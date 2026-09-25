'use client'

import Link from 'next/link'
import { Coins } from 'lucide-react'

export default function AdminStudioBudgetPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <div className="rounded-2xl border border-hairline bg-paper-elevated p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-tint text-brand">
          <Coins size={22} strokeWidth={1.75} />
        </div>
        <h1 className="font-serif text-2xl font-medium text-ink">Budget Config</h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          Architecture Budget packs (marketplace investments, stages, grading) are authored as
          studio challenge packs — seed via <span className="font-mono text-[12px]">seed-studio-budget</span>.
          Diagram cost tables remain available for inflation signals in reports.
        </p>
        <Link
          href="/admin/studio"
          className="mt-5 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          Open Studio Packs
        </Link>
      </div>
    </div>
  )
}
