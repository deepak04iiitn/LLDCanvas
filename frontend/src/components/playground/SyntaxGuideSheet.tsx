'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { STEPS, EXAMPLES, KEYWORDS, VISIBILITY, RELATIONS, TIPS } from '@/lib/draft'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

function GuideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[10px] font-medium uppercase tracking-widest text-brand">{title}</h3>
      {children}
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-[#14130f] p-3 font-mono text-[11px] leading-5 text-white/80">
      {code}
    </pre>
  )
}

export function SyntaxGuideSheet({ open, onOpenChange }: Props) {
  const [activeExample, setActiveExample] = useState(0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        style={{ width: 'min(30rem, 100vw)', maxWidth: 'min(30rem, 100vw)' }}
        className="border-l border-hairline bg-paper p-0"
      >
        <SheetHeader className="border-b border-hairline p-5">
          <SheetTitle className="font-serif text-xl font-medium text-ink">Syntax guide</SheetTitle>
          <SheetDescription className="text-ink-muted">
            Everything you need to write Draft Notation — no need to leave this panel.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto p-5">
          {/* Quick start */}
          <GuideSection title="Quick start">
            <div className="space-y-2">
              {STEPS.map(s => (
                <div key={s.n} className="flex items-start gap-3 rounded-md border border-hairline bg-paper-elevated p-3">
                  <span className="mt-0.5 shrink-0 font-mono text-sm font-medium text-brand">{s.n}</span>
                  <div>
                    <p className="text-xs font-medium text-ink">{s.title}</p>
                    <p className="text-[11px] leading-snug text-ink-muted">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GuideSection>

          {/* Keywords */}
          <GuideSection title="Keywords">
            <div className="space-y-2">
              {KEYWORDS.map(row => (
                <div key={row.kw} className="flex items-start gap-3 rounded-md border border-hairline bg-paper-elevated p-3">
                  <code className="shrink-0 font-mono text-xs font-semibold text-brand">{row.kw}</code>
                  <p className="text-xs leading-relaxed text-ink-muted">{row.desc}</p>
                </div>
              ))}
            </div>
          </GuideSection>

          {/* Fields & methods */}
          <GuideSection title="Fields & methods">
            <CodeBlock code={'ClassName knows field: Type\nClassName can method(): Return'} />
            <div className="grid grid-cols-2 gap-2">
              {VISIBILITY.map(v => (
                <div key={v.name} className="flex items-start gap-2 rounded-md border border-hairline bg-paper-elevated p-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-hairline font-mono text-[11px] font-bold text-brand">
                    {v.symbol === '(none)' ? '+' : v.symbol}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-ink">{v.name}</p>
                    <p className="text-[11px] leading-snug text-ink-faint">{v.plain}</p>
                  </div>
                </div>
              ))}
            </div>
          </GuideSection>

          {/* Relationships */}
          <GuideSection title="Relationships">
            <div className="space-y-2">
              {RELATIONS.map(r => (
                <div key={r.verb} className="rounded-md border border-hairline bg-paper-elevated p-3">
                  <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-mono text-xs font-semibold text-brand">{r.verb}</span>
                    <span className="text-[10px] text-ink-faint">— {r.uml}</span>
                  </div>
                  <p className="mb-2 text-[11px] leading-relaxed text-ink-muted">{r.plain}</p>
                  <code className="rounded bg-hairline px-1.5 py-0.5 font-mono text-[10px] text-ink">{r.example}</code>
                </div>
              ))}
            </div>
          </GuideSection>

          {/* Full examples */}
          <GuideSection title="Full examples">
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={ex.title}
                  onClick={() => setActiveExample(i)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
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
          </GuideSection>

          {/* Tips */}
          <GuideSection title="Tips & tricks">
            <div className="space-y-3">
              {TIPS.map(tip => (
                <div key={tip.title} className="space-y-1.5 rounded-md border border-hairline bg-paper-elevated p-3">
                  <p className="text-xs font-medium text-ink">{tip.title}</p>
                  <p className="text-[11px] leading-snug text-ink-muted">{tip.body}</p>
                  <CodeBlock code={tip.code} />
                </div>
              ))}
            </div>
          </GuideSection>

          {/* Docs CTA */}
          <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
            <p className="mb-1 text-xs font-medium text-ink">Want the full reference?</p>
            <p className="mb-3 text-[11px] leading-snug text-ink-muted">
              The detailed docs cover advanced patterns, modifier keywords, edge cases, and more examples.
            </p>
            <Link
              href="/docs/draft"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-medium text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
            >
              Read detailed docs
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
