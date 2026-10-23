"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ConfirmDialog({ open, title, body, confirmLabel, loading, onConfirm, onCancel }: {
  open: boolean; title: string; body: string; confirmLabel: string; loading?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onCancel}>
          <motion.div role="alertdialog" aria-modal="true" aria-label={title} initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={onCancel} className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface-2">Cancel</button>
              <button onClick={onConfirm} disabled={loading} className="rounded-lg bg-err px-4 py-2 text-sm font-medium text-white disabled:opacity-70">{loading ? "Deleting…" : confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}