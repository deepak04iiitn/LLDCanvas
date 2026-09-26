'use client'

import Link from 'next/link'
import { ArrowRight, Info, Network, ZoomIn } from 'lucide-react'

export default function ArchitectureAnalysisPage() {
  return (
    <div className="h-full overflow-y-auto bg-paper">

      {/* Hero */}
      <div className="bg-linear-to-b from-brand-tint/35 to-paper border-b border-hairline/60 px-6 pt-10 pb-8">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand mb-2">
            Design Studio
          </p>
          <h1 className="font-serif text-3xl font-medium text-ink leading-tight mb-2">
            Architecture Analysis
          </h1>
          <p className="text-[15px] text-ink-muted leading-relaxed max-w-2xl">
            Understand how your designs work — and where they break
          </p>
        </div>
      </div>

      {/* Feature tiles */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-5 lg:grid-cols-2">

          {/* Microscope tile — solid brand CTA */}
          <div className="flex flex-col rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
            <div className="flex flex-col flex-1 p-7">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-tint">
                  <ZoomIn size={22} className="text-brand" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-medium text-ink leading-tight">
                    Architecture Microscope
                  </h2>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-brand mt-1">
                    Structural Investigation
                  </p>
                </div>
              </div>

              <p className="text-[14px] text-ink-muted leading-relaxed flex-1 mb-6">
                Zoom into a design at multiple levels — system, service, class, and method. Use structured lenses to analyse coupling, cohesion, and responsibility distribution.
              </p>

              <div className="mb-6 rounded-xl bg-brand-tint/40 border border-brand/10 px-4 py-3 space-y-1.5">
                {['Inspect coupling between components', 'Map cohesion across service boundaries', 'Build structured analysis reports'].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/50" />
                    <p className="text-[12px] text-ink-muted">{item}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/design-studio/microscope/problems"
                className="flex items-center justify-between gap-2 rounded-xl bg-brand px-5 py-3 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity group"
              >
                <span>Explore Microscope</span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Dependency Web tile — outlined brand CTA */}
          <div className="flex flex-col rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
            <div className="flex flex-col flex-1 p-7">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-tint">
                  <Network size={22} className="text-brand" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-medium text-ink leading-tight">
                    Dependency Web
                  </h2>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-brand mt-1">
                    Coupling &amp; Change Propagation
                  </p>
                </div>
              </div>

              <p className="text-[14px] text-ink-muted leading-relaxed flex-1 mb-6">
                Map the dependency graph of a real system. Visualise coupling hotspots, identify circular dependencies, and reason about change propagation paths.
              </p>

              <div className="mb-6 rounded-xl bg-brand-tint/40 border border-brand/10 px-4 py-3 space-y-1.5">
                {['Trace dependency graphs across components', 'Find circular dependencies and coupling hotspots', 'Reason about which changes cascade'].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/50" />
                    <p className="text-[12px] text-ink-muted">{item}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/design-studio/depweb/problems"
                className="flex items-center justify-between gap-2 rounded-xl border border-brand text-brand px-5 py-3 text-[13px] font-semibold hover:bg-brand-tint/40 transition-colors group"
              >
                <span>Explore Dependency Web</span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom callout */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-tint/20 px-6 py-5">
          <Info size={16} className="text-brand shrink-0 mt-0.5" />
          <p className="text-[13px] text-ink leading-relaxed">
            <span className="font-semibold">Not sure where to start?</span>{' '}
            Begin with Architecture Microscope — it gives you the structural vocabulary you will use in Dependency Web.
          </p>
        </div>
      </div>
    </div>
  )
}
