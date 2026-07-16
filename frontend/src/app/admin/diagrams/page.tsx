'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Search, Trash2, ChevronLeft, ChevronRight, RefreshCw, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { adminApi, type AdminDiagram } from '@/lib/admin-api'

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

export default function AdminDiagramsPage() {
  const [diagrams, setDiagrams]     = useState<AdminDiagram[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [q, setQ]                   = useState('')
  const [actionId, setActionId]     = useState<string | null>(null)
  const searchTimeout               = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (p = 1, query = q) => {
    setLoading(true)
    try {
      const data = await adminApi.diagrams.list({ page: p, limit: 20, q: query })
      setDiagrams(data.diagrams)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPage(p)
    } catch { toast.error('Failed to load diagrams') }
    finally { setLoading(false) }
  }, [q])

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(v: string) {
    setQ(v)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => load(1, v), 350)
  }

  async function handleDelete(d: AdminDiagram) {
    if (!confirm(`Delete diagram "${d.title}"?`)) return
    setActionId(d.id)
    try {
      await adminApi.diagrams.delete(d.id)
      toast.success('Diagram deleted')
      load(page, q)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setActionId(null) }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Diagrams</h1>
          <p className="mt-0.5 text-sm text-ink-faint">{total.toLocaleString()} total diagrams</p>
        </div>
        <button onClick={() => load(page, q)} className="flex items-center gap-2 rounded-md border border-hairline-strong px-3 py-2 text-sm text-ink-muted transition-all hover:bg-hairline">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
        <input
          value={q} onChange={e => handleSearch(e.target.value)}
          placeholder="Search by title…"
          className="h-9 w-full rounded-md border border-hairline-strong bg-paper pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : diagrams.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-ink-faint">No diagrams found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline bg-paper">
                  {['Title', 'Owner', 'Nodes', 'Edges', 'Created', 'Updated', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint first:pl-4 last:pr-4 last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {diagrams.map(d => (
                  <tr key={d.id} className="border-b border-hairline transition-colors last:border-0 hover:bg-paper/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {d.thumbnail ? (
                          <img src={d.thumbnail} alt={d.title} className="h-8 w-12 rounded border border-hairline object-cover" />
                        ) : (
                          <div className="flex h-8 w-12 items-center justify-center rounded border border-hairline bg-paper">
                            <Layers className="h-3.5 w-3.5 text-ink-faint" />
                          </div>
                        )}
                        <span className="max-w-[180px] truncate font-medium text-ink">{d.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate font-medium text-ink max-w-[140px]">{d.owner.name}</p>
                      <p className="truncate font-mono text-[10px] text-ink-faint max-w-[140px]">{d.owner.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-ink-muted">{d.nodeCount}</td>
                    <td className="px-4 py-3 font-mono text-sm text-ink-muted">{d.edgeCount}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-faint whitespace-nowrap">
                      {d.createdAt ? format(parseISO(d.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-faint whitespace-nowrap">
                      {d.updatedAt ? format(parseISO(d.updatedAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(d)}
                        disabled={actionId === d.id}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-red-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50 ml-auto"
                      >
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

      <Pagination page={page} totalPages={totalPages} onPage={p => load(p, q)} />
    </div>
  )
}
