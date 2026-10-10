'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, X } from 'lucide-react'
import { journeyApi, type RevisePackResponse } from '@/lib/plannr-api'
import { SpacedRepetitionWidget } from '@/components/plannr/hub/SpacedRepetitionWidget'
import { cn } from '@/lib/utils'

export default function PlannrRevisePage() {
  const [pack, setPack] = useState<RevisePackResponse | null>(null)
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function load() {
    return journeyApi.getRevisePack().then(setPack)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function removeBookmark(slug: string) {
    setPack(p =>
      p
        ? {
            ...p,
            bookmarkedTopics: (p.bookmarkedTopics ?? []).filter(t => t.slug !== slug),
          }
        : p,
    )
    try {
      await journeyApi.toggleRevisionBookmark(slug)
    } catch {
      await load()
    }
  }

  const focusSkills = pack?.focusSkills ?? []
  const primary = pack?.weakSkill
  const trackLabel = pack?.track?.label
  const bookmarks = pack?.bookmarkedTopics ?? []

  return (
    <div className="w-full space-y-10 px-6 py-10 lg:px-8">
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Plannr · Revise{trackLabel ? ` · ${trackLabel}` : ''}
        </p>
        <h1 className="font-serif text-[32px] font-medium tracking-tight text-ink">
          Cheat sheets & review
        </h1>
        <p className="mt-1 max-w-xl text-[13px] text-ink-muted">
          Save topics while learning with <span className="font-medium text-ink">Mark for revise</span>,
          then come back here anytime. Skill focus uses the same evidence as Skills.
        </p>
      </div>

      <SpacedRepetitionWidget />

      {/* User bookmarks */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Bookmark size={14} className="text-brand" />
          <h2 className="font-serif text-[20px] text-ink">Saved for revision</h2>
          {bookmarks.length > 0 && (
            <span className="font-mono text-[11px] text-ink-faint">{bookmarks.length}</span>
          )}
        </div>
        {bookmarks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-hairline bg-paper-elevated/50 px-4 py-5 text-[13px] text-ink-muted">
            Nothing saved yet. Open any topic and tap <span className="font-medium text-ink">Mark for revise</span> —
            it will show up here so you can revisit whenever you want.
          </p>
        ) : (
          <ul className="space-y-2">
            {bookmarks.map(t => (
              <li
                key={t.slug}
                className="flex items-center gap-3 rounded-xl border border-hairline bg-paper-elevated px-4 py-3"
              >
                <Bookmark size={14} className="shrink-0 fill-brand text-brand" />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/plannr/topic/${t.slug}`}
                    className="text-[14px] font-medium text-ink hover:text-brand"
                  >
                    {t.title}
                  </Link>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                    Stage {t.stage}
                    {t.completed ? ' · done' : ' · in progress'}
                    {' · '}~{t.estimatedMinutes}m
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeBookmark(t.slug)}
                  className="rounded-lg p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                  aria-label="Remove bookmark"
                  title="Remove from saved"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Track focus — evidence-aware */}
      {(focusSkills.length > 0 || primary) && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">
                Focus for this track
              </p>
              {pack?.howToImprove && (
                <p className="mt-1 text-[13px] text-ink-muted">{pack.howToImprove}</p>
              )}
            </div>
            <Link
              href="/dashboard/plannr/skills"
              className="shrink-0 text-[12px] font-medium text-brand hover:underline"
            >
              Skills →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(focusSkills.length > 0
              ? focusSkills
              : primary
                ? [
                    {
                      key: primary.key,
                      label: primary.label,
                      score: primary.value,
                      assessed: primary.assessed === true,
                    },
                  ]
                : []
            ).map((s, i) => (
              <div
                key={s.key}
                className={cn(
                  'rounded-2xl border bg-paper-elevated p-4',
                  i === 0 ? 'border-brand/30' : 'border-hairline',
                )}
              >
                <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">
                  {i === 0 ? (s.assessed ? 'Lowest scored' : 'Not assessed yet') : 'Also on track'}
                </p>
                <p className="mt-1 font-serif text-[18px] font-medium text-ink">{s.label}</p>
                {s.assessed ? (
                  <p className="mt-1 text-[13px] text-ink-muted">
                    Score{' '}
                    <span
                      className={cn(
                        'font-mono font-medium',
                        s.score >= 70
                          ? 'text-green-600'
                          : s.score >= 40
                            ? 'text-amber-600'
                            : 'text-red-600',
                      )}
                    >
                      {s.score}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-[13px] text-ink-faint">
                    No evidence yet — learn or practice to start scoring.
                  </p>
                )}
                {'recentReasons' in s &&
                  Array.isArray(s.recentReasons) &&
                  s.recentReasons.length > 0 && (
                    <p className="mt-2 text-[10px] leading-snug text-ink-faint">
                      {s.recentReasons[0]}
                    </p>
                  )}
              </div>
            ))}
          </div>

          {(pack?.weakTopics?.length ?? 0) > 0 && primary && (
            <div className="rounded-2xl border border-hairline bg-paper p-5">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-ink-faint">
                Related to {primary.label}
              </p>
              <ul className="space-y-2">
                {pack!.weakTopics.map(t => (
                  <li key={t.slug} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/dashboard/plannr/topic/${t.slug}`}
                      className="text-[13px] font-medium text-brand hover:underline"
                    >
                      {t.title}
                    </Link>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                      {t.kind === 'revise' ? 'Revisit' : 'Learn'} · ~{t.estimatedMinutes}m
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-serif text-[20px] text-ink">Topic packs</h2>
          <p className="text-[12px] text-ink-muted">
            Primary packs match your track first. Optional ones stay available but are deprioritized.
          </p>
          {(pack?.sheets ?? []).map(sheet => (
            <div
              key={sheet.slug}
              className={cn(
                'overflow-hidden rounded-xl border bg-paper-elevated',
                sheet.trackPriority === 'optional' ? 'border-hairline/70 opacity-90' : 'border-hairline',
              )}
            >
              <button
                type="button"
                onClick={() => setOpenSlug(s => (s === sheet.slug ? null : sheet.slug))}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">
                    Stage {sheet.stage}
                    {sheet.completed ? ' · done' : ''}
                    {sheet.trackPriority === 'optional' ? ' · optional' : ''}
                  </p>
                  <p className="text-[14px] font-medium text-ink">{sheet.title}</p>
                </div>
                <span className="text-[12px] text-ink-faint">
                  {openSlug === sheet.slug ? 'Hide' : 'Open'}
                </span>
              </button>
              {openSlug === sheet.slug && (
                <div className="space-y-4 border-t border-hairline px-4 py-4">
                  {sheet.cheatSheet.map((card, i) => (
                    <div key={i}>
                      <p className="mb-1 text-[13px] font-medium text-ink">{card.title}</p>
                      <ul className="space-y-1">
                        {card.bullets.map((b, j) => (
                          <li key={j} className="flex gap-2 text-[12px] text-ink-muted">
                            <span className="text-brand">•</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {sheet.takeaways?.length > 0 && (
                    <div>
                      <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-ink-faint">
                        Takeaways
                      </p>
                      {sheet.takeaways.map((t, i) => (
                        <p key={i} className="text-[12px] text-ink-muted">
                          {t}
                        </p>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/dashboard/plannr/topic/${sheet.slug}`}
                    className="inline-block text-[12px] font-medium text-brand"
                  >
                    Open module →
                  </Link>
                </div>
              )}
            </div>
          ))}
          {(pack?.sheets?.length ?? 0) === 0 && (
            <p className="rounded-xl border border-hairline bg-paper-elevated px-4 py-6 text-center text-[13px] text-ink-muted">
              No cheat sheets yet — complete a topic to unlock its pack here.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
