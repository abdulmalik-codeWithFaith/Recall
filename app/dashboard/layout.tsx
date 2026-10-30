"use client";
import { Suspense, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Skeleton } from "@/components/ui/states";

/* Route protection: proxy.ts redirects when there's no session cookie, and every API route re-validates it with Appwrite.
   The Suspense boundaries are required by Next.js 16 Cache Components, because Sidebar and the [id] pages read the URL
   (usePathname / useParams), which is only known at request time. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="min-h-dvh lg:pl-64">
      <Suspense fallback={<div className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface/60 lg:block" />}>
        <Sidebar open={menu} onClose={() => setMenu(false)} />
      </Suspense>
      <DashboardHeader onMenu={() => setMenu(true)} />
      <main className="px-4 py-8 sm:px-8">
        <Suspense fallback={<Skeleton className="mx-auto h-48 max-w-3xl" />}>{children}</Suspense>
      </main>
    </div>
  );
}