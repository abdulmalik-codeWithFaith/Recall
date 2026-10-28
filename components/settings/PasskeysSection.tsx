"use client";
import { useCallback, useEffect, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Check, KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { inputCls } from "@/components/auth/AuthShell";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/states";
import { api, ApiError } from "@/lib/api";
import { describePasskeyError, deviceLabel, passkeysSupported, signInWithPasskey } from "@/lib/passkey-client";

interface Passkey { id: string; name: string; createdAt: string; lastUsedAt: string | null }
const day = (d: string) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export function PasskeysSection() {
  const [list, setList] = useState<Passkey[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [toDelete, setToDelete] = useState<Passkey | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api<{ passkeys: Passkey[] }>("/api/auth/passkeys").then((d) => setList(d.passkeys)).catch((e) => { toast.error(e.message); setList([]); });
  }, []);
  useEffect(load, [load]);

  const register = async () => {
    const { passkeyId, publicKey } = await api<{ passkeyId: string; publicKey: never }>("/api/auth/passkeys/options", { method: "POST", body: JSON.stringify({ name: deviceLabel() }) });
    const credential = await startRegistration({ optionsJSON: publicKey });
    await api("/api/auth/passkeys/verify", { method: "POST", body: JSON.stringify({ passkeyId, credential }) });
  };

  const add = async () => {
    setAdding(true);
    try {
      try { await register(); }
      catch (e) {
        // Adding or removing passkeys needs a sign-in within the last 10 minutes. Re-confirm, then retry once.
        if (e instanceof ApiError && e.type === "user_reauthentication_required") {
          toast.info("Confirm it's you with your passkey, then we'll add the new one.");
          await signInWithPasskey();
          await register();
        } else throw e;
      }
      toast.success("Passkey added");
      load();
    } catch (e) { toast.error(describePasskeyError(e, "signup")); }
    setAdding(false);
  };

  const rename = async (id: string) => {
    try { await api(`/api/auth/passkeys/${id}`, { method: "PATCH", body: JSON.stringify({ name: draft }) }); setEditing(null); load(); }
    catch (e) { toast.error((e as Error).message); }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      try { await api(`/api/auth/passkeys/${toDelete.id}`, { method: "DELETE" }); }
      catch (e) {
        if (e instanceof ApiError && e.type === "user_reauthentication_required") {
          await signInWithPasskey();
          await api(`/api/auth/passkeys/${toDelete.id}`, { method: "DELETE" });
        } else throw e;
      }
      toast.success("Passkey removed");
      setToDelete(null);
      load();
    } catch (e) { toast.error(describePasskeyError(e, "signin")); }
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Passkeys are how you sign in. Add one on each device you use, so losing a device never locks you out of your memories.</p>
      {list === null ? <Skeleton className="h-16" /> : (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {list.map((p) => (
            <li key={p.id} className="flex items-center gap-3 p-4">
              <KeyRound className="size-5 shrink-0 text-brand-soft" />
              <div className="min-w-0 flex-1">
                {editing === p.id ? (
                  <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && rename(p.id)} aria-label="Passkey name" className={`${inputCls} !py-1.5 text-sm`} />
                ) : <p className="truncate text-sm font-medium">{p.name}</p>}
                <p className="text-xs text-muted">Added {day(p.createdAt)}{p.lastUsedAt ? ` · Last used ${day(p.lastUsedAt)}` : ""}</p>
              </div>
              {editing === p.id ? (
                <button onClick={() => rename(p.id)} aria-label="Save name" className="grid size-8 place-items-center rounded-lg text-ok hover:bg-surface-2"><Check className="size-4" /></button>
              ) : (
                <button onClick={() => { setEditing(p.id); setDraft(p.name); }} aria-label={`Rename ${p.name}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"><Pencil className="size-4" /></button>
              )}
              <button onClick={() => setToDelete(p)} aria-label={`Remove ${p.name}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-err"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={add} disabled={adding || !passkeysSupported()} className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
        <Plus className="size-4" /> {adding ? "Waiting for your device…" : "Add a passkey"}
      </button>
      <ConfirmDialog open={!!toDelete} title="Remove this passkey?" body={`“${toDelete?.name ?? ""}” will no longer sign you in. You can't remove your last passkey.`} confirmLabel="Remove" loading={deleting} onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}