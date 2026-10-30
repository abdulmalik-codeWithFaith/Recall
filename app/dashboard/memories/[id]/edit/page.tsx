"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { MemoryEditor } from "@/components/memories/MemoryEditor";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { api } from "@/lib/api";
import type { Memory } from "@/types/memory";
import type { MemoryValues } from "@/lib/validation/memory";

export default function EditMemoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api<Memory>(`/api/memories/${id}`).then(setMemory).catch((e) => setError(e.message));
  }, [id]);
  useEffect(load, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!memory) return <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="h-12" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;

  const { title, problem, solution, code, language, tags, sourceUrl, isFavorite } = memory;
  const initial = { title, problem, solution, code, language, tags, sourceUrl: sourceUrl ?? "", isFavorite } as MemoryValues;

  return (
    <div>
      <h1 className="mx-auto mb-8 max-w-3xl font-display text-3xl font-semibold tracking-tight">Edit memory</h1>
      <MemoryEditor initial={initial} submitLabel="Save changes" onSubmit={async (v) => {
        await api<Memory>(`/api/memories/${id}`, { method: "PATCH", body: JSON.stringify(v) });
        toast.success("Changes saved");
        router.push(`/dashboard/memories/${id}`);
      }} />
    </div>
  );
}