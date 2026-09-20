'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import {
  communityApi,
  type PublishedDesign,
  type CommunityDiagram,
} from '@/lib/community-api'
import { isFeatureEnabled } from '@/lib/features/flags'
import { cn } from '@/lib/utils'

export function DesignDetail() {
  const params = useParams()
  const router = useRouter()
  const slug = String(params.slug ?? '')
  const [design, setDesign] = useState<PublishedDesign | null>(null)
  const [diagram, setDiagram] = useState<CommunityDiagram | null>(null)
  const [events, setEvents] = useState<{ t: number; type: string }[]>([])
  const [forks, setForks] = useState<
    { diagramId: string; title: string; createdAt: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [forking, setForking] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [reason, setReason] = useState('')

  const watchOn = isFeatureEnabled('FF_COMMUNITY_WATCH')
  const forksOn = isFeatureEnabled('FF_COMMUNITY_FORKS')

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await communityApi.gallery.get(slug)
        if (cancelled) return
        setDesign(data.design)
        setDiagram(data.diagram)

        if (watchOn) {
          try {
            const w = await communityApi.watch.get(slug)
            if (!cancelled) setEvents(w.events ?? [])
          } catch {
            /* watch is optional stub */
          }
        }
        if (forksOn) {
          try {
            const f = await communityApi.forks.list(slug)
            if (!cancelled) setForks(f.forks ?? [])
          } catch {
            /* optional */
          }
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Design not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug, watchOn, forksOn])

  const fork = useCallback(async () => {
    setForking(true)
    try {
      const res = await communityApi.forks.create(slug)
      toast.success('Forked — opening your copy')
      router.push(`/editor/${res.diagramId}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Fork failed')
      setForking(false)
    }
  }, [router, slug])

  const report = useCallback(async () => {
    if (!reason.trim()) {
      toast.error('Add a short reason')
      return
    }
    setReporting(true)
    try {
      await communityApi.report.create({ slug, reason: reason.trim() })
      toast.success('Report submitted')
      setReason('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Report failed')
    } finally {
      setReporting(false)
    }
  }, [reason, slug])

  const nodeCount =
    diagram?.diagramData &&
    typeof diagram.diagramData === 'object' &&
    Array.isArray((diagram.diagramData as { nodes?: unknown[] }).nodes)
      ? (diagram.diagramData as { nodes: unknown[] }).nodes.length
      : null

  return (
    <CategoryShell
      title={design?.title ?? 'Community design'}
      subtitle={design?.summary || undefined}
      backHref="/community"
      backLabel="Community"
      actions={
        forksOn ? (
          <button
            type="button"
            disabled={forking || loading || !design}
            onClick={fork}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
          >
            {forking && <Loader2 className="h-3 w-3 animate-spin" />}
            Fork
          </button>
        ) : undefined
      }
    >
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : !design ? (
          <p className="text-center text-[14px] text-ink-muted">
            Design not found.
          </p>
        ) : (
          <>
            <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                Diagram
              </p>
              <p className="mt-1 text-[14px] text-ink">
                {diagram?.title ?? 'Untitled'}
                {nodeCount != null ? ` · ${nodeCount} nodes` : ''}
              </p>
              {design.summary && (
                <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
                  {design.summary}
                </p>
              )}
            </div>

            {watchOn && (
              <section>
                <h2 className="font-serif text-lg font-medium text-ink">
                  Watch replay
                </h2>
                <p className="mt-1 text-[13px] text-ink-muted">
                  {events.length === 0
                    ? 'No replay events linked yet (stub).'
                    : `${events.length} event(s) available.`}
                </p>
                {events.length > 0 && (
                  <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-hairline bg-paper-elevated p-3 font-mono text-[11px] text-ink-muted">
                    {events.slice(0, 40).map((ev, i) => (
                      <li key={`${ev.t}-${i}`}>
                        t={ev.t} · {ev.type}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {forksOn && (
              <section>
                <h2 className="font-serif text-lg font-medium text-ink">Forks</h2>
                {forks.length === 0 ? (
                  <p className="mt-1 text-[13px] text-ink-muted">
                    No forks yet — be the first.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {forks.map(f => (
                      <li
                        key={f.diagramId}
                        className="rounded-lg border border-hairline bg-paper-elevated px-3 py-2 text-[13px] text-ink"
                      >
                        {f.title}
                        <span className="ml-2 font-mono text-[10px] text-ink-faint">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            <section>
              <h2 className="font-serif text-lg font-medium text-ink">Report</h2>
              <p className="mt-1 text-[13px] text-ink-muted">
                Flag spam or inappropriate content for review.
              </p>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="Reason…"
                className={cn(
                  'mt-3 w-full rounded-lg border border-hairline bg-paper-elevated px-3 py-2 text-[13px] text-ink outline-none focus:border-brand/40',
                )}
              />
              <button
                type="button"
                disabled={reporting}
                onClick={report}
                className="mt-2 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-brand/30 hover:text-ink disabled:opacity-50"
              >
                {reporting ? 'Sending…' : 'Submit report'}
              </button>
            </section>
          </>
        )}
      </div>
    </CategoryShell>
  )
}
