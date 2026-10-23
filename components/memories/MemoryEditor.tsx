"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { inputCls } from "@/components/auth/AuthShell";
import { Field, FormError, SubmitButton } from "@/components/auth/FormField";
import { LANGUAGES, memorySchema, type MemoryValues } from "@/lib/validation/memory";
import { TagSelector } from "./TagSelector";

const EMPTY: MemoryValues = { title: "", problem: "", solution: "", code: "", language: "JavaScript", tags: [], sourceUrl: "", isFavorite: false };

/** Create and edit share this form. `onSubmit` must resolve only after the memory is really stored. */
export function MemoryEditor({ initial, submitLabel, onSubmit }: { initial?: MemoryValues; submitLabel: string; onSubmit: (v: MemoryValues) => Promise<void> }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<MemoryValues>({ resolver: zodResolver(memorySchema), defaultValues: initial ?? EMPTY });

  const submit = async (v: MemoryValues) => {
    setServerError(null);
    try { await onSubmit(v); } catch (e) { setServerError((e as Error).message); }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="mx-auto max-w-3xl space-y-6" noValidate>
      <FormError message={serverError && `${serverError} Your changes are still here, so you can try again.`} />
      <Field label="Memory title" error={errors.title?.message}>
        <input placeholder="Firebase Firestore permission denied" className={inputCls} {...register("title")} />
      </Field>
      <Field label="Problem" error={errors.problem?.message}>
        <textarea rows={4} placeholder="What went wrong? Include the error message if you have it. Markdown works." className={inputCls} {...register("problem")} />
      </Field>
      <Field label="Solution" error={errors.solution?.message}>
        <textarea rows={5} placeholder="What fixed it, and why?" className={inputCls} {...register("solution")} />
      </Field>
      <Field label="Code snippet (optional)" error={errors.code?.message}>
        <textarea rows={7} spellCheck={false} placeholder="Paste the code that fixed it" className={`${inputCls} font-mono text-[13px]`} {...register("code")} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Programming language" error={errors.language?.message}>
          <select className={inputCls} {...register("language")}>{LANGUAGES.map((l) => (<option key={l} value={l}>{l}</option>))}</select>
        </Field>
        <Field label="Source URL (optional)" error={errors.sourceUrl?.message}>
          <input type="url" placeholder="https://…" className={inputCls} {...register("sourceUrl")} />
        </Field>
      </div>
      <div>
        <span className="mb-1.5 block text-sm font-medium">Technology tags</span>
        <Controller control={control} name="tags" render={({ field }) => <TagSelector value={field.value} onChange={field.onChange} />} />
        {errors.tags && <span role="alert" className="mt-1.5 block text-sm text-err">{errors.tags.message}</span>}
      </div>
      <Controller control={control} name="isFavorite" render={({ field }) => (
        <button type="button" role="switch" aria-checked={field.value} onClick={() => field.onChange(!field.value)}
          className="flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm hover:bg-surface">
          <Star className={`size-4.5 ${field.value ? "fill-accent text-accent" : "text-muted"}`} /> Mark as favorite
        </button>
      )} />
      <div className="max-w-xs"><SubmitButton loading={isSubmitting}>{submitLabel}</SubmitButton></div>
    </form>
  );
}