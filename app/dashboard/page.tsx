"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Cpu, Library, Plus, Search, Star, TextSearch } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import type { Memory, Stats } from "@/types/memory";

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Memory[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null); setStats(null); setRecent(null);
    try {
      const [s, m] = await Promise.all([fetch("/api/stats"), fetch("/api/memories?limit=6&sort=newest")]);
      if (!s.ok || !m.ok) throw new Error();
      setStats(await s.json());
      setRecent((await m.json()).memories);
    } catch {
      setError("Couldn't load your dashboard.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section aria-label="Statistics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats ? (
          <>
            <StatCard label="Saved memories" value={stats.totalMemories} icon={Library} />
            <StatCard label="Favorites" value={stats.favorites} icon={Star} />
            <StatCard label="Searches" value={stats.searches} icon={TextSearch} />
            <StatCard label="Technologies" value={stats.technologies} icon={Cpu} />
          </>
        ) : Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36" />)}
      </section>

      <section aria-label="Quick actions" className="flex flex-wrap gap-3">
        <Link href="/dashboard/memories/new" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white"><Plus className="size-4" /> Save a new memory</Link>
        <Link href="/dashboard/search" className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm hover:bg-surface"><Search className="size-4" /> Search with AI</Link>
        <Link href="/dashboard/memories" className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm hover:bg-surface"><Library className="size-4" /> Browse all</Link>
      </section>

      <section aria-label="Recent memories">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Recent memories</h2>
        <div className="mt-5">
          {recent === null ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-44" />)}</div>
          ) : recent.length === 0 ? (
            <EmptyState title="Your developer memory starts here." body="Save the next bug you fix and you'll be able to find it by describing it." href="/dashboard/memories/new" cta="Save your first memory" />
          ) : (
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recent.map((m) => (
                <motion.div key={m.id} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}><MemoryCard memory={m} /></motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}