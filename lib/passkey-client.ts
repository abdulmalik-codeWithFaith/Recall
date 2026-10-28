import { Account } from "appwrite";
import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { api } from "./api";
import { getBrowserClient } from "./appwrite/browser";

export const passkeysSupported = () => typeof window !== "undefined" && browserSupportsWebAuthn();

export function deviceLabel() {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? "iPhone" : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows PC" : /Linux/.test(ua) ? "Linux" : "Device";
  return `${os} · ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

/**
 * Sign up = create an account (name only), open a session, register a passkey on it, then trade the
 * browser session for our HTTP-only cookie. If anything fails before a passkey exists, the half-made account is removed.
 */
export async function signUpWithPasskey(name: string) {
  const { userId, secret } = await api<{ userId: string; secret: string }>("/api/auth/signup/start", { method: "POST", body: JSON.stringify({ name }) });
  const account = new Account(getBrowserClient());
  try {
    await account.createSession({ userId, secret });
    const challenge = await account.createPasskey({ name: deviceLabel() });
    const credential = await startRegistration({ optionsJSON: challenge.publicKey as never });
    await account.updatePasskeyVerification({ passkeyId: challenge.passkeyId, credential: credential as never });
    const { jwt } = await account.createJWT();
    await api("/api/auth/signup/finish", { method: "POST", body: JSON.stringify({ jwt }) });
  } catch (e) {
    try {
      const { jwt } = await account.createJWT();
      await api("/api/auth/signup/abort", { method: "POST", body: JSON.stringify({ jwt }) });
    } catch { /* nothing to clean up */ }
    throw e;
  } finally {
    try { await account.deleteSession({ sessionId: "current" }); } catch { /* browser session already gone */ }
  }
}

/** Sign in = Appwrite challenge → device passkey → Appwrite token → our server turns it into the cookie session. */
export async function signInWithPasskey(opts: { crossDevice?: boolean } = {}) {
  const account = new Account(getBrowserClient());
  const challenge = await account.createPasskeyToken();
  // `hints: ["hybrid"]` asks supporting browsers to open the "use your phone" QR flow first; others ignore it.
  const optionsJSON = { ...challenge.publicKey, ...(opts.crossDevice ? { hints: ["hybrid"] } : {}) };
  const credential = await startAuthentication({ optionsJSON: optionsJSON as never });
  const token = await account.updatePasskeyToken({ challengeId: challenge.$id, credential: credential as never });
  await api("/api/auth/session", { method: "POST", body: JSON.stringify({ userId: token.userId, secret: token.secret }) });
}

export function describePasskeyError(e: unknown, mode: "signup" | "signin"): string {
  const err = e as { name?: string; code?: string; type?: string; message?: string };
  if (err.code === "ERROR_CEREMONY_ABORTED" || err.name === "NotAllowedError" || err.name === "AbortError")
    return mode === "signup"
      ? "Passkey creation was cancelled. Try again when you're ready."
      : "Sign-in was cancelled, or no passkey was found on this device. If your passkey is on your phone, use “Use a passkey from another device”.";
  if (err.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED" || err.name === "InvalidStateError")
    return "This device already has a RecallAI passkey. Try signing in instead.";
  if (err.name === "NotSupportedError" || err.code === "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG")
    return "This device or browser can't create the kind of passkey RecallAI needs. Try a recent Chrome, Safari, Edge or Firefox.";
  if (err.type === "user_passkey_invalid")
    return "Your browser's passkey wasn't accepted for this address. If you're developing locally, make sure you're on http://localhost (not 127.0.0.1).";
  return err.message || "Something went wrong. Please try again.";
}