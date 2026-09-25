'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  getAbstractionLens,
  getBlastRadius,
  getCreationLens,
  getCycleLens,
  getDependencyLens,
  getEncapsulationLens,
  getFlowLens,
  getLayerLens,
  getOverview,
  getRelationshipInspector,
  getResponsibilityLens,
  getSystemClusters,
  getXRayTree,
  type MicroscopeContext,
  type MicroscopeLens,
  type MicroscopeZoomLevel,
} from '@/lib/graph/microscope'
import type { AnalyzeEdge } from '@/lib/graph/analyzeDiagram'
import { OverviewCard, WhatIfPanel } from './OverviewCard'
import { CohesionBars } from './CohesionBars'

function ExpandList({
  title,
  items,
  onPick,
}: {
  title: string
  items: { id: string; name: string; meta?: string }[]
  onPick?: (id: string) => void
}) {
  if (!items.length) {
    return (
      <div>
        <p className="font-mono text-[10px] uppercase text-ink-faint">{title}</p>
        <p className="mt-1 text-[12px] text-ink-muted">None</p>
      </div>
    )
  }
  return (
    <div>
      <p className="font-mono text-[10px] uppercase text-ink-faint">
        {title} ({items.length})
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.map(it => (
          <li key={it.id}>
            <button
              type="button"
              onClick={() => onPick?.(it.id)}
              className="w-full rounded px-1.5 py-0.5 text-left text-[12px] text-ink hover:bg-hairline/40"
            >
              {it.name}
              {it.meta && (
                <span className="ml-1 font-mono text-[10px] text-ink-faint">{it.meta}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MicroscopeLensBody({
  ctx,
  focusId,
  lens,
  zoom,
  selectedEdge,
  flowId,
  onPickElement,
  onPickFlow,
  onSelectMethod,
  className,
}: {
  ctx: MicroscopeContext
  focusId: string | null
  lens: MicroscopeLens
  zoom: MicroscopeZoomLevel
  selectedEdge?: AnalyzeEdge | null
  flowId?: string | null
  onPickElement?: (elementId: string) => void
  onPickFlow?: (flowId: string) => void
  onSelectMethod?: (methodName: string) => void
  className?: string
}) {
  if (zoom === 'system') {
    const sys = getSystemClusters(ctx)
    return (
      <div className={cn('space-y-4', className)}>
        <p className="text-[13px] text-ink-muted">System clusters by layer and stereotype.</p>
        {LAYER_ORDER_UI.map(layer => (
          <div key={layer}>
            <p className="font-mono text-[10px] uppercase text-ink-faint">{layer}</p>
            <p className="text-[12px] text-ink">
              {sys.layers[layer].map(n => n.name).join(', ') || '—'}
            </p>
          </div>
        ))}
      </div>
    )
  }

  if (zoom === 'relationship' && selectedEdge) {
    const rel = getRelationshipInspector(ctx, selectedEdge)
    if (!rel) return <p className="text-[13px] text-ink-muted">Select a relationship.</p>
    return (
      <div className={cn('space-y-2 text-[13px]', className)}>
        <h3 className="font-serif text-lg text-ink">Relationship</h3>
        <p>
          <span className="font-mono text-[10px] text-ink-faint">Type</span> {rel.type}
        </p>
        <p>
          <span className="font-mono text-[10px] text-ink-faint">Direction</span> {rel.direction}
        </p>
        <p>
          <span className="font-mono text-[10px] text-ink-faint">Abstraction</span>{' '}
          {rel.abstraction}
        </p>
        {rel.implementations.length > 0 && (
          <ExpandList
            title="Implementations"
            items={rel.implementations}
            onPick={onPickElement}
          />
        )}
        <ExpandList title="Consumers" items={rel.consumers} onPick={onPickElement} />
      </div>
    )
  }

  if (!focusId) {
    return (
      <div className={cn('space-y-3 py-6', className)}>
        <p className="font-serif text-lg text-ink">Nothing selected yet</p>
        <ol className="list-decimal space-y-2 pl-4 text-[13px] text-ink-muted">
          <li>Click a class on the diagram (left), or use a Jump to chip.</li>
          <li>Pick a lens above (Dependencies is a good start).</li>
          <li>Click names in the lists to follow the trail — unrelated boxes fade.</li>
        </ol>
      </div>
    )
  }

  if (lens === 'overview') {
    const o = getOverview(ctx, focusId)
    if (!o) return null
    return (
      <OverviewCard
        className={className}
        name={o.name}
        nodeType={o.nodeType}
        responsibilities={o.responsibilities}
        dependencies={o.dependencies}
        dependents={o.dependents}
        indirectDependencies={o.indirectDependencies}
        outgoingRelationships={o.outgoingRelationships}
        onExpandDeps={() => onPickElement?.(focusId)}
      />
    )
  }

  if (lens === 'dependencies') {
    const d = getDependencyLens(ctx, focusId)
    return (
      <div className={cn('space-y-4', className)}>
        <p className="font-mono text-[11px] text-ink-faint">
          Dependency depth: {d.dependencyDepth}
        </p>
        {d.sampleChain && (
          <p className="rounded border border-hairline px-2 py-1.5 font-mono text-[11px] text-ink-muted">
            {d.sampleChain.labels.join(' → ')}
          </p>
        )}
        <ExpandList title="Direct dependencies" items={d.direct} onPick={onPickElement} />
        <ExpandList title="Dependents" items={d.dependents} onPick={onPickElement} />
        <ExpandList
          title="Indirect"
          items={d.indirect.map(i => ({ id: i.id, name: i.name, meta: `d${i.depth}` }))}
          onPick={onPickElement}
        />
      </div>
    )
  }

  if (lens === 'blast') {
    const b = getBlastRadius(ctx, focusId)
    const name = ctx.analysis.byElementId[focusId]?.name ?? focusId
    return (
      <div className={cn('space-y-4', className)}>
        <WhatIfPanel
          focusName={name}
          directCount={b.direct.length}
          indirectCount={b.indirect.length}
          affectedComponents={b.affectedComponentCount}
          affectedFlows={b.affectedFlows.map(f => f.label)}
        />
        <ExpandList title="Direct impact" items={b.direct} onPick={onPickElement} />
        <ExpandList title="Indirect impact" items={b.indirect} onPick={onPickElement} />
      </div>
    )
  }

  if (lens === 'responsibilities') {
    const r = getResponsibilityLens(ctx, focusId)
    return (
      <div className={cn('space-y-4', className)}>
        <CohesionBars cohesion={r.cohesion} />
        <div>
          <p className="font-mono text-[10px] uppercase text-ink-faint">By domain</p>
          <ul className="mt-1 space-y-1 text-[12px]">
            {r.domains.map(d => (
              <li key={d.domain} className="flex justify-between">
                <span className="capitalize text-ink">{d.domain}</span>
                <span className="font-mono text-ink-faint">{d.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <ul className="space-y-1">
          {r.items.map(it => (
            <li key={it.name}>
              <button
                type="button"
                onClick={() => onSelectMethod?.(it.name)}
                className="w-full rounded border border-hairline px-2 py-1.5 text-left text-[12px] hover:border-brand/40"
              >
                <span className="font-mono text-ink">{it.name}()</span>
                <span className="ml-2 font-mono text-[10px] text-ink-faint">{it.domain}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-ink-muted">
          Evidence only — decide if responsibilities belong together. Try{' '}
          <Link href="/design-studio/refactor" className="text-brand hover:underline">
            Refactoring Mode
          </Link>
          .
        </p>
      </div>
    )
  }

  if (lens === 'flows') {
    const f = getFlowLens(ctx, focusId, flowId ?? undefined)
    return (
      <div className={cn('space-y-3', className)}>
        {f.flows.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {f.flows.map(fl => (
              <button
                key={fl.id}
                type="button"
                onClick={() => onPickFlow?.(fl.id)}
                className={cn(
                  'rounded-md px-2 py-1 font-mono text-[10px] uppercase',
                  f.selected?.id === fl.id ? 'bg-brand-tint text-brand' : 'bg-hairline/50 text-ink-muted',
                )}
              >
                {fl.label}
              </button>
            ))}
          </div>
        )}
        {f.heuristic && (
          <p className="text-[11px] text-ink-faint">Heuristic path — author flows for fidelity.</p>
        )}
        <ol className="space-y-1 border-l border-hairline pl-3">
          {f.steps.map((s, i) => (
            <li key={`${s.id}-${i}`}>
              <button
                type="button"
                onClick={() => onPickElement?.(s.id)}
                className="text-left text-[13px] text-ink hover:text-brand"
              >
                {s.name}
                {s.note && (
                  <span className="ml-1 text-[11px] text-ink-faint">— {s.note}</span>
                )}
              </button>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  if (lens === 'abstractions' || lens === 'consumers') {
    const a = getAbstractionLens(ctx, focusId)
    return (
      <div className={cn('space-y-4', className)}>
        <p className="text-[12px] text-ink-muted">
          Focus type: <span className="font-mono text-ink">{a.focusType}</span>
        </p>
        {a.interfacesUsed.map(iface => (
          <div key={iface.id} className="rounded border border-hairline p-2">
            <button
              type="button"
              className="font-medium text-ink"
              onClick={() => onPickElement?.(iface.id)}
            >
              {iface.name}
            </button>
            <p className="mt-1 font-mono text-[10px] text-ink-faint">Implementations</p>
            <ExpandList title="" items={iface.impls} onPick={onPickElement} />
          </div>
        ))}
        {a.realizations.length > 0 && (
          <ExpandList title="Realizations of this interface" items={a.realizations} onPick={onPickElement} />
        )}
        <ExpandList title="Concrete deps" items={a.concreteDeps} onPick={onPickElement} />
        <ExpandList title="Consumers" items={a.consumers} onPick={onPickElement} />
      </div>
    )
  }

  if (lens === 'cycles') {
    const c = getCycleLens(ctx, focusId)
    return (
      <div className={cn('space-y-3', className)}>
        <p className="text-[12px] text-ink-muted">
          {c.cycles.length} cycle(s) involving focus · {c.allCount} total
        </p>
        {c.cycles.map((cy, i) => (
          <button
            key={i}
            type="button"
            className="block w-full rounded border border-amber-200 bg-amber-50/50 px-2 py-2 text-left font-mono text-[11px] text-amber-950"
            onClick={() => cy.ids[0] && onPickElement?.(cy.ids[0])}
          >
            Trace: {cy.labels.join(' → ')} → {cy.labels[0]}
          </button>
        ))}
        {!c.cycles.length && (
          <p className="text-[13px] text-emerald-700">No directed cycles through this component.</p>
        )}
      </div>
    )
  }

  if (lens === 'layers') {
    const L = getLayerLens(ctx, focusId)
    return (
      <div className={cn('space-y-3', className)}>
        {L.focusLayer && (
          <p className="text-[12px] text-ink">
            Focus layer: <span className="font-mono text-brand">{L.focusLayer}</span>
          </p>
        )}
        {LAYER_ORDER_UI.map(layer => (
          <div key={layer}>
            <p className="font-mono text-[10px] uppercase text-ink-faint">{layer}</p>
            <p className="text-[12px] text-ink-muted">
              {L.byLayer[layer].map(n => n.name).join(', ') || '—'}
            </p>
          </div>
        ))}
        {L.illegal.length > 0 && (
          <div className="rounded border border-amber-200 p-2">
            <p className="font-mono text-[10px] uppercase text-amber-800">Investigate deps</p>
            <ul className="mt-1 text-[12px] text-amber-950">
              {L.illegal.map((x, i) => (
                <li key={i}>
                  {x.from} ({x.fromLayer}) → {x.to} ({x.toLayer})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  if (lens === 'encapsulation') {
    const e = getEncapsulationLens(ctx, focusId)
    return (
      <div className={cn('space-y-3', className)}>
        <p className="text-[12px] text-ink-muted">
          External accessors: {e.externalAccessors} · Internal ops: {e.internalOps}
        </p>
        <div>
          <p className="font-mono text-[10px] uppercase text-ink-faint">Public API</p>
          <ul className="mt-1 font-mono text-[11px] text-ink">
            {e.publicApi.map(m => (
              <li key={m}>+ {m}()</li>
            ))}
            {!e.publicApi.length && <li className="text-ink-faint">—</li>}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase text-ink-faint">Internal</p>
          <ul className="mt-1 font-mono text-[11px] text-ink-muted">
            {e.internal.map(m => (
              <li key={m}>- {m}()</li>
            ))}
            {!e.internal.length && <li className="text-ink-faint">No private/protected marked</li>}
          </ul>
        </div>
      </div>
    )
  }

  if (lens === 'creation') {
    const c = getCreationLens(ctx, focusId)
    return (
      <div className={cn('space-y-4', className)}>
        <ExpandList title="Creates" items={c.creates} onPick={onPickElement} />
        <ExpandList title="Created by" items={c.createdBy} onPick={onPickElement} />
        <ExpandList
          title="Uses (dependency)"
          items={c.uses.map(u => ({ id: u.id, name: u.name, meta: u.type }))}
          onPick={onPickElement}
        />
        <p className="text-[11px] text-ink-muted">
          Distinguish who uses an object from who creates it.
        </p>
      </div>
    )
  }

  if (lens === 'xray') {
    return (
      <div className={cn('space-y-4', className)}>
        {(['dependency', 'responsibility', 'flow'] as const).map(mode => {
          const tree = getXRayTree(ctx, focusId, mode)
          return (
            <div key={mode} className="rounded border border-hairline p-2">
              <p className="font-mono text-[10px] uppercase text-ink-faint">X-Ray · {mode}</p>
              <p className="mt-1 font-medium text-ink">{tree.rootName}</p>
              <ul className="mt-1 space-y-0.5 pl-3 text-[12px] text-ink-muted">
                {tree.children.map(ch => (
                  <li key={ch.id}>
                    <button type="button" onClick={() => onPickElement?.(ch.id)}>
                      ├── {ch.name}
                    </button>
                    {ch.children?.length > 0 && (
                      <ul className="pl-3">
                        {ch.children.map(g => (
                          <li key={g.id}>└── {g.name}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    )
  }

  return null
}

const LAYER_ORDER_UI = [
  'presentation',
  'application',
  'domain',
  'infrastructure',
] as const
