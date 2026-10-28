import { NextResponse } from "next/server";
import { fail, requireSession } from "@/lib/appwrite/server";
import { listUserRows } from "@/lib/memories";

export async function GET() {
  try {
    const { user } = await requireSession();
    const rows = await listUserRows(user.$id);
    const tags = new Set(rows.flatMap((r) => (r.tags ?? []).map((t) => t.toLowerCase())));
    const prefs = (user.prefs ?? {}) as Record<string, unknown>;
    return NextResponse.json({
      totalMemories: rows.length,
      favorites: rows.filter((r) => r.isFavorite).length,
      searches: Number(prefs.searchCount ?? 0),
      technologies: tags.size,
    });
  } catch (e) { return fail(e); }
}