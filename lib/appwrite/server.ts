import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Account, AppwriteException, Client } from "node-appwrite";

export const SESSION_COOKIE = "recall_session";

const base = () => new Client().setEndpoint(process.env.APPWRITE_ENDPOINT!).setProject(process.env.APPWRITE_PROJECT_ID!);
export const adminClient = () => base().setKey(process.env.APPWRITE_API_KEY!);
export const jwtClient = (jwt: string) => base().setJWT(jwt);
export const sessionClient = (secret: string, origin?: string) => {
  const c = base().setSession(secret);
  if (origin) c.addHeader("Origin", origin); // lets Appwrite pick the right relying party (localhost vs production)
  return c;
};

export const originOf = (req: Request) => req.headers.get("origin") ?? new URL(req.url).origin;

export class HttpError extends Error {
  constructor(public status: number, message: string, public type?: string) { super(message); }
}

/** Exchange an Appwrite token for a session and store its secret in an HTTP-only cookie. */
export async function startSession(userId: string, secret: string) {
  const session = await new Account(adminClient()).createSession({ userId, secret });
  (await cookies()).set(SESSION_COOKIE, session.secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expire),
  });
  return session;
}

/** Validates the cookie against Appwrite on every call. The cookie alone is never trusted. */
export async function requireSession(origin?: string) {
  const jar = await cookies();
  const secret = jar.get(SESSION_COOKIE)?.value;
  if (!secret) throw new HttpError(401, "Please sign in.");
  const client = sessionClient(secret, origin);
  try {
    const user = await new Account(client).get();
    return { client, user, secret };
  } catch (e) {
    if (e instanceof AppwriteException && e.code === 401) jar.delete(SESSION_COOKIE);
    throw new HttpError(401, "Your session has expired. Please sign in again.");
  }
}

const FRIENDLY: Record<string, string> = {
  user_auth_method_unsupported: "Passkeys aren't enabled for this project yet.",
  user_reauthentication_required: "For your security, confirm it's you with your passkey first.",
  user_invalid_token: "That took too long or was already used. Please try again.",
  user_passkey_invalid: "This passkey wasn't accepted for this site.",
  user_passkey_limit_exceeded: "You've reached the limit of 10 passkeys.",
  user_passkey_already_exists: "This passkey is already registered.",
  user_blocked: "This account is blocked.",
  general_rate_limit_exceeded: "Too many attempts. Please wait a little and try again.",
};

export function fail(e: unknown) {
  if (e instanceof HttpError) return NextResponse.json({ error: e.message, type: e.type }, { status: e.status });
  if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  if (e instanceof AppwriteException) {
    const status = e.code >= 400 && e.code < 600 ? e.code : 500;
    return NextResponse.json({ error: FRIENDLY[e.type] ?? (status < 500 ? e.message : "Something went wrong."), type: e.type }, { status });
  }
  if (e instanceof TypeError && e.message === "fetch failed") {
    console.error("Appwrite unreachable:", (e.cause as { code?: string } | undefined)?.code ?? e.message);
    return NextResponse.json({ error: "Couldn't reach Appwrite. Check your internet connection (or VPN/firewall) and try again.", type: "network_unreachable" }, { status: 503 });
  }
  console.error(e);
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}

export const readJson = (req: Request) => req.json().catch(() => ({}));