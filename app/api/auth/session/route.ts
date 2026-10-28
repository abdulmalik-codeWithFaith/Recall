import { NextResponse } from "next/server";
import { z } from "zod";
import { fail, readJson, startSession } from "@/lib/appwrite/server";

/** Sign-in final step: the browser passes the one-time token Appwrite issued after verifying the passkey. */
export async function POST(req: Request) {
  try {
    const { userId, secret } = z.object({ userId: z.string().min(1).max(64), secret: z.string().min(1) }).parse(await readJson(req));
    await startSession(userId, secret);
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}