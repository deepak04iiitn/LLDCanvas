'use client'

import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'

export default function AdminStudioToolsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <div className="rounded-2xl border border-hairline bg-paper-elevated p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-tint text-brand">
          <SlidersHorizontal size={22} strokeWidth={1.75} />
        </div>
        <h1 className="font-serif text-2xl font-medium text-ink">Studio Tools</h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          Microscope, Dependency Web, and Replay are editor tools — no dedicated CMS.
          Challenge content lives under Studio Packs.
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
