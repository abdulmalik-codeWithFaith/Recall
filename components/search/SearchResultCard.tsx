import Link from "next/link";
import type { SearchResult } from "@/types/memory";

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n).trimEnd() + "…" : s);

export function SearchResultCard({ result: { memory: m, score }, rank }: { result: SearchResult; rank: number }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand/50">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">{m.title}</h3>
        {score !== null
          ? <span className="shrink-0 rounded-full bg-ok/15 px-2.5 py-1 text-xs font-medium text-ok">{Math.round(score * 100)}% match</span>
          : <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">#{rank}</span>}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{clip(m.problem, 180)}</p>
      <p className="mt-2 text-sm leading-relaxed"><span className="hl">{clip(m.solution, 160)}</span></p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md bg-brand/15 px-2 py-1 text-xs text-brand-soft">{m.language}</span>
          {m.tags.slice(0, 4).map((t) => (<span key={t} className="rounded-md bg-surface-2 px-2 py-1 text-xs text-muted">{t}</span>))}
        </div>
        <Link href={`/dashboard/memories/${m.id}`} className="text-sm font-medium text-brand-soft hover:underline">View full memory</Link>
      </div>
    </article>
  );
}