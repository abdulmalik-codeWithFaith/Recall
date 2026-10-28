"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fingerprint, Smartphone, TriangleAlert } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormError } from "@/components/auth/FormField";
import { describePasskeyError, passkeysSupported, signInWithPasskey } from "@/lib/passkey-client";

export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState<"main" | "device" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(passkeysSupported());
    fetch("/api/auth/me").then((r) => r.ok && router.replace("/dashboard")).catch(() => {});
  }, [router]);

  const go = async (crossDevice: boolean) => {
    setError(null);
    setBusy(crossDevice ? "device" : "main");
    try {
      await signInWithPasskey({ crossDevice });
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(describePasskeyError(e, "signin"));
      setBusy(null);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Pick up where you left off."
      footer={<>New to RecallAI? <Link href="/register" className="font-medium text-brand-soft hover:underline">Create an account</Link></>}>
      {!supported && (
        <div role="alert" className="mb-4 flex gap-3 rounded-xl border border-err/30 bg-err/10 p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-err" />
          <p>This browser or device doesn&apos;t support passkeys. Try a recent version of Chrome, Safari, Edge or Firefox.</p>
        </div>
      )}
      <div className="space-y-3">
        <FormError message={error} />
        <button onClick={() => go(false)} disabled={busy !== null || !supported}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 font-medium text-white shadow-lg shadow-brand/25 transition-transform active:scale-[0.98] disabled:opacity-70">
          {busy === "main" ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Fingerprint className="size-4.5" />}
          Sign in with passkey
        </button>
        <button onClick={() => go(true)} disabled={busy !== null || !supported}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-3.5 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-60">
          {busy === "device" ? <span className="size-4 animate-spin rounded-full border-2 border-fg/30 border-t-fg" /> : <Smartphone className="size-4.5" />}
          Use a passkey from another device
        </button>
        <p className="pt-1 text-center text-xs text-muted">On a laptop, the second option shows a QR code to scan with your phone.</p>
      </div>
    </AuthShell>
  );
}