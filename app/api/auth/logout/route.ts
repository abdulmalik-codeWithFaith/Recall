import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Account } from "node-appwrite";
import { SESSION_COOKIE, sessionClient } from "@/lib/appwrite/server";

export async function POST() {
  const jar = await cookies();
  const secret = jar.get(SESSION_COOKIE)?.value;
  if (secret) { try { await new Account(sessionClient(secret)).deleteSession({ sessionId: "current" }); } catch { /* already invalid */ } }
  jar.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}