import { NextResponse } from "next/server";
import { ID, Users } from "node-appwrite";
import { adminClient, fail, readJson } from "@/lib/appwrite/server";
import { nameSchema } from "@/lib/validation/auth";

/** Creates a name-only account with an internal unique ID, plus a one-time token to open its first session. */
export async function POST(req: Request) {
  try {
    const { name } = nameSchema.parse(await readJson(req));
    const users = new Users(adminClient());
    const user = await users.create({ userId: ID.unique(), name });
    const token = await users.createToken({ userId: user.$id });
    return NextResponse.json({ userId: user.$id, secret: token.secret });
  } catch (e) { return fail(e); }
}