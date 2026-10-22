"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell, inputCls } from "@/components/auth/AuthShell";
import { Field, FormError, PasswordInput, SubmitButton } from "@/components/auth/FormField";
import { register as registerUser } from "@/lib/auth-client";
import { registerSchema, type RegisterValues } from "@/lib/validation/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async ({ confirmPassword: _c, ...values }: RegisterValues) => {
    setServerError(null);
    try {
      await registerUser(values); // the API creates the account and starts a session
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setServerError((e as Error).message);
    }
  };

  return (
    <AuthShell title="Create your memory" subtitle="Save what you solve. Find it later in your own words."
      footer={<>Already have an account? <Link href="/login" className="font-medium text-brand-soft hover:underline">Log in</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError message={serverError} />
        <Field label="Full name" error={errors.name?.message}>
          <input autoComplete="name" placeholder="Ada Lovelace" className={inputCls} {...register("name")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" placeholder="you@example.com" className={inputCls} {...register("email")} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <PasswordInput autoComplete="new-password" placeholder="At least 8 characters" {...register("password")} />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <PasswordInput autoComplete="new-password" placeholder="Repeat your password" {...register("confirmPassword")} />
        </Field>
        <SubmitButton loading={isSubmitting}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}