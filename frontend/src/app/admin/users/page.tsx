'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Search, Shield, Ban, Trash2, ChevronLeft, ChevronRight,
  ShieldCheck, RefreshCw, CalendarDays, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns'
import { adminApi, type AdminUser } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
const FILTERS = ['all', 'active', 'blocked', 'admin'] as const
type Filter = (typeof FILTERS)[number]

const DATE_PRESETS = [
  { label: 'Today',      from: () => format(startOfDay(new Date()), 'yyyy-MM-dd'), to: () => format(endOfDay(new Date()), 'yyyy-MM-dd') },
  { label: 'Last 7 d',   from: () => format(subDays(new Date(), 6), 'yyyy-MM-dd'),  to: () => format(new Date(), 'yyyy-MM-dd') },
  { label: 'Last 30 d',  from: () => format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: () => format(new Date(), 'yyyy-MM-dd') },
  { label: 'Last 90 d',  from: () => format(subDays(new Date(), 89), 'yyyy-MM-dd'), to: () => format(new Date(), 'yyyy-MM-dd') },
] as const

// ─── Small components ─────────────────────────────────────────────────────────
function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) return <img src={image} alt={name} className="h-8 w-8 rounded-full object-cover" />
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-tint font-mono text-sm font-bold text-brand">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function StatusBadge({ blocked, isAdmin }: { blocked: boolean; isAdmin: boolean }) {
  if (isAdmin) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[10px] font-bold text-brand">
      <ShieldCheck className="h-2.5 w-2.5" /> Admin
    </span>
  )
  if (blocked) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 font-mono text-[10px] font-bold text-red-600">
      <Ban className="h-2.5 w-2.5" /> Blocked
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600">
      Active
    </span>
  )
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers]           = useState<AdminUser[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [q, setQ]                   = useState('')
  const [filter, setFilter]         = useState<Filter>('all')
  const [from, setFrom]             = useState('')
  const [to, setTo]                 = useState('')
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [actionId, setActionId]     = useState<string | null>(null)
  const searchTimeout               = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (
    p     = 1,
    query = q,
    f     = filter,
    fromD = from,
    toD   = to,
  ) => {
    setLoading(true)
    try {
      const data = await adminApi.users.list({ page: p, limit: 20, q: query, filter: f, from: fromD, to: toD })
      setUsers(data.users)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPage(p)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [q, filter, from, to])

  // Re-fetch when status filter, date from/to changes
  useEffect(() => { load(1, q, filter, from, to) }, [filter, from, to]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(v: string) {
    setQ(v)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => load(1, v, filter, from, to), 350)
  }

  function applyPreset(preset: (typeof DATE_PRESETS)[number]) {
    const f = preset.from()
    const t = preset.to()
    setFrom(f); setTo(t); setActivePreset(preset.label)
  }

  function clearDates() {
    setFrom(''); setTo(''); setActivePreset(null)
  }

  const hasDateFilter = from || to

  async function handleBlock(user: AdminUser) {
    setActionId(user.id)
    try {
      const { blocked } = await adminApi.users.toggleBlock(user.id)
      toast.success(blocked ? `${user.name} blocked` : `${user.name} unblocked`)
      load(page, q, filter, from, to)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setActionId(null) }
  }

  async function handleDelete(user: AdminUser) {
    if (!confirm(`Permanently delete ${user.name} and all their data?`)) return
    setActionId(user.id)
    try {
      await adminApi.users.delete(user.id)
      toast.success(`${user.name} deleted`)
      load(page, q, filter, from, to)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setActionId(null) }
  }

  return (
    <div className="space-y-5 p-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Users</h1>
          <p className="mt-0.5 text-sm text-ink-faint">
            {total.toLocaleString()} user{total !== 1 ? 's' : ''}
            {hasDateFilter && ' in selected range'}
          </p>
        </div>
        <button
          onClick={() => load(page, q, filter, from, to)}
          className="flex items-center gap-2 rounded-md border border-hairline-strong px-3 py-2 text-sm text-ink-muted transition-all hover:bg-hairline"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Search + status filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={q} onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="h-9 w-full rounded-md border border-hairline-strong bg-paper pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
        </div>
        <div className="flex gap-1 rounded-md border border-hairline-strong bg-paper p-0.5">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium capitalize transition-all',
                filter === f ? 'bg-brand text-brand-foreground shadow-sm' : 'text-ink-muted hover:text-ink',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Date filter row */}
      <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <CalendarDays className="h-3.5 w-3.5 text-ink-faint" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
              Joined between
            </span>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {DATE_PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={cn(
                  'rounded-full border px-3 py-1 font-mono text-[11px] font-medium transition-all',
                  activePreset === preset.label
                    ? 'border-brand bg-brand text-brand-foreground'
                    : 'border-hairline-strong bg-paper text-ink-muted hover:border-brand/40 hover:text-ink',
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-hairline-strong" />

          {/* Custom date inputs */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={e => { setFrom(e.target.value); setActivePreset(null) }}
              className="h-8 rounded-md border border-hairline-strong bg-paper px-2 font-mono text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
            <span className="font-mono text-[10px] text-ink-faint">to</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={e => { setTo(e.target.value); setActivePreset(null) }}
              className="h-8 rounded-md border border-hairline-strong bg-paper px-2 font-mono text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>

          {/* Clear */}
          {hasDateFilter && (
            <button
              onClick={clearDates}
              className="flex items-center gap-1 rounded-full border border-hairline-strong px-2.5 py-1 font-mono text-[11px] text-ink-muted transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-ink-faint">
            <CalendarDays className="h-6 w-6 text-ink-faint/50" />
            No users found{hasDateFilter ? ' in this date range' : ''}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline bg-paper">
                  {['User', 'Status', 'Diagrams', 'Sessions', 'Joined', 'Actions'].map(h => (
                    <th key={h} className={cn(
                      'px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint',
                      ['Diagrams', 'Sessions', 'Actions'].includes(h) ? 'text-right' : 'text-left',
                    )}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-hairline transition-colors last:border-0 hover:bg-paper/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} image={user.image} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{user.name}</p>
                          <p className="truncate font-mono text-[10px] text-ink-faint">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge blocked={user.blocked} isAdmin={user.isAdmin} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-ink-muted">{user.diagramCount}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-ink-muted">{user.sessionCount}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-faint whitespace-nowrap">
                      {user.createdAt ? format(parseISO(user.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!user.isAdmin && (
                          <>
                            <button
                              onClick={() => handleBlock(user)}
                              disabled={actionId === user.id}
                              title={user.blocked ? 'Unblock' : 'Block'}
                              className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-md transition-all',
                                user.blocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50',
                                actionId === user.id && 'opacity-50',
                              )}
                            >
                              {user.blocked ? <Shield className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={actionId === user.id}
                              title="Delete user"
                              className="flex h-7 w-7 items-center justify-center rounded-md text-red-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={p => load(p, q, filter, from, to)} />
    </div>
  )
}
