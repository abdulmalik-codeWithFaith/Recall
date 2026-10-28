import { NextResponse } from "next/server";
import { fail, requireSession } from "@/lib/appwrite/server";

export async function GET() {
  try {
    const { user } = await requireSession();
    return NextResponse.json({ id: user.$id, name: user.name });
  } catch (e) { return fail(e); }
}