"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { inputCls } from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/FormField";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PasskeysSection } from "@/components/settings/PasskeysSection";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth-client";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-line bg-surface p-6">
    <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
    <div className="mt-5 space-y-4">{children}</div>
  </section>
);

export default function SettingsPage() {
  const router = useRouter();
  const user = useUser();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) setName(user.name); }, [user]);

  const saveName = async () => {
    setSaving(true);
    try { await api("/api/auth/profile", { method: "PATCH", body: JSON.stringify({ name }) }); toast.success("Name updated"); router.refresh(); }
    catch (e) { toast.error((e as Error).message); }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>

      <Section title="Profile">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-surface-2 font-display text-lg font-semibold ring-1 ring-line">
            {(user?.name ?? "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?"}
          </span>
          <p className="font-medium">{user?.name ?? "…"}</p>
        </div>
        <Field label="Display name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
        <button onClick={saveName} disabled={saving || !name.trim() || name === user?.name} className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">{saving ? "Saving…" : "Update name"}</button>
      </Section>

      <Section title="Preferences">
        <div className="flex items-center justify-between gap-4"><span className="text-sm">Theme</span><ThemeToggle /></div>
      </Section>

      <Section title="Passkeys"><PasskeysSection /></Section>

      <button onClick={async () => { try { await logout(); router.push("/login"); router.refresh(); } catch { toast.error("Couldn't log out."); } }}
        className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm hover:text-err"><LogOut className="size-4" /> Log out</button>
    </div>
  );
}