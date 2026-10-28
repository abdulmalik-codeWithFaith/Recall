import { NextResponse } from "next/server";
import { Account } from "node-appwrite";
import { z } from "zod";
import { fail, originOf, readJson, requireSession } from "@/lib/appwrite/server";

export async function POST(req: Request) {
  try {
    const { passkeyId, credential } = z.object({ passkeyId: z.string().min(1), credential: z.record(z.string(), z.unknown()) }).parse(await readJson(req));
    const { client } = await requireSession(originOf(req));
    await new Account(client).updatePasskeyVerification({ passkeyId, credential });
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}