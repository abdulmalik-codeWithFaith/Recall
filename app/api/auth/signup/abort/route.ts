import { NextResponse } from "next/server";
import { Account, Users } from "node-appwrite";
import { z } from "zod";
import { adminClient, fail, jwtClient, readJson } from "@/lib/appwrite/server";

/** Removes a half-made account (no passkey yet) when sign-up is cancelled or fails. Never touches accounts that have a passkey. */
export async function POST(req: Request) {
  try {
    const { jwt } = z.object({ jwt: z.string().min(10) }).parse(await readJson(req));
    const me = await new Account(jwtClient(jwt)).get();
    const users = new Users(adminClient());
    const { passkeys } = await users.listPasskeys({ userId: me.$id });
    if (!passkeys.length) await users.delete({ userId: me.$id });
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}