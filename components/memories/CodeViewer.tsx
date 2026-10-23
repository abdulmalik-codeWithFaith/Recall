"use client";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

const SHIKI: Record<string, string> = {
  JavaScript: "javascript", TypeScript: "typescript", Python: "python", Java: "java", PHP: "php",
  "C#": "csharp", "C++": "cpp", Go: "go", Rust: "rust", SQL: "sql", Other: "text",
};

export function CodeViewer({ code, language }: { code: string; language: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("shiki")
      .then(({ codeToHtml }) => codeToHtml(code, { lang: SHIKI[language] ?? "text", theme: "github-dark" }))
      .then((out) => !cancelled && setHtml(out))
      .catch(() => !cancelled && setHtml(null));
    return () => { cancelled = true; };
  }, [code, language]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-white/60">
        <span>{language}</span>
        <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/10 hover:text-white" aria-live="polite">
          {copied ? <><Check className="size-3.5 text-ok" /> Copied</> : <><Copy className="size-3.5" /> Copy code</>}
        </button>
      </div>
      {html ? (
        <div className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed [&_pre]:!bg-transparent" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-white/80"><code>{code}</code></pre>
      )}
    </div>
  );
}