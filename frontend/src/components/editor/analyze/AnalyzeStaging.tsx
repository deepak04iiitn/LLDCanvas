'use client'

import { Play, ScanSearch } from 'lucide-react'
import { RULESET_VERSION, type AnalysisReport } from '@/lib/design-analysis'

export function AnalyzeStaging({
  typeCount,
  edgeCount,
  ready,
  lastReport,
  onAnalyze,
}: {
  typeCount: number
  edgeCount: number
  ready: boolean
  lastReport: AnalysisReport | null
  onAnalyze: () => void
}) {
  return (
    <div className="relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden bg-paper px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--hairline-strong) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-72 w-[28rem] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--brand) 28%, transparent), transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-lg text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 text-brand">
          <ScanSearch size={22} strokeWidth={1.75} />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Design analysis · {RULESET_VERSION}
        </p>
        <h1 className="mt-3 font-serif text-[clamp(1.75rem,4vw,2.5rem)] font-medium tracking-tight text-ink">
          Review your design
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          We evaluate UML correctness, structure, relationships, and LLD heuristics in the
          background — hit Analyze when you want the full report.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-hairline bg-paper-elevated px-3 py-1 font-mono text-[11px] text-ink-muted">
            {typeCount} types
          </span>
          <span className="rounded-full border border-hairline bg-paper-elevated px-3 py-1 font-mono text-[11px] text-ink-muted">
            {edgeCount} relationships
          </span>
          {ready && (
            <span className="rounded-full border border-brand/30 bg-brand/5 px-3 py-1 font-mono text-[11px] text-brand">
              Analysis ready
            </span>
          )}
        </div>

        {lastReport && (
          <p className="mt-4 text-[12px] text-ink-faint">
            Last score{' '}
            <span className="font-mono font-medium text-ink">{lastReport.overallScore}/100</span>
            {' · '}
            {lastReport.summary.failed} fail · {lastReport.summary.warned} warn
          </p>
        )}

        <button
          type="button"
          onClick={onAnalyze}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-brand px-8 py-3.5 text-[15px] font-semibold text-white shadow-sm shadow-brand/25 transition-opacity hover:opacity-95"
        >
          <Play size={16} fill="currentColor" />
          Analyze Design
        </button>
      </div>
    </div>
  )
}
