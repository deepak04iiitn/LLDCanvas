'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Globe2, Search, Star, EyeOff, Eye, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { adminApi, type AdminPublishedDesign, type GalleryModerateAction } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-hairline ${className}`} />
}

function designId(d: AdminPublishedDesign) {
  return String(d._id)
}

const VIS_COLORS = {
  public:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  unlisted: 'bg-amber-50 text-amber-700 border-amber-200',
  private:  'bg-hairline text-ink-muted border-hairline',
}

export default function AdminCommunityGalleryPage() {
  const [designs, setDesigns] = useState<AdminPublishedDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [draftQ, setDraftQ] = useState('')
  const [q, setQ] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return designs
    return designs.filter(d =>
      d.title.toLowerCase().includes(needle) ||
      d.slug.toLowerCase().includes(needle) ||
      (d.summary ?? '').toLowerCase().includes(needle),
    )
  }, [designs, q])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.community.listGallery()
      setDesigns(data.designs ?? [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function moderate(d: AdminPublishedDesign, action: GalleryModerateAction) {
    const id = designId(d)
    setBusyId(id)
    try {
      const updated = await adminApi.community.moderate(id, action)
      setDesigns(prev => prev.map(x => designId(x) === id ? { ...x, ...updated } : x))
      const labels: Record<GalleryModerateAction, string> = {
        feature: 'Featured',
        unfeature: 'Unfeatured',
        unpublish: 'Unpublished',
        publish: 'Published',
      }
      toast.success(labels[action])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Moderation failed')
    } finally {
      setBusyId(null)
    }
  }

  const featured = designs.filter(d => d.featured).length
  const publicCount = designs.filter(d => d.visibility === 'public').length

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Community Gallery</h1>
          <p className="mt-0.5 text-sm text-ink-faint">Feature, unfeature, or unpublish community designs</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-2 text-center">
            <p className="text-lg font-bold text-brand">{designs.length}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint">Total</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
            <p className="text-lg font-bold text-emerald-600">{publicCount}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-600">Public</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-center">
            <p className="text-lg font-bold text-amber-700">{featured}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700">Featured</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search designs…"
            value={draftQ}
            onChange={e => setDraftQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setQ(draftQ)}
            className="w-full rounded-lg border border-hairline bg-paper-elevated py-2 pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
        </div>
        <button
          onClick={() => setQ(draftQ)}
          className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90 sm:w-auto"
        >
          Search
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-hairline bg-hairline/40">
                {['Design', 'Visibility', 'Featured', 'Updated', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-hairline">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(d => {
                const id = designId(d)
                const busy = busyId === id
                return (
                  <tr key={id} className="border-b border-hairline transition hover:bg-hairline/30">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        {d.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={d.thumbnail} alt="" className="h-10 w-14 rounded-md border border-hairline object-cover" />
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded-md border border-hairline bg-hairline/40">
                            <Globe2 className="h-4 w-4 text-ink-faint" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-ink">{d.title}</p>
                          <p className="font-mono text-[10px] text-ink-faint">{d.slug}</p>
                          {d.summary && (
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-muted">{d.summary}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', VIS_COLORS[d.visibility])}>
                        {d.visibility}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {d.featured ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-ink-faint">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-faint">
                      {d.updatedAt ? format(parseISO(d.updatedAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          disabled={busy}
                          onClick={() => moderate(d, d.featured ? 'unfeature' : 'feature')}
                          className="inline-flex items-center gap-1 rounded-lg border border-hairline px-2.5 py-1 text-[11px] font-medium text-ink-muted transition hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                        >
                          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Star className="h-3 w-3" />}
                          {d.featured ? 'Unfeature' : 'Feature'}
                        </button>
                        {d.visibility === 'public' ? (
                          <button
                            disabled={busy}
                            onClick={() => moderate(d, 'unpublish')}
                            className="inline-flex items-center gap-1 rounded-lg border border-hairline px-2.5 py-1 text-[11px] font-medium text-ink-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <EyeOff className="h-3 w-3" /> Unpublish
                          </button>
                        ) : (
                          <button
                            disabled={busy}
                            onClick={() => moderate(d, 'publish')}
                            className="inline-flex items-center gap-1 rounded-lg border border-hairline px-2.5 py-1 text-[11px] font-medium text-ink-muted transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                          >
                            <Eye className="h-3 w-3" /> Publish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Globe2 className="h-8 w-8 text-ink-faint opacity-40" />
            <p className="text-sm text-ink-faint">No published designs yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
