'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Copy, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeUpProps, inViewProps } from '@/lib/motion'
import { parse, renderToFlow, STEPS, EXAMPLES, KEYWORDS, VISIBILITY, RELATIONS, TIPS } from '@/lib/draft'
import type { ParseError } from '@/lib/draft'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SiteFooter } from '@/components/marketing/SiteFooter'

// ── Small shared bits, matching the landing page's own visual language ────────

function Eyebrow({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
      <span className="text-gold">¶{index}</span> — {children}
    </p>
  )
}

// ── Table of contents ─────────────────────────────────────────────────────────

const TOC = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'live',        label: 'Try it Live' },
  { id: 'fields',      label: 'Fields & Methods' },
  { id: 'relations',   label: 'Relationships' },
  { id: 'examples',    label: 'Full Examples' },
  { id: 'tips',        label: 'Tips & Tricks' },
]

// ── Syntax-ish highlight: very minimal coloring (kept dark — code reads best
//    on a dark surface regardless of the surrounding page theme) ─────────────
function highlightDraft(line: string): React.ReactNode {
  if (line.trimStart().startsWith('#')) {
    return <span className="text-white/30 italic">{line}</span>
  }
  const kwMatch = line.match(/^(interface|abstract|enum|note)\s+/)
  if (kwMatch) {
    return (
      <>
        <span className="text-violet-400">{kwMatch[1]}</span>
        <span className="text-white/75">{line.slice(kwMatch[1].length)}</span>
      </>
    )
  }
  const verbs = ['is a', 'acts as', 'owns', 'has many', 'has one', 'has', 'uses', 'talks to', 'knows about']
  for (const verb of verbs) {
    const idx = line.indexOf(` ${verb} `)
    if (idx !== -1) {
      return (
        <>
          <span className="text-sky-300">{line.slice(0, idx)}</span>
          <span className="text-amber-400"> {verb} </span>
          <span className="text-emerald-300">{line.slice(idx + verb.length + 2)}</span>
        </>
      )
    }
  }
  const knowsIdx = line.indexOf(' knows ')
  if (knowsIdx !== -1) {
    return (
      <>
        <span className="text-sky-300">{line.slice(0, knowsIdx)}</span>
        <span className="text-amber-400"> knows </span>
        <span className="text-white/70">{line.slice(knowsIdx + 7)}</span>
      </>
    )
  }
  const canIdx = line.indexOf(' can ')
  if (canIdx !== -1) {
    return (
      <>
        <span className="text-sky-300">{line.slice(0, canIdx)}</span>
        <span className="text-amber-400"> can </span>
        <span className="text-rose-300">{line.slice(canIdx + 5)}</span>
      </>
    )
  }
  if (/^\s*[A-Z]\w*\s*$/.test(line)) {
    return <span className="text-sky-300">{line}</span>
  }
  if (/^\s*[A-Z_][A-Z0-9_,\s]*$/.test(line.trim()) && line.trim().length > 0) {
    return <span className="text-emerald-400">{line}</span>
  }
  return <span className="text-white/75">{line}</span>
}

function CodeBlock({ code, copyable = true }: { code: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="group relative overflow-hidden rounded-md border border-hairline bg-[#14130f]">
      {copyable && (
        <button
          onClick={copy}
          className="absolute right-3 top-3 z-10 rounded-md border border-white/10 bg-white/5 p-1.5
                     text-white/40 opacity-0 transition-all group-hover:opacity-100 hover:text-white"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-5">
        {code.split('\n').map((line, i) => (
          <div key={i}>{highlightDraft(line) || <span>&nbsp;</span>}</div>
        ))}
      </pre>
    </div>
  )
}

// ── Live Widget ───────────────────────────────────────────────────────────────
const LIVE_DEFAULT = `User
User knows id, name: String, email: String
User can login(), getProfile(): Profile

Post
Post knows id, content: String, createdAt: Date
Post can publish(), delete()

User has many Post
`

function LiveWidget() {
  const [code, setCode] = useState(LIVE_DEFAULT)
  const [errors, setErrors]   = useState<ParseError[]>([])
  const [nodeCount, setNodeCount] = useState(() => renderToFlow(parse(LIVE_DEFAULT).ast).nodes.length)
  const [edgeCount, setEdgeCount] = useState(() => renderToFlow(parse(LIVE_DEFAULT).ast).edges.length)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const parse_ = useCallback((text: string) => {
    const { ast, errors: errs } = parse(text)
    setErrors(errs)
    const { nodes, edges } = renderToFlow(ast)
    setNodeCount(nodes.length)
    setEdgeCount(edges.length)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value
    setCode(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => parse_(v), 350)
  }

  return (
    <div className="overflow-hidden rounded-md border border-hairline bg-[#14130f]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <span className="font-mono text-[11px] text-white/50">Live preview</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-sky-400">{nodeCount} nodes</span>
          <span className="font-mono text-[11px] text-emerald-400">{edgeCount} edges</span>
        </div>
      </div>
      <div className="flex flex-col gap-0 md:flex-row">
        {/* Editor side */}
        <div className="flex-1 border-r border-white/[0.06]">
          <textarea
            value={code}
            onChange={handleChange}
            spellCheck={false}
            className="no-scrollbar h-64 w-full resize-none bg-transparent p-4 font-mono text-xs
                       leading-5 text-white/80 outline-none caret-emerald-400"
            style={{ tabSize: 2 }}
          />
        </div>
        {/* Preview side */}
        <div className="no-scrollbar h-64 w-full min-h-0 shrink-0 overflow-y-auto p-4 md:w-72">
          {errors.length > 0 ? (
            <div className="space-y-1">
              {errors.map((e, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px] text-red-400">
                  <AlertCircle size={10} className="mt-px shrink-0" />
                  <span>Line {e.line}: {e.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(() => {
                try {
                  const { ast } = parse(code)
                  return ast.nodes.map(n => (
                    <div key={n.name} className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wide',
                          n.kind === 'class'     && 'bg-sky-500/20 text-sky-300',
                          n.kind === 'interface' && 'bg-violet-500/20 text-violet-300',
                          n.kind === 'abstract'  && 'bg-amber-500/20 text-amber-300',
                          n.kind === 'enum'      && 'bg-emerald-500/20 text-emerald-300',
                          n.kind === 'note'      && 'bg-white/10 text-white/50',
                        )}>
                          {n.kind}
                        </span>
                        <span className="font-mono text-xs font-semibold text-white/80">{n.name}</span>
                      </div>
                      {n.fields.length > 0 && (
                        <div className="mt-1.5 space-y-0.5 border-t border-white/[0.05] pt-1.5">
                          {n.fields.map((f, fi) => (
                            <div key={fi} className="font-mono text-[10px] text-white/45">
                              {f.visibility ?? '+'} {f.name}{f.type ? `: ${f.type}` : ''}
                            </div>
                          ))}
                        </div>
                      )}
                      {n.methods.length > 0 && (
                        <div className="mt-1 space-y-0.5 border-t border-white/[0.05] pt-1">
                          {n.methods.map((m, mi) => (
                            <div key={mi} className="font-mono text-[10px] text-rose-300/70">
                              {m.visibility ?? '+'} {m.name}()
                              {m.returnType && m.returnType !== 'void' ? `: ${m.returnType}` : ''}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                } catch {
                  return null
                }
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ activeId }: { activeId: string }) {
  return (
    <nav className="sticky top-24 hidden w-52 shrink-0 self-start lg:block">
      <p className="mb-5 px-3 font-mono text-[10px] font-medium uppercase tracking-widest text-ink-faint">
        On this page
      </p>
      <div className="space-y-3 border-l border-hairline">
        {TOC.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              '-ml-px block border-l-2 py-1 pl-4 text-[15px] leading-normal transition-colors',
              activeId === item.id
                ? 'border-brand font-medium text-brand'
                : 'border-transparent text-ink-muted hover:border-hairline-strong hover:text-ink',
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [activeExample, setActiveExample] = useState(0)
  const [activeId, setActiveId] = useState(TOC[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -70% 0px' },
    )
    TOC.forEach(item => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen text-ink">
      <SiteNavbar alwaysSolid />

      <div className="mx-auto flex max-w-6xl gap-16 px-5 py-14 sm:px-8">
        <Sidebar activeId={activeId} />

        <div className="min-w-0 flex-1 space-y-24 pb-16">
          {/* ─── Header ─────────────────────────────────────────────────── */}
          <div className="max-w-2xl">
            <motion.div {...fadeUpProps(0)}>
              <Eyebrow index="00">documentation</Eyebrow>
            </motion.div>
            <motion.h1
              className="mb-5 font-serif text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl"
              {...fadeUpProps(0.06)}
            >
              Draft Notation
            </motion.h1>
            <motion.p className="mb-6 text-lg leading-relaxed text-ink-muted" {...fadeUpProps(0.12)}>
              A plain-English way to write class diagrams. No angle brackets, no drag-and-drop —
              you describe classes and how they relate, in sentences a teammate could read out loud,
              and the canvas builds itself.
            </motion.p>
            <motion.div {...fadeUpProps(0.18)}>
              <Link
                href="/playground"
                className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold
                           text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
              >
                Open Playground <ChevronRight size={15} />
              </Link>
            </motion.div>
          </div>

          {/* ─── Quick start ────────────────────────────────────────────── */}
          <section id="quick-start" className="scroll-mt-28 space-y-6">
            <Eyebrow index="01">quick start</Eyebrow>
            <h2 className="font-serif text-3xl font-medium text-ink">Four things to learn</h2>
            <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
              That's genuinely the whole language. There's no schema to memorize —
              if you can describe your system out loud, you can already write Draft Notation.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  {...inViewProps(i * 0.06)}
                  className="rounded-md border border-hairline bg-paper-elevated p-6 transition-all duration-200
                             hover:-translate-y-0.5 hover:border-hairline-strong hover:shadow-md"
                >
                  <p className="mb-4 font-mono text-2xl font-medium text-brand">{s.n}</p>
                  <p className="mb-1 font-mono text-[10px] font-medium tracking-widest text-ink-faint uppercase">{s.mono}</p>
                  <h3 className="mb-2 font-medium text-ink">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{s.desc}</p>
                </motion.div>
              ))}
            </div>

            <CodeBlock code={`# Start with your first class
User

# Give it fields
User knows id, name: String, email: String

# Give it behaviours
User can login(), getProfile(): Profile

# Describe a relationship — this line alone creates the Post class too
User has many Post
`} />
          </section>

          {/* ─── Live widget ────────────────────────────────────────────── */}
          <section id="live" className="scroll-mt-28 space-y-6">
            <Eyebrow index="02">playground</Eyebrow>
            <h2 className="font-serif text-3xl font-medium text-ink">Try it live</h2>
            <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
              Edit the code on the left — the parsed structure updates on the right in real time.
              Nothing here is sent anywhere; it's the same parser the editor uses.
            </p>
            <LiveWidget />
          </section>

          {/* ─── Fields & methods ───────────────────────────────────────── */}
          <section id="fields" className="scroll-mt-28 space-y-10">
            <div className="space-y-3">
              <Eyebrow index="03">the details</Eyebrow>
              <h2 className="font-serif text-3xl font-medium text-ink">Declaring things</h2>
              <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
                Any capitalised word on its own line becomes a class — that's the default,
                so you rarely type <code className="rounded bg-hairline px-1 py-0.5 font-mono text-[13px] text-brand">class</code> at
                all. Reach for one of these keywords only when you need something more specific:
              </p>
              <div className="overflow-hidden rounded-md border border-hairline">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-hairline">
                      <th className="px-5 py-3 text-left"><p className="font-mono text-[10px] font-medium tracking-widest text-ink-faint uppercase">Keyword</p></th>
                      <th className="px-5 py-3 text-left"><p className="font-mono text-[10px] font-medium tracking-widest text-ink-faint uppercase">What it means</p></th>
                    </tr>
                  </thead>
                  <tbody>
                    {KEYWORDS.map(row => (
                      <tr key={row.kw} className="border-b border-hairline last:border-0">
                        <td className="px-5 py-4 font-mono text-sm font-semibold text-brand">{row.kw}</td>
                        <td className="px-5 py-4 text-sm text-ink-muted">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-2xl font-medium text-ink">Fields & methods</h3>
              <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
                Once a class exists, give it fields with{' '}
                <code className="rounded bg-hairline px-1 py-0.5 font-mono text-[13px] text-brand">knows</code>,
                and behaviour with{' '}
                <code className="rounded bg-hairline px-1 py-0.5 font-mono text-[13px] text-brand">can</code>.
                Add a type after a colon, and comma-separate as many as you like on one line.
              </p>
              <CodeBlock copyable={false} code={`Account knows accountNumber: String, balance: number
Account can deposit(amount: number), withdraw(amount: number)`} />
              <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
                Prefix any field or method with a symbol to set its visibility —
                the same private/protected/public concept from any OOP language:
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {VISIBILITY.map(v => (
                  <div key={v.name} className="flex items-start gap-3 rounded-md border border-hairline bg-paper-elevated p-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-hairline font-mono text-xs font-bold text-brand">
                      {v.symbol === '(none)' ? '+' : v.symbol}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{v.name}</p>
                      <p className="text-xs leading-relaxed text-ink-muted">{v.plain}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── Relationships ──────────────────────────────────────────── */}
          <section id="relations" className="scroll-mt-28 space-y-6">
            <Eyebrow index="04">the important part</Eyebrow>
            <h2 className="font-serif text-3xl font-medium text-ink">Relationships</h2>
            <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
              This is the one place UML jargon actually matters, so here's each verb translated
              into plain English — what it means, not just what it's called.
            </p>

            <div className="space-y-3">
              {RELATIONS.map((r, i) => (
                <motion.div
                  key={r.verb}
                  {...inViewProps(Math.min(i * 0.04, 0.3))}
                  className="rounded-md border border-hairline bg-paper-elevated p-5"
                >
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-sm font-semibold text-brand">{r.verb}</span>
                    <span className="text-xs text-ink-faint">— {r.uml}</span>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-ink-muted">{r.plain}</p>
                  <code className="rounded bg-hairline px-2 py-1 font-mono text-xs text-ink">{r.example}</code>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ─── Examples ───────────────────────────────────────────────── */}
          <section id="examples" className="scroll-mt-28 space-y-6">
            <Eyebrow index="05">see it in context</Eyebrow>
            <h2 className="font-serif text-3xl font-medium text-ink">Full examples</h2>
            <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
              Three complete systems, written start to finish — a good way to see how the pieces
              combine once there's more than one relationship on the page.
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setActiveExample(i)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
                    activeExample === i
                      ? 'bg-brand text-brand-foreground'
                      : 'border border-hairline-strong text-ink-muted hover:text-ink',
                  )}
                >
                  {ex.title}
                </button>
              ))}
            </div>
            <CodeBlock code={EXAMPLES[activeExample].code} />
          </section>

          {/* ─── Tips ───────────────────────────────────────────────────── */}
          <section id="tips" className="scroll-mt-28 space-y-6">
            <Eyebrow index="06">good to know</Eyebrow>
            <h2 className="font-serif text-3xl font-medium text-ink">Tips & tricks</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {TIPS.map((tip, i) => (
                <motion.div
                  key={tip.title}
                  {...inViewProps(i * 0.05)}
                  className="space-y-3 rounded-md border border-hairline bg-paper-elevated p-5"
                >
                  <h4 className="font-medium text-ink">{tip.title}</h4>
                  <p className="text-xs leading-relaxed text-ink-muted">{tip.body}</p>
                  <CodeBlock code={tip.code} copyable={false} />
                </motion.div>
              ))}
            </div>
          </section>

          {/* ─── CTA ────────────────────────────────────────────────────── */}
          <motion.div
            {...inViewProps(0)}
            className="space-y-4 rounded-md border border-brand/20 bg-brand-tint p-10 text-center"
          >
            <h2 className="font-serif text-2xl font-medium text-ink">Ready to design?</h2>
            <p className="text-sm text-ink-muted">
              Open the Playground and start writing — the diagram builds itself as you type.
            </p>
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold
                         text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
            >
              Open Playground <ChevronRight size={15} />
            </Link>
          </motion.div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
