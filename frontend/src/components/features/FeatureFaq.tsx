import { JsonLd } from '@/components/seo/JsonLd'

export interface FaqItem { q: string; a: string }

export function FeatureFaq({ items }: { items: FaqItem[] }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14 sm:px-8">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(i => ({
          '@type': 'Question',
          name: i.q,
          acceptedAnswer: { '@type': 'Answer', text: i.a },
        })),
      }} />
      <h2 className="mb-6 font-serif text-2xl font-medium text-ink">Frequently asked questions</h2>
      <div className="divide-y divide-hairline rounded-xl border border-hairline bg-paper-elevated">
        {items.map(item => (
          <div key={item.q} className="px-5 py-4">
            <p className="text-sm font-semibold text-ink">{item.q}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
