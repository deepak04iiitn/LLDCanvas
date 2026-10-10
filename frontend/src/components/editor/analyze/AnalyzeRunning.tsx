'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { analysisCategoryBatches } from '@/lib/design-analysis'

const LENSES: Record<string, string> = {
  uml: 'Reading UML form',
  structure: 'Mapping structure',
  relationships: 'Tracing edges',
  solid: 'Weighing SOLID',
  naming: 'Checking names',
  extensibility: 'Probing extension',
}

export function AnalyzeRunning({ onDone }: { onDone: () => void }) {
  const batches = analysisCategoryBatches()
  const [step, setStep] = useState(0)
  const doneRef = useRef(false)

  useEffect(() => {
    if (step >= batches.length) {
      if (doneRef.current) return
      doneRef.current = true
      const t = setTimeout(onDone, 480)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep(s => s + 1), 540)
    return () => clearTimeout(t)
  }, [step, batches.length, onDone])

  const total = batches.length
  const finished = step >= total
  const activeIdx = finished ? total - 1 : step
  const active = batches[activeIdx]
  const progress = Math.min(step, total) / total

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-y-auto bg-paper">
      {/* Quiet field — not a glow blob */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 55% 50% at 50% 45%, black, transparent)',
        }}
      />
      {/* Horizontal scan sweep */}
      {!finished && (
        <div
          className="analyze-scan-line pointer-events-none absolute inset-x-0 h-px bg-brand/40"
          aria-hidden
        />
      )}

      <div className="relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-10 sm:py-12">
        {/* Crop marks — instrument feel */}
        <div className="pointer-events-none absolute left-4 top-6 h-4 w-4 border-l border-t border-ink/20 sm:left-2" />
        <div className="pointer-events-none absolute right-4 top-6 h-4 w-4 border-r border-t border-ink/20 sm:right-2" />
        <div className="pointer-events-none absolute bottom-6 left-4 h-4 w-4 border-b border-l border-ink/20 sm:left-2" />
        <div className="pointer-events-none absolute bottom-6 right-4 h-4 w-4 border-b border-r border-ink/20 sm:right-2" />

        <div className="flex items-end justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-faint">
              Design scan
            </p>
            <p className="mt-1 font-mono text-[11px] tabular-nums text-ink-muted">
              {String(Math.min(step + (finished ? 0 : 1), total)).padStart(2, '0')}
              <span className="text-ink-faint"> / {String(total).padStart(2, '0')}</span>
            </p>
          </div>
          <div className="h-1 w-24 overflow-hidden bg-ink/8 sm:w-32">
            <div
              className="h-full bg-brand transition-[width] duration-500 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* One lens at a time — not a checklist */}
        <div
          key={active.id}
          className="mt-8 animate-in fade-in slide-in-from-bottom-1 duration-300 sm:mt-10"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand">
            {finished ? 'Ready' : LENSES[active.id] ?? 'Checking'}
          </p>
          <h2 className="mt-2 font-serif text-[clamp(1.75rem,5vw,2.35rem)] font-medium leading-[1.1] tracking-tight text-ink">
            {finished ? 'Checks complete' : active.label}
          </h2>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-muted">
            {finished
              ? 'Opening your design report…'
              : 'Deterministic rules against the live diagram — no model guessing.'}
          </p>
        </div>

        {/* Index rail — compact, not a card */}
        <ol className="mt-10 flex flex-wrap items-center gap-x-1 gap-y-2 sm:mt-12">
          {batches.map((b, i) => {
            const done = i < step || finished
            const current = i === activeIdx && !finished
            return (
              <li key={b.id} className="flex items-center gap-1">
                {i > 0 && <span className="mx-1 h-px w-3 bg-ink/15 sm:w-4" aria-hidden />}
                <span
                  className={cn(
                    'font-mono text-[10px] uppercase tracking-wider transition-colors duration-300',
                    done && 'text-brand',
                    current && 'text-ink',
                    !done && !current && 'text-ink-faint',
                  )}
                >
                  <span className="tabular-nums text-[9px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
                  {' '}
                  <span className={cn(current && 'underline decoration-brand/50 underline-offset-4')}>
                    {b.label.split('&')[0].trim().split(' ')[0]}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
