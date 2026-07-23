'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Terminal, Play, Layers, GitBranch, Zap } from 'lucide-react'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { Reveal } from '@/components/features/Reveal'

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPILE_LINES = [
  { sym: '$',  text: 'lldcanvas run --diagram parking-lot.uml --lang python', cls: 'text-ink' },
  { sym: '↳',  text: 'Parsing UML diagram...                    0.11s',        cls: 'text-ink-faint' },
  { sym: '✓',  text: 'Nodes resolved · 6 classes · 4 relationships',            cls: 'text-emerald-600' },
  { sym: '↳',  text: 'Injecting Python 3.11 runtime...          0.23s',        cls: 'text-ink-faint' },
  { sym: '✓',  text: 'Sandbox ready',                                           cls: 'text-emerald-600' },
  { sym: '↳',  text: 'Executing...                              0.34s',        cls: 'text-ink-faint' },
  { sym: '✓',  text: 'Exit code 0 · Process complete',                          cls: 'text-brand font-semibold' },
]

const LANGUAGES = [
  { name: 'python',     version: '3.11',  type: 'interpreted', note: 'Most popular for LLD interviews' },
  { name: 'java',       version: '21',    type: 'compiled',    note: 'FAANG standard language' },
  { name: 'go',         version: '1.22',  type: 'compiled',    note: 'Google, Uber, Cloudflare' },
  { name: 'rust',       version: '1.78',  type: 'compiled',    note: 'Systems and performance' },
  { name: 'typescript', version: '5.4',   type: 'transpiled',  note: 'Full-stack and Node.js' },
  { name: 'c++',        version: 'C++20', type: 'compiled',    note: 'Competitive and systems' },
  { name: 'c',          version: 'C17',   type: 'compiled',    note: 'Low-level systems' },
  { name: 'c#',         version: '12',    type: 'compiled',    note: 'Microsoft / .NET ecosystem' },
  { name: 'ruby',       version: '3.3',   type: 'interpreted', note: 'Scripting and web' },
  { name: 'php',        version: '8.3',   type: 'interpreted', note: 'Web backend' },
  { name: 'f#',         version: '8.0',   type: 'compiled',    note: 'Functional on .NET' },
  { name: 'haskell',    version: '9.8',   type: 'compiled',    note: 'Purely functional' },
]

const TYPE_COLOR: Record<string, string> = {
  interpreted: 'text-amber-600',
  compiled:    'text-sky-600',
  transpiled:  'text-violet-600',
}

const WORKFLOW_STEPS = [
  {
    n: '01', comment: '// step 01 of 03',
    title: 'Design in the UML canvas',
    body:  'Use the drag-and-drop editor or Draft Notation to build your class diagram — classes, methods, relationships, and design patterns.',
    log:   'Diagram parsed · 6 classes · 4 relationships',
    visual: 'uml',
  },
  {
    n: '02', comment: '// step 02 of 03',
    title: 'Pick your language, open the panel',
    body:  'Click "Write Code" in the toolbar. A sliding panel appears beside your diagram. Select any of the 12 supported languages.',
    log:   'Runtime injected · python 3.11 · sandbox ready',
    visual: 'panel',
  },
  {
    n: '03', comment: '// step 03 of 03',
    title: 'Implement the classes, run it',
    body:  'Write the implementation, add test input, click Run. See real stdout and stderr — no local setup, no tab switching, no waiting.',
    log:   'Exit code 0 · Executed in 0.34s',
    visual: 'output',
  },
]

const PANEL_FEATURES = [
  { icon: Terminal,  title: 'Real stdout and stderr',  body: 'Get actual compiler/interpreter output — error messages, stack traces, print statements — exactly as you\'d see locally.' },
  { icon: Layers,    title: 'Stdin support',            body: 'Paste custom input that your program reads from stdin. Test different inputs without modifying your code.' },
  { icon: GitBranch, title: 'Draggable panel layout',  body: 'The code panel and input/output areas are both resizable — drag to give your code or output more space.' },
  { icon: Zap,       title: 'Language-aware editor',   body: 'Syntax highlighting and basic auto-indentation for every supported language in the editor panel.' },
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

// ─── Animated compile-output terminal ────────────────────────────────────────

function CompileTerminal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-hairline-strong bg-paper shadow-lg"
      style={{ boxShadow: '0 8px 40px rgba(35,78,63,0.07)' }}
    >
      {/* macOS-style title bar */}
      <div className="flex items-center gap-2 border-b border-hairline bg-paper-elevated px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
        </div>
        <span className="flex-1 text-center font-mono text-[10px] text-ink-faint/55">
          lldcanvas — bash — 80x24
        </span>
      </div>

      {/* Compile output lines */}
      <div className="space-y-0.5 px-5 py-4">
        {COMPILE_LINES.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.38, duration: 0.22, ease: 'easeOut' }}
            className="flex items-start gap-2.5 font-mono text-[12px] leading-[1.75] sm:text-[13px]"
          >
            <span className="w-3 shrink-0 select-none text-right text-ink-faint/35">{line.sym}</span>
            <span className={line.cls}>{line.text}</span>
            {/* Blinking cursor only on the last visible line */}
            {i === COMPILE_LINES.length - 1 && (
              <motion.span
                className="ml-0.5 inline-block h-3.5 w-1.5 rounded-sm bg-brand/70 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'steps(1)' }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Workflow visuals ─────────────────────────────────────────────────────────

function UmlVisual() {
  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated p-4">
      <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-ink-faint/50">class diagram</p>
      <div className="space-y-2">
        <div className="rounded-lg border border-brand/25 bg-white">
          <div className="border-b border-brand/20 px-3 py-2 text-center font-mono text-[11px] font-bold text-brand">
            ParkingLot
          </div>
          <div className="space-y-0.5 px-3 py-2 font-mono text-[10px] text-ink-muted">
            <p>- levels: Level[]</p>
            <p>- capacity: int</p>
          </div>
          <div className="space-y-0.5 border-t border-hairline px-3 py-2 font-mono text-[10px] text-ink-muted">
            <p>+ getAvailableSpot()</p>
            <p>+ parkVehicle(v: Vehicle)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-6">
          <div className="h-px flex-1 border-t border-dashed border-brand/25" />
          <span className="font-mono text-[9px] text-ink-faint/40">uses</span>
        </div>
        <div className="ml-6 rounded-lg border border-hairline bg-white">
          <div className="border-b border-hairline px-3 py-1.5 text-center font-mono text-[10px] font-bold text-ink-muted">
            Level
          </div>
          <div className="px-3 py-1.5 font-mono text-[9px] text-ink-faint">
            + getFreeSpot()
          </div>
        </div>
      </div>
    </div>
  )
}

function PanelVisual() {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline-strong shadow-md">
      <div className="flex items-center justify-between border-b border-hairline bg-paper-elevated px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal size={11} className="text-ink-faint/50" />
          <span className="font-mono text-[10px] text-ink-faint">Code Execution</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[9px] text-ink-faint">
            python 3.11
          </span>
          <span className="flex items-center gap-1 rounded-md bg-brand px-2.5 py-0.5 font-mono text-[9px] font-bold text-white">
            <Play size={7} /> Run
          </span>
        </div>
      </div>
      <div className="bg-[#1c1b18] px-4 py-3 font-mono text-[11px] leading-[1.9]">
        <span className="text-blue-400">class </span>
        <span className="text-amber-300">ParkingLot</span>
        <span className="text-white/60">:</span>
        <br />
        <span className="text-white/30">&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span className="text-blue-400">def </span>
        <span className="text-amber-300/80">__init__</span>
        <span className="text-white/60">(self, levels):</span>
        <br />
        <span className="text-white/30">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span className="text-white/65">self.levels = levels</span>
        <br />
        <span className="text-white/30">&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span className="text-blue-400">def </span>
        <span className="text-amber-300/80">get_available_spot</span>
        <span className="text-white/60">(self):</span>
      </div>
    </div>
  )
}

function OutputVisual() {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2">
        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint/50">
          Output
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[9px] font-bold text-emerald-600">
          EXIT 0
        </span>
      </div>
      <div className="space-y-0.5 px-4 py-3 font-mono text-[12px]">
        <p className="text-emerald-600">Spot A-101 is available</p>
        <p className="text-emerald-600">Vehicle parked successfully</p>
        <p className="mt-1 text-ink-faint/30">{'─'.repeat(32)}</p>
        <p className="text-ink-faint/50">Process finished · exit code 0</p>
        <p className="text-ink-faint/40">Elapsed: 0.34s</p>
      </div>
    </div>
  )
}

const WORKFLOW_VISUALS: Record<string, React.ReactNode> = {
  uml:    <UmlVisual />,
  panel:  <PanelVisual />,
  output: <OutputVisual />,
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CodeExecutionPageClient() {
  return (
    <div className="overflow-hidden">

      {/* ════════════════════ HERO ════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-12 sm:px-8 sm:pt-16">
          <Reveal>
            <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
              <span className="text-gold">¶06</span>&nbsp;—&nbsp;Code Execution
            </p>
          </Reveal>

          {/* Animated terminal */}
          <CompileTerminal />

          {/* Headline + CTA below the terminal */}
          <Reveal delay={0.15}>
            <div className="mt-8">
              <h1 className="font-serif text-[clamp(2.3rem,5vw,4rem)] font-medium leading-[1.05] tracking-tight text-ink">
                Design it. Write it.{' '}
                <span className="text-brand">Run it.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-[1.8] text-ink-muted">
                A UML diagram is a plan. Code is the proof. LLDCanvas lets you implement
                the class you just diagrammed and execute it in 12 languages — right inside
                the same workspace, no tab switching, no local setup.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href="/editor/local"
                  className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover active:scale-[0.98]"
                >
                  Open the editor <ArrowRight size={14} />
                </Link>
                {/* Pulsing live badge */}
                <span className="flex items-center gap-2 font-mono text-[11px] text-ink-faint">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Sandbox ready · 12 runtimes loaded
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════ STATS ═══════════════════════════════════════ */}
      <Reveal>
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
                  <p className="mt-1 font-mono text-[12px] text-ink-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ════════════════════ LANGUAGES — ls -la table ════════════════════ */}
      <section className="border-b border-hairline py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
              <span className="text-gold">§01</span>&nbsp;—&nbsp;Supported runtimes
            </p>
            <h2 className="mb-2 font-serif text-[clamp(1.5rem,3vw,2.3rem)] font-medium text-ink">
              12 languages. Use the one your interviewer expects.
            </h2>
            <p className="mb-8 max-w-xl text-[14px] leading-relaxed text-ink-muted">
              Every major interview language runs in a real sandboxed environment — not emulated,
              not transpiled in the browser, not fake.
            </p>
          </Reveal>

          {/* ls-la table */}
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated">
              {/* Column headers */}
              <div className="flex items-center gap-4 border-b border-hairline px-5 py-2.5">
                <span className="w-5 shrink-0" />
                <span className="w-28 shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-ink-faint/45">runtime</span>
                <span className="w-16 shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-ink-faint/45">version</span>
                <span className="w-24 shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-ink-faint/45">type</span>
                <span className="flex-1 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-ink-faint/45">best for</span>
              </div>

              {/* Language rows */}
              <div className="divide-y divide-hairline">
                {LANGUAGES.map((lang, i) => (
                  <motion.div
                    key={lang.name}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.035, duration: 0.2 }}
                    className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-paper"
                  >
                    <span className="w-5 shrink-0 text-[11px] text-emerald-500">●</span>
                    <span className="w-28 shrink-0 font-mono text-[12px] font-semibold text-ink">{lang.name}</span>
                    <span className="w-16 shrink-0 font-mono text-[11px] text-ink-faint">{lang.version}</span>
                    <span className={`w-24 shrink-0 font-mono text-[11px] ${TYPE_COLOR[lang.type] ?? 'text-ink-faint'}`}>
                      {lang.type}
                    </span>
                    <span className="flex-1 text-[12px] text-ink-muted">{lang.note}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════ WORKFLOW — stacked code-comment steps ════════ */}
      <section className="border-b border-hairline py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
              <span className="text-gold">§02</span>&nbsp;—&nbsp;The workflow
            </p>
            <h2 className="mb-12 font-serif text-[clamp(1.5rem,3vw,2.3rem)] font-medium text-ink">
              From UML diagram to running code, without leaving the tab.
            </h2>
          </Reveal>

          <div>
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.n}>
                <Reveal delay={i * 0.08}>
                  <div className="grid items-start gap-8 lg:grid-cols-2">
                    {/* Left — comment-style description */}
                    <div className="flex flex-col justify-center py-4">
                      <p className="mb-4 font-mono text-[10px] text-ink-faint/35">{step.comment}</p>
                      <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.38em] text-ink-faint/55">
                        Step {step.n}
                      </p>
                      <h3 className="mb-3 font-serif text-[1.35rem] font-medium text-ink">
                        {step.title}
                      </h3>
                      <p className="text-[14px] leading-relaxed text-ink-muted">{step.body}</p>
                      {/* Log output badge */}
                      <div className="mt-5 flex items-center gap-2 self-start rounded-lg border border-emerald-200/70 bg-emerald-50/50 px-3 py-2">
                        <span className="text-[10px] text-emerald-500">✓</span>
                        <span className="font-mono text-[10px] text-emerald-700">{step.log}</span>
                      </div>
                    </div>

                    {/* Right — visual mockup */}
                    <div>{WORKFLOW_VISUALS[step.visual]}</div>
                  </div>
                </Reveal>

                {/* Connector pipe between steps */}
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="flex justify-center py-3">
                    <div className="flex flex-col items-center">
                      <div className="h-5 w-px bg-hairline-strong" />
                      <span className="select-none font-mono text-[11px] leading-none text-ink-faint/30">│</span>
                      <div className="h-5 w-px bg-hairline-strong" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ WHY IT MATTERS ════════════════════════════════ */}
      <Reveal>
        <section className="border-b border-hairline py-16">
          <div className="mx-auto max-w-5xl px-6 sm:px-8">
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
              <span className="text-gold">§03</span>&nbsp;—&nbsp;Why it matters for LLD preparation
            </p>
            <h2 className="mb-6 font-serif text-[clamp(1.4rem,3vw,2rem)] font-medium text-ink">
              The gap between design and implementation is where most candidates get tripped up.
            </h2>
            <div className="max-w-2xl space-y-4 text-[15px] leading-[1.85] text-ink-muted">
              <p>
                Drawing a UML class diagram is one skill. Writing an actual working implementation
                from that diagram is another. Both are tested in LLD rounds at companies like
                Google, Amazon, Flipkart, and Paytm — some interviewers explicitly ask you to
                implement one or two of the core classes on screen.
              </p>
              <p>
                Practicing with code execution next to your diagram builds both skills
                simultaneously. You notice when your design has a gap — when a method
                signature you drew doesn&apos;t make sense to implement, or when a dependency
                creates a circular import. The feedback loop is immediate.
              </p>
              <p>
                Combine code execution with the{' '}
                <Link href="/features/interview-questions" className="text-brand hover:underline">
                  100+ practice problems
                </Link>
                {' '}and{' '}
                <Link href="/features/interview-mode" className="text-brand hover:underline">
                  Interview Mode
                </Link>
                {' '}for complete end-to-end practice.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ════════════════════ PANEL FEATURES ════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated/40 py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
              <span className="text-gold">§04</span>&nbsp;—&nbsp;Panel features
            </p>
            <h2 className="mb-8 font-serif text-[clamp(1.4rem,3vw,2rem)] font-medium text-ink">
              Everything a code panel needs. Nothing it doesn&apos;t.
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {PANEL_FEATURES.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.07}>
                <div className="flex items-start gap-4 rounded-xl border border-hairline bg-paper p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/8">
                    <Icon size={15} className="text-brand" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FAQ ════════════════════════════════════════════ */}
      <FeatureFaq items={FAQ} />

      {/* ════════════════════ INTERNAL LINKS ════════════════════════════════ */}
      <Reveal>
        <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">
            Related features
          </p>
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
      </Reveal>

      <FeatureCrossLinks exclude="/features/code-execution" />
    </div>
  )
}
