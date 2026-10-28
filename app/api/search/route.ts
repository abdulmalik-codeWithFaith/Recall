import { NextResponse } from "next/server";
import { Account } from "node-appwrite";
import { z } from "zod";
import { decodeVector, embed, queryText } from "@/lib/embeddings";
import { fail, readJson, requireSession } from "@/lib/appwrite/server";
import { listUserRows, toMemory } from "@/lib/memories";

const MIN_SCORE = Number(process.env.SEARCH_MIN_SCORE ?? 0.35); // cosine cutoff, tune against your own data
const TOP_K = 8;

export async function POST(req: Request) {
  try {
    const { client, user } = await requireSession();
    const { query } = z.object({ query: z.string().trim().min(3, "Describe the problem in a few words.").max(500) }).parse(await readJson(req));

    const q = await embed(queryText(query)); // same model as when memories were saved
    const rows = await listUserRows(user.$id, true); // only this user's rows

    const ranked = rows
      .filter((r) => r.embedding)
      .map((r) => {
        const v = decodeVector(r.embedding!);
        let dot = 0; // vectors are unit length, so the dot product is the cosine similarity
        for (let i = 0; i < q.length; i++) dot += q[i] * v[i];
        return { row: r, cosine: dot };
      })
      .filter((x) => x.cosine >= MIN_SCORE)
      .sort((a, b) => b.cosine - a.cosine)
      .slice(0, TOP_K);

    // Best effort: count the search for the dashboard stat. Never fail the search over it.
    const prefs = (user.prefs ?? {}) as Record<string, unknown>;
    new Account(client).updatePrefs({ prefs: { ...prefs, searchCount: Number(prefs.searchCount ?? 0) + 1 } }).catch(() => {});

    // Cosine isn't a calibrated percentage, so we return the ranking and no fake "% match".
    return NextResponse.json({ results: ranked.map((x) => ({ memory: toMemory(x.row), score: null })) });
  } catch (e) { return fail(e); }
}