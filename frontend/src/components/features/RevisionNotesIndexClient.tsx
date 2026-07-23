'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type PublicRevisionNoteSummary } from '@/lib/public-api'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { Reveal } from '@/components/features/Reveal'

// ─── Roman numerals ──────────────────────────────────────────────────────────
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

// ─── Field-guide rarity tiers (mapped from difficulty) ───────────────────────
const RARITY: Record<string, { label: string; color: string; bg: string; ring: string; dot: string }> = {
  easy:   { label: 'Core',         color: 'text-emerald-700', bg: 'bg-emerald-50',  ring: 'ring-emerald-200', dot: '●' },
  medium: { label: 'Intermediate', color: 'text-amber-700',   bg: 'bg-amber-50',    ring: 'ring-amber-200',   dot: '◆' },
  hard:   { label: 'Advanced',     color: 'text-red-700',     bg: 'bg-red-50',      ring: 'ring-red-200',     dot: '★' },
}

interface Props {
  notes: PublicRevisionNoteSummary[]
  groups: [string, PublicRevisionNoteSummary[]][]
}

export function RevisionNotesIndexClient({ notes, groups }: Props) {
  return (
    <div className="overflow-hidden">

      {/* ════════════════════ HERO — Field Guide title page ══════════════════════ */}
      <section className="relative border-b border-hairline overflow-hidden">

        {/* Faint ruled-lines texture — like notebook paper */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 27px, #234E3F 27px, #234E3F 28px)',
            backgroundSize: '100% 28px',
          }}
          aria-hidden
        />

        <Reveal className="relative mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-24">

          {/* Series label */}
          <p className="mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-ink-faint/60">
            <span className="text-gold">¶05</span>&nbsp;—&nbsp;Quick Revision · Interview Prep
          </p>

          {/* Title block with decorative rules */}
          <div className="pt-5 pb-5" style={{ borderTop: '2px solid rgba(0,0,0,0.10)', borderBottom: '1px solid var(--color-hairline)' }}>
            <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-ink-faint/45">
              A Field Guide to
            </p>
            <h1 className="font-serif text-[clamp(2.6rem,7vw,5.5rem)] font-medium leading-[0.92] tracking-tight text-ink">
              Low-Level Design
            </h1>
          </div>

          {/* Bottom meta strip */}
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-lg text-[15px] leading-relaxed text-ink-muted">
              {notes.length} concise revision notes across {groups.length} disciplines — covering
              LLD design patterns, OOP &amp; SOLID principles, and system design fundamentals —
              each distilled with a real-world analogy for rapid interview recall.
            </p>
            <p className="shrink-0 font-mono text-[11px] text-ink-faint/50">
              {notes.length}&nbsp;entries&nbsp;·&nbsp;{groups.length}&nbsp;chapters
            </p>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════ CHAPTERS ═══════════════════════════════════════════ */}
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-10 sm:px-8">
        {groups.map(([category, categoryNotes], gi) => {
          const roman = ROMAN[gi] ?? String(gi + 1)

          return (
            <div key={category} className="mb-16 last:mb-0">

              {/* ── Chapter divider ─────────────────────────────────────────── */}
              <Reveal>
                <div className="mb-6 flex items-center gap-4">
                  {/* Large ghost roman numeral */}
                  <span
                    className="shrink-0 select-none font-serif text-[4rem] font-medium leading-none text-ink/5"
                    aria-hidden
                  >
                    {roman}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 h-px bg-hairline-strong" />
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.38em] text-ink-faint/60">
                      Chapter {roman}&nbsp;&nbsp;—&nbsp;&nbsp;{category}
                    </p>
                  </div>

                  <span className="shrink-0 font-mono text-[10px] text-ink-faint/35">
                    {categoryNotes.length}&nbsp;entries
                  </span>
                </div>
              </Reveal>

              {/* ── Specimen entry list ──────────────────────────────────────── */}
              <div className="divide-y divide-hairline border-y border-hairline">
                {categoryNotes.map((n, ni) => {
                  const r = RARITY[n.difficulty] ?? RARITY.easy

                  return (
                    <Reveal key={n.slug} delay={ni * 0.04}>
                      <Link
                        href={`/features/revision-notes/${n.categorySlug}/${n.slug}`}
                        className="group flex items-center gap-3 px-2 py-4 transition-colors hover:bg-paper-elevated/70 sm:gap-5 sm:px-3"
                      >
                        {/* Entry index */}
                        <span className="w-7 shrink-0 text-right font-mono text-[10px] text-ink-faint/30">
                          {String(ni + 1).padStart(2, '0')}
                        </span>

                        {/* Rarity badge — desktop */}
                        <span
                          className={cn(
                            'hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase ring-1 ring-inset sm:inline-flex',
                            r.bg, r.color, r.ring,
                          )}
                        >
                          {r.dot}&nbsp;{r.label}
                        </span>

                        {/* Rarity dot — mobile */}
                        <span
                          className={cn(
                            'mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full sm:hidden',
                            n.difficulty === 'easy'   ? 'bg-emerald-400'
                            : n.difficulty === 'medium' ? 'bg-amber-400'
                            : 'bg-red-400',
                          )}
                        />

                        {/* Title + summary */}
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-[15px] font-medium leading-snug text-ink transition-colors group-hover:text-brand">
                            {n.title}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-[12px] text-ink-faint">{n.summary}</p>
                        </div>

                        {/* Hover arrow */}
                        <ChevronRight
                          size={14}
                          className="shrink-0 text-brand opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </Link>
                    </Reveal>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <FeatureCrossLinks exclude="/features/revision-notes" />
    </div>
  )
}
