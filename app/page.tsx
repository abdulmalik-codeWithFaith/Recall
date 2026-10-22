"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, BrainCircuit, ChevronDown, Code2, Database, Library, Lock, Menu, Search, Sparkles, Tags, X, Zap,
} from "lucide-react";

/* ───────── Example data for the demo (clearly labelled as an example in the UI) ───────── */
const DEMOS = [
  {
    query: "my app can't read data after users sign in",
    title: "Firestore: permission denied after login",
    problem: "Authenticated users got “Missing or insufficient permissions” when reading the orders collection.",
    solution: "Security rules were still in test mode and had expired. Scope reads to the signed-in user instead.",
    code: "match /orders/{id} {\n  allow read: if request.auth.uid == resource.data.uid;\n}",
    tags: ["Firebase", "Security rules"], lang: "JavaScript",
  },
  {
    query: "component keeps re-rendering forever",
    title: "React: infinite render loop in useEffect",
    problem: "A component re-rendered endlessly and froze the tab after adding a fetch.",
    solution: "The effect depended on an object recreated every render. Depend on its id, or memoize it.",
    code: "useEffect(() => {\n  load(filters.id);\n}, [filters.id]);",
    tags: ["React", "Hooks"], lang: "TypeScript",
  },
  {
    query: "browser blocks my API call from localhost",
    title: "CORS error calling the API from localhost:3000",
    problem: "Requests from the frontend failed with a missing Access-Control-Allow-Origin header.",
    solution: "Allow the dev origin on the server, and handle the OPTIONS preflight request.",
    code: "res.setHeader(\"Access-Control-Allow-Origin\",\n  \"http://localhost:3000\");",
    tags: ["CORS", "Node.js"], lang: "JavaScript",
  },
];

/* ───────── Navbar ───────── */
const LINKS = [["Features", "#features"], ["How it works", "#how"], ["FAQ", "#faq"]];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-white"><BrainCircuit className="size-4.5" /></span>
          RecallAI
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map(([l, h]) => (
            <a key={h} href={h} className="text-sm text-muted transition-colors hover:text-fg">{l}</a>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="rounded-lg px-3.5 py-2 text-sm text-muted transition-colors hover:text-fg">Log in</Link>
          <Link href="/register" className="rounded-lg bg-fg px-4 py-2 text-sm font-medium text-bg transition-transform active:scale-95">Get started</Link>
        </div>
        <button aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)} className="grid size-10 place-items-center rounded-lg border border-line md:hidden">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-line md:hidden">
            <div className="flex flex-col gap-1 p-4">
              {LINKS.map(([l, h]) => (
                <a key={h} href={h} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-muted hover:bg-surface">{l}</a>
              ))}
              <Link href="/login" className="rounded-lg px-3 py-3 text-muted hover:bg-surface">Log in</Link>
              <Link href="/register" className="mt-1 rounded-lg bg-brand px-3 py-3 text-center font-medium text-white">Get started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ───────── Search demo: the product's core moment ───────── */
function Demo() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "searching" | "done">("typing");
  const d = DEMOS[i];

  useEffect(() => {
    if (reduce) { setTyped(d.query); setPhase("done"); return; }
    setTyped(""); setPhase("typing");
    let n = 0;
    const t = setInterval(() => {
      n++; setTyped(d.query.slice(0, n));
      if (n >= d.query.length) { clearInterval(t); setPhase("searching"); }
    }, 28);
    return () => clearInterval(t);
  }, [i, reduce, d.query]);

  useEffect(() => {
    if (phase !== "searching") return;
    const t = setTimeout(() => setPhase("done"), 850);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-brand/50 to-transparent opacity-60 blur-sm" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/30">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search className="size-4.5 shrink-0 text-brand-soft" />
          <p className="min-h-6 flex-1 truncate text-[15px]" aria-live="polite">
            {typed}
            {phase === "typing" && <span className="caret ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-fg" />}
          </p>
          <span className="hidden rounded-md border border-line px-2 py-0.5 text-xs text-muted sm:block">Example</span>
        </div>

        <div className="min-h-[19rem] p-4">
          <AnimatePresence mode="wait">
            {phase !== "done" ? (
              <motion.div key="skeleton" exit={{ opacity: 0 }} className="space-y-3" aria-hidden>
                <div className="shimmer h-5 w-2/3 rounded-md" style={{ opacity: phase === "searching" ? 1 : 0.35 }} />
                <div className="shimmer h-3.5 w-full rounded-md" style={{ opacity: phase === "searching" ? 1 : 0.35 }} />
                <div className="shimmer h-24 w-full rounded-lg" style={{ opacity: phase === "searching" ? 1 : 0.35 }} />
              </motion.div>
            ) : (
              <motion.article key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-ok/15 px-2.5 py-1 font-medium text-ok"><Sparkles className="size-3" /> Closest memory</span>
                  <span className="text-muted">Matched on meaning, not on your exact words</span>
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d.problem}</p>
                <p className="mt-2 text-sm leading-relaxed"><span className="hl">{d.solution}</span></p>
                <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-bg p-3 font-mono text-xs leading-relaxed text-brand-soft"><code>{d.code}</code></pre>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[d.lang, ...d.tags].map((t) => (<span key={t} className="rounded-md bg-surface-2 px-2 py-1 text-xs text-muted">{t}</span>))}
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2/50 px-4 py-3">
          <span className="text-xs text-muted">Try another:</span>
          {DEMOS.map((x, n) => (
            <button key={x.title} onClick={() => setI(n)} aria-pressed={n === i}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${n === i ? "border-brand bg-brand/15 text-fg" : "border-line text-muted hover:text-fg"}`}>
              {x.tags[0]}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted">Sample data for illustration. Not connected to a real account.</p>
    </div>
  );
}

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 pt-16 sm:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="font-display text-[clamp(2.75rem,8vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
          Stop solving<br />
          <span className="echo" data-text="the same bug">the same bug</span><br />
          twice.
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.6 }}
          className="mx-auto mt-7 max-w-xl text-pretty text-lg leading-relaxed text-muted">
          RecallAI remembers the problems you’ve solved, the code you wrote, and the fix that finally worked. Save it once. Find it later by describing it in your own words.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-medium text-white shadow-lg shadow-brand/30 transition-transform active:scale-95">
            Start remembering <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a href="#features" className="rounded-xl border border-line px-6 py-3.5 font-medium transition-colors hover:bg-surface">Explore features</a>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="mt-16">
        <Demo />
      </motion.div>
    </section>
  );
}

/* ───────── Problem ───────── */
const PAINS = [
  "You fixed this exact error last month. You can’t remember how.",
  "The snippet that worked is buried in an old chat.",
  "You search your notes and bookmarks and find nothing useful.",
  "You rebuild the same debugging steps from scratch.",
  "An hour goes by to find a five-minute answer.",
];

function Problem() {
  return (
    <section className="border-y border-line bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 md:grid-cols-[1fr_1.3fr]">
        <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">You’ve already solved most of today’s problems.</h2>
        <ul className="divide-y divide-line">
          {PAINS.map((p) => (<li key={p} className="py-5 text-lg text-muted first:pt-0">{p}</li>))}
        </ul>
      </div>
    </section>
  );
}

/* ───────── Features (bento: sizes follow importance) ───────── */
const FEATURES = [
  { icon: Search, t: "AI semantic search", d: "Describe the problem the way you’d explain it to a teammate. RecallAI finds memories by meaning, so you don’t need the original keywords.", span: "md:col-span-2 md:row-span-2", big: true },
  { icon: Library, t: "Developer memory library", d: "Every problem and fix in one searchable place.", span: "" },
  { icon: Code2, t: "Code snippet storage", d: "Syntax-highlighted code, one click to copy.", span: "" },
  { icon: Tags, t: "Smart organization", d: "Group by language and technology tags.", span: "" },
  { icon: Lock, t: "Private workspace", d: "Your memories are yours. No one else can read them.", span: "" },
  { icon: Zap, t: "Instant retrieval", d: "From “what was that fix?” to the answer in seconds.", span: "md:col-span-2" },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-28">
      <h2 className="max-w-2xl font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Everything you learned, one question away.</h2>
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, t, d, span, big }) => (
          <div key={t} className={`group rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brand/50 ${span}`}>
            <Icon className={`${big ? "size-8" : "size-6"} text-brand-soft`} />
            <h3 className={`mt-5 font-display font-semibold tracking-tight ${big ? "text-3xl" : "text-xl"}`}>{t}</h3>
            <p className={`mt-2 leading-relaxed text-muted ${big ? "max-w-md text-lg" : "text-sm"}`}>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────── How it works (a real sequence, so numbered) ───────── */
const STEPS = [
  ["You hit a problem", "A cryptic error, a failing deploy, a config that won’t behave."],
  ["Save the problem and the fix", "Write what happened, what worked, and paste the code."],
  ["RecallAI makes it searchable", "Your memory is converted into an embedding and stored privately in Appwrite VectorsDB."],
  ["Search in plain language", "Months later, describe the problem. The right memory comes back."],
];

function How() {
  return (
    <section id="how" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-28">
        <h2 className="max-w-2xl font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Four steps. One of them is the hard part, and you’re already doing it.</h2>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {STEPS.map(([t, d], n) => (
            <li key={t} className="bg-bg p-6">
              <span className="font-display text-5xl font-semibold text-brand/70">{n + 1}</span>
              <h3 className="mt-6 font-display text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────── Built on Appwrite ───────── */
function Stack() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-28">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <Database className="size-8 text-brand-soft" />
          <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-balance">Built on Appwrite VectorsDB.</h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">Appwrite Authentication keeps your account secure. Appwrite generates the embeddings, and VectorsDB finds your memories by similarity.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Appwrite VectorsDB", "Appwrite Auth", "Appwrite Embeddings", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"].map((s) => (
            <span key={s} className="rounded-full border border-line bg-surface px-4 py-2 text-sm">{s}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */
const FAQ = [
  ["Is my data private?", "Yes. Each memory belongs to your account and is only readable by you."],
  ["How is this different from keyword search?", "Keyword search needs the exact words you used before. RecallAI compares meaning, so a different description of the same problem still finds it."],
  ["What can I save?", "Problems, solutions, code snippets, tags, the language, and an optional source link."],
  ["Which languages are supported?", "JavaScript, TypeScript, Python, Java, PHP, C#, C++, Go, Rust, SQL, and Other."],
  ["Is it free?", "RecallAI is a hackathon project built for Appwrite Databases Hackathon 2026."],
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 pb-28">
      <h2 className="font-display text-4xl font-semibold tracking-tight">Questions</h2>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {FAQ.map(([q, a], n) => (
          <div key={q}>
            <button onClick={() => setOpen(open === n ? null : n)} aria-expanded={open === n} className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-medium">
              {q}
              <ChevronDown className={`size-5 shrink-0 text-muted transition-transform ${open === n ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {open === n && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="pb-5 leading-relaxed text-muted">{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────── CTA + Footer ───────── */
function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <div className="rounded-3xl border border-brand/40 bg-gradient-to-br from-brand/25 via-surface to-surface px-6 py-16 text-center">
        <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Save what you learned today. Find it tomorrow.</h2>
        <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-fg px-6 py-3.5 font-medium text-bg transition-transform active:scale-95">
          Start remembering <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row">
        <p>RecallAI. Built for Appwrite Databases Hackathon 2026.</p>
        <div className="flex gap-6">
          <a href="https://github.com" className="hover:text-fg">GitHub</a>
          <a href="https://appwrite.io" className="hover:text-fg">Appwrite</a>
          <Link href="/login" className="hover:text-fg">Log in</Link>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Features />
        <How />
        <Stack />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}