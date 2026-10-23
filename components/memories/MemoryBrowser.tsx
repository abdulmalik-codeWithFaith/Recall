"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Search } from "lucide-react";
import { toast } from "sonner";
import { inputCls } from "@/components/auth/AuthShell";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { api } from "@/lib/api";
import { LANGUAGES } from "@/lib/validation/memory";
import type { Memory } from "@/types/memory";
import { MemoryCard } from "./MemoryCard";

const PAGE_SIZE = 12;
const sel = `${inputCls} !w-auto !py-2 text-sm`;

/** Shared by My Memories and Favorites. Filtering, sorting and paging happen server-side. */
export function MemoryBrowser({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [language, setLanguage] = useState("");
  const [tag, setTag] = useState("");
  const [favOnly, setFavOnly] = useState(favoritesOnly);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(0);
  const [reload, setReload] = useState(0);
  const [data, setData] = useState<{ memories: Memory[]; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Memory | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { const t = setTimeout(() => { setDq(q.trim()); setPage(0); }, 300); return () => clearTimeout(t); }, [q]);

  useEffect(() => {
    let cancelled = false;
    const p = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE), sort });
    if (dq) p.set("q", dq);
    if (language) p.set("language", language);
    if (tag.trim()) p.set("tag", tag.trim());
    if (favOnly) p.set("favorite", "true");
    setError(null);
    api<{ memories: Memory[]; total: number }>(`/api/memories?${p}`)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [dq, language, tag, favOnly, sort, page, reload]);

  const toggleFavorite = async (m: Memory) => {
    try {
      await api(`/api/memories/${m.id}`, { method: "PATCH", body: JSON.stringify({ isFavorite: !m.isFavorite }) });
      setReload((n) => n + 1);
    } catch { toast.error("Couldn't update favorite."); }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try { await api(`/api/memories/${toDelete.id}`, { method: "DELETE" }); toast.success("Memory deleted"); setToDelete(null); setReload((n) => n + 1); }
    catch (e) { toast.error((e as Error).message); }
    setDeleting(false);
  };

  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const filtered = Boolean(dq || language || tag.trim());

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search by title" placeholder="Search by title" className={`${inputCls} !py-2 pl-10 text-sm`} />
        </div>
        <select value={language} onChange={(e) => { setLanguage(e.target.value); setPage(0); }} aria-label="Filter by language" className={sel}>
          <option value="">All languages</option>{LANGUAGES.map((l) => (<option key={l}>{l}</option>))}
        </select>
        <input value={tag} onChange={(e) => { setTag(e.target.value); setPage(0); }} aria-label="Filter by tag" placeholder="Tag, e.g. React" className={`${sel} w-36`} />
        <select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")} aria-label="Sort" className={sel}>
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
        </select>
        {!favoritesOnly && (
          <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={favOnly} onChange={(e) => { setFavOnly(e.target.checked); setPage(0); }} className="accent-[var(--brand)]" /> Favorites</label>
        )}
        <div className="ml-auto inline-flex rounded-lg border border-line p-0.5">
          {([["grid", LayoutGrid], ["list", List]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)} aria-label={`${v} view`} aria-pressed={view === v} className={`grid size-8 place-items-center rounded-md ${view === v ? "bg-surface-2" : "text-muted"}`}><Icon className="size-4" /></button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {error ? <ErrorState message={error} onRetry={() => setReload((n) => n + 1)} />
          : !data ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-44" />)}</div>
          : data.memories.length === 0 ? (
            filtered ? <EmptyState title="No memories match" body="Try a different title, language or tag." />
              : favoritesOnly ? <EmptyState title="No favorites yet" body="Star a memory and it will show up here." />
              : <EmptyState title="Your developer memory starts here." body="Save the next bug you fix." href="/dashboard/memories/new" cta="Save your first memory" />
          ) : (
            <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
              {data.memories.map((m) => (
                <MemoryCard key={m.id} memory={m} layout={view} onToggleFavorite={toggleFavorite} onDelete={setToDelete} />
              ))}
            </div>
          )}
      </div>

      {data && pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page" className="grid size-9 place-items-center rounded-lg border border-line disabled:opacity-40"><ChevronLeft className="size-4" /></button>
          <span className="text-muted">Page {page + 1} of {pages}</span>
          <button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)} aria-label="Next page" className="grid size-9 place-items-center rounded-lg border border-line disabled:opacity-40"><ChevronRight className="size-4" /></button>
        </nav>
      )}

      <ConfirmDialog open={!!toDelete} title="Delete this memory?" body={`“${toDelete?.title ?? ""}” will be removed permanently.`} confirmLabel="Delete" loading={deleting} onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}