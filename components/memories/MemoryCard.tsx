import Link from "next/link";
import { Pencil, Star, Trash2 } from "lucide-react";
import type { Memory } from "@/types/memory";

interface Props {
  memory: Memory;
  layout?: "grid" | "list";
  onToggleFavorite?: (m: Memory) => void;
  onDelete?: (m: Memory) => void;
}

export function MemoryCard({ memory: m, layout = "grid", onToggleFavorite, onDelete }: Props) {
  const star = (
    <Star className={`size-4.5 ${m.isFavorite ? "fill-accent text-accent" : "text-muted"}`} />
  );
  return (
    <article className={`rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand/50 ${layout === "list" ? "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6" : "flex flex-col"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">{m.title}</h3>
          {onToggleFavorite ? (
            <button onClick={() => onToggleFavorite(m)} aria-pressed={m.isFavorite} aria-label={m.isFavorite ? "Remove from favorites" : "Add to favorites"} className="shrink-0">{star}</button>
          ) : star}
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{m.problem}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-brand/15 px-2 py-1 text-xs text-brand-soft">{m.language}</span>
          {m.tags.slice(0, 3).map((t) => (<span key={t} className="rounded-md bg-surface-2 px-2 py-1 text-xs text-muted">{t}</span>))}
        </div>
      </div>
      <div className={`flex items-center gap-4 text-sm ${layout === "list" ? "sm:flex-col sm:items-end sm:gap-2" : "mt-5 justify-between"}`}>
        <time className="text-muted" dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time>
        <div className="flex items-center gap-1">
          {onDelete && (
            <>
              <Link href={`/dashboard/memories/${m.id}/edit`} aria-label={`Edit ${m.title}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"><Pencil className="size-4" /></Link>
              <button onClick={() => onDelete(m)} aria-label={`Delete ${m.title}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-err"><Trash2 className="size-4" /></button>
            </>
          )}
          <Link href={`/dashboard/memories/${m.id}`} className="ml-2 font-medium text-brand-soft hover:underline">View</Link>
        </div>
      </div>
    </article>
  );
}