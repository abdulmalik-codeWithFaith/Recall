import { NextResponse } from "next/server";
import { Account } from "node-appwrite";
import { z } from "zod";
import { fail, HttpError, originOf, readJson, requireSession } from "@/lib/appwrite/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { name } = z.object({ name: z.string().trim().min(1).max(60) }).parse(await readJson(req));
    const { client } = await requireSession(originOf(req));
    await new Account(client).updatePasskey({ passkeyId: id, name });
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}

/** Refuses to delete the last passkey, because the account would become unreachable. */
export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { client } = await requireSession(originOf(req));
    const account = new Account(client);
    const { passkeys } = await account.listPasskeys();
    if (passkeys.length <= 1) throw new HttpError(409, "Keep at least one passkey, or you'll be locked out. Add another one first.");
    await account.deletePasskey({ passkeyId: id });
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}