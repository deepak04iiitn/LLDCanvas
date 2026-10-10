'use client'

import Link from 'next/link'
import { ArrowRight, Bug, Search, Wrench, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const TRAITS = [
  {
    icon: Bug,
    label: 'Compiles fine',
    desc: 'No syntax errors. The bug is structural or logical.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
  },
  {
    icon: Search,
    label: 'Find the root cause',
    desc: 'Wrong pattern, broken abstraction, misapplied principle.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
  },
  {
    icon: Wrench,
    label: 'Fix it',
    desc: 'Submit corrected code that properly implements the intent.',
    color: 'text-brand',
    bg: 'bg-brand-tint border-brand/20',
  },
  {
    icon: MessageSquare,
    label: 'Explain it',
    desc: 'Articulate why the original was wrong — interviewers always ask.',
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
  },
]

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Read the broken code',
    body: 'Study an implementation that compiles but has structural or logical errors.',
  },
  {
    n: '02',
    title: 'Identify the bug',
    body: 'Find the root cause — wrong pattern, broken abstraction, or misapplied principle.',
  },
  {
    n: '03',
    title: 'Fix and explain',
    body: 'Submit the corrected code and articulate why the original was wrong.',
  },
]

const SKILLS = [
  { label: 'Code-level pattern recognition', body: 'Spot broken or misapplied design patterns in real code.' },
  { label: 'Root cause analysis',            body: 'Diagnose the structural reason behind a code-level bug.' },
  { label: 'Implementation review',          body: 'Evaluate whether code correctly implements its stated design intent.' },
  { label: 'Fix articulation',               body: 'Explain your fix clearly — the interviewer is always listening.' },
]

const SCENARIOS = [
  { label: 'Broken Singleton',        tag: 'Thread safety',   difficulty: 'Easy' },
  { label: 'Observer with memory leak', tag: 'Lifecycle',     difficulty: 'Medium' },
  { label: 'Factory violating OCP',   tag: 'SOLID',           difficulty: 'Medium' },
  { label: 'Strategy leaking impl details', tag: 'Abstraction', difficulty: 'Hard' },
]

export default function CodeBugLabPage() {
  return (
    <div className="h-full overflow-y-auto bg-paper">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-hairline px-6 pt-14 pb-0 sm:px-10">
        <div className="mx-auto max-w-4xl">

          {/* Headline + CTA */}
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between pb-10">
            <div className="min-w-0">
              <h1 className="font-serif text-[44px] sm:text-[54px] font-medium leading-[1.05] tracking-tight text-ink">
                The code compiles.<br />
                <span className="text-ink-faint">The design doesn&apos;t.</span>
              </h1>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-muted">
                Hunt bugs in real LLD implementations. Find the structural flaw,
                fix it, and explain why it was wrong — exactly what interviewers ask.
              </p>
            </div>
            <Link
              href="/dashboard/learn/debugger/problems"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink/80"
            >
              Explore Problems <ArrowRight size={14} />
            </Link>
          </div>

          {/* 4 traits strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-hairline pt-8 pb-10">
            {TRAITS.map(t => {
              const Icon = t.icon
              return (
                <div key={t.label} className={cn('rounded-2xl border px-4 py-4', t.bg)}>
                  <Icon size={16} className={cn('mb-2.5', t.color)} />
                  <p className={cn('font-mono text-[11px] font-semibold tracking-wide', t.color)}>{t.label}</p>
                  <p className="mt-1 text-[11px] leading-snug text-ink-muted">{t.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10 space-y-20">

        {/* ── Premise ────────────────────────────────────────────────────── */}
        <section className="grid gap-10 sm:grid-cols-[1fr_2fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">The premise</p>
          </div>
          <div className="space-y-4">
            <p className="text-[16px] leading-[1.85] text-ink">
              Each challenge gives you a broken implementation of a design pattern
              or LLD concept. The code compiles but has logical errors, wrong
              abstractions, or misapplied patterns.
            </p>
            <p className="text-[15px] leading-[1.85] text-ink-muted">
              Find the bug, understand why it&apos;s wrong, and fix it. These are
              exactly the code-review questions interviewers ask at senior-level rounds.
            </p>
          </div>
        </section>

        {/* ── Sample scenarios ────────────────────────────────────────────── */}
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-6">Sample problems</p>
          <div className="divide-y divide-hairline border-y border-hairline">
            {SCENARIOS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6 py-4">
                <span className="font-mono text-[11px] tabular-nums text-ink-faint w-6 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="font-serif text-[17px] text-ink flex-1">{s.label}</p>
                <span className="hidden sm:inline-block rounded-full border border-hairline bg-paper-elevated px-2.5 py-0.5 font-mono text-[10px] text-ink-faint shrink-0">
                  {s.tag}
                </span>
                <span className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold',
                  s.difficulty === 'Easy'   ? 'bg-emerald-100 text-emerald-700' :
                  s.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                              'bg-rose-100 text-rose-700',
                )}>
                  {s.difficulty}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────────────── */}
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-10">How it works</p>
          <div className="divide-y divide-hairline">
            {HOW_IT_WORKS.map(step => (
              <div key={step.n} className="flex items-start gap-8 py-8 first:pt-0 last:pb-0">
                <span className="shrink-0 font-mono text-[28px] font-bold leading-none tabular-nums text-hairline-strong select-none">
                  {step.n}
                </span>
                <div className="pt-1 min-w-0">
                  <h3 className="font-serif text-[17px] font-medium text-ink">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Skills + Interview relevance ────────────────────────────────── */}
        <div className="grid gap-14 lg:grid-cols-2">
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-8">Skills you&apos;ll build</p>
            <ul className="space-y-5">
              {SKILLS.map(skill => (
                <li key={skill.label} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 font-mono text-[12px] text-ink-faint">—</span>
                  <div>
                    <p className="text-[14px] font-medium text-ink">{skill.label}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{skill.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
            <div className="px-6 py-6 border-b border-hairline">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-4">Interview relevance</p>
              <blockquote className="font-serif text-[18px] leading-[1.6] text-ink">
                &ldquo;Here&apos;s an implementation of Observer — what&apos;s wrong?&rdquo;
              </blockquote>
            </div>
            <div className="px-6 py-5 bg-paper">
              <p className="text-[13px] leading-relaxed text-ink-muted">
                Code review is a standard component at senior-level interviews.
                Code Bug Lab trains the exact skill of spotting a structurally
                broken design and articulating the fix under pressure.
              </p>
            </div>
          </section>
        </div>

        {/* ── Terminal preview ────────────────────────────────────────────── */}
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-6">What you&apos;ll see</p>
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#141922]">
            <div className="border-b border-white/5 px-5 py-3 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
              <span className="ml-3 font-mono text-[10px] text-white/20">Singleton.java — bug hunt</span>
            </div>
            <div className="px-6 py-5 font-mono text-[12px] leading-relaxed space-y-0.5">
              <p className="text-white/30">// Thread-unsafe Singleton — find the bug</p>
              <p><span className="text-violet-400">public class</span> <span className="text-emerald-300">DatabaseConnection</span> <span className="text-white/60">{'{'}</span></p>
              <p className="pl-4"><span className="text-violet-400">private static</span> <span className="text-emerald-300">DatabaseConnection</span> <span className="text-white/80">instance</span><span className="text-white/60">;</span></p>
              <p className="pl-4 text-white/30">// constructor omitted</p>
              <p className="pl-4"><span className="text-violet-400">public static</span> <span className="text-emerald-300">DatabaseConnection</span> <span className="text-amber-300">getInstance</span><span className="text-white/60">() {'{'}</span></p>
              <p className="pl-8"><span className="text-violet-400">if</span> <span className="text-white/60">(instance ==</span> <span className="text-violet-400">null</span><span className="text-white/60">) {'{'}</span></p>
              <p className="pl-12 text-rose-400/80">instance = <span className="text-violet-400">new</span> <span className="text-emerald-300">DatabaseConnection</span>(); <span className="text-rose-400/50">// ← bug here</span></p>
              <p className="pl-8 text-white/60">{'}'}</p>
              <p className="pl-8"><span className="text-violet-400">return</span> <span className="text-white/80">instance</span><span className="text-white/60">;</span></p>
              <p className="pl-4 text-white/60">{'}'}</p>
              <p className="text-white/60">{'}'}</p>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-t border-hairline pt-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-[24px] font-medium text-ink">Ready to hunt?</p>
            <p className="mt-1 text-[13px] text-ink-muted">Pick a problem and find the flaw.</p>
          </div>
          <Link
            href="/dashboard/learn/debugger/problems"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink/80"
          >
            Explore Problems <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  )
}
