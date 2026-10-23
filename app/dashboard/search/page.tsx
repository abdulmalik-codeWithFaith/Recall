"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { api } from "@/lib/api";
import type { SearchResult } from "@/types/memory";

const EXAMPLES = [
  "How did I fix Firebase permission errors?",
  "Why was my React component rendering repeatedly?",
  "What was the solution to my API CORS issue?",
  "How did I configure environment variables?",
];
const RECENT_KEY = "recent-searches";

function SearchView() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const last = useRef("");

  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")); } catch { /* ignore */ } }, []);

  const run = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q) return;
    last.current = q; setQuery(q); setLoading(true); setError(null);
    try {
      const d = await api<{ results: SearchResult[] }>("/api/search", { method: "POST", body: JSON.stringify({ query: q }) });
      setResults(d.results);
      const next = [q, ...recent.filter((r) => r !== q)].slice(0, 5);
      setRecent(next);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    } catch (e) { setError((e as Error).message); }
    setLoading(false);
  }, [recent]);

  useEffect(() => { const q = params.get("q"); if (q) run(q); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Search your memory</h1>
      <form onSubmit={(e) => { e.preventDefault(); run(query); }} role="search" className="relative mt-6">
        <Sparkles className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-soft" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Describe the problem" placeholder="What technical problem are you trying to remember?"
          className="w-full rounded-2xl border border-line bg-surface py-4 pl-12 pr-28 text-base outline-none transition-colors placeholder:text-muted/70 focus:border-brand" />
        <button type="submit" disabled={loading || !query.trim()} className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          <Search className="size-4" /> Search
        </button>
      </form>

      <div className="mt-8">
        {loading ? (
          <div className="space-y-4" aria-busy="true">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-36" />)}</div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => run(last.current)} />
        ) : results === null ? (
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-sm text-muted">Try describing a problem like this:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((x) => (<button key={x} onClick={() => run(x)} className="rounded-full border border-line px-3.5 py-2 text-left text-sm text-muted hover:text-fg">{x}</button>))}
              </div>
            </div>
            {recent.length > 0 && (
              <div>
                <p className="mb-3 text-sm text-muted">Recent searches</p>
                <div className="flex flex-wrap gap-2">
                  {recent.map((x) => (<button key={x} onClick={() => run(x)} className="rounded-full bg-surface-2 px-3.5 py-2 text-sm hover:bg-surface">{x}</button>))}
                </div>
              </div>
            )}
          </div>
        ) : results.length === 0 ? (
          <EmptyState title="No matching memories" body="Nothing you've saved is close to that description. Try different wording, or save this one once you've solved it." href="/dashboard/memories/new" cta="Save a memory" />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted">{results.length} {results.length === 1 ? "memory" : "memories"} found, closest first</p>
            {results.map((r, i) => (<SearchResultCard key={r.memory.id} result={r} rank={i + 1} />))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchView /></Suspense>;
}