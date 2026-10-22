"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { AuthShell, inputCls } from "@/components/auth/AuthShell";
import { Field, FormError, SubmitButton } from "@/components/auth/FormField";
import { requestRecovery } from "@/lib/auth-client";
import { forgotSchema, type ForgotValues } from "@/lib/validation/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (values: ForgotValues) => {
    setServerError(null);
    try { await requestRecovery(values); setSent(true); } catch (e) { setServerError((e as Error).message); }
  };

  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we'll send a reset link."
      footer={<Link href="/login" className="font-medium text-brand-soft hover:underline">Back to log in</Link>}>
      {sent ? (
        <div className="rounded-xl border border-ok/30 bg-ok/10 p-5">
          <MailCheck className="size-6 text-ok" />
          <p className="mt-3 font-medium">Check your inbox</p>
          <p className="mt-1 text-sm text-muted">If an account exists for that email, a reset link is on its way.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormError message={serverError} />
          <Field label="Email" error={errors.email?.message}>
            <input type="email" autoComplete="email" placeholder="you@example.com" className={inputCls} {...register("email")} />
          </Field>
          <SubmitButton loading={isSubmitting}>Send reset link</SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}