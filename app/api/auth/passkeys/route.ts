import { NextResponse } from "next/server";
import { Account } from "node-appwrite";
import { fail, originOf, requireSession } from "@/lib/appwrite/server";

export async function GET(req: Request) {
  try {
    const { client } = await requireSession(originOf(req));
    const { passkeys } = await new Account(client).listPasskeys();
    return NextResponse.json({
      passkeys: passkeys.map((p) => {
        const x = p as unknown as Record<string, string | null | undefined>;
        return { id: x.$id, name: x.name, createdAt: x.$createdAt, lastUsedAt: x.lastUsedAt ?? x.accessedAt ?? null };
      }),
    });
  } catch (e) { return fail(e); }
}