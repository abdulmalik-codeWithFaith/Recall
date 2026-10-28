import { NextResponse } from "next/server";
import { EMBEDDING_MODEL, documentText, embed, encodeVector } from "@/lib/embeddings";
import { fail, readJson, requireSession } from "@/lib/appwrite/server";
import { deleteRow, getOwnedRow, toMemory, updateRow } from "@/lib/memories";
import { memorySchema } from "@/lib/validation/memory";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { user } = await requireSession();
    return NextResponse.json(toMemory(await getOwnedRow(id, user.$id)));
  } catch (e) { return fail(e); }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { user } = await requireSession();
    const patch = memorySchema.partial().parse(await readJson(req));
    const current = await getOwnedRow(id, user.$id);

    const data: Record<string, unknown> = { ...patch };
    if ("sourceUrl" in patch) data.sourceUrl = patch.sourceUrl || null;
    if ("code" in patch) data.code = patch.code || null;

    // Re-embed only when searchable content really changed. Favorite-only edits never touch the vector.
    const next = { title: patch.title ?? current.title, problem: patch.problem ?? current.problem, solution: patch.solution ?? current.solution, language: patch.language ?? current.language, tags: patch.tags ?? current.tags ?? [] };
    const changed = next.title !== current.title || next.problem !== current.problem || next.solution !== current.solution || next.language !== current.language || next.tags.join("\u0000") !== (current.tags ?? []).join("\u0000");
    if (changed) {
      data.embedding = encodeVector(await embed(documentText(next)));
      data.embeddingModel = EMBEDDING_MODEL;
    }
    return NextResponse.json(toMemory(await updateRow(id, data)));
  } catch (e) { return fail(e); }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { user } = await requireSession();
    await getOwnedRow(id, user.$id);
    await deleteRow(id);
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}