"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

/* Route protection comes with the Appwrite session check (middleware) in the auth step. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="min-h-dvh lg:pl-64">
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <DashboardHeader onMenu={() => setMenu(true)} />
      <main className="px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}