import ReactMarkdown from "react-markdown";

/** react-markdown does not render raw HTML by default, so saved content can't inject markup. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 leading-relaxed [&_a]:text-brand-soft [&_a]:underline [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}