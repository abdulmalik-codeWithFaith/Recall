import Link from "next/link";
import { AlertTriangle, Plus } from "lucide-react";

export function EmptyState({ title, body, href, cta }: { title: string; body?: string; href?: string; cta?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {body && <p className="mx-auto mt-2 max-w-sm text-muted">{body}</p>}
      {href && cta && (
        <Link href={href} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-medium text-white transition-transform active:scale-95">
          <Plus className="size-4" /> {cta}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-err/30 bg-err/10 px-6 py-10 text-center">
      <AlertTriangle className="mx-auto size-6 text-err" />
      <p className="mt-3 font-medium">{message}</p>
      <button onClick={onRetry} className="mt-4 rounded-lg border border-line bg-surface px-4 py-2 text-sm hover:bg-surface-2">Retry</button>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-xl ${className}`} aria-hidden />;
}