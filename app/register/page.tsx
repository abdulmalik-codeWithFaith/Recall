"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fingerprint, TriangleAlert } from "lucide-react";
import { AuthShell, inputCls } from "@/components/auth/AuthShell";
import { Field, FormError, SubmitButton } from "@/components/auth/FormField";
import { describePasskeyError, passkeysSupported, signUpWithPasskey } from "@/lib/passkey-client";
import { nameSchema } from "@/lib/validation/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => setSupported(passkeysSupported()), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = nameSchema.safeParse({ name });
    if (!parsed.success) return setFieldError(parsed.error.issues[0].message);
    setFieldError(undefined);
    setLoading(true);
    try {
      await signUpWithPasskey(parsed.data.name);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(describePasskeyError(err, "signup"));
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome to RecallAI" subtitle="Your coding knowledge, always within reach."
      footer={<>Already have an account? <Link href="/login" className="font-medium text-brand-soft hover:underline">Sign in</Link></>}>
      {!supported && (
        <div role="alert" className="mb-4 flex gap-3 rounded-xl border border-err/30 bg-err/10 p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-err" />
          <p>This browser or device doesn&apos;t support passkeys. Try a recent version of Chrome, Safari, Edge or Firefox.</p>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field label="Your name" error={fieldError}>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ada Lovelace" disabled={loading} className={inputCls} />
        </Field>
        <SubmitButton loading={loading}>{!loading && <Fingerprint className="size-4.5" />} Create account with passkey</SubmitButton>
        <p className="text-center text-xs text-muted">No email or password. You&apos;ll confirm with your fingerprint, face, or device PIN.</p>
      </form>
    </AuthShell>
  );
}