'use client'

import { useCallback, useEffect, useMemo, type CSSProperties } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nanoid } from 'nanoid'
import { cn } from '@/lib/utils'

export interface DebuggerDiagram {
  nodes: unknown[]
  edges: unknown[]
}

function eidOf(data: Record<string, unknown> | undefined, fallback: string) {
  return String(data?.elementId ?? fallback)
}

function toRfNodes(
  raw: unknown[],
  selectedId: string | null,
  highlightedIds: Set<string>,
  markedIds: Set<string>,
): Node[] {
  return raw.map((n, i) => {
    const node = n as {
      id?: string
      position?: { x: number; y: number }
      data?: Record<string, unknown>
      type?: string
    }
    const id = String(node.id ?? `n${i}`)
    const data = { ...(node.data ?? {}) }
    const elementId = eidOf(data, id)
    const name = String(data.name ?? id)
    const methods = Array.isArray(data.methods) ? data.methods : []
    const selected = selectedId === elementId || selectedId === id
    const highlighted = highlightedIds.has(elementId) || highlightedIds.has(id)
    const marked = markedIds.has(elementId) || markedIds.has(id)

    return {
      id,
      type: 'debuggerClass',
      position: node.position ?? { x: (i % 4) * 220, y: Math.floor(i / 4) * 160 },
      data: {
        ...data,
        elementId,
        name,
        methods,
        nodeType: data.nodeType ?? node.type ?? 'class',
        selected,
        highlighted,
        marked,
      },
      selected,
    }
  })
}

function toRfEdges(
  raw: unknown[],
  selectedId: string | null,
  highlightedIds: Set<string>,
  markedIds: Set<string>,
): Edge[] {
  return raw.map((e, i) => {
    const edge = e as {
      id?: string
      source?: string
      target?: string
      data?: Record<string, unknown>
    }
    const id = String(edge.id ?? `e${i}`)
    const data = { ...(edge.data ?? {}) }
    const elementId = eidOf(data, id)
    const selected = selectedId === elementId || selectedId === id
    const highlighted = highlightedIds.has(elementId) || highlightedIds.has(id)
    const marked = markedIds.has(elementId) || markedIds.has(id)
    return {
      id,
      source: String(edge.source),
      target: String(edge.target),
      type: 'smoothstep',
      data: { ...data, elementId },
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      style: {
        stroke: marked ? '#b45309' : highlighted ? '#234E3F' : selected ? '#234E3F' : '#6b7280',
        strokeWidth: marked || highlighted || selected ? 2.5 : 1.75,
      },
      animated: highlighted,
    }
  })
}

const HANDLE_SIDES = [
  Position.Top,
  Position.Right,
  Position.Bottom,
  Position.Left,
] as const

const handleStyle: CSSProperties = {
  width: 8,
  height: 8,
  opacity: 0,
  border: 'none',
  background: 'transparent',
}

function DebuggerClassNode({ data }: { data: Record<string, unknown> }) {
  const methods = Array.isArray(data.methods) ? data.methods : []
  const name = String(data.name ?? 'Class')
  const nodeType = String(data.nodeType ?? 'class')
  const selected = Boolean(data.selected)
  const highlighted = Boolean(data.highlighted)
  const marked = Boolean(data.marked)

  return (
    <div
      className={cn(
        'relative min-w-[140px] max-w-[200px] rounded-md border bg-paper-elevated text-left shadow-sm',
        marked && 'border-amber-500 ring-2 ring-amber-400/40',
        !marked && highlighted && 'border-brand ring-2 ring-brand/30',
        !marked && !highlighted && selected && 'border-brand',
        !marked && !highlighted && !selected && 'border-hairline',
      )}
    >
      {/* Default handles (no id) — edges without sourceHandle/targetHandle attach here */}
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />
      {/* Extra sides for Repair-mode connect routing */}
      {HANDLE_SIDES.map(side => (
        <Handle
          key={`t-${side}`}
          id={`t-${side}`}
          type="target"
          position={side}
          style={handleStyle}
        />
      ))}
      {HANDLE_SIDES.map(side => (
        <Handle
          key={`s-${side}`}
          id={`s-${side}`}
          type="source"
          position={side}
          style={handleStyle}
        />
      ))}
      <div className="border-b border-hairline px-2.5 py-1.5">
        {nodeType !== 'class' && (
          <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
            «{nodeType}»
          </p>
        )}
        <p className="font-serif text-[13px] font-medium text-ink">{name}</p>
      </div>
      {methods.length > 0 && (
        <ul className="space-y-0.5 px-2.5 py-1.5">
          {methods.slice(0, 6).map((m, i) => {
            const label =
              typeof m === 'string'
                ? m
                : `${(m as { name?: string }).name ?? 'method'}()`
            return (
              <li key={i} className="truncate font-mono text-[10px] text-ink-muted">
                + {label}
              </li>
            )
          })}
          {methods.length > 6 && (
            <li className="font-mono text-[9px] text-ink-faint">+{methods.length - 6} more</li>
          )}
        </ul>
      )}
    </div>
  )
}

const nodeTypes = { debuggerClass: DebuggerClassNode }

export interface DebuggerCanvasProps {
  diagram: DebuggerDiagram
  readOnly: boolean
  selectedId: string | null
  highlightedIds?: string[]
  markedIds?: string[]
  onSelect: (elementId: string, kind: 'node' | 'edge') => void
  onDiagramChange?: (diagram: DebuggerDiagram) => void
  className?: string
}

export function DebuggerCanvas({
  diagram,
  readOnly,
  selectedId,
  highlightedIds = [],
  markedIds = [],
  onSelect,
  onDiagramChange,
  className,
}: DebuggerCanvasProps) {
  const hi = useMemo(() => new Set(highlightedIds), [highlightedIds])
  const mk = useMemo(() => new Set(markedIds), [markedIds])

  const [nodes, setNodes, onNodesChange] = useNodesState(
    toRfNodes(diagram.nodes ?? [], selectedId, hi, mk),
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    toRfEdges(diagram.edges ?? [], selectedId, hi, mk),
  )

  useEffect(() => {
    setNodes(toRfNodes(diagram.nodes ?? [], selectedId, hi, mk))
    setEdges(toRfEdges(diagram.edges ?? [], selectedId, hi, mk))
  }, [diagram, selectedId, hi, mk, setNodes, setEdges])

  const emitChange = useCallback(
    (ns: Node[], es: Edge[]) => {
      if (!onDiagramChange) return
      onDiagramChange({
        nodes: ns.map(n => ({
          id: n.id,
          position: n.position,
          data: n.data,
        })),
        edges: es.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          data: e.data ?? { relationshipType: 'dependency' },
        })),
      })
    },
    [onDiagramChange],
  )

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const elementId = String((node.data as { elementId?: string })?.elementId ?? node.id)
      onSelect(elementId, 'node')
    },
    [onSelect],
  )

  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      const elementId = String((edge.data as { elementId?: string })?.elementId ?? edge.id)
      onSelect(elementId, 'edge')
    },
    [onSelect],
  )

  const onConnect = useCallback(
    (c: Connection) => {
      if (readOnly) return
      setEdges(eds => {
        const next = addEdge(
          {
            ...c,
            id: `e-${nanoid(6)}`,
            data: { elementId: `ed-${nanoid(6)}`, relationshipType: 'dependency' },
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds,
        )
        emitChange(nodes, next)
        return next
      })
    },
    [readOnly, setEdges, emitChange, nodes],
  )

  const addNode = useCallback(
    (nodeType: 'class' | 'interface') => {
      if (readOnly) return
      const id = `n-${nanoid(6)}`
      const elementId = `el-${nanoid(6)}`
      const name = nodeType === 'interface' ? 'NewInterface' : 'NewClass'
      const node: Node = {
        id,
        type: 'debuggerClass',
        position: { x: 80 + Math.random() * 120, y: 80 + Math.random() * 80 },
        data: {
          elementId,
          name,
          nodeType,
          methods: [],
          attributes: [],
        },
      }
      setNodes(ns => {
        const next = [...ns, node]
        emitChange(next, edges)
        return next
      })
      onSelect(elementId, 'node')
    },
    [readOnly, setNodes, edges, emitChange, onSelect],
  )

  return (
    <div className={cn('relative flex h-full min-h-0 flex-col', className)}>
      {!readOnly && (
        <div className="flex shrink-0 gap-2 border-b border-hairline bg-paper px-3 py-2">
          <button
            type="button"
            onClick={() => addNode('class')}
            className="rounded-md border border-hairline px-2.5 py-1 text-[12px] font-medium text-ink hover:bg-hairline/40"
          >
            Add Class
          </button>
          <button
            type="button"
            onClick={() => addNode('interface')}
            className="rounded-md border border-hairline px-2.5 py-1 text-[12px] font-medium text-ink hover:bg-hairline/40"
          >
            Add Interface
          </button>
          <span className="self-center font-mono text-[10px] text-ink-faint">
            Drag to connect · rewire edges in Repair
          </span>
        </div>
      )}
      <div className="min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
            style: { stroke: '#6b7280', strokeWidth: 1.75 },
          }}
          onNodesChange={chs => {
            onNodesChange(chs)
            if (!readOnly) {
              // defer emit — React Flow batches; use onNodeDragStop via nodesChange for positions
            }
          }}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onConnect={onConnect}
          onNodeDragStop={() => emitChange(nodes, edges)}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} size={1} />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable className="!bg-paper" />
        </ReactFlow>
      </div>
    </div>
  )
}

/** BFS outbound reachable node ids from a selected element (by elementId or node id). */
export function traceOutbound(
  diagram: DebuggerDiagram,
  startElementId: string,
): string[] {
  const nodes = (diagram.nodes ?? []) as {
    id?: string
    data?: { elementId?: string }
  }[]
  const edges = (diagram.edges ?? []) as {
    source?: string
    target?: string
    data?: { elementId?: string }
  }[]

  const idByElement = new Map<string, string>()
  for (const n of nodes) {
    const id = String(n.id)
    const eid = String(n.data?.elementId ?? id)
    idByElement.set(eid, id)
    idByElement.set(id, id)
  }
  const startNodeId = idByElement.get(startElementId)
  if (!startNodeId) return [startElementId]

  const adj = new Map<string, string[]>()
  for (const e of edges) {
    const s = String(e.source)
    const t = String(e.target)
    if (!adj.has(s)) adj.set(s, [])
    adj.get(s)!.push(t)
  }

  const visited = new Set<string>()
  const queue = [startNodeId]
  visited.add(startNodeId)
  while (queue.length) {
    const u = queue.shift()!
    for (const v of adj.get(u) ?? []) {
      if (!visited.has(v)) {
        visited.add(v)
        queue.push(v)
      }
    }
  }

  const out: string[] = []
  for (const n of nodes) {
    const id = String(n.id)
    if (visited.has(id)) out.push(String(n.data?.elementId ?? id))
  }
  for (const e of edges) {
    if (visited.has(String(e.source)) && visited.has(String(e.target))) {
      out.push(String(e.data?.elementId ?? e.source))
    }
  }
  return out
}
