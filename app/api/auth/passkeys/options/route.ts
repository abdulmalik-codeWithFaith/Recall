import { NextResponse } from "next/server";
import { Account } from "node-appwrite";
import { z } from "zod";
import { fail, originOf, readJson, requireSession } from "@/lib/appwrite/server";

export async function POST(req: Request) {
  try {
    const { name } = z.object({ name: z.string().trim().min(1).max(60) }).parse(await readJson(req));
    const { client } = await requireSession(originOf(req));
    const c = await new Account(client).createPasskey({ name });
    return NextResponse.json({ passkeyId: c.passkeyId, publicKey: c.publicKey });
  } catch (e) { return fail(e); }
}