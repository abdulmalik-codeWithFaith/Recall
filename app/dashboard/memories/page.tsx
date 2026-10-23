import Link from "next/link";
import { Plus } from "lucide-react";
import { MemoryBrowser } from "@/components/memories/MemoryBrowser";

export default function MemoriesPage() {
  return (
    <div>
      <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight">My memories</h1>
        <Link href="/dashboard/memories/new" className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white md:hidden"><Plus className="size-4" /> New</Link>
      </div>
      <MemoryBrowser />
    </div>
  );
}