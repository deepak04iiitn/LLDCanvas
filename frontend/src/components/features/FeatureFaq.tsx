'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'

export interface FaqItem { q: string; a: string }

export function FeatureFaq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="border-t border-hairline bg-paper">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(i => ({
          '@type': 'Question',
          name: i.q,
          acceptedAnswer: { '@type': 'Answer', text: i.a },
        })),
      }} />

      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:py-20">
        {/* Two-column layout: sticky label on left, accordion on right */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">

          {/* Left — section identity */}
          <div className="lg:pt-2">
            <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">FAQ</p>
            <h2 className="font-serif text-3xl font-medium leading-snug text-ink">
              Questions people ask
            </h2>
          </div>

          {/* Right — accordion */}
          <div className="divide-y divide-hairline">
            {items.map((item, i) => {
              const isOpen = open === i
              return (
                <div key={item.q}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-start gap-4 py-5 text-left"
                  >
                    {/* Index */}
                    <span className="mt-0.5 w-6 flex-shrink-0 font-mono text-[11px] font-bold text-ink-faint transition-colors group-hover:text-brand">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Question */}
                    <span className="flex-1 font-serif text-[17px] font-medium leading-snug text-ink transition-colors group-hover:text-brand">
                      {item.q}
                    </span>

                    {/* Toggle icon */}
                    <span className="mt-0.5 flex-shrink-0 rounded-full border border-hairline p-1 transition-colors group-hover:border-brand/40 group-hover:bg-brand-tint">
                      {isOpen
                        ? <Minus className="h-3.5 w-3.5 text-brand" />
                        : <Plus className="h-3.5 w-3.5 text-ink-faint transition-colors group-hover:text-brand" />
                      }
                    </span>
                  </button>

                  {/* Answer — visible when open */}
                  {isOpen && (
                    <div className="ml-10 pb-6">
                      <p className="text-sm leading-relaxed text-ink-muted">{item.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
