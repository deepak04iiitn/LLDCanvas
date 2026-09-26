'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DiagramLike } from '@/lib/graph/analyzeDiagram'
import {
  allSimplePaths,
  analyzePath,
  buildDepWebModel,
  compareDependencyCounts,
  computeHighlight,
  findNodeByLabel,
  getBlastRadius,
  getExternalView,
  getHubs,
  getLayerView,
  getNodeStats,
  shortestPath,
  simulateChange,
  simulateRemoval,
  toMatrix,
  type DepWebFilters,
  type DepWebLens,
  type DepWebOverlay,
} from '@/lib/graph/dependencyWeb'
import { DependencyGraphCanvas } from './DependencyGraphCanvas'
import { NodeInspector } from './NodeInspector'
import { CompareStrip, DependencyMatrix } from './DependencyMatrix'

const LENSES: { id: DepWebLens; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'dependencies', label: 'Dependencies' },
  { id: 'dependents', label: 'Dependents' },
  { id: 'blast', label: 'Blast Radius' },
  { id: 'cycles', label: 'Cycles' },
  { id: 'layers', label: 'Layers' },
  { id: 'external', label: 'External' },
  { id: 'paths', label: 'Paths' },
  { id: 'hotspots', label: 'Hotspots' },
]

const REL_TYPES = [
  'dependency',
  'association',
  'aggregation',
  'composition',
  'inheritance',
  'realization',
]

export interface DependencyWebSessionProps {
  diagram: DiagramLike
  /** Optional second diagram for refactor compare */
  compareDiagram?: DiagramLike | null
  /** Evolution version edge counts for strip */
  evolutionCounts?: { label: string; edges: number }[]
  overlay?: DepWebOverlay
  initialFocusId?: string | null
  onOpenMicroscope?: (elementId: string) => void
  onFocusElement?: (elementId: string) => void
  className?: string
  /** Studio challenge: hide less chrome */
  guided?: boolean
  guideText?: string
}

export function DependencyWebSession({
  diagram,
  compareDiagram = null,
  evolutionCounts,
  overlay,
  initialFocusId = null,
  onOpenMicroscope,
  onFocusElement,
  className,
  guided,
  guideText,
}: DependencyWebSessionProps) {
  const [lens, setLens] = useState<DepWebLens>('overview')
  const [focusId, setFocusId] = useState<string | null>(initialFocusId)
  const [search, setSearch] = useState('')
  const [pathFrom, setPathFrom] = useState('')
  const [pathTo, setPathTo] = useState('')
  const [activePath, setActivePath] = useState<string[] | null>(null)
  const [allPaths, setAllPaths] = useState<string[][]>([])
  const [cycleIndex, setCycleIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'graph' | 'matrix'>('graph')
  const [showFilters, setShowFilters] = useState(false)
  const [simNote, setSimNote] = useState<string | null>(null)
  const [filters, setFilters] = useState<DepWebFilters>({
    relationshipTypes: [...REL_TYPES],
    direction: 'both',
  })

  useEffect(() => {
    if (initialFocusId) setFocusId(initialFocusId)
  }, [initialFocusId])

  const model = useMemo(
    () => buildDepWebModel(diagram, overlay, filters),
    [diagram, overlay, filters],
  )

  const compareModel = useMemo(
    () => (compareDiagram ? buildDepWebModel(compareDiagram, overlay) : null),
    [compareDiagram, overlay],
  )

  const compare = useMemo(() => {
    if (!compareModel) return null
    return compareDependencyCounts(model, compareModel, focusId ?? undefined)
  }, [model, compareModel, focusId])

  const highlight = useMemo(
    () =>
      computeHighlight(model, focusId, lens, {
        path: activePath ?? undefined,
        cycleIndex,
      }),
    [model, focusId, lens, activePath, cycleIndex],
  )

  const stats = focusId ? getNodeStats(model, focusId, overlay) : null
  const hubs = useMemo(() => getHubs(model), [model])
  const layers = useMemo(() => getLayerView(model), [model])
  const externals = useMemo(() => getExternalView(model), [model])
  const matrix = useMemo(() => toMatrix(model), [model])

  const budgetNote =
    stats && stats.outgoing + stats.indirectOut >= 5
      ? `Downstream leverage: ${stats.outgoing + stats.indirectOut} components — useful evidence when prioritizing an Architecture Budget spend.`
      : undefined

  const select = (id: string) => {
    setFocusId(id)
    onFocusElement?.(id)
    setSimNote(null)
  }

  const runPathSearch = () => {
    const from =
      findNodeByLabel(model, pathFrom)?.id ??
      model.nodes.find(n => n.id === pathFrom)?.id
    const to =
      findNodeByLabel(model, pathTo)?.id ?? model.nodes.find(n => n.id === pathTo)?.id
    if (!from || !to) {
      setActivePath(null)
      setAllPaths([])
      setSimNote('Could not resolve both endpoints — check names.')
      return
    }
    const short = shortestPath(model, from, to)
    const all = allSimplePaths(model, from, to)
    setActivePath(short)
    setAllPaths(all)
    setLens('paths')
    setFocusId(from)
    setSimNote(
      short
        ? `Shortest path: ${short.length - 1} hop(s). ${all.length} simple path(s) found.`
        : 'No dependency path found in the outgoing direction.',
    )
  }

  const pathAnalysis = activePath ? analyzePath(model, activePath) : null

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-paper', className)}>
      <div className="shrink-0 space-y-2 border-b border-hairline px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Dependency Web
          </p>
          <span className="font-mono text-[10px] text-ink-faint">
            {model.nodes.length}n · {model.links.length}e
            {model.cycles.length > 0 && (
              <span className="text-amber-700"> · {model.cycles.length} cycle(s)</span>
            )}
          </span>
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => setViewMode(v => (v === 'graph' ? 'matrix' : 'graph'))}
              className="rounded border border-hairline px-2 py-0.5 font-mono text-[10px] uppercase text-ink-muted"
            >
              {viewMode === 'graph' ? 'Matrix' : 'Graph'}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(s => !s)}
              className="rounded border border-hairline px-2 py-0.5 font-mono text-[10px] uppercase text-ink-muted"
            >
              Filters
            </button>
          </div>
        </div>

        {(guided || guideText) && (
          <p className="rounded-md bg-brand-tint/40 px-2 py-1.5 text-[12px] text-ink">
            {guideText ??
              'See → Select → Trace → Isolate → Simulate → Understand. Click a node, then use lenses.'}
          </p>
        )}

        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const hit = findNodeByLabel(model, search)
                if (hit) select(hit.id)
              }
            }}
            placeholder="Search component…"
            className="w-full rounded-md border border-hairline bg-paper py-1.5 pl-7 pr-2 text-[13px] outline-none focus:border-brand/40"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {LENSES.map(l => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLens(l.id)}
              className={cn(
                'rounded-md px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wide',
                lens === l.id
                  ? 'bg-brand-tint text-brand'
                  : 'text-ink-faint hover:bg-hairline/50',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-md border border-hairline p-2 text-[11px]">
            <div>
              <p className="font-mono text-[10px] uppercase text-ink-faint">Relationships</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {REL_TYPES.map(t => {
                  const on = filters.relationshipTypes?.includes(t)
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setFilters(f => {
                          const cur = new Set(f.relationshipTypes ?? [])
                          if (cur.has(t)) cur.delete(t)
                          else cur.add(t)
                          return { ...f, relationshipTypes: [...cur] }
                        })
                      }
                      className={cn(
                        'rounded px-1.5 py-0.5',
                        on ? 'bg-brand-tint text-brand' : 'bg-hairline/40 text-ink-muted',
                      )}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>
            <label className="flex items-center gap-1.5 text-ink-muted">
              <input
                type="checkbox"
                checked={Boolean(filters.externalOnly)}
                onChange={e =>
                  setFilters(f => ({ ...f, externalOnly: e.target.checked }))
                }
              />
              External only
            </label>
          </div>
        )}

        {lens === 'paths' && (
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-[11px] text-ink-muted">
              From
              <input
                value={pathFrom}
                onChange={e => setPathFrom(e.target.value)}
                className="mt-0.5 block w-32 rounded border border-hairline px-1.5 py-1 text-[12px]"
                placeholder="OrderService"
              />
            </label>
            <label className="text-[11px] text-ink-muted">
              To
              <input
                value={pathTo}
                onChange={e => setPathTo(e.target.value)}
                className="mt-0.5 block w-32 rounded border border-hairline px-1.5 py-1 text-[12px]"
                placeholder="Stripe"
              />
            </label>
            <button
              type="button"
              onClick={runPathSearch}
              className="rounded-md bg-brand px-2 py-1.5 text-[12px] font-semibold text-brand-foreground"
            >
              Trace path
            </button>
          </div>
        )}

        {compare && (
          <CompareStrip
            totalBefore={compare.totalBefore}
            totalAfter={compare.totalAfter}
            focus={
              compare.focus
                ? {
                    label: compare.focus.label,
                    beforeOut: compare.focus.beforeOut,
                    afterOut: compare.focus.afterOut,
                  }
                : null
            }
          />
        )}

        {evolutionCounts && evolutionCounts.length > 0 && (
          <div className="flex flex-wrap gap-2 font-mono text-[11px] text-ink-muted">
            <span className="uppercase text-ink-faint">Evolution</span>
            {evolutionCounts.map(v => (
              <span key={v.label}>
                {v.label}: {v.edges} deps
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[280px] flex-1 bg-[#F8F8F8]">
          {viewMode === 'graph' ? (
            <DependencyGraphCanvas
              model={model}
              focusId={focusId}
              highlightIds={highlight.highlightIds}
              dimIds={highlight.dimIds}
              hotspotMode={lens === 'hotspots'}
              onSelect={select}
              className="h-full"
            />
          ) : (
            <DependencyMatrix matrix={matrix} onSelect={select} className="h-full" />
          )}
          <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-paper/90 px-2 py-1 font-mono text-[10px] text-ink-faint">
            Drag to pan · Scroll to zoom · Click a node
          </p>
        </div>

        <aside className="max-h-[45vh] w-full shrink-0 overflow-y-auto border-t border-hairline p-3 lg:max-h-none lg:w-[320px] lg:border-l lg:border-t-0">
          {simNote && (
            <p className="mb-3 rounded-md border border-amber-200 bg-amber-50/50 px-2 py-1.5 text-[12px] text-amber-950">
              {simNote}
            </p>
          )}

          {stats ? (
            <NodeInspector
              stats={stats}
              onTraceDeps={() => {
                setLens('dependencies')
                setSimNote(null)
              }}
              onTraceDependents={() => {
                setLens('dependents')
                setSimNote(null)
              }}
              onBlast={() => {
                setLens('blast')
                const b = getBlastRadius(model, focusId!)
                setSimNote(
                  `Blast: ${b.direct.length} direct · ${b.indirect.length} indirect · ${b.affectedComponents} components`,
                )
              }}
              onSimulateRemoval={() => {
                setLens('blast')
                const s = simulateRemoval(model, focusId!, overlay)
                setSimNote(s.narrative)
              }}
              onSimulateChange={() => {
                setLens('blast')
                const s = simulateChange(model, focusId!, overlay)
                setSimNote(s.narrative)
              }}
              onFindPaths={() => {
                setLens('paths')
                setPathFrom(stats.node.label)
              }}
              onOpenMicroscope={
                onOpenMicroscope ? () => onOpenMicroscope(focusId!) : undefined
              }
              budgetNote={budgetNote}
            />
          ) : (
            <div className="space-y-2 text-[13px] text-ink-muted">
              <p className="font-serif text-lg text-ink">Select a node</p>
              <p>Click the graph to inspect incoming/outgoing deps, blast radius, and more.</p>
            </div>
          )}

          {lens === 'cycles' && (
            <div className="mt-4 space-y-2">
              <p className="font-mono text-[10px] uppercase text-ink-faint">Cycles</p>
              {(focusId
                ? model.cycles.filter(c => c.includes(focusId))
                : model.cycles
              ).map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setCycleIndex(i)
                    setSimNote(
                      `Trace: ${c.map(id => model.byId.get(id)?.label ?? id).join(' → ')} → ${model.byId.get(c[0])?.label ?? c[0]}`,
                    )
                  }}
                  className="block w-full rounded border border-amber-200 bg-amber-50/40 px-2 py-1.5 text-left font-mono text-[11px] text-amber-950"
                >
                  {c.map(id => model.byId.get(id)?.label ?? id).join(' → ')}
                </button>
              ))}
              {!model.cycles.length && (
                <p className="text-[12px] text-emerald-700">No directed cycles detected.</p>
              )}
            </div>
          )}

          {lens === 'hotspots' && (
            <div className="mt-4 space-y-2 text-[12px]">
              <p className="font-mono text-[10px] uppercase text-ink-faint">Hubs · high in</p>
              {hubs.highInDegree.slice(0, 5).map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => select(n.id)}
                  className="block w-full text-left text-ink hover:text-brand"
                >
                  {n.label} · ↓{n.inDegree}
                </button>
              ))}
              <p className="mt-2 font-mono text-[10px] uppercase text-ink-faint">
                Hubs · high out
              </p>
              {hubs.highOutDegree.slice(0, 5).map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => select(n.id)}
                  className="block w-full text-left text-ink hover:text-brand"
                >
                  {n.label} · ↑{n.outDegree}
                </button>
              ))}
            </div>
          )}

          {lens === 'layers' && (
            <div className="mt-4 space-y-2 text-[12px]">
              {(['presentation', 'application', 'domain', 'infrastructure'] as const).map(
                layer => (
                  <div key={layer}>
                    <p className="font-mono text-[10px] uppercase text-ink-faint">{layer}</p>
                    <p className="text-ink-muted">
                      {layers.byLayer[layer].map(n => n.label).join(', ') || '—'}
                    </p>
                  </div>
                ),
              )}
              {layers.violations.length > 0 && (
                <div className="rounded border border-amber-200 p-2">
                  <p className="font-mono text-[10px] uppercase text-amber-800">
                    Investigate crossings
                  </p>
                  {layers.violations.slice(0, 6).map((v, i) => (
                    <p key={i} className="text-[11px] text-amber-950">
                      {v.from} ({v.fromLayer}) → {v.to} ({v.toLayer})
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {lens === 'external' && (
            <div className="mt-4 space-y-2 text-[12px]">
              {externals.map(ext => (
                <button
                  key={ext.id}
                  type="button"
                  onClick={() => select(ext.id)}
                  className="block w-full rounded border border-hairline px-2 py-1.5 text-left"
                >
                  <span className="font-medium text-ink">{ext.label}</span>
                  <span className="mt-0.5 block text-[11px] text-ink-muted">
                    Used by: {ext.dependents.map(d => d.label).join(', ') || '—'}
                  </span>
                </button>
              ))}
              {!externals.length && (
                <p className="text-ink-muted">No external systems tagged yet.</p>
              )}
            </div>
          )}

          {lens === 'paths' && pathAnalysis && (
            <div className="mt-4 space-y-1 rounded border border-hairline p-2 text-[12px]">
              <p className="font-mono text-[10px] uppercase text-ink-faint">Path analysis</p>
              <p>{pathAnalysis.labels.join(' → ')}</p>
              <p className="text-ink-muted">
                Length {pathAnalysis.length} · Layers:{' '}
                {pathAnalysis.layersCrossed.join(' → ') || '—'} · External hops:{' '}
                {pathAnalysis.externalDependencies}
              </p>
              {allPaths.length > 1 && (
                <p className="text-ink-faint">{allPaths.length} paths total (capped)</p>
              )}
            </div>
          )}

          {lens === 'dependencies' && stats && (
            <ul className="mt-3 space-y-0.5 text-[12px]">
              {stats.transitiveDeps.slice(0, 12).map(d => (
                <li key={d.id}>
                  <button type="button" onClick={() => select(d.id)} className="text-ink hover:text-brand">
                    {d.label}
                    <span className="ml-1 font-mono text-[10px] text-ink-faint">d{d.depth}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {lens === 'dependents' && stats && (
            <ul className="mt-3 space-y-0.5 text-[12px]">
              {stats.transitiveDependents.slice(0, 12).map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => select(d.id)}
                  className="block text-ink hover:text-brand"
                >
                  {d.label}
                </button>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
