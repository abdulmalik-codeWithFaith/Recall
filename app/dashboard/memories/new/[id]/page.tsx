"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CodeViewer } from "@/components/memories/CodeViewer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Markdown } from "@/components/ui/Markdown";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { api } from "@/lib/api";
import type { Memory } from "@/types/memory";

const fmt = (d: string) => new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function MemoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [m, setM] = useState<Memory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setError(null);
    api<Memory>(`/api/memories/${id}`).then(setM).catch((e) => setError(e.message));
  }, [id]);
  useEffect(load, [load]);

  const toggleFavorite = async () => {
    if (!m) return;
    try { setM(await api<Memory>(`/api/memories/${id}`, { method: "PATCH", body: JSON.stringify({ isFavorite: !m.isFavorite }) })); }
    catch { toast.error("Couldn't update favorite."); }
  };

  const remove = async () => {
    setDeleting(true);
    try { await api(`/api/memories/${id}`, { method: "DELETE" }); toast.success("Memory deleted"); router.push("/dashboard/memories"); }
    catch (e) { toast.error((e as Error).message); setDeleting(false); }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!m) return <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/dashboard/memories" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft className="size-4" /> Back to library</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">{m.title}</h1>
        <div className="flex items-center gap-2">
          <button onClick={toggleFavorite} aria-pressed={m.isFavorite} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface">
            <Star className={`size-4 ${m.isFavorite ? "fill-accent text-accent" : ""}`} /> {m.isFavorite ? "Favorited" : "Favorite"}
          </button>
          <Link href={`/dashboard/memories/${m.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface"><Pencil className="size-4" /> Edit</Link>
          <button onClick={() => setConfirm(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-err hover:bg-err/10"><Trash2 className="size-4" /> Delete</button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-brand/15 px-2 py-1 text-xs text-brand-soft">{m.language}</span>
        {m.tags.map((t) => (<span key={t} className="rounded-md bg-surface-2 px-2 py-1 text-xs text-muted">{t}</span>))}
      </div>

      <section className="mt-10"><h2 className="mb-2 font-display text-xl font-semibold">Problem</h2><Markdown>{m.problem}</Markdown></section>
      <section className="mt-8"><h2 className="mb-2 font-display text-xl font-semibold">Solution</h2><Markdown>{m.solution}</Markdown></section>
      {m.code && <section className="mt-8"><h2 className="mb-2 font-display text-xl font-semibold">Code</h2><CodeViewer code={m.code} language={m.language} /></section>}
      {m.sourceUrl && (
        <a href={m.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-1.5 text-sm text-brand-soft hover:underline">
          <ExternalLink className="size-4" /> Source
        </a>
      )}
      <p className="mt-10 border-t border-line pt-4 text-sm text-muted">Created {fmt(m.createdAt)} · Updated {fmt(m.updatedAt)}</p>

      <ConfirmDialog open={confirm} title="Delete this memory?" body="It will be removed permanently, along with its search index entry." confirmLabel="Delete" loading={deleting} onConfirm={remove} onCancel={() => setConfirm(false)} />
    </article>
  );
}