'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  reconnectEdge,
  ConnectionMode,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type OnNodesChange,
  type OnEdgesChange,
  type OnReconnect,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { EditorProvider } from '@/contexts/EditorContext'
import { edgeTypes, DEFAULT_EDGE_TYPE } from '@/components/canvas/edges'
import { UMLMarkers } from '@/components/canvas/UMLMarkers'
import { RelationshipPicker } from '@/components/canvas/RelationshipPicker'
import { DraftConnectionLine } from '@/components/canvas/edges/DraftConnectionLine'
import { resetConnectionDraft, getConnectionDraftWaypoints } from '@/lib/connectionDraft'
import type { RelationshipType, UMLEdgeData } from '@/types'

export interface DebuggerDiagram {
  nodes: unknown[]
  edges: unknown[]
}

const RELATIONSHIP_TYPES = new Set<string>([
  'association',
  'aggregation',
  'composition',
  'inheritance',
  'realization',
  'dependency',
  'bidirectional',
])

function eidOf(data: Record<string, unknown> | undefined, fallback: string) {
  return String(data?.elementId ?? fallback)
}

function resolveRelationshipType(
  type: unknown,
  data: Record<string, unknown> | undefined,
): RelationshipType {
  const fromData = data?.relationshipType
  if (typeof fromData === 'string' && RELATIONSHIP_TYPES.has(fromData)) {
    return fromData as RelationshipType
  }
  if (typeof type === 'string' && RELATIONSHIP_TYPES.has(type)) {
    return type as RelationshipType
  }
  return DEFAULT_EDGE_TYPE
}

function mapDiagramNodes(ns: Node[]): DebuggerDiagram['nodes'] {
  return ns.map(n => ({
    id: n.id,
    position: n.position,
    data: n.data,
  }))
}

function mapDiagramEdges(es: Edge[]): DebuggerDiagram['edges'] {
  return es.map(e => {
    const data = (e.data ?? {}) as Record<string, unknown>
    const relationshipType = resolveRelationshipType(e.type, data)
    const hasWaypoints = Array.isArray(data.waypoints) && data.waypoints.length > 0
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      type: relationshipType,
      data: {
        ...data,
        relationshipType,
        elementId: eidOf(data, e.id),
        waypoints: hasWaypoints ? data.waypoints : undefined,
        lineStyle: hasWaypoints
          ? undefined
          : ((data.lineStyle as string | undefined) ?? 'step'),
      },
    }
  })
}

function toRfNodes(
  raw: unknown[],
  selectedId: string | null,
  highlightedIds: Set<string>,
  markedIds: Set<string>,
  editable: boolean,
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
        editable,
      },
      selected,
    }
  })
}

const SIDE_POSITION: Record<'top' | 'right' | 'bottom' | 'left', Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
}
const SIDE_OFFSETS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95] as const

function sideHandleStyle(side: 'top' | 'right' | 'bottom' | 'left', pct: number) {
  return side === 'top' || side === 'bottom' ? { left: `${pct}%` } : { top: `${pct}%` }
}

/** Same dense border ports as the UML editor (every 5% along each side). */
const HANDLE_POSITIONS = (['top', 'right', 'bottom', 'left'] as const).flatMap(side =>
  SIDE_OFFSETS.map(pct => ({
    id: pct === 50 ? side : `${side}@${pct}`,
    position: SIDE_POSITION[side],
    style: sideHandleStyle(side, pct),
  })),
)

const HANDLE_BASE =
  '!h-2.5 !w-2.5 !rounded-full !border-[1.5px] !border-white !bg-brand ' +
  '!shadow-sm !transition-[opacity,transform] !duration-100'

function snap5(v: number): number {
  return Math.max(5, Math.min(95, Math.round(v / 5) * 5))
}

function nearestHandleId(clientX: number, clientY: number, rect: DOMRect, zone = 14): string | null {
  const mx = clientX - rect.left
  const my = clientY - rect.top
  const w = rect.width
  const h = rect.height
  const dTop = my
  const dBottom = h - my
  const dLeft = mx
  const dRight = w - mx
  const closest = Math.min(dTop, dBottom, dLeft, dRight)
  if (closest > zone) return null
  if (closest === dTop) {
    const p = snap5((mx / w) * 100)
    return p === 50 ? 'top' : `top@${p}`
  }
  if (closest === dBottom) {
    const p = snap5((mx / w) * 100)
    return p === 50 ? 'bottom' : `bottom@${p}`
  }
  if (closest === dLeft) {
    const p = snap5((my / h) * 100)
    return p === 50 ? 'left' : `left@${p}`
  }
  const p = snap5((my / h) * 100)
  return p === 50 ? 'right' : `right@${p}`
}

function estimateNodeSize(node: {
  data?: { methods?: unknown[] }
}): { w: number; h: number } {
  const methods = Array.isArray(node.data?.methods) ? node.data!.methods!.length : 0
  const shown = Math.min(methods, 6)
  const h = 36 + (shown > 0 ? 8 + shown * 14 : 0) + (methods > 6 ? 12 : 0)
  return { w: 160, h: Math.max(h, 48) }
}

function normalizeHandleId(h?: string | null): string | undefined {
  if (!h) return undefined
  const m = /^(?:[st]-)?(top|right|bottom|left)(?:@(\d+))?$/i.exec(h)
  if (!m) return undefined
  const side = m[1].toLowerCase()
  const pct = m[2]
  if (!pct || pct === '50') return side
  return `${side}@${pct}`
}

function isValidHandleId(h?: string): boolean {
  return Boolean(h && /^(top|right|bottom|left)(@\d+)?$/.test(h))
}

/** Mid-side ports: vertical stacks use bottom→top; horizontal use left↔right. */
function pickHandles(
  source: { position: { x: number; y: number }; data?: { methods?: unknown[] } },
  target: { position: { x: number; y: number }; data?: { methods?: unknown[] } },
): { sourceHandle: string; targetHandle: string } {
  const s = estimateNodeSize(source)
  const t = estimateNodeSize(target)
  const sx = source.position.x + s.w / 2
  const sy = source.position.y + s.h / 2
  const tx = target.position.x + t.w / 2
  const ty = target.position.y + t.h / 2
  const dx = tx - sx
  const dy = ty - sy
  if (Math.abs(dy) >= Math.abs(dx)) {
    return dy >= 0
      ? { sourceHandle: 'bottom', targetHandle: 'top' }
      : { sourceHandle: 'top', targetHandle: 'bottom' }
  }
  return dx >= 0
    ? { sourceHandle: 'right', targetHandle: 'left' }
    : { sourceHandle: 'left', targetHandle: 'right' }
}

function toRfEdges(
  raw: unknown[],
  nodesRaw: unknown[],
  selectedId: string | null,
  highlightedIds: Set<string>,
  markedIds: Set<string>,
  editable: boolean,
): Edge[] {
  const nodeById = new Map<
    string,
    { position: { x: number; y: number }; data?: { methods?: unknown[] } }
  >()
  for (const n of nodesRaw) {
    const node = n as {
      id?: string
      position?: { x: number; y: number }
      data?: { methods?: unknown[] }
    }
    if (node.id) {
      nodeById.set(String(node.id), {
        position: node.position ?? { x: 0, y: 0 },
        data: node.data,
      })
    }
  }

  return raw.map((e, i) => {
    const edge = e as {
      id?: string
      source?: string
      target?: string
      sourceHandle?: string | null
      targetHandle?: string | null
      type?: string
      data?: Record<string, unknown>
    }
    const id = String(edge.id ?? `e${i}`)
    const data = { ...(edge.data ?? {}) }
    const elementId = eidOf(data, id)
    const relationshipType = resolveRelationshipType(edge.type, data)
    const selected = selectedId === elementId || selectedId === id
    const highlighted = highlightedIds.has(elementId) || highlightedIds.has(id)
    const marked = markedIds.has(elementId) || markedIds.has(id)

    const sourceId = String(edge.source)
    const targetId = String(edge.target)
    let sourceHandle = normalizeHandleId(edge.sourceHandle)
    let targetHandle = normalizeHandleId(edge.targetHandle)
    if (
      !sourceHandle ||
      !targetHandle ||
      !isValidHandleId(sourceHandle) ||
      !isValidHandleId(targetHandle)
    ) {
      const src = nodeById.get(sourceId)
      const tgt = nodeById.get(targetId)
      if (src && tgt) {
        const picked = pickHandles(src, tgt)
        sourceHandle = isValidHandleId(sourceHandle) ? sourceHandle : picked.sourceHandle
        targetHandle = isValidHandleId(targetHandle) ? targetHandle : picked.targetHandle
      }
    }

    const hasWaypoints = Array.isArray(data.waypoints) && (data.waypoints as unknown[]).length > 0
    return {
      id,
      source: sourceId,
      target: targetId,
      sourceHandle,
      targetHandle,
      type: relationshipType,
      data: {
        ...data,
        elementId,
        relationshipType,
        // Pack edges default to elbow; user-drawn edges with bend points stay straight+waypoints
        lineStyle: hasWaypoints
          ? undefined
          : ((data.lineStyle as string | undefined) ?? 'step'),
        waypoints: hasWaypoints ? data.waypoints : undefined,
        hideChrome: true,
        highlighted,
        marked,
      },
      selected,
      reconnectable: editable,
      animated: highlighted,
    }
  })
}

function DebuggerClassNode({ data }: { data: Record<string, unknown> }) {
  const methods = Array.isArray(data.methods) ? data.methods : []
  const name = String(data.name ?? 'Class')
  const nodeType = String(data.nodeType ?? 'class')
  const selected = Boolean(data.selected)
  const highlighted = Boolean(data.highlighted)
  const marked = Boolean(data.marked)
  const editable = Boolean(data.editable)
  const nodeRef = useRef<HTMLDivElement>(null)
  const [activeHandle, setActiveHandle] = useState<string | null>(null)

  const onBorderMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      if (!editable) return
      const rect = nodeRef.current?.getBoundingClientRect()
      if (rect) setActiveHandle(nearestHandleId(e.clientX, e.clientY, rect))
    },
    [editable],
  )

  const onBorderMouseLeave = useCallback(() => {
    setActiveHandle(null)
  }, [])

  return (
    <div
      ref={nodeRef}
      onMouseMove={onBorderMouseMove}
      onMouseLeave={onBorderMouseLeave}
      className={cn(
        'relative min-w-[140px] max-w-[200px] rounded-md border bg-paper-elevated text-left shadow-sm',
        marked && 'border-amber-500 ring-2 ring-amber-400/40',
        !marked && highlighted && 'border-brand ring-2 ring-brand/30',
        !marked && !highlighted && selected && 'border-brand',
        !marked && !highlighted && !selected && 'border-hairline',
      )}
    >
      {/* Dense border handles like UML editor — only nearest lights up */}
      {HANDLE_POSITIONS.map(({ id, position, style }) => {
        const visible = editable && id === activeHandle
        return (
          <Handle
            key={id}
            id={id}
            type="source"
            position={position}
            style={style}
            className={cn(
              HANDLE_BASE,
              visible ? 'opacity-100! hover:scale-125!' : 'opacity-0!',
            )}
          />
        )
      })}
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

/** Stable defaults — `= []` in props creates a new array every render and loops RF sync. */
const EMPTY_IDS: string[] = []

export interface DebuggerCanvasProps {
  diagram: DebuggerDiagram
  readOnly: boolean
  selectedId: string | null
  highlightedIds?: string[]
  markedIds?: string[]
  onSelect: (elementId: string, kind: 'node' | 'edge') => void
  onDiagramChange?: (diagram: DebuggerDiagram) => void
  className?: string
  /** Hide built-in Add Class strip (parent provides its own toolbar). */
  hideEditChrome?: boolean
}

function DebuggerCanvasInner({
  diagram,
  readOnly,
  selectedId,
  highlightedIds = EMPTY_IDS,
  markedIds = EMPTY_IDS,
  onSelect,
  onDiagramChange,
  className,
  hideEditChrome,
}: DebuggerCanvasProps) {
  const editable = !readOnly
  const hiKey = highlightedIds.join('\0')
  const mkKey = markedIds.join('\0')
  const hi = useMemo(() => new Set(highlightedIds), [hiKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const mk = useMemo(() => new Set(markedIds), [mkKey]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Structural content only — positions live in RF until emitted; do not include selection. */
  const diagramKey = useMemo(() => {
    const n = diagram.nodes ?? []
    const e = diagram.edges ?? []
    return `${n.length}:${e.length}:${JSON.stringify(
      n.map((x: unknown) => {
        const node = x as {
          id?: string
          position?: { x: number; y: number }
          data?: { elementId?: string; name?: string; methods?: unknown; nodeType?: string }
        }
        return [
          node.id,
          node.data?.elementId,
          node.data?.name,
          node.data?.nodeType,
          node.position?.x,
          node.position?.y,
          JSON.stringify(node.data?.methods ?? null),
        ]
      }),
    )}:${JSON.stringify(
      e.map((x: unknown) => {
        const edge = x as {
          id?: string
          source?: string
          target?: string
          sourceHandle?: string | null
          targetHandle?: string | null
        }
        return [edge.id, edge.source, edge.target, edge.sourceHandle, edge.targetHandle]
      }),
    )}`
  }, [diagram])

  const [nodes, setNodes] = useNodesState(
    toRfNodes(diagram.nodes ?? [], selectedId, hi, mk, editable),
  )
  const [edges, setEdges] = useEdgesState(
    toRfEdges(diagram.edges ?? [], diagram.nodes ?? [], selectedId, hi, mk, editable),
  )

  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  nodesRef.current = nodes
  edgesRef.current = edges

  const skipNextSync = useRef(false)

  const emitChange = useCallback(
    (ns: Node[], es: Edge[]) => {
      if (!onDiagramChange || readOnly) return
      skipNextSync.current = true
      const payload = {
        nodes: mapDiagramNodes(ns),
        edges: mapDiagramEdges(es),
      }
      // Never call parent setState inside RF/setState updaters — defer to next tick.
      queueMicrotask(() => onDiagramChange(payload))
    },
    [onDiagramChange, readOnly],
  )

  // Full replace only when parent diagram content changes (undo / external), not on selection.
  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    const nextNodes = toRfNodes(diagram.nodes ?? [], selectedId, hi, mk, editable)
    const nextEdges = toRfEdges(diagram.edges ?? [], diagram.nodes ?? [], selectedId, hi, mk, editable)
    setNodes(nextNodes)
    setEdges(nextEdges)
    nodesRef.current = nextNodes
    edgesRef.current = nextEdges
    // eslint-disable-next-line react-hooks/exhaustive-deps -- diagram read when diagramKey changes
  }, [diagramKey, editable, setNodes, setEdges])

  // Selection / highlight chrome only — keep positions.
  useEffect(() => {
    setNodes(ns =>
      ns.map(n => {
        const elementId = eidOf(n.data as Record<string, unknown>, n.id)
        const selected = selectedId === elementId || selectedId === n.id
        const highlighted = hi.has(elementId) || hi.has(n.id)
        const marked = mk.has(elementId) || mk.has(n.id)
        return {
          ...n,
          selected,
          data: {
            ...n.data,
            selected,
            highlighted,
            marked,
            editable,
          },
        }
      }),
    )
    setEdges(es =>
      es.map(e => {
        const elementId = eidOf(e.data as Record<string, unknown>, e.id)
        const selected = selectedId === elementId || selectedId === e.id
        const highlighted = hi.has(elementId) || hi.has(e.id)
        const marked = mk.has(elementId) || mk.has(e.id)
        return {
          ...e,
          selected,
          reconnectable: editable,
          animated: highlighted,
          data: {
            ...(e.data as Record<string, unknown>),
            highlighted,
            marked,
          },
        }
      }),
    )
  }, [selectedId, hi, mk, editable, setNodes, setEdges])

  const { flowToScreenPosition } = useReactFlow()
  const [pendingConn, setPendingConn] = useState<Connection | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 })

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

  const onNodeDoubleClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (readOnly) return
      const current = String((node.data as { name?: string })?.name ?? node.id)
      const nextName = window.prompt('Rename class', current)
      if (nextName == null) return
      const name = nextName.trim()
      if (!name || name === current) return
      const updated = nodesRef.current.map(n =>
        n.id === node.id ? { ...n, data: { ...n.data, name } } : n,
      )
      nodesRef.current = updated
      setNodes(updated)
      emitChange(updated, edgesRef.current)
      const elementId = String((node.data as { elementId?: string })?.elementId ?? node.id)
      onSelect(elementId, 'node')
    },
    [readOnly, setNodes, emitChange, onSelect],
  )

  const handleNodesChange: OnNodesChange = useCallback(
    changes => {
      const next = applyNodeChanges(changes, nodesRef.current)
      nodesRef.current = next
      setNodes(next)
      if (!readOnly) {
        const shouldEmit = changes.some(
          c =>
            c.type === 'remove' ||
            c.type === 'add' ||
            c.type === 'replace' ||
            (c.type === 'position' && c.dragging === false),
        )
        if (shouldEmit) emitChange(next, edgesRef.current)
      }
    },
    [readOnly, setNodes, emitChange],
  )

  const handleEdgesChange: OnEdgesChange = useCallback(
    changes => {
      const next = applyEdgeChanges(changes, edgesRef.current)
      edgesRef.current = next
      setEdges(next)
      if (!readOnly) {
        const shouldEmit = changes.some(
          c => c.type === 'remove' || c.type === 'add' || c.type === 'replace',
        )
        if (shouldEmit) emitChange(nodesRef.current, next)
      }
    },
    [readOnly, setEdges, emitChange],
  )

  const onConnectStart = useCallback(() => {
    if (readOnly) return
    resetConnectionDraft()
  }, [readOnly])

  const onConnect = useCallback(
    (c: Connection) => {
      if (readOnly) return
      if (!c.source || !c.target) return
      if (c.source === c.target && (c.sourceHandle ?? null) === (c.targetHandle ?? null)) return
      const eds = edgesRef.current
      const duplicate = eds.some(
        e =>
          e.source === c.source &&
          e.target === c.target &&
          (e.sourceHandle ?? null) === (c.sourceHandle ?? null) &&
          (e.targetHandle ?? null) === (c.targetHandle ?? null),
      )
      if (duplicate) {
        toast.info('That relationship already exists')
        resetConnectionDraft()
        return
      }

      setPendingConn(c)

      const src = nodesRef.current.find(n => n.id === c.source)
      const tgt = nodesRef.current.find(n => n.id === c.target)
      let pos = { x: window.innerWidth / 2 - 130, y: window.innerHeight / 2 - 160 }
      if (src && tgt) {
        const midX =
          (src.position.x + ((src.measured?.width as number | undefined) ?? 180) / 2 +
            tgt.position.x +
            ((tgt.measured?.width as number | undefined) ?? 180) / 2) /
          2
        const midY =
          (src.position.y + ((src.measured?.height as number | undefined) ?? 100) / 2 +
            tgt.position.y +
            ((tgt.measured?.height as number | undefined) ?? 100) / 2) /
          2
        const screen = flowToScreenPosition({ x: midX, y: midY })
        pos = { x: screen.x - 130, y: screen.y - 80 }
      }
      setPickerPos(pos)
      setPickerOpen(true)
    },
    [readOnly, flowToScreenPosition],
  )

  const onRelationshipPick = useCallback(
    (relType: RelationshipType) => {
      if (!pendingConn) return
      const waypoints = getConnectionDraftWaypoints()
      resetConnectionDraft()
      const edgeId = `e-${nanoid(6)}`
      const elementId = `ed-${nanoid(6)}`
      const edge: Edge = {
        id: edgeId,
        source: pendingConn.source!,
        target: pendingConn.target!,
        sourceHandle: pendingConn.sourceHandle,
        targetHandle: pendingConn.targetHandle,
        type: relType,
        reconnectable: true,
        data: {
          elementId,
          relationshipType: relType,
          // Same as UML editor: straight polyline + bend waypoints from the drag
          waypoints: waypoints.length > 0 ? waypoints : undefined,
          hideChrome: true,
        } satisfies UMLEdgeData & { elementId: string; hideChrome: boolean },
      }
      const next = [...edgesRef.current, edge]
      edgesRef.current = next
      setEdges(next)
      emitChange(nodesRef.current, next)
      setPendingConn(null)
      setPickerOpen(false)
      onSelect(elementId, 'edge')
    },
    [pendingConn, setEdges, emitChange, onSelect],
  )

  const closePicker = useCallback(() => {
    setPendingConn(null)
    setPickerOpen(false)
    resetConnectionDraft()
  }, [])

  const onReconnect: OnReconnect = useCallback(
    (oldEdge, newConnection) => {
      if (readOnly) return
      const next = reconnectEdge(oldEdge, newConnection, edgesRef.current)
      edgesRef.current = next
      setEdges(next)
      emitChange(nodesRef.current, next)
    },
    [readOnly, setEdges, emitChange],
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
          editable: true,
        },
      }
      const next = [...nodesRef.current, node]
      nodesRef.current = next
      setNodes(next)
      emitChange(next, edgesRef.current)
      onSelect(elementId, 'node')
    },
    [readOnly, setNodes, emitChange, onSelect],
  )

  return (
    <div className={cn('relative flex h-full min-h-0 flex-col', className)}>
      {!readOnly && !hideEditChrome && (
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
            Drag handles to connect · Delete to remove · Double-click to rename
          </span>
        </div>
      )}
      <div className="relative min-h-0 flex-1">
        <UMLMarkers />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          defaultEdgeOptions={{
            type: DEFAULT_EDGE_TYPE,
            reconnectable: editable,
          }}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onConnectStart={editable ? onConnectStart : undefined}
          onConnect={onConnect}
          onReconnect={editable ? onReconnect : undefined}
          nodesDraggable={editable}
          nodesConnectable={editable}
          edgesReconnectable={editable}
          elementsSelectable
          edgesFocusable={editable}
          deleteKeyCode={editable ? ['Backspace', 'Delete'] : null}
          connectionLineComponent={editable ? DraftConnectionLine : undefined}
          fitView
          zoomOnScroll={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
        {editable && (
          <RelationshipPicker
            open={pickerOpen}
            position={pickerPos}
            onSelect={onRelationshipPick}
            onClose={closePicker}
          />
        )}
      </div>
    </div>
  )
}

export function DebuggerCanvas(props: DebuggerCanvasProps) {
  return (
    <EditorProvider initialTheme="light">
      <ReactFlowProvider>
        <DebuggerCanvasInner {...props} />
      </ReactFlowProvider>
    </EditorProvider>
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
