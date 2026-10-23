import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export const inputCls =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-muted/70 focus:border-brand disabled:opacity-60";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-white"><BrainCircuit className="size-4.5" /></span>
          RecallAI
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-line bg-surface/50 lg:grid lg:place-items-center" aria-hidden>
        <div className="max-w-md px-10">
          <p className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.03em]">Save it once.<br />Find it by meaning.</p>
          <div className="mt-10 rounded-2xl border border-line bg-bg p-5 shadow-2xl shadow-black/30">
            <p className="text-xs text-muted">Example memory</p>
            <p className="mt-2 font-display text-lg font-semibold">Next.js build fails on Vercel</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">Fixed by adding the missing environment variable to the project settings and redeploying.</p>
            <div className="mt-3 flex gap-1.5">
              {["Next.js", "Vercel"].map((t) => (<span key={t} className="rounded-md bg-surface-2 px-2 py-1 text-xs text-muted">{t}</span>))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}