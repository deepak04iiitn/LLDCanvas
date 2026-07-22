import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Terminal, Play, Cpu, Layers, GitBranch, Zap } from 'lucide-react'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Run Code in 12 Languages - Online Code Execution | LLDCanvas',
  description:
    'Don\'t just design it - run it. LLDCanvas lets you write and execute real code in 12 languages (Python, Java, Go, Rust, C++, TypeScript, and more) in the same workspace as your UML class diagram. No tab-switching, no local setup, no waiting. Integrated code execution for Low-Level Design practice.',
  keywords: [
    'online code execution', 'run code online', 'LLD coding practice',
    'code editor online', 'Java Python Go code runner', 'design and code',
    'LLD implementation', 'online compiler', 'multi-language code runner',
    'software design implementation',
  ],
  alternates: { canonical: '/features/code-execution' },
  openGraph: {
    title: 'Code Execution in 12 Languages - LLDCanvas',
    description: 'Write and run real code next to your UML diagram. Python, Java, Go, Rust, TypeScript, and 7 more.',
    type: 'website', url: '/features/code-execution',
  },
}

const LANGUAGES = [
  { name: 'Python',     color: 'bg-yellow-50 text-yellow-700 border-yellow-200',  note: 'Most popular for LLD interviews' },
  { name: 'Java',       color: 'bg-orange-50 text-orange-700 border-orange-200',  note: 'FAANG standard language' },
  { name: 'Go',         color: 'bg-sky-50 text-sky-700 border-sky-200',           note: 'Google, Uber, Cloudflare' },
  { name: 'Rust',       color: 'bg-rose-50 text-rose-700 border-rose-200',        note: 'Systems and performance' },
  { name: 'TypeScript', color: 'bg-blue-50 text-blue-700 border-blue-200',        note: 'Full-stack and Node.js' },
  { name: 'C++',        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',  note: 'Competitive and systems' },
  { name: 'C',          color: 'bg-slate-50 text-slate-700 border-slate-200',     note: 'Low-level systems' },
  { name: 'C#',         color: 'bg-violet-50 text-violet-700 border-violet-200',  note: 'Microsoft / .NET ecosystem' },
  { name: 'Ruby',       color: 'bg-red-50 text-red-700 border-red-200',           note: 'Scripting and web' },
  { name: 'PHP',        color: 'bg-purple-50 text-purple-700 border-purple-200',  note: 'Web backend' },
  { name: 'F#',         color: 'bg-teal-50 text-teal-700 border-teal-200',        note: 'Functional on .NET' },
  { name: 'Haskell',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', note: 'Purely functional' },
]

const FAQ = [
  {
    q: 'Where does the code actually run?',
    a: 'In a secure sandboxed execution environment — not in your browser. You write code, click Run, and receive real stdout and stderr output, exactly like running locally. The sandbox enforces memory and time limits so it\'s safe to run arbitrary code.',
  },
  {
    q: 'Can I run code next to my UML diagram in the same window?',
    a: 'Yes — the code execution panel slides in as a side panel within the editor workspace, so you can implement a class you just diagrammed without switching windows or tabs. The diagram stays visible while you code.',
  },
  {
    q: 'Can I provide custom input to my program?',
    a: 'Yes — the panel includes an input section where you can type stdin that your program reads at runtime. This is useful for testing user inputs, file paths, or any interactive CLI behavior.',
  },
  {
    q: 'Is there a daily execution limit?',
    a: 'Free accounts get 15 successful submissions per day. Pro gets 25, and Ultimate gets 50. The limit resets at midnight UTC.',
  },
  {
    q: 'What happens when I hit the daily limit?',
    a: 'You\'ll see a clear message explaining the limit and your reset time. You can upgrade your plan to get more daily executions, or wait for the reset.',
  },
  {
    q: 'How fast is code execution?',
    a: 'Typical run times are under 5 seconds for most programs. Compilation languages like Java, Go, and Rust have a 1-3 second compile step before execution. Interpreted languages like Python run almost instantly.',
  },
]

export default function CodeExecutionFeaturePage() {
  return (
    <div className="overflow-hidden">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Code Execution - Run Code in 12 Languages',
        url: 'https://lldcanvas.com/features/code-execution',
        description: 'Write and execute real code in 12 programming languages within the LLDCanvas workspace.',
      }} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:px-8 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left */}
            <div>
              <p className="mb-4 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
                <span className="text-gold">¶06</span> — Code Execution
              </p>
              <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
                Don&apos;t just design it.{' '}
                <span className="text-brand">Run it.</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-ink-muted">
                A UML diagram is a plan. Code is the proof. LLDCanvas lets you implement the
                class you just diagrammed and execute it in 12 languages — right inside
                the same workspace, without ever opening a new tab or spinning up a local
                environment.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/editor/local"
                  className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-95"
                >
                  Try it in the editor <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Right — code panel mockup */}
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-xl border border-hairline-strong shadow-xl">
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#1a1916] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-white/40" />
                    <span className="font-mono text-[10px] text-white/50">Code Execution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-white/40">Python 3</span>
                    <button className="flex items-center gap-1 rounded-md bg-brand px-2.5 py-1 font-mono text-[9px] font-bold text-white">
                      <Play size={9} /> Run
                    </button>
                  </div>
                </div>
                {/* Code */}
                <pre className="bg-[#14130f] px-5 py-4 font-mono text-[12px] leading-[1.9] text-emerald-300/90 overflow-hidden">
<span className="text-blue-400/80">class</span> <span className="text-amber-300">ParkingLot</span>:
  <span className="text-blue-400/80">def</span> <span className="text-amber-300/80">__init__</span>(self, levels):
    self.levels = levels

  <span className="text-blue-400/80">def</span> <span className="text-amber-300/80">get_available_spot</span>(self):
    <span className="text-blue-400/80">for</span> level <span className="text-blue-400/80">in</span> self.levels:
      spot = level.get_free_spot()
      <span className="text-blue-400/80">if</span> spot: <span className="text-blue-400/80">return</span> spot
    <span className="text-blue-400/80">return</span> <span className="text-rose-400/70">None</span>
                </pre>
                {/* Output */}
                <div className="border-t border-white/[0.08] bg-[#11100d] px-4 py-3">
                  <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-widest text-white/30">Output</p>
                  <p className="font-mono text-[12px] text-emerald-400">Spot A-101 is available</p>
                  <p className="font-mono text-[12px] text-white/40">Process finished with exit code 0</p>
                </div>
              </div>
              {/* Quick stats */}
              <div className="flex items-center justify-between rounded-xl border border-hairline bg-paper-elevated px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-brand" />
                  <span className="font-mono text-[10px] text-ink-muted">Ran in 0.34s</span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600">Success</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="border-b border-hairline bg-paper-elevated/60">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-hairline sm:grid-cols-4 sm:divide-y-0">
            {[
              { value: '12',  label: 'languages supported' },
              { value: '1',   label: 'unified workspace' },
              { value: '<5s', label: 'typical run time' },
              { value: '0',   label: 'local setup required' },
            ].map(s => (
              <div key={s.label} className="px-6 py-8 text-center">
                <p className="font-mono text-3xl font-black text-brand">{s.value}</p>
                <p className="mt-1 text-[13px] text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Languages grid ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-gold">§1</span> — Supported languages
        </p>
        <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
          12 languages. Use the one your interviewer expects.
        </h2>
        <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Every major interview language is supported. Each runs in a real sandboxed
          execution environment — not emulated, not transpiled, not fake.
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {LANGUAGES.map(l => (
            <div key={l.name} className={`flex items-center gap-3 rounded-xl border p-3.5 ${l.color}`}>
              <Terminal size={14} className="shrink-0" />
              <div>
                <p className="font-mono text-sm font-bold">{l.name}</p>
                <p className="text-[11px] opacity-70">{l.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The design-to-code workflow ───────────────────────────────────── */}
      <section className="border-y border-hairline bg-[#14130f] py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-emerald-400/60 uppercase">
            <span className="text-emerald-400">§2</span> — The workflow
          </p>
          <h2 className="mb-3 font-serif text-2xl font-medium text-white">
            From UML diagram to running code, in one tab.
          </h2>
          <p className="mb-10 max-w-xl text-[14px] leading-relaxed text-white/50">
            The typical LLD preparation workflow requires a whiteboard tool, a code editor, and a documentation tab —
            context switching that costs you both time and focus. LLDCanvas collapses all three into one panel.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                n: '1', icon: Layers, title: 'Draw the class diagram',
                body: 'Design your system using the UML editor — classes, relationships, and design patterns.',
                color: 'text-blue-400',
              },
              {
                n: '2', icon: Cpu, title: 'Open the code panel',
                body: 'Click "Write Code" and the code execution panel slides in beside your diagram. Select your language.',
                color: 'text-violet-400',
              },
              {
                n: '3', icon: Play, title: 'Implement and run',
                body: 'Write the implementation, provide test input, hit Run, and see real stdout output — no terminal, no environment, no waiting.',
                color: 'text-emerald-400',
              },
            ].map(({ n, icon: Icon, title, body, color }) => (
              <div key={n} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                  <Icon size={14} className={color} />
                </div>
                <p className="mb-1.5 text-sm font-semibold text-white">{title}</p>
                <p className="text-[13px] leading-relaxed text-white/50">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why this matters for LLD interviews ───────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-gold">§3</span> — Why it matters for LLD preparation
        </p>
        <h2 className="mb-5 font-serif text-2xl font-medium text-ink">
          The gap between design and implementation is where most candidates get tripped up.
        </h2>
        <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink-muted">
          <p>
            Drawing a UML class diagram is one skill. Writing an actual working implementation from that diagram
            is another. Both are tested in LLD rounds at companies like Google, Amazon, Flipkart, and Paytm —
            some interviewers explicitly ask you to implement one or two of the core classes on screen.
          </p>
          <p>
            Practicing with code execution next to your diagram builds both skills simultaneously. You notice when
            your design has a gap — when a method signature you drew doesn&apos;t make sense to implement,
            or when a dependency you drew creates a circular import. The feedback loop is immediate.
          </p>
          <p>
            Combine code execution with the{' '}
            <Link href="/features/interview-questions" className="text-brand hover:underline">100+ practice problems</Link>
            {' '}and{' '}
            <Link href="/features/interview-mode" className="text-brand hover:underline">Interview Mode</Link>
            {' '}for complete end-to-end practice.
          </p>
        </div>
      </section>

      {/* ── Panel features ────────────────────────────────────────────────── */}
      <section className="border-t border-hairline bg-paper-elevated/40 py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">§4</span> — Panel features
          </p>
          <h2 className="mb-8 font-serif text-2xl font-medium text-ink">
            Everything a code panel needs. Nothing it doesn&apos;t.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Terminal,  title: 'Real stdout and stderr', body: 'Get actual compiler/interpreter output — error messages, stack traces, print statements — exactly as you\'d see locally.' },
              { icon: Layers,    title: 'Stdin support', body: 'Paste custom input that your program reads from stdin. Test different inputs without modifying your code.' },
              { icon: GitBranch, title: 'Draggable panel layout', body: 'The code panel and input/output areas are both resizable — drag to give your code or output more space.' },
              { icon: Zap,       title: 'Language-aware editor', body: 'Syntax highlighting and basic auto-indentation for every supported language in the editor panel.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3 rounded-xl border border-hairline bg-paper p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                  <Icon size={14} className="text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeatureFaq items={FAQ} />

      {/* Internal links */}
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">Related features</p>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/features/editor',              label: 'UML Editor — design the classes first' },
            { href: '/features/draft-notation',      label: 'Draft Notation — write diagrams in plain English' },
            { href: '/features/interview-questions', label: 'Practice Problems — 100+ LLD problems to implement' },
            { href: '/features/interview-mode',      label: 'Interview Mode — timed sessions' },
            { href: '/pricing',                      label: 'View daily execution limits by plan' },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-1.5 rounded-lg border border-hairline bg-paper-elevated px-4 py-2 text-[13px] text-ink-muted transition-colors hover:border-brand/30 hover:text-brand"
            >
              {l.label} <ArrowRight size={12} />
            </Link>
          ))}
        </div>
      </section>

      <FeatureCrossLinks exclude="/features/code-execution" />
    </div>
  )
}
