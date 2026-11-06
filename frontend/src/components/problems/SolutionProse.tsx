import type { ProseSection } from '@/content/problem-solutions/types'
import { cn } from '@/lib/utils'

export function Paragraphs({ items, className }: { items: string[]; className?: string }) {
  if (!items.length) return null
  return (
    <div className={cn('max-w-2xl space-y-5', className)}>
      {items.map((p, i) => (
        <p key={i} className="text-[15.5px] leading-[1.8] text-ink/85">
          {p}
        </p>
      ))}
    </div>
  )
}

export function PointList({
  items,
  numbered,
  className,
}: {
  items: string[]
  numbered?: boolean
  className?: string
}) {
  if (!items.length) return null
  return (
    <ul className={cn('max-w-2xl space-y-3.5', className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3.5 text-[15px] leading-[1.8] text-ink/80">
          <span
            className={cn(
              'mt-[0.35em] shrink-0 font-mono text-[11px] tabular-nums',
              numbered ? 'w-5 text-brand/70' : 'w-3 text-brand/50',
            )}
          >
            {numbered ? String(i + 1).padStart(2, '0') : '-'}
          </span>
          <span className="min-w-0 border-l border-brand/20 pl-3.5">{item}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Hybrid teaching block: keep paragraphs as paragraphs; show bullets/numbered
 * only when the author explicitly provided them (substantial points, not sentence crumbs).
 */
export function SolutionProse({
  section,
  className,
}: {
  section: ProseSection
  className?: string
}) {
  const paragraphs = (section.paragraphs ?? []).map(p => p.trim()).filter(Boolean)
  const bullets = section.bullets?.filter(Boolean) ?? []
  const numbered = section.numbered?.filter(Boolean) ?? []
  const table = section.table

  return (
    <div className={cn('mb-0', className)}>
      {section.heading && (
        <h3 className="mb-5 max-w-2xl font-serif text-[1.15rem] font-semibold leading-normal tracking-tight text-ink">
          {section.heading}
        </h3>
      )}
      <Paragraphs items={paragraphs} className="mb-1" />
      {numbered.length > 0 && <PointList items={numbered} numbered className="mt-6" />}
      {bullets.length > 0 && <PointList items={bullets} className="mt-6" />}
      {table && table.headers.length > 0 && table.rows.length > 0 && (
        <div className="mt-6 max-w-3xl overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13.5px] leading-[1.65]">
            <thead>
              <tr className="border-b border-brand/25">
                {table.headers.map(h => (
                  <th
                    key={h}
                    className="px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-ink/8 align-top">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2.5 text-ink/80">
                      {ci === 0 ? (
                        <code className="font-mono text-[12.5px] text-brand">{cell}</code>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {section.callout && (
        <aside className="mt-6 max-w-2xl border-l-2 border-brand/40 pl-4">
          {section.callout.title && (
            <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-brand">
              {section.callout.title}
            </p>
          )}
          <p className="text-[14.5px] leading-[1.8] text-ink-muted">{section.callout.body}</p>
        </aside>
      )}
    </div>
  )
}

export function SolutionProseList({ sections }: { sections: ProseSection[] }) {
  return (
    <div className="flex flex-col gap-12">
      {sections.map((s, i) => (
        <SolutionProse key={s.heading ?? i} section={s} className="mb-0" />
      ))}
    </div>
  )
}

export function EntityTable({
  entities,
}: {
  entities: { name: string; responsibility: string; keyMembers?: string[] }[]
}) {
  return (
    <div className="my-6 overflow-x-auto border-y border-hairline">
      <table className="w-full min-w-xl text-left text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <th className="py-3 pr-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              Class / type
            </th>
            <th className="py-3 pr-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              Responsibility
            </th>
            <th className="hidden py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint sm:table-cell">
              Key members
            </th>
          </tr>
        </thead>
        <tbody>
          {entities.map(e => (
            <tr
              key={e.name}
              className="align-top border-b border-hairline/70 transition-colors last:border-0 hover:bg-brand/3"
            >
              <td className="py-3.5 pr-4 font-mono text-[12px] font-medium text-brand">{e.name}</td>
              <td className="py-3.5 pr-4 text-[13.5px] leading-relaxed text-ink/75">{e.responsibility}</td>
              <td className="hidden py-3.5 font-mono text-[11px] leading-relaxed text-ink-faint sm:table-cell">
                {e.keyMembers?.length ? e.keyMembers.join(', ') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
