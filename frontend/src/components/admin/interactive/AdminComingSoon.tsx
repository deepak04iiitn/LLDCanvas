'use client'

import { Construction } from 'lucide-react'

export function AdminComingSoon({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <div className="rounded-2xl border border-hairline bg-paper-elevated p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-tint text-brand">
          <Construction size={22} strokeWidth={1.75} />
        </div>
        <h1 className="font-serif text-2xl font-medium text-ink">{title}</h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          {description ?? 'CMS coming online — content CRUD will ship with this feature phase.'}
        </p>
      </div>
    </div>
  )
}
