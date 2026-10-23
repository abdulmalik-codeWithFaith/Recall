"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { inputCls } from "@/components/auth/AuthShell";

const SUGGESTED = ["React", "Next.js", "Firebase", "Appwrite", "Tailwind CSS", "Node.js", "Git", "Docker"];

export function TagSelector({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tag = raw.trim();
    if (!tag || value.some((t) => t.toLowerCase() === tag.toLowerCase()) || value.length >= 10) return;
    onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-md bg-brand/15 py-1 pl-2.5 pr-1 text-sm text-brand-soft">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))} className="grid size-5 place-items-center rounded hover:bg-brand/25"><X className="size-3.5" /></button>
          </span>
        ))}
      </div>
      <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a tag and press Enter" aria-label="Add a technology tag" className={`${inputCls} mt-2`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); }
          else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }} />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SUGGESTED.filter((s) => !value.includes(s)).map((s) => (
          <button key={s} type="button" onClick={() => add(s)} className="rounded-md border border-line px-2 py-1 text-xs text-muted hover:text-fg">+ {s}</button>
        ))}
      </div>
    </div>
  );
}