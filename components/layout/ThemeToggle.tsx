"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/hooks/useTheme";

const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light theme" },
  { value: "dark", icon: Moon, label: "Dark theme" },
  { value: "system", icon: Monitor, label: "System theme" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-lg border border-line bg-surface p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button key={value} role="radio" aria-checked={theme === value} aria-label={label} onClick={() => setTheme(value)}
          className={`grid size-8 place-items-center rounded-md transition-colors ${theme === value ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"}`}>
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}