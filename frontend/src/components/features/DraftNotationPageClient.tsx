'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeftRight, FileText, Zap, GitBranch } from 'lucide-react'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { Reveal } from '@/components/features/Reveal'

// ─── Animated keyword headline ───────────────────────────────────────────────

const HEADLINE_EXAMPLES = [
  { sentence: 'User has many Order',           result: 'One-to-many arrow draws itself.' },
  { sentence: 'Order owns OrderItem',          result: 'Composition diamond appears.' },
  { sentence: 'Payment implements Payable',    result: 'Realization arrow renders.' },
  { sentence: 'Dog extends Animal',            result: 'Inheritance triangle snaps in.' },
]

function AnimatedKeyword() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setIdx(i => (i + 1) % HEADLINE_EXAMPLES.length); setVisible(true) }, 350)
    }, 2600)
    return () => clearInterval(t)
  }, [])

  const { sentence, result } = HEADLINE_EXAMPLES[idx]
  // split on the keyword
  const kwMatch = sentence.match(/\b(has many|owns|implements|extends|has|uses|includes|can|knows)\b/)
  const kw = kwMatch ? kwMatch[0] : ''
  const [before, after] = kw ? sentence.split(kw) : [sentence, '']

  return (
    <span
      className="block transition-all duration-300"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(6px)' }}
    >
      <span className="text-ink-muted">{before?.trim()}&nbsp;</span>
      <span className="text-brand">{kw}</span>
      <span className="text-ink-muted">&nbsp;{after?.trim()}</span>
      <span className="ml-3 font-sans text-[0.45em] font-normal tracking-normal text-ink-faint align-middle opacity-70">
        → {result}
      </span>
    </span>
  )
}

// ─── Typewriter data ──────────────────────────────────────────────────────────

const DRAFT_LINES = [
  { text: 'User knows id, name: String, email: String', reveals: 'userFields' },
  { text: 'User can login(), logout(), getProfile(): Profile', reveals: 'userMethods' },
  { text: '', reveals: null },
  { text: 'User has many Order', reveals: 'orderRelation' },
  { text: 'Order knows id: UUID, status: OrderStatus', reveals: 'orderFields' },
  { text: 'Order owns OrderItem', reveals: 'orderItem' },
  { text: '', reveals: null },
  { text: 'Payment implements Payable', reveals: 'payment' },
]

// ─── Live Diagram (right panel) ───────────────────────────────────────────────

function LiveDiagram({ revealed }: { revealed: Set<string> }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-2 p-6"
      style={{
        backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 1,
      }}
    >
      {/* backdrop to make dot grid subtle */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden />

      {/* User box */}
      <AnimatePresence>
        {revealed.has('userFields') && (
          <motion.div
            key="user"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="w-48 overflow-hidden rounded-xl border border-hairline bg-white shadow-md"
          >
            <div className="border-b border-hairline bg-brand/5 px-3 py-2 text-center">
              <span className="font-mono text-[11px] font-black text-ink">User</span>
            </div>
            <div className="border-b border-hairline px-3 py-1.5">
              <p className="font-mono text-[9px] text-ink-muted">+ id: String</p>
              <p className="font-mono text-[9px] text-ink-muted">+ name: String</p>
              <p className="font-mono text-[9px] text-ink-muted">+ email: String</p>
            </div>
            {revealed.has('userMethods') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.22 }}
                className="px-3 py-1.5"
              >
                <p className="font-mono text-[9px] text-ink-muted">+ login()</p>
                <p className="font-mono text-[9px] text-ink-muted">+ logout()</p>
                <p className="font-mono text-[9px] text-ink-muted">+ getProfile()</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User → Order connector */}
      <AnimatePresence>
        {revealed.has('orderRelation') && (
          <motion.div
            key="conn1"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className="flex flex-col items-center"
          >
            <div className="h-3 w-px bg-brand/40" />
            <span className="font-mono text-[9px] font-bold text-brand">1..*</span>
            <div className="h-3 w-px bg-brand/40" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order box */}
      <AnimatePresence>
        {revealed.has('orderRelation') && (
          <motion.div
            key="order"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="w-48 overflow-hidden rounded-xl border border-hairline bg-white shadow-md"
          >
            <div className="border-b border-hairline bg-brand/5 px-3 py-2 text-center">
              <span className="font-mono text-[11px] font-black text-ink">Order</span>
            </div>
            {revealed.has('orderFields') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.22 }}
                className="border-b border-hairline px-3 py-1.5"
              >
                <p className="font-mono text-[9px] text-ink-muted">+ id: UUID</p>
                <p className="font-mono text-[9px] text-ink-muted">+ status: OrderStatus</p>
              </motion.div>
            )}
            {revealed.has('orderItem') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.18 }}
                className="px-3 py-1.5"
              >
                <p className="font-mono text-[9px] font-semibold text-brand">◆ OrderItem</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order → OrderItem connector */}
      <AnimatePresence>
        {revealed.has('orderItem') && (
          <motion.div
            key="conn2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="h-3 w-px bg-brand/40" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* OrderItem box */}
      <AnimatePresence>
        {revealed.has('orderItem') && (
          <motion.div
            key="orderitem"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="w-48 rounded-xl border border-hairline bg-white px-3 py-2 text-center shadow-md"
          >
            <span className="font-mono text-[11px] font-black text-ink">OrderItem</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment / Payable */}
      <AnimatePresence>
        {revealed.has('payment') && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-1 flex items-center gap-2"
          >
            <div className="w-28 rounded-xl border border-hairline bg-white px-3 py-2 text-center shadow-md">
              <span className="font-mono text-[10px] font-black text-ink">Payment</span>
            </div>
            <span className="font-mono text-[9px] font-bold text-brand">▷ impl</span>
            <div className="w-24 rounded-xl border border-dashed border-hairline-strong bg-paper-elevated/80 px-2 py-2 text-center">
              <span className="font-mono text-[8px] font-black text-ink">«interface»</span><br />
              <span className="font-mono text-[9px] font-black text-ink">Payable</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!revealed.has('userFields') && (
        <p className="font-mono text-[11px] text-ink-faint/50 text-center">
          diagram will appear here…
        </p>
      )}
    </div>
  )
}

// ─── Syntax colour helper ─────────────────────────────────────────────────────

const KW_LIST = ['knows', 'can', 'has many', 'has', 'owns', 'implements', 'extends', 'uses', 'includes']

function ColoredLine({ text }: { text: string }) {
  let remaining = text
  const parts: { str: string; isKw: boolean }[] = []
  while (remaining.length > 0) {
    let foundAt = -1, foundKw = ''
    for (const kw of KW_LIST) {
      const idx = remaining.toLowerCase().indexOf(kw)
      if (idx !== -1 && (foundAt === -1 || idx < foundAt)) { foundAt = idx; foundKw = kw }
    }
    if (foundAt === -1) { parts.push({ str: remaining, isKw: false }); break }
    if (foundAt > 0) parts.push({ str: remaining.slice(0, foundAt), isKw: false })
    parts.push({ str: remaining.slice(foundAt, foundAt + foundKw.length), isKw: true })
    remaining = remaining.slice(foundAt + foundKw.length)
  }
  return (
    <span>
      {parts.map((p, i) =>
        p.isKw
          ? <span key={i} className="font-bold text-brand">{p.str}</span>
          : <span key={i} className="text-ink">{p.str}</span>
      )}
    </span>
  )
}

// ─── Typewriter panel (the hero visual) ──────────────────────────────────────

function TypewriterPanel() {
  const [doneIdxs, setDoneIdxs] = useState<number[]>([])
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [parseMs, setParseMs] = useState(0)
  const [fading, setFading] = useState(false)

  const curLine = DRAFT_LINES[lineIdx]

  const reset = useCallback(() => {
    setFading(true)
    setTimeout(() => {
      setDoneIdxs([]); setLineIdx(0); setCharIdx(0)
      setRevealed(new Set()); setParseMs(0); setFading(false)
    }, 500)
  }, [])

  useEffect(() => {
    if (fading || !curLine) return
    const text = curLine.text

    if (text === '') {
      const t = setTimeout(() => {
        setDoneIdxs(p => [...p, lineIdx])
        if (lineIdx < DRAFT_LINES.length - 1) { setLineIdx(i => i + 1); setCharIdx(0) }
        else setTimeout(reset, 2800)
      }, 180)
      return () => clearTimeout(t)
    }

    if (charIdx < text.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), text[charIdx] === ' ' ? 42 : 30)
      return () => clearTimeout(t)
    }

    const t = setTimeout(() => {
      setDoneIdxs(p => [...p, lineIdx])
      if (curLine.reveals) {
        setRevealed(r => new Set([...r, curLine.reveals as string]))
        setParseMs(+(Math.random() * 0.28 + 0.08).toFixed(2))
      }
      if (lineIdx < DRAFT_LINES.length - 1) { setLineIdx(i => i + 1); setCharIdx(0) }
      else setTimeout(reset, 2800)
    }, 350)
    return () => clearTimeout(t)
  }, [charIdx, lineIdx, curLine, fading, reset])

  const typingText = curLine ? curLine.text.slice(0, charIdx) : ''
  const isTypingBlank = curLine?.text === ''

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-hairline bg-white shadow-[0_8px_40px_rgba(35,78,63,0.10),0_2px_8px_rgba(0,0,0,0.06)] transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Chrome */}
      <div className="flex items-center justify-between border-b border-hairline bg-paper-elevated px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/70" />
            <div className="h-3 w-3 rounded-full bg-amber-400/70" />
            <div className="h-3 w-3 rounded-full bg-emerald-400/70" />
          </div>
          <span className="font-mono text-[11px] text-ink-faint">design.draft</span>
        </div>
        <div className="flex items-center gap-3">
          {parseMs > 0 && (
            <motion.span
              key={parseMs}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 font-mono text-[10px] text-brand"
            >
              <Zap size={10} /> {parseMs}ms
            </motion.span>
          )}
          <div className="flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-2.5 py-0.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            <span className="font-mono text-[9px] font-bold text-brand">Live</span>
          </div>
        </div>
      </div>

      {/* Split — left wider for code, right wider for diagram */}
      <div className="grid grid-cols-1 sm:grid-cols-[5fr_6fr]" style={{ minHeight: 400 }}>
        {/* Code panel */}
        <div className="border-b border-hairline sm:border-b-0 sm:border-r bg-[#faf9f7] px-5 py-5">
          <p className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ink-faint/50">Draft Notation</p>
          <div className="font-mono text-[12.5px] leading-[2.1]">
            {doneIdxs.map(idx => {
              const line = DRAFT_LINES[idx]
              if (!line) return null
              if (line.text === '') return <div key={`blank-${idx}`} className="h-3" />
              return (
                <div key={idx} className="flex items-start gap-2">
                  <span className="mt-px select-none text-[9px] text-ink-faint/30 tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                  <ColoredLine text={line.text} />
                </div>
              )
            })}
            {curLine && !isTypingBlank && !doneIdxs.includes(lineIdx) && (
              <div className="flex items-start gap-2">
                <span className="mt-px select-none text-[9px] text-ink-faint/30 tabular-nums">{String(lineIdx + 1).padStart(2, '0')}</span>
                <span>
                  <ColoredLine text={typingText} />
                  <span className="inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse bg-brand align-middle" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Diagram panel */}
        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '18px 18px' }}
            aria-hidden
          />
          <div className="border-b border-hairline bg-paper-elevated/40 px-5 py-2.5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ink-faint/50">Live Diagram</p>
          </div>
          <LiveDiagram revealed={revealed} />
        </div>
      </div>
    </div>
  )
}

// ─── Keyword data ──────────────────────────────────────────────────────────────

const KEYWORDS_DATA = [
  { kw: 'knows',      uml: 'Field declaration',   ex: 'User knows id, name: String',    result: 'Adds typed fields to the class box' },
  { kw: 'can',        uml: 'Method declaration',   ex: 'User can login(): bool',         result: 'Adds methods with optional return types' },
  { kw: 'has many',   uml: 'Association 1..*',     ex: 'User has many Order',            result: 'One-to-many arrow with multiplicity label' },
  { kw: 'owns',       uml: 'Composition ◆',        ex: 'Order owns OrderItem',           result: 'Filled diamond - part dies with whole' },
  { kw: 'implements', uml: 'Realization ▷',         ex: 'List implements Collection',     result: 'Dashed arrow to the interface' },
  { kw: 'extends',    uml: 'Inheritance ▷',         ex: 'Dog extends Animal',             result: 'Open triangle - subclass arrow' },
  { kw: 'includes',   uml: 'Aggregation ◇',         ex: 'Team includes Player',           result: 'Open diamond - part can outlive the whole' },
  { kw: 'uses',       uml: 'Dependency',            ex: 'Controller uses Service',        result: 'Dashed arrow for temporary usage' },
]

const FAQ_ITEMS = [
  {
    q: 'Is Draft Notation the same as PlantUML or Mermaid?',
    a: 'No - and that\'s the point. PlantUML and Mermaid require you to learn their specific syntax with colons, arrows, and pipe characters. Draft Notation uses natural English: "User has many Order" is the entire line. No brackets, no symbols, no boilerplate.',
  },
  {
    q: 'Does Draft Notation replace the drag-and-drop editor?',
    a: 'No - it\'s a second entry point. Use Draft Notation when typing is faster than clicking (common during interviews or while explaining a design verbally). Use the visual editor when you want fine-grained layout control. Both stay in sync.',
  },
  {
    q: 'Can I convert a visual diagram back to Draft Notation text?',
    a: 'Yes - Draft Notation round-trips both ways. Any diagram you\'ve built or rearranged visually can be exported back to its plain-English source at any time via Export - Draft Notation.',
  },
  {
    q: 'Do I need to sign in to try Draft Notation?',
    a: 'No - the Playground runs the exact same parser with zero sign-in required. Try the full syntax before deciding whether to create an account.',
  },
  {
    q: 'How fast does it render?',
    a: 'Under a millisecond for parsing, with a 400ms debounce so it does not re-render on every keystroke mid-sentence. In practice it feels instant - not like a build step.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DraftNotationPageClient() {
  return (
    <div className="overflow-hidden">

      {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-6 pt-8 pb-16 sm:px-10 sm:pt-10 sm:pb-20">

          {/* ── Centered headline block ── */}
          <Reveal className="mb-12 text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-paper-elevated px-4 py-1.5 font-mono text-[10px] font-medium tracking-[0.2em] text-ink-faint uppercase">
              <span className="text-gold">¶02</span> Draft Notation
            </p>

            <h1 className="font-serif text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.07] tracking-tight text-ink">
              Write a sentence.
              <br />
              <AnimatedKeyword />
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-muted">
              LLDCanvas&apos;s own plain-English diagramming language. No angle brackets,
              no pipe characters, no boilerplate - just natural words that parse into
              a live UML class diagram in under a millisecond.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/playground"
                className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 transition-all hover:bg-brand-hover active:scale-95"
              >
                Try in Playground <ArrowRight size={15} />
              </Link>
              <Link
                href="/docs"
                className="flex items-center gap-2 rounded-lg border border-hairline-strong px-6 py-3 text-sm font-medium text-ink-muted transition-all hover:border-brand/30 hover:text-ink"
              >
                <FileText size={14} /> Full syntax docs
              </Link>
            </div>
          </Reveal>

          {/* ── Full-width demo stage — the actual hero ── */}
          <Reveal delay={0.1}>
            <TypewriterPanel />
          </Reveal>

          {/* ── Subtle caption ── */}
          <Reveal delay={0.18}>
            <p className="mt-4 text-center font-mono text-[10px] text-ink-faint/60">
              write draft notation on the left &nbsp;·&nbsp; diagram assembles live on the right &nbsp;·&nbsp; loops automatically
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ STATS BAR ══════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated/60">
        <Reveal>
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-hairline sm:grid-cols-4 sm:divide-y-0">
            {[
              { value: '8',    label: 'plain-English keywords' },
              { value: '<1ms', label: 'parse time' },
              { value: '5',    label: 'UML node types' },
              { value: '∞',    label: 'free to use in Playground' },
            ].map(s => (
              <div key={s.label} className="px-6 py-8 text-center">
                <p className="font-mono text-3xl font-black text-brand">{s.value}</p>
                <p className="mt-1 text-[13px] text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        </Reveal>
      </section>

      {/* ══ KEYWORDS ════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <Reveal>
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">§1</span> — Vocabulary
          </p>
          <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
            Eight keywords. Every UML relationship covered.
          </h2>
          <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            Once you know these eight words you can describe any class diagram from memory.
            Each word maps to a precise UML relationship type - the arrow, arrowhead, and
            line style are determined by the word you choose.
          </p>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KEYWORDS_DATA.map((k, i) => (
            <Reveal key={k.kw} delay={i * 0.06}>
              <div className="h-full rounded-xl border border-hairline bg-paper-elevated p-4 transition-all hover:border-brand/20 hover:shadow-sm">
                <code className="mb-3 inline-block rounded-lg border border-brand/20 bg-brand/5 px-3 py-1.5 font-mono text-sm font-black text-brand">
                  {k.kw}
                </code>
                <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint">{k.uml}</p>
                <p className="mb-2 font-mono text-[11px] text-ink leading-relaxed">{k.ex}</p>
                <p className="border-t border-hairline pt-2 text-[11px] leading-relaxed text-ink-muted">{k.result}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ ROUND-TRIP ══════════════════════════════════════════════════════ */}
      <section className="border-y border-hairline bg-paper-elevated/40 py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
              <span className="text-gold">§2</span> — Round-trip
            </p>
            <h2 className="mb-3 font-serif text-2xl font-medium text-ink">
              Text - diagram - text. No lock-in.
            </h2>
            <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
              Draft Notation is not write-only. Any diagram you have built visually - or rearranged
              on the canvas - can be exported back to its plain-English source at any time.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
          <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
            {/* Left: text source */}
            <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
              <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint">Draft Notation source</p>
              <pre className="font-mono text-[12px] leading-[2] text-ink">
                <span className="text-brand font-bold">User</span> knows id, name{'\n'}
                <span className="text-brand font-bold">User</span> has many <span className="font-bold">Order</span>{'\n'}
                <span className="font-bold">Order</span> owns OrderItem
              </pre>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-1">
              <ArrowLeftRight size={20} className="text-ink-faint" />
              <span className="font-mono text-[9px] text-ink-faint">export / import</span>
            </div>

            {/* Right: visual diagram */}
            <div
              className="relative overflow-hidden rounded-2xl border border-hairline bg-white p-5 shadow-sm"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '18px 18px' }}
                aria-hidden
              />
              <p className="mb-3 font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint/50">Visual diagram</p>
              <div className="flex flex-col items-center gap-2">
                <div className="w-36 rounded-xl border border-hairline bg-white shadow-sm">
                  <div className="rounded-t-xl border-b border-hairline bg-brand/5 px-3 py-1.5 text-center font-mono text-[10px] font-black">User</div>
                  <div className="px-3 py-1.5 font-mono text-[9px] text-ink-muted">id, name</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-3 w-px bg-brand/40" />
                  <span className="font-mono text-[9px] text-brand">1..*</span>
                  <div className="h-3 w-px bg-brand/40" />
                </div>
                <div className="w-36 rounded-xl border border-hairline bg-white px-3 py-2 text-center font-mono text-[10px] font-black shadow-sm">Order</div>
                <div className="h-3 w-px bg-brand/30" />
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[9px] text-brand">◆</span>
                  <div className="w-32 rounded-xl border border-hairline bg-white px-3 py-1.5 text-center font-mono text-[10px] font-black shadow-sm">OrderItem</div>
                </div>
              </div>
            </div>
          </div>
          </Reveal>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: GitBranch, title: 'Version-control friendly', body: 'Plain text diffs cleanly. Paste a Draft Notation diagram into a git commit, Notion, or Slack - readable anywhere without special tools.' },
              { icon: ArrowLeftRight, title: 'Sync with the visual editor', body: 'Start in text, switch to drag-and-drop to rearrange nodes, export back to text. No information loss, no lock-in between the two modes.' },
              { icon: Zap, title: 'Speed of thought', body: 'Typing "User has many Order" takes two seconds. Dragging a one-to-many association takes ten. Every second matters under interview pressure.' },
            ].map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="flex h-full items-start gap-3 rounded-xl border border-hairline bg-paper p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/8">
                    <Icon size={15} className="text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMPARISON ══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <Reveal>
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">§3</span> — vs the alternatives
          </p>
          <h2 className="mb-8 font-serif text-2xl font-medium text-ink">How Draft Notation compares.</h2>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              name: 'Draft Notation',
              line: 'User has many Order',
              verdict: "Natural English - say it exactly how you'd describe it in an interview.",
              good: true,
            },
            {
              name: 'PlantUML',
              line: 'User "1" -- "*" Order',
              verdict: 'Cryptic syntax requiring special chars, quotes, and multiplicity notation.',
              good: false,
            },
            {
              name: 'Mermaid',
              line: 'User ||--o{ Order : has',
              verdict: 'Hard-to-read pipe characters. Requires learning a specific symbol vocabulary.',
              good: false,
            },
          ].map((c, i) => (
            <Reveal key={c.name} delay={i * 0.08}>
            <div
              className={`h-full rounded-2xl border p-5 ${c.good ? 'border-brand/20 bg-brand/5' : 'border-hairline bg-paper-elevated/40'}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-sm font-bold text-ink">{c.name}</p>
                <span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold ${c.good ? 'bg-brand text-brand-foreground' : 'bg-ink-faint/15 text-ink-muted'}`}>
                  {c.good ? '✓ Natural' : '✗ Cryptic'}
                </span>
              </div>
              <div className="mb-3 overflow-x-auto rounded-lg border border-hairline bg-white px-3 py-2.5">
                <code className={`whitespace-nowrap font-mono text-[12px] ${c.good ? 'font-semibold text-brand' : 'text-ink-muted'}`}>
                  {c.line}
                </code>
              </div>
              <p className="text-[12px] leading-relaxed text-ink-muted">{c.verdict}</p>
            </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ INTERNAL LINKS ══════════════════════════════════════════════════ */}
      <section className="border-t border-hairline bg-paper-elevated/30">
        <Reveal>
        <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-faint">Related features</p>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/features/editor',              label: 'UML Editor - visual drag-and-drop' },
              { href: '/playground',                   label: 'Playground - try it without signing in' },
              { href: '/features/code-execution',      label: 'Code Execution - run what you design' },
              { href: '/features/interview-questions',  label: 'Practice Problems - apply your skills' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 rounded-lg border border-hairline bg-paper px-4 py-2 text-[13px] text-ink-muted transition-colors hover:border-brand/30 hover:text-ink"
              >
                {l.label} <ArrowRight size={12} />
              </Link>
            ))}
          </div>
        </div>
        </Reveal>
      </section>

      <FeatureFaq items={FAQ_ITEMS} />
      <FeatureCrossLinks exclude="/features/draft-notation" />
    </div>
  )
}
