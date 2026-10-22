"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Plus, Search } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { ThemeToggle } from "./ThemeToggle";

const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

export function DashboardHeader({ onMenu }: { onMenu: () => void }) {
  const user = useUser();
  const router = useRouter();
  const [q, setQ] = useState("");
  const first = user?.name.split(" ")[0];

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/75 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-8">
        <button onClick={onMenu} aria-label="Open menu" className="grid size-10 place-items-center rounded-lg border border-line lg:hidden"><Menu className="size-5" /></button>
        <p className="hidden font-display text-lg font-semibold tracking-tight sm:block">{first ? `Hi, ${first}` : "Welcome back"}</p>

        <form className="relative mx-auto w-full max-w-md" role="search"
          onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/dashboard/search?q=${encodeURIComponent(q.trim())}`); }}>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search your memories" placeholder="Search your memories"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-brand" />
        </form>

        <div className="hidden sm:block"><ThemeToggle /></div>
        <Link href="/dashboard/memories/new" className="hidden items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition-transform active:scale-95 md:inline-flex">
          <Plus className="size-4" /> Create memory
        </Link>
        <Link href="/dashboard/settings" aria-label="Profile and settings" className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold ring-1 ring-line">
          {user ? initials(user.name) : ""}
        </Link>
      </div>
    </header>
  );
}