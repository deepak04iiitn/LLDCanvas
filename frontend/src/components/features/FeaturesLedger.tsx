'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LedgerRow {
  n: string
  title: string
  teaser: string
  body: string
  chips: string[]
  href: string
}

// Content is always rendered for every row, regardless of open/closed state —
// only a wrapping motion.div's height/opacity animates. Crawlers (and users
// with JS disabled) get the full text either way; this is purely a
// progressive-disclosure UX affordance, never a content-hiding mechanism.
function LedgerItem({ row, open, onToggle }: { row: LedgerRow; open: boolean; onToggle: () => void }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-5 px-6 py-5 text-left transition-colors hover:bg-paper sm:px-8"
      >
        <span className="shrink-0 font-mono text-xs font-bold text-ink-faint/60">{row.n}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-lg font-medium text-ink">{row.title}</span>
          {!open && <span className="mt-0.5 block truncate text-sm text-ink-muted">{row.teaser}</span>}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300', open && 'rotate-180 text-brand')} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-7 sm:px-8">
          <p className="max-w-3xl text-[15px] leading-relaxed text-ink-muted">{row.body}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {row.chips.map(c => (
              <span key={c} className="rounded-full border border-hairline bg-paper px-2.5 py-1 font-mono text-[11px] text-ink-muted">
                {c}
              </span>
            ))}
          </div>
          <Link
            href={row.href}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-opacity hover:opacity-70"
          >
            Explore {row.title} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export function FeaturesLedger({ rows }: { rows: LedgerRow[] }) {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated shadow-sm">
      {rows.map((row, i) => (
        <div key={row.n} className={i > 0 ? 'border-t border-hairline' : ''}>
          <LedgerItem row={row} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
        </div>
      ))}
    </div>
  )
}

export type { LedgerRow }
