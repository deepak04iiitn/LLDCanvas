'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Search, Trash2, ChevronLeft, ChevronRight, RefreshCw, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { adminApi, type AdminSession } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

const STATUS_FILTERS = ['all', 'active', 'completed', 'abandoned'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

function StatusBadge({ status }: { status: AdminSession['status'] }) {
  const map = {
    completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700', Icon: CheckCircle2 },
    active:    { label: 'Active',    className: 'bg-brand-tint text-brand',       Icon: Clock },
    abandoned: { label: 'Abandoned', className: 'bg-amber-50 text-amber-700',     Icon: AlertCircle },
  }
  const { label, className, Icon } = map[status] ?? map.abandoned
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${className}`}>
      <Icon className="h-2.5 w-2.5" /> {label}
    </span>
  )
}

function fmtDuration(s: number | null) {
  if (s === null) return '∞'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-end gap-2 pt-4">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline-strong text-ink-muted transition-all hover:bg-hairline disabled:opacity-40">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="font-mono text-xs text-ink-faint">{page} / {totalPages}</span>
      <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline-strong text-ink-muted transition-all hover:bg-hairline disabled:opacity-40">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function AdminSessionsPage() {
  const [sessions, setSessions]     = useState<AdminSession[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [q, setQ]                   = useState('')
  const [status, setStatus]         = useState<StatusFilter>('all')
  const [actionId, setActionId]     = useState<string | null>(null)
  const searchTimeout               = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (p = 1, query = q, st = status) => {
    setLoading(true)
    try {
      const data = await adminApi.sessions.list({ page: p, limit: 20, q: query, status: st })
      setSessions(data.sessions)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPage(p)
    } catch { toast.error('Failed to load sessions') }
    finally { setLoading(false) }
  }, [q, status])

  useEffect(() => { load(1, q, status) }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(v: string) {
    setQ(v)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => load(1, v, status), 350)
  }

  async function handleDelete(s: AdminSession) {
    if (!confirm(`Delete session "${s.title}"?`)) return
    setActionId(s.id)
    try {
      await adminApi.sessions.delete(s.id)
      toast.success('Session deleted')
      load(page, q, status)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setActionId(null) }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Practice Sessions</h1>
          <p className="mt-0.5 text-sm text-ink-faint">{total.toLocaleString()} total sessions</p>
        </div>
        <button onClick={() => load(page, q, status)} className="flex items-center gap-2 rounded-md border border-hairline-strong px-3 py-2 text-sm text-ink-muted transition-all hover:bg-hairline">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={e => handleSearch(e.target.value)} placeholder="Search by title…"
            className="h-9 w-full rounded-md border border-hairline-strong bg-paper pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
        </div>
        <div className="flex gap-1 rounded-md border border-hairline-strong bg-paper p-0.5">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatus(f)}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium capitalize transition-all',
                status === f ? 'bg-brand text-brand-foreground shadow-sm' : 'text-ink-muted hover:text-ink',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-ink-faint">No sessions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline bg-paper">
                  {['Title', 'User', 'Status', 'Limit', 'Elapsed', 'Started', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-b border-hairline transition-colors last:border-0 hover:bg-paper/60">
                    <td className="px-4 py-3">
                      <p className="max-w-[180px] truncate font-medium text-ink">{s.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[140px] truncate font-medium text-ink">{s.user.name}</p>
                      <p className="max-w-[140px] truncate font-mono text-[10px] text-ink-faint">{s.user.email}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{fmtDuration(s.durationLimit)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{fmtDuration(s.timeElapsed)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-faint whitespace-nowrap">
                      {s.startedAt ? format(parseISO(s.startedAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(s)} disabled={actionId === s.id}
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-red-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={p => load(p, q, status)} />
    </div>
  )
}
