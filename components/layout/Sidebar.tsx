"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Library, LayoutDashboard, LogOut, PlusCircle, Search, Settings, Star, X } from "lucide-react";
import { toast } from "sonner";
import { logout } from "@/lib/auth-client";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/memories", label: "My Memories", icon: Library },
  { href: "/dashboard/memories/new", label: "Save Memory", icon: PlusCircle, exact: true },
  { href: "/dashboard/search", label: "AI Search", icon: Search },
  { href: "/dashboard/favorites", label: "Favorites", icon: Star },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || (pathname.startsWith(href + "/") && !NAV.some((n) => n.exact && n.href === pathname));

  const onLogout = async () => {
    try { await logout(); router.push("/login"); router.refresh(); }
    catch { toast.error("Couldn't log out. Try again."); }
  };

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2 px-3 py-1 font-display text-lg font-semibold tracking-tight">
        <span className="grid size-8 place-items-center rounded-lg bg-brand text-white"><BrainCircuit className="size-4.5" /></span>
        RecallAI
      </Link>
      <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Dashboard">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const on = active(href, exact);
          return (
            <Link key={href} href={href} onClick={onNavigate} aria-current={on ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${on ? "text-fg" : "text-muted hover:text-fg"}`}>
              {on && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-surface-2" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <Icon className="relative size-4.5" />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>
      <button onClick={onLogout} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:text-err">
        <LogOut className="size-4.5" /> Log out
      </button>
    </div>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface/60 p-4 backdrop-blur-xl lg:block">
        <NavContent />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/60 lg:hidden" aria-hidden />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-surface p-4 lg:hidden" role="dialog" aria-label="Navigation">
              <button onClick={onClose} aria-label="Close menu" className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg text-muted hover:text-fg"><X className="size-5" /></button>
              <NavContent onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}