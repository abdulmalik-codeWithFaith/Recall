import { NextResponse } from "next/server";
import { Account } from "node-appwrite";
import { fail, readJson, requireSession } from "@/lib/appwrite/server";
import { nameSchema } from "@/lib/validation/auth";

export async function PATCH(req: Request) {
  try {
    const { client } = await requireSession();
    const { name } = nameSchema.parse(await readJson(req));
    const user = await new Account(client).updateName({ name });
    return NextResponse.json({ id: user.$id, name: user.name });
  } catch (e) { return fail(e); }
}