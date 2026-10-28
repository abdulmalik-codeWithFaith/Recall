import { NextResponse } from "next/server";
import { z } from "zod";
import { EMBEDDING_MODEL, documentText, embed, encodeVector } from "@/lib/embeddings";
import { fail, readJson, requireSession } from "@/lib/appwrite/server";
import { createRow, listUserRows, toMemory } from "@/lib/memories";
import { memorySchema } from "@/lib/validation/memory";

const listParams = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(12),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(["newest", "oldest"]).default("newest"),
  q: z.string().trim().max(200).optional(),
  language: z.string().max(30).optional(),
  tag: z.string().trim().max(40).optional(),
  favorite: z.enum(["true", "false"]).optional(),
});

export async function GET(req: Request) {
  try {
    const { user } = await requireSession();
    const p = listParams.parse(Object.fromEntries(new URL(req.url).searchParams));
    let rows = await listUserRows(user.$id);
    if (p.q) rows = rows.filter((r) => r.title.toLowerCase().includes(p.q!.toLowerCase()));
    if (p.language) rows = rows.filter((r) => r.language === p.language);
    if (p.tag) rows = rows.filter((r) => r.tags?.some((t) => t.toLowerCase() === p.tag!.toLowerCase()));
    if (p.favorite === "true") rows = rows.filter((r) => r.isFavorite);
    if (p.sort === "oldest") rows = [...rows].reverse(); // rows arrive newest first
    return NextResponse.json({ memories: rows.slice(p.offset, p.offset + p.limit).map(toMemory), total: rows.length });
  } catch (e) { return fail(e); }
}

/** The row is written only after the embedding exists, and success is returned only after the write succeeds. */
export async function POST(req: Request) {
  try {
    const { user } = await requireSession();
    const v = memorySchema.parse(await readJson(req));
    const vector = await embed(documentText(v));
    const row = await createRow(user.$id, {
      title: v.title, problem: v.problem, solution: v.solution, code: v.code || null,
      language: v.language, tags: v.tags, sourceUrl: v.sourceUrl || null, isFavorite: v.isFavorite,
      embedding: encodeVector(vector), embeddingModel: EMBEDDING_MODEL,
    });
    return NextResponse.json(toMemory(row), { status: 201 });
  } catch (e) { return fail(e); }
}