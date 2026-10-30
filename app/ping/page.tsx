"use client";
import { useState } from "react";
import { getBrowserClient } from "@/lib/appwrite/browser";

/** TEMPORARY: sends one client.ping() so the Appwrite Console setup wizard can finish. Delete this folder afterwards. */
export default function PingPage() {
  const [result, setResult] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const ping = async () => {
    setBusy(true);
    setResult("");
    try {
      const res = await getBrowserClient().ping();
      setResult(`Ping sent. Appwrite replied: ${String(res)}`);
    } catch (e) {
      setResult(`Ping failed: ${e instanceof Error ? e.message : String(e)}`);
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="font-display text-2xl font-semibold">Appwrite ping</h1>
      <button onClick={ping} disabled={busy} className="mt-4 rounded-xl bg-brand px-5 py-3 font-medium text-white disabled:opacity-60">
        {busy ? "Sending…" : "Send a ping"}
      </button>
      {result && <p className="mt-4 text-sm">{result}</p>}
    </main>
  );
}