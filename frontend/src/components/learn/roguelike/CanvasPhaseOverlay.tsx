'use client'

/**
 * CanvasPhaseOverlay — full-viewport canvas experience for Roguelike runs.
 *
 * Design principles:
 *  • Canvas = 100% of the screen, nothing clips it
 *  • HUD elements float on top and stay out of the way
 *  • Secondary info only appears when the user asks for it
 *  • Smooth CSS transitions for all open/close interactions
 */

import { useState, useEffect } from 'react'
import { Loader2, ChevronDown, ChevronUp, X, PenLine, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Stage, FullRun, RoguelikeScenario, StageResult, ArchitectureHealth, DecisionOption } from '@/lib/learn-api'
import { RoguelikeCanvas } from './RoguelikeCanvas'
import type { SimpleNode, SimpleEdge } from './RoguelikeCanvas'

// ── Colour helpers (keep in sync with ArchitectureHealth.tsx) ─────────────────
function getOverallScore(h: ArchitectureHealth): number {
  return Math.round(
    ((100 - h.coupling) + h.cohesion + h.extensibility + (100 - h.complexity) + h.reliability) / 5,
  )
}
function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-500'
  if (score >= 45) return 'text-amber-500'
  return 'text-red-500'
}
function getBarColor(value: number, lowerIsBetter: boolean): string {
  const badness = lowerIsBetter ? value : 100 - value
  if (badness < 35) return 'bg-emerald-500'
  if (badness < 65) return 'bg-amber-500'
  return 'bg-red-500'
}

const METRICS: { key: keyof ArchitectureHealth; label: string; lowerIsBetter: boolean }[] = [
  { key: 'coupling',      label: 'Coupling',      lowerIsBetter: true  },
  { key: 'cohesion',      label: 'Cohesion',      lowerIsBetter: false },
  { key: 'extensibility', label: 'Extensibility', lowerIsBetter: false },
  { key: 'complexity',    label: 'Complexity',    lowerIsBetter: true  },
  { key: 'reliability',   label: 'Reliability',   lowerIsBetter: false },
]

const MODE_COLORS: Record<string, string> = {
  beginner:  'bg-emerald-100 text-emerald-700',
  interview: 'bg-blue-100 text-blue-700',
  survival:  'bg-amber-100 text-amber-700',
  hardcore:  'bg-red-100 text-red-700',
  endless:   'bg-purple-100 text-purple-700',
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  stage:             Stage
  run:               FullRun
  scenario:          RoguelikeScenario
  selectedDecision?: DecisionOption | null
  diagramNodes:      SimpleNode[]
  diagramEdges:      SimpleEdge[]
  architectureNotes: string
  submitting:        boolean
  onDiagramChange:   (n: SimpleNode[], e: SimpleEdge[]) => void
  onNotesChange:     (v: string) => void
  onBack:            () => void
  onSubmit:          () => void
  completedStages:   StageResult[]
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CanvasPhaseOverlay({
  stage, run, scenario,
  selectedDecision,
  diagramNodes, diagramEdges,
  architectureNotes, submitting,
  onDiagramChange, onNotesChange,
  onBack, onSubmit,
  completedStages,
}: Props) {

  const [briefOpen,   setBriefOpen]   = useState(true)
  const [notesOpen,   setNotesOpen]   = useState(false)
  const [metricsOpen, setMetricsOpen] = useState(false)

  // Close brief sheet when notes opens (user is switching intent)
  useEffect(() => { if (notesOpen) setBriefOpen(false) }, [notesOpen])

  const overall      = getOverallScore(run.health)
  const scoreColor   = getScoreColor(overall)
  const prevHealth   = completedStages.length > 0
    ? completedStages[completedStages.length - 1]?.healthBefore
    : undefined

  const { resources, stagesTotal, currentStageOrder: currentOrder, mode } = run

  return (
    <div className="fixed inset-0 z-60 overflow-hidden bg-paper">

      {/* ── 1. Canvas — fills everything ─────────────────────────────────── */}
      <div className="absolute inset-0">
        <RoguelikeCanvas
          nodes={diagramNodes}
          edges={diagramEdges}
          onChange={onDiagramChange}
        />
      </div>

      {/* ── 2. Full-width top header bar ─────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 z-20 flex h-12 items-stretch border-b border-hairline bg-paper/92 backdrop-blur-md">

        {/* LEFT — scenario name + mode (single line) */}
        <div className="flex shrink-0 items-center gap-2.5 border-r border-hairline px-5">
          <span className="whitespace-nowrap font-medium text-[13px] text-ink">{scenario.title}</span>
          <span className={cn('shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[8px] uppercase font-semibold tracking-wide', MODE_COLORS[mode] ?? 'bg-hairline text-ink-muted')}>
            {mode}
          </span>
        </div>

        {/* CENTER — stage type + title (clickable, opens sheet) */}
        <button
          onClick={() => setBriefOpen(v => !v)}
          className={cn(
            'flex w-48 shrink-0 flex-col items-center justify-center gap-0.5 border-r border-hairline px-6 transition-colors',
            briefOpen ? 'bg-brand-tint' : 'hover:bg-paper-elevated',
          )}
        >
          <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-ink-faint">
            {stage.event.type}
          </span>
          <div className="flex items-center gap-1">
            <span className={cn('font-serif text-[15px] font-semibold leading-none', briefOpen ? 'text-brand' : 'text-ink')}>
              {stage.title}
            </span>
            <ChevronDown
              size={12}
              className={cn('shrink-0 text-ink-faint transition-transform duration-200', briefOpen && 'rotate-180')}
            />
          </div>
        </button>

        {/* RIGHT — resources evenly split + progress dots */}
        <div className="flex flex-1 items-center">

          {/* Resources — equal columns across available width */}
          <div className="flex flex-1 items-center justify-evenly border-l border-hairline">
            <ResourceCell value={`${resources.engineeringHoursRemaining}`} label="Eng Hrs"
              warn={resources.engineeringHoursRemaining < 8}
              danger={resources.engineeringHoursRemaining < 4} />
            <div className="h-6 w-px bg-hairline" />
            <ResourceCell value={`${resources.complexityBudgetRemaining}`} label="Complexity"
              warn={resources.complexityBudgetRemaining < 3}
              danger={resources.complexityBudgetRemaining < 2} />
            <div className="h-6 w-px bg-hairline" />
            <ResourceCell value={`${resources.teamSize}`} label="Team Size" />
            <div className="h-6 w-px bg-hairline" />
            <ResourceCell value={`${resources.infraBudgetRemaining}`} label="Infra" />
            <div className="h-6 w-px bg-hairline" />
            <ResourceCell value={`${resources.changesRemaining}`} label="Changes"
              warn={resources.changesRemaining < 3}
              danger={resources.changesRemaining < 1} />
          </div>

          {/* Stage progress — pinned right */}
          <div className="flex shrink-0 items-center gap-2 border-l border-hairline px-5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.min(stagesTotal, 10) }, (_, i) => {
                const ord = i + 1
                return (
                  <div key={i} className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    ord === currentOrder ? 'scale-110 bg-brand' :
                    ord < currentOrder  ? 'bg-emerald-500' : 'bg-hairline',
                  )} />
                )
              })}
              {stagesTotal > 10 && <span className="ml-1 font-mono text-[9px] text-ink-faint">+{stagesTotal - 10}</span>}
            </div>
            <span className="font-mono text-[11px] font-medium tabular-nums text-ink-muted">{currentOrder}/{stagesTotal}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Stage brief — top sheet slides down from header ───────────── */}
      {briefOpen && (
        <div className="absolute inset-0 z-28" onClick={() => setBriefOpen(false)} />
      )}
      <div className={cn(
        'absolute left-1/2 top-12 z-29 w-96 -translate-x-1/2',
        'rounded-b-2xl border-x border-b border-hairline bg-paper shadow-lg',
        'transition-all duration-200 ease-out origin-top',
        briefOpen
          ? 'opacity-100 scale-y-100 pointer-events-auto'
          : 'opacity-0 scale-y-95 pointer-events-none',
      )}>
        <div className="px-7 py-6">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
            {stage.event.type} &middot; Stage {currentOrder} of {stagesTotal}
          </p>
          <h2 className="font-serif text-[20px] font-semibold text-ink leading-tight mb-3">
            {stage.title}
          </h2>
          <p className="text-[13px] leading-relaxed text-ink-muted mb-4">
            {stage.event.description}
          </p>

          {/* Chosen approach banner */}
          {selectedDecision && (
            <div className="flex items-start gap-2.5 rounded-xl border border-brand/20 bg-brand-tint px-3.5 py-2.5">
              <span className="mt-px font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
                Approach
              </span>
              <span className="text-[12px] font-medium text-ink leading-snug">
                {selectedDecision.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Architecture score badge — hidden on stage 1 (no history yet) */}
      <button
        onClick={() => setMetricsOpen(v => !v)}
        hidden={currentOrder === 1}
        title="Architecture Health"
        className={cn(
          'absolute right-4 top-14 z-20 flex flex-col items-center justify-center rounded-full border-2 shadow-md transition-all duration-200',
          'h-13 w-13',
          metricsOpen
            ? 'border-brand bg-brand/8'
            : 'border-hairline bg-paper/90 backdrop-blur-md hover:border-brand/30 hover:bg-brand-tint/50',
        )}
      >
        <span className={cn('font-mono text-[15px] font-bold leading-none tabular-nums', scoreColor)}>
          {overall}
        </span>
        <span className="mt-0.5 font-mono text-[7px] uppercase tracking-wide text-ink-faint">
          health
        </span>
      </button>

      {/* ── 5. Architecture metrics drawer — slides from right (stage 2+) ── */}
      <div className={cn(
        'absolute right-0 top-0 z-25 h-full w-64 transition-transform duration-300 ease-out',
        metricsOpen && currentOrder > 1 ? 'translate-x-0' : 'translate-x-full',
      )}>
        <div className="flex h-full flex-col border-l border-hairline bg-paper/96 shadow-2xl backdrop-blur-xl">
          {/* Drawer header */}
          <div className="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Architecture</p>
              <p className="text-[11px] text-ink-muted">Health metrics</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline">
                <span className={cn('font-mono text-[13px] font-bold tabular-nums', scoreColor)}>{overall}</span>
              </div>
              <button
                onClick={() => setMetricsOpen(false)}
                className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-hairline/50 hover:text-ink"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Metric bars */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
            <div className="space-y-3">
              {METRICS.map(m => {
                const value = run.health[m.key] as number
                const prev  = prevHealth ? (prevHealth[m.key] as number) : undefined
                const delta = prev !== undefined ? value - prev : undefined
                const isGood = delta !== undefined
                  ? (m.lowerIsBetter ? delta <= 0 : delta >= 0)
                  : true
                return (
                  <div key={m.key}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] text-ink-muted">{m.label}</span>
                      <div className="flex items-center gap-1">
                        {delta !== undefined && delta !== 0 && (
                          <span className={cn('font-mono text-[10px]', isGood ? 'text-emerald-500' : 'text-red-500')}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        )}
                        <span className="font-mono text-[11px] tabular-nums text-ink">{value}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-hairline/50">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', getBarColor(value, m.lowerIsBetter))}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tech debt */}
            <div className="mt-4 rounded-lg border border-hairline bg-paper px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-ink-muted">Tech Debt</span>
                <span className={cn(
                  'rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium tabular-nums',
                  run.health.debt < 20 ? 'bg-emerald-100 text-emerald-700' :
                  run.health.debt < 50 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700',
                )}>
                  {run.health.debt}
                </span>
              </div>
              {prevHealth && run.health.debt !== prevHealth.debt && (
                <p className={cn(
                  'mt-0.5 font-mono text-[10px]',
                  run.health.debt > prevHealth.debt ? 'text-red-500' : 'text-emerald-500',
                )}>
                  {run.health.debt > prevHealth.debt ? '+' : ''}{run.health.debt - prevHealth.debt} this stage
                </p>
              )}
            </div>

            <p className="mt-3 text-[10px] leading-relaxed text-ink-faint">
              Score = avg of inverted coupling &amp; complexity + cohesion, extensibility, reliability
            </p>
          </div>
        </div>
      </div>

      {/* ── Backdrop for metrics panel ────────────────────────────────────── */}
      {metricsOpen && (
        <div
          className="absolute inset-0 z-24"
          onClick={() => setMetricsOpen(false)}
        />
      )}

      {/* ── 6. Bottom bar — notes + actions ─────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20">

        {/* Notes bottom sheet — slides up */}
        <div className={cn(
          'mx-4 overflow-hidden rounded-t-2xl border border-b-0 border-hairline bg-paper/95 shadow-lg backdrop-blur-md transition-all duration-300 ease-out',
          notesOpen ? 'max-h-44 opacity-100' : 'max-h-0 opacity-0 border-0',
        )}>
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">Design Notes</p>
            <button
              onClick={() => setNotesOpen(false)}
              className="rounded-md p-1 text-ink-faint hover:text-ink transition-colors"
            >
              <ChevronDown size={13} />
            </button>
          </div>
          <textarea
            value={architectureNotes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder="Explain your design decisions, trade-offs, and reasoning…"
            className="h-28 w-full resize-none bg-transparent px-4 py-3 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-3 border-t border-hairline bg-paper/90 px-5 py-3 backdrop-blur-md">
          {/* Back */}
          <button
            onClick={onBack}
            className="shrink-0 text-[12px] text-ink-muted transition-colors hover:text-ink"
          >
            ← Back
          </button>

          {/* Notes toggle button */}
          <button
            onClick={() => setNotesOpen(v => !v)}
            className={cn(
              'flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-[12px] transition-colors',
              notesOpen
                ? 'border-brand/30 bg-brand-tint text-brand'
                : 'border-hairline bg-paper text-ink-muted hover:border-brand/20 hover:bg-paper-elevated hover:text-ink',
            )}
          >
            <PenLine size={13} className="shrink-0" />
            <span className="min-w-0 flex-1 truncate text-left">
              {architectureNotes
                ? architectureNotes.slice(0, 70) + (architectureNotes.length > 70 ? '…' : '')
                : 'Add design notes…'}
            </span>
            {notesOpen
              ? <ChevronDown size={12} className="shrink-0" />
              : <ChevronUp   size={12} className="shrink-0" />}
          </button>

          {/* Submit */}
          <button
            disabled={submitting}
            onClick={onSubmit}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-brand px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
          >
            {submitting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : 'Submit Design →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Resource mini (kept for any inline use) ───────────────────────────────────
function ResourceMini({
  icon, value, warn, danger,
}: { icon: string; value: string; warn?: boolean; danger?: boolean }) {
  return (
    <span className={cn(
      'font-mono text-[10px]',
      danger ? 'text-red-600' : warn ? 'text-amber-600' : 'text-ink-muted',
    )}>
      {icon} {value}
    </span>
  )
}

// ── Resource cell — number + text label, no emoji ─────────────────────────────
function ResourceCell({
  value, label, warn, danger,
}: { value: string; label: string; warn?: boolean; danger?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      <span className={cn(
        'font-mono text-[13px] font-semibold tabular-nums leading-none',
        danger ? 'text-red-500' : warn ? 'text-amber-500' : 'text-ink',
      )}>
        {value}
      </span>
      <span className="font-mono text-[8px] uppercase tracking-[0.12em] leading-none text-ink-faint">
        {label}
      </span>
    </div>
  )
}
