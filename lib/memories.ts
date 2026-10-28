import { ID, Permission, Query, Role, TablesDB } from "node-appwrite";
import type { Memory } from "@/types/memory";
import { adminClient, HttpError } from "./appwrite/server";

const databaseId = () => process.env.APPWRITE_DB_ID!;
const tableId = () => process.env.APPWRITE_TABLE_ID ?? "memories";
const db = () => new TablesDB(adminClient());

export interface MemoryRow {
  $id: string; $createdAt: string; $updatedAt: string;
  userId: string; title: string; problem: string; solution: string; code: string | null;
  language: string; tags: string[]; sourceUrl: string | null; isFavorite: boolean;
  embedding?: string; embeddingModel?: string;
}

export const toMemory = (r: MemoryRow): Memory => ({
  id: r.$id, createdAt: r.$createdAt, updatedAt: r.$updatedAt,
  title: r.title, problem: r.problem, solution: r.solution, code: r.code ?? "",
  language: r.language, tags: r.tags ?? [], sourceUrl: r.sourceUrl || null, isFavorite: !!r.isFavorite,
});

const LIGHT = ["$id", "$createdAt", "$updatedAt", "userId", "title", "problem", "solution", "code", "language", "tags", "sourceUrl", "isFavorite"];

/** Every query is scoped to the signed-in user's ID, which comes from the validated session, never from the client. */
export async function listUserRows(userId: string, withEmbedding = false): Promise<MemoryRow[]> {
  const out: MemoryRow[] = [];
  let cursor: string | undefined;
  for (;;) {
    const queries = [Query.equal("userId", userId), Query.select(withEmbedding ? [...LIGHT, "embedding"] : LIGHT), Query.orderDesc("$createdAt"), Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await db().listRows({ databaseId: databaseId(), tableId: tableId(), queries });
    const rows = res.rows as unknown as MemoryRow[];
    out.push(...rows);
    if (rows.length < 100 || out.length >= 5000) break;
    cursor = rows[rows.length - 1].$id;
  }
  return out;
}

/** Returns 404 (not 403) for someone else's row, so IDs can't be probed. */
export async function getOwnedRow(id: string, userId: string): Promise<MemoryRow> {
  let row: MemoryRow;
  try { row = (await db().getRow({ databaseId: databaseId(), tableId: tableId(), rowId: id })) as unknown as MemoryRow; }
  catch { throw new HttpError(404, "Memory not found."); }
  if (row.userId !== userId) throw new HttpError(404, "Memory not found.");
  return row;
}

export async function createRow(userId: string, data: Record<string, unknown>): Promise<MemoryRow> {
  const me = Role.user(userId);
  const row = await db().createRow({
    databaseId: databaseId(), tableId: tableId(), rowId: ID.unique(),
    data: { ...data, userId },
    permissions: [Permission.read(me), Permission.update(me), Permission.delete(me)],
  });
  return row as unknown as MemoryRow;
}

export async function updateRow(id: string, data: Record<string, unknown>): Promise<MemoryRow> {
  return (await db().updateRow({ databaseId: databaseId(), tableId: tableId(), rowId: id, data })) as unknown as MemoryRow;
}

export const deleteRow = (id: string) => db().deleteRow({ databaseId: databaseId(), tableId: tableId(), rowId: id });