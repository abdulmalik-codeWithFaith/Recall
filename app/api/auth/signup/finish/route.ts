import { NextResponse } from "next/server";
import { Account, Users } from "node-appwrite";
import { z } from "zod";
import { adminClient, fail, HttpError, jwtClient, readJson, startSession } from "@/lib/appwrite/server";

/** Only issues the cookie session if the account really has a saved passkey. */
export async function POST(req: Request) {
  try {
    const { jwt } = z.object({ jwt: z.string().min(10) }).parse(await readJson(req));
    const me = await new Account(jwtClient(jwt)).get();
    const users = new Users(adminClient());
    const { passkeys } = await users.listPasskeys({ userId: me.$id });
    if (!passkeys.length) throw new HttpError(400, "No passkey was saved. Please try again.");
    const token = await users.createToken({ userId: me.$id });
    await startSession(me.$id, token.secret);
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}