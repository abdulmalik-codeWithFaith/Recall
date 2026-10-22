"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell, inputCls } from "@/components/auth/AuthShell";
import { Field, FormError, PasswordInput, SubmitButton } from "@/components/auth/FormField";
import { login } from "@/lib/auth-client";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    try {
      await login(values);
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setServerError((e as Error).message);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to search your developer memory."
      footer={<>New here? <Link href="/register" className="font-medium text-brand-soft hover:underline">Create an account</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError message={serverError} />
        <Field label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" placeholder="you@example.com" className={inputCls} {...register("email")} />
        </Field>
        <Field label="Password" error={errors.password?.message}
          hint={<Link href="/forgot-password" className="text-sm font-normal text-brand-soft hover:underline">Forgot password?</Link>}>
          <PasswordInput autoComplete="current-password" placeholder="Your password" {...register("password")} />
        </Field>
        <SubmitButton loading={isSubmitting}>Log in</SubmitButton>
      </form>
    </AuthShell>
  );
}