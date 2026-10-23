"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MemoryEditor } from "@/components/memories/MemoryEditor";
import { api } from "@/lib/api";
import type { Memory } from "@/types/memory";

export default function NewMemoryPage() {
  const router = useRouter();
  return (
    <div>
      <h1 className="mx-auto mb-8 max-w-3xl font-display text-3xl font-semibold tracking-tight">Save a memory</h1>
      <MemoryEditor submitLabel="Save memory" onSubmit={async (v) => {
        const m = await api<Memory>("/api/memories", { method: "POST", body: JSON.stringify(v) }); // resolves only after it's stored
        toast.success("Memory saved");
        router.push(`/dashboard/memories/${m.id}`);
      }} />
    </div>
  );
}