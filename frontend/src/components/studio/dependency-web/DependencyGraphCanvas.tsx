'use client'

import { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeMouseHandler,
  MarkerType,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { cn } from '@/lib/utils'
import type { DepWebModel } from '@/lib/graph/dependencyWeb'

function DepNode({ data }: { data: Record<string, unknown> }) {
  const label = String(data.label ?? '')
  const meta = String(data.meta ?? '')
  const hotspot = Boolean(data.hotspot)
  const hub = Boolean(data.hub)
  const cycle = Boolean(data.cycle)
  return (
    <div
      className={cn(
        'min-w-[120px] rounded-lg border bg-white px-3 py-2 shadow-sm',
        cycle
          ? 'border-amber-400'
          : hub || hotspot
            ? 'border-brand'
            : 'border-hairline',
      )}
    >
      <p className="font-mono text-[12px] font-semibold text-ink">{label}</p>
      <p className="font-mono text-[10px] text-ink-faint">{meta}</p>
    </div>
  )
}

const nodeTypes = { dep: DepNode }

function CanvasInner({
  model,
  focusId,
  highlightIds,
  dimIds,
  hotspotMode,
  onSelect,
  className,
}: {
  model: DepWebModel
  focusId: string | null
  highlightIds: string[]
  dimIds: string[]
  hotspotMode?: boolean
  onSelect: (id: string) => void
  className?: string
}) {
  const hi = useMemo(() => new Set(highlightIds), [highlightIds])
  const dim = useMemo(() => new Set(dimIds), [dimIds])
  const maxHot = Math.max(1, ...model.nodes.map(n => n.hotspotScore))

  const initialNodes: Node[] = useMemo(
    () =>
      model.nodes.map(n => {
        const highlighted = hi.size === 0 || hi.has(n.id)
        const faded = dim.has(n.id) && hi.size > 0
        const scale = hotspotMode ? 0.85 + (n.hotspotScore / maxHot) * 0.5 : 1
        return {
          id: n.id,
          type: 'dep',
          position: { x: n.x, y: n.y },
          data: {
            label: n.label,
            meta: `${n.nodeType} · ↓${n.inDegree} ↑${n.outDegree}`,
            hotspot: hotspotMode && n.hotspotScore >= maxHot * 0.55,
            hub: n.isHub,
            cycle: n.inCycle,
          },
          selected: focusId === n.id,
          style: {
            opacity: faded ? 0.22 : highlighted ? 1 : 0.35,
            transform: `scale(${scale})`,
          },
        }
      }),
    [model.nodes, hi, dim, focusId, hotspotMode, maxHot],
  )

  const initialEdges: Edge[] = useMemo(
    () =>
      model.links.map(l => {
        const keep =
          hi.size === 0 || hi.has(l.source) || hi.has(l.target)
        return {
          id: l.id,
          source: l.source,
          target: l.target,
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
          style: { opacity: keep ? 0.7 : 0.12, strokeWidth: 1.5 },
          label: l.relationshipType === 'dependency' ? undefined : l.relationshipType,
          labelStyle: { fontSize: 9, fill: '#888' },
        }
      }),
    [model.links, hi],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const onNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => onSelect(node.id),
    [onSelect],
  )

  return (
    <div className={cn('h-full w-full', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
        minZoom={0.15}
        maxZoom={2.5}
        panOnDrag
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#E2E2E2" />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  )
}

export function DependencyGraphCanvas(props: {
  model: DepWebModel
  focusId: string | null
  highlightIds: string[]
  dimIds: string[]
  hotspotMode?: boolean
  onSelect: (id: string) => void
  className?: string
}) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}
