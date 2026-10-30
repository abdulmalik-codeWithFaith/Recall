import { NextResponse } from "next/server";
import { Query, TablesDB, Users } from "node-appwrite";
import { adminClient } from "@/lib/appwrite/server";
import { embed } from "@/lib/embeddings";

/** Development-only connection check: open http://localhost:3000/api/health */
export async function GET() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Not found" }, { status: 404 });

  const required = ["APPWRITE_ENDPOINT", "APPWRITE_PROJECT_ID", "APPWRITE_API_KEY", "APPWRITE_DB_ID", "NEXT_PUBLIC_APPWRITE_ENDPOINT", "NEXT_PUBLIC_APPWRITE_PROJECT_ID"];
  const missing = required.filter((k) => !process.env[k] || process.env[k]!.includes("PASTE_") || process.env[k]!.includes("REGION"));
  if (missing.length) return NextResponse.json({ ok: false, step: "env", fix: `Fill in these values in .env.local, then restart npm run dev: ${missing.join(", ")}` });

  const checks: { step: string; ok: boolean; detail?: string }[] = [];
  const run = async (step: string, fn: () => Promise<unknown>) => {
    try { await fn(); checks.push({ step, ok: true }); }
    catch (e) { checks.push({ step, ok: false, detail: e instanceof Error ? e.message : String(e) }); }
  };

  await run("API key + project (users.read)", () => new Users(adminClient()).list({ queries: [Query.limit(1)] }));
  await run("Database + memories table (rows.read)", () =>
    new TablesDB(adminClient()).listRows({ databaseId: process.env.APPWRITE_DB_ID!, tableId: process.env.APPWRITE_TABLE_ID ?? "memories", queries: [Query.limit(1)] }));
  await run("Embeddings (embeddings.write)", () => embed("search_query: connection test"));

  // If the database check failed, show the databases this key can actually see (names + real IDs).
  let availableDatabases: unknown;
  if (!checks[1].ok) {
    try {
      const list = await new TablesDB(adminClient()).list();
      availableDatabases = list.databases.map((d) => ({ name: d.name, id: d.$id, type: (d as unknown as { type?: string }).type }));
    } catch (e) {
      availableDatabases = `Couldn't list databases: ${e instanceof Error ? e.message : String(e)} (add the databases.read scope to your API key)`;
    }
  }

  return NextResponse.json({ ok: checks.every((c) => c.ok), checks, ...(availableDatabases ? { availableDatabases } : {}) });
}