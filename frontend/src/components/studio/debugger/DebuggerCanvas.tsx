'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  reconnectEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type OnNodesChange,
  type OnEdgesChange,
  type OnReconnect,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { EditorProvider } from '@/contexts/EditorContext'
import { CanvasView } from '@/components/canvas/CanvasView'
import { DEFAULT_EDGE_TYPE } from '@/components/canvas/edges'
import { RelationshipPicker } from '@/components/canvas/RelationshipPicker'
import { resetConnectionDraft, getConnectionDraftWaypoints } from '@/lib/connectionDraft'
import type {
  RelationshipType,
  UMLEdgeData,
  UMLMethod,
  UMLAttribute,
  NodeType,
  UMLNodeData,
  Waypoint,
  Visibility,
} from '@/types'

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

const NODE_TYPES = new Set<string>(['class', 'interface', 'abstract-class', 'enum', 'note'])

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

function resolveNodeType(type: unknown, data: Record<string, unknown> | undefined): NodeType {
  const fromData = data?.nodeType
  if (typeof fromData === 'string' && NODE_TYPES.has(fromData)) {
    return fromData as NodeType
  }
  if (typeof type === 'string' && NODE_TYPES.has(type)) {
    return type as NodeType
  }
  if (type === 'debuggerClass') return 'class'
  return 'class'
}

function normalizeVisibility(v: unknown, fallback: Visibility): Visibility {
  if (v === '+' || v === '-' || v === '#' || v === '~') return v
  const s = String(v ?? '').toLowerCase()
  if (s === 'public' || s === '+') return '+'
  if (s === 'private' || s === '-') return '-'
  if (s === 'protected' || s === '#') return '#'
  if (s === 'package' || s === '~') return '~'
  return fallback
}

function normalizeMethod(m: unknown, i: number): UMLMethod {
  if (m && typeof m === 'object' && 'name' in (m as object)) {
    const o = m as Partial<UMLMethod> & { visibility?: unknown; params?: unknown }
    const params =
      typeof o.params === 'string'
        ? o.params
        : Array.isArray(o.params)
          ? (o.params as { name?: string; type?: string }[])
              .map(p => `${p.name ?? 'arg'}: ${p.type ?? 'Object'}`)
              .join(', ')
          : ''
    return {
      id: o.id ?? `m${i}`,
      visibility: normalizeVisibility(o.visibility, '+'),
      name: String(o.name ?? 'method'),
      params,
      returnType: String(o.returnType ?? 'void'),
      isStatic: Boolean(o.isStatic),
      isAbstract: Boolean(o.isAbstract),
      isConstructor: Boolean(o.isConstructor),
    }
  }
  const raw = String(m ?? 'method').trim()
  const visMatch = raw.match(/^([+\-#~])\s*/)
  const visibility = (visMatch?.[1] as UMLMethod['visibility']) ?? '+'
  const rest = raw.replace(/^([+\-#~])\s*/, '')
  const name = rest.replace(/\s*\(.*$/, '').trim() || 'method'
  const paramsMatch = rest.match(/\((.*)\)/)
  return {
    id: `m${i}`,
    visibility,
    name,
    params: paramsMatch?.[1]?.trim() ?? '',
    returnType: 'void',
    isStatic: false,
    isAbstract: false,
  }
}

function normalizeAttribute(a: unknown, i: number): UMLAttribute {
  if (a && typeof a === 'object' && 'name' in (a as object)) {
    const o = a as Partial<UMLAttribute> & { visibility?: unknown }
    return {
      id: o.id ?? `a${i}`,
      visibility: normalizeVisibility(o.visibility, '-'),
      name: String(o.name ?? 'field'),
      type: String(o.type ?? 'String'),
      isStatic: Boolean(o.isStatic),
    }
  }
  const raw = String(a ?? 'field').trim()
  const visMatch = raw.match(/^([+\-#~])\s*/)
  const visibility = (visMatch?.[1] as UMLAttribute['visibility']) ?? '-'
  const rest = raw.replace(/^([+\-#~])\s*/, '')
  const [name, type] = rest.split(':').map(s => s.trim())
  return {
    id: `a${i}`,
    visibility,
    name: name || 'field',
    type: type || 'String',
    isStatic: false,
  }
}

function mapDiagramNodes(ns: Node[]): DebuggerDiagram['nodes'] {
  return ns.map(n => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
  }))
}

function mapDiagramEdges(es: Edge[]): DebuggerDiagram['edges'] {
  return es.map(e => {
    const data = (e.data ?? {}) as Record<string, unknown>
    const relationshipType = resolveRelationshipType(e.type, data)
    const hasWaypoints = Array.isArray(data.waypoints) && data.waypoints.length > 0
    const lineStyle =
      data.lineStyle === 'step' || data.lineStyle === 'straight'
        ? data.lineStyle
        : hasWaypoints
          ? undefined
          : 'step'
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
        // Step routing ignores waypoints; keeping both caused broken polylines
        waypoints: lineStyle === 'step' ? undefined : hasWaypoints ? data.waypoints : undefined,
        lineStyle,
      },
    }
  })
}

function estimateNodeBox(node: {
  data?: { methods?: unknown[]; attributes?: unknown[]; locked?: boolean }
}): { w: number; h: number } {
  const methods = Array.isArray(node.data?.methods) ? node.data!.methods!.length : 0
  const attrs = Array.isArray(node.data?.attributes) ? node.data!.attributes!.length : 0
  // Studio keeps add-row chrome collapsed until select — match locked height.
  return { w: 220, h: Math.max(64, 52 + attrs * 20 + methods * 20 + 8) }
}

/** Push nodes apart so edge step-routing has room (avoids sideways U-stubs). */
function ensureNodeSpacing(nodes: Node[]): Node[] {
  if (nodes.length < 2) return nodes
  const next = nodes.map(n => ({ ...n, position: { ...n.position } }))
  const order = [...next.keys()].sort(
    (i, j) => next[i].position.y - next[j].position.y || next[i].position.x - next[j].position.x,
  )
  const GAP = 100
  const NEAR_X = 360
  for (let a = 0; a < order.length; a++) {
    for (let b = a + 1; b < order.length; b++) {
      const i = order[a]
      const j = order[b]
      const A = next[i]
      const B = next[j]
      const as = estimateNodeBox(
        A as { data?: { methods?: unknown[]; attributes?: unknown[]; locked?: boolean } },
      )
      const bs = estimateNodeBox(
        B as { data?: { methods?: unknown[]; attributes?: unknown[]; locked?: boolean } },
      )
      const acx = A.position.x + as.w / 2
      const bcx = B.position.x + bs.w / 2
      const nearHorizontally = Math.abs(acx - bcx) < NEAR_X
      const minY = A.position.y + as.h + GAP
      if (nearHorizontally && B.position.y < minY) {
        B.position.y = minY
      }
    }
  }
  return next
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

function pickHandles(
  source: {
    position: { x: number; y: number }
    data?: { methods?: unknown[]; attributes?: unknown[]; locked?: boolean }
  },
  target: {
    position: { x: number; y: number }
    data?: { methods?: unknown[]; attributes?: unknown[]; locked?: boolean }
  },
): { sourceHandle: string; targetHandle: string } {
  const s = estimateNodeBox(source)
  const t = estimateNodeBox(target)
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

function toRfNodes(
  raw: unknown[],
  selectedId: string | null,
  highlightedIds: Set<string>,
  markedIds: Set<string>,
  locked: boolean,
): Node[] {
  const mapped = raw.map((n, i) => {
    const node = n as {
      id?: string
      position?: { x: number; y: number }
      data?: Record<string, unknown>
      type?: string
    }
    const id = String(node.id ?? `n${i}`)
    const rawData = { ...(node.data ?? {}) }
    const elementId = eidOf(rawData, id)
    const nodeType = resolveNodeType(node.type, rawData)
    const name = String(rawData.name ?? id)
    const methods = (Array.isArray(rawData.methods) ? rawData.methods : []).map(normalizeMethod)
    const attributes = (Array.isArray(rawData.attributes) ? rawData.attributes : []).map(
      normalizeAttribute,
    )
    const selected = selectedId === elementId || selectedId === id
    const highlighted = highlightedIds.has(elementId) || highlightedIds.has(id)
    const marked = markedIds.has(elementId) || markedIds.has(id)

    const data: UMLNodeData & {
      elementId: string
      highlighted: boolean
      marked: boolean
      locked: boolean
    } = {
      ...(rawData as object),
      elementId,
      nodeType,
      name,
      methods,
      attributes,
      stereotype:
        typeof rawData.stereotype === 'string'
          ? rawData.stereotype
          : nodeType === 'interface'
            ? 'interface'
            : nodeType === 'enum'
              ? 'enum'
              : undefined,
      highlighted,
      marked,
      locked,
    }

    return {
      id,
      type: nodeType === 'note' ? 'note' : nodeType,
      position: node.position ?? { x: (i % 4) * 240, y: Math.floor(i / 4) * 180 },
      data,
      selected,
    }
  })
  return ensureNodeSpacing(mapped)
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
    { position: { x: number; y: number }; data?: { methods?: unknown[]; attributes?: unknown[]; locked?: boolean } }
  >()
  for (const n of nodesRaw) {
    const node = n as {
      id?: string
      position?: { x: number; y: number }
      data?: { methods?: unknown[]; attributes?: unknown[]; locked?: boolean }
    }
    if (node.id) {
      nodeById.set(String(node.id), {
        position: node.position ?? { x: 0, y: 0 },
        data: node.data,
      })
    }
  }

  // First pass: build edge stubs with geometry-based handles (ignore stale seed
  // handles after spacing — same bottom→top on a short gap causes U-stubs).
  type Stub = {
    id: string
    sourceId: string
    targetId: string
    data: Record<string, unknown>
    elementId: string
    relationshipType: RelationshipType
    selected: boolean
    highlighted: boolean
    marked: boolean
    sourceHandle: string
    targetHandle: string
    lineStyle: 'step' | 'straight' | undefined
  }

  const stubs: Stub[] = []
  raw.forEach((e, i) => {
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
    const sourceId = String(edge.source)
    const targetId = String(edge.target)
    if (!nodeById.has(sourceId) || !nodeById.has(targetId)) return

    const data = { ...(edge.data ?? {}) }
    // Drop draft waypoints that break routing (they force polyline over step).
    delete data.waypoints
    const elementId = eidOf(data, id)
    const relationshipType = resolveRelationshipType(edge.type, data)
    const src = nodeById.get(sourceId)!
    const tgt = nodeById.get(targetId)!
    const picked = pickHandles(src, tgt)

    const sBox = estimateNodeBox(src)
    const tBox = estimateNodeBox(tgt)
    const gapY = Math.abs(
      tgt.position.y + tBox.h / 2 - (src.position.y + sBox.h / 2),
    )
    // Step elbows need vertical room; otherwise RF draws sideways loops.
    const lineStyleRaw = data.lineStyle
    let lineStyle: 'step' | 'straight' | undefined =
      lineStyleRaw === 'step' || lineStyleRaw === 'straight' ? lineStyleRaw : 'step'
    if (lineStyle === 'step' && gapY < 140) lineStyle = 'straight'

    stubs.push({
      id,
      sourceId,
      targetId,
      data,
      elementId,
      relationshipType,
      selected: selectedId === elementId || selectedId === id,
      highlighted: highlightedIds.has(elementId) || highlightedIds.has(id),
      marked: markedIds.has(elementId) || markedIds.has(id),
      sourceHandle: picked.sourceHandle,
      targetHandle: picked.targetHandle,
      lineStyle,
    })
  })

  // Spread sibling edges that share the same source side so paths don't stack.
  const bySourceSide = new Map<string, Stub[]>()
  for (const s of stubs) {
    const side = s.sourceHandle.split('@')[0]
    const key = `${s.sourceId}|${side}`
    if (!bySourceSide.has(key)) bySourceSide.set(key, [])
    bySourceSide.get(key)!.push(s)
  }
  for (const group of bySourceSide.values()) {
    if (group.length < 2) continue
    const side = group[0].sourceHandle.split('@')[0] as 'top' | 'right' | 'bottom' | 'left'
    group.sort((a, b) => {
      const ta = nodeById.get(a.targetId)!.position
      const tb = nodeById.get(b.targetId)!.position
      return side === 'top' || side === 'bottom' ? ta.x - tb.x : ta.y - tb.y
    })
    const n = group.length
    group.forEach((s, i) => {
      const pct = Math.round(20 + (60 * (i + 1)) / (n + 1))
      const snapped = Math.max(5, Math.min(95, Math.round(pct / 5) * 5))
      s.sourceHandle = snapped === 50 ? side : `${side}@${snapped}`
    })
  }

  return stubs.map(s => ({
    id: s.id,
    source: s.sourceId,
    target: s.targetId,
    sourceHandle: s.sourceHandle,
    targetHandle: s.targetHandle,
    type: s.relationshipType,
    data: {
      ...s.data,
      elementId: s.elementId,
      relationshipType: s.relationshipType,
      lineStyle: s.lineStyle,
      waypoints: undefined,
      highlighted: s.highlighted,
      marked: s.marked,
    } satisfies UMLEdgeData & {
      elementId: string
      highlighted: boolean
      marked: boolean
    },
    selected: s.selected,
    reconnectable: editable,
    animated: s.highlighted,
  }))
}

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
          type?: string
          data?: { relationshipType?: string }
        }
        return [
          edge.id,
          edge.source,
          edge.target,
          edge.sourceHandle,
          edge.targetHandle,
          edge.type,
          edge.data?.relationshipType,
        ]
      }),
    )}`
  }, [diagram])

  const [nodes, setNodes] = useNodesState(
    toRfNodes(diagram.nodes ?? [], selectedId, hi, mk, !editable),
  )
  const [edges, setEdges] = useEdgesState(
    toRfEdges(diagram.edges ?? [], diagram.nodes ?? [], selectedId, hi, mk, editable),
  )

  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  nodesRef.current = nodes
  edgesRef.current = edges

  const skipNextSync = useRef(false)
  const rfInstance = useRef<ReactFlowInstance | null>(null)

  const emitChange = useCallback(
    (ns: Node[], es: Edge[]) => {
      if (!onDiagramChange || readOnly) return
      skipNextSync.current = true
      const payload = {
        nodes: mapDiagramNodes(ns),
        edges: mapDiagramEdges(es),
      }
      queueMicrotask(() => onDiagramChange(payload))
    },
    [onDiagramChange, readOnly],
  )

  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    const nextNodes = toRfNodes(diagram.nodes ?? [], selectedId, hi, mk, !editable)
    const nextEdges = toRfEdges(
      diagram.edges ?? [],
      nextNodes,
      selectedId,
      hi,
      mk,
      editable,
    )
    setNodes(nextNodes)
    setEdges(nextEdges)
    nodesRef.current = nextNodes
    edgesRef.current = nextEdges
    requestAnimationFrame(() => {
      rfInstance.current?.fitView({ padding: 0.18, maxZoom: 1.15, duration: 180 })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- diagram read when diagramKey changes
  }, [diagramKey, editable, setNodes, setEdges])

  useEffect(() => {
    setNodes(ns =>
      ns.map(n => {
        const elementId = eidOf(n.data as Record<string, unknown>, n.id)
        const selected = selectedId === elementId || selectedId === n.id
        const highlighted = hi.has(elementId) || hi.has(n.id)
        const marked = mk.has(elementId) || mk.has(n.id)
        const dimOthers = hi.size > 0 && !highlighted
        return {
          ...n,
          selected,
          style: {
            ...(n.style ?? {}),
            opacity: dimOthers ? 0.28 : 1,
            transition: 'opacity 160ms ease',
          },
          data: {
            ...n.data,
            highlighted,
            marked,
            locked: !editable,
          },
        }
      }),
    )
    setEdges(es =>
      es.map(e => {
        const elementId = eidOf((e.data ?? {}) as Record<string, unknown>, e.id)
        const selected = selectedId === elementId || selectedId === e.id
        const highlighted = hi.has(elementId) || hi.has(e.id)
        const marked = mk.has(elementId) || mk.has(e.id)
        const dimOthers = hi.size > 0 && !highlighted
        return {
          ...e,
          selected,
          style: {
            ...(e.style ?? {}),
            opacity: dimOthers ? 0.2 : 1,
          },
          data: {
            ...e.data,
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

  const handleNodesChange: OnNodesChange = useCallback(
    changes => {
      // Always apply selection changes (debugger click-to-highlight on read-only).
      const allowed = readOnly
        ? changes.filter(c => c.type === 'select')
        : changes
      if (allowed.length === 0) return
      const next = applyNodeChanges(allowed, nodesRef.current)
      nodesRef.current = next
      setNodes(next)
      if (!readOnly) {
        const shouldEmit = allowed.some(
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
      const allowed = readOnly
        ? changes.filter(c => c.type === 'select')
        : changes
      if (allowed.length === 0) return
      const next = applyEdgeChanges(allowed, edgesRef.current)
      edgesRef.current = next
      setEdges(next)
      if (!readOnly) {
        const shouldEmit = allowed.some(
          c => c.type === 'remove' || c.type === 'add' || c.type === 'replace',
        )
        if (shouldEmit) emitChange(nodesRef.current, next)
      }
    },
    [readOnly, setEdges, emitChange],
  )

  const onConnectStart = useCallback(() => {
    resetConnectionDraft()
  }, [])

  const onConnect = useCallback(
    (c: Connection) => {
      if (readOnly) return
      const isSameHandle = c.source === c.target && c.sourceHandle === c.targetHandle
      const isDuplicate = edgesRef.current.some(
        e =>
          e.source === c.source &&
          e.target === c.target &&
          (e.sourceHandle ?? null) === (c.sourceHandle ?? null) &&
          (e.targetHandle ?? null) === (c.targetHandle ?? null),
      )
      if (isSameHandle || isDuplicate) {
        if (isDuplicate) toast.info('That relationship already exists')
        return
      }

      setPendingConn(c)

      const src = nodesRef.current.find(n => n.id === c.source)
      const tgt = nodesRef.current.find(n => n.id === c.target)
      let pos = { x: window.innerWidth / 2 - 130, y: window.innerHeight / 2 - 160 }
      if (src && tgt) {
        const midX =
          (src.position.x + ((src.measured?.width as number | undefined) ?? 200) / 2 +
            tgt.position.x +
            ((tgt.measured?.width as number | undefined) ?? 200) / 2) /
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
      const next = addEdge(
        {
          ...pendingConn,
          id: edgeId,
          type: relType,
          reconnectable: true,
          data: {
            elementId,
            relationshipType: relType,
            waypoints: waypoints.length > 0 ? waypoints : undefined,
          } satisfies UMLEdgeData & { elementId: string },
        },
        edgesRef.current,
      )
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

  const selectedCount = useMemo(
    () => nodes.filter(n => n.selected).length + edges.filter(e => e.selected).length,
    [nodes, edges],
  )

  const handleClearSelection = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, selected: false })))
    setEdges(eds => eds.map(e => ({ ...e, selected: false })))
    onSelect('', 'node')
  }, [setNodes, setEdges, onSelect])

  const handleDelete = useCallback(() => {
    if (readOnly) return
    const nextNodes = nodesRef.current.filter(n => !n.selected)
    const removedNodeIds = new Set(nodesRef.current.filter(n => n.selected).map(n => n.id))
    const nextEdges = edgesRef.current.filter(
      e => !e.selected && !removedNodeIds.has(e.source) && !removedNodeIds.has(e.target),
    )
    nodesRef.current = nextNodes
    edgesRef.current = nextEdges
    setNodes(nextNodes)
    setEdges(nextEdges)
    emitChange(nextNodes, nextEdges)
  }, [readOnly, setNodes, setEdges, emitChange])

  const handleDuplicate = useCallback(() => {
    if (readOnly) return
    const selected = nodesRef.current.filter(n => n.selected)
    if (selected.length === 0) return
    const clones = selected.map(n => ({
      ...n,
      id: `n-${nanoid(6)}`,
      position: { x: n.position.x + 32, y: n.position.y + 32 },
      selected: false,
      data: {
        ...n.data,
        elementId: `el-${nanoid(6)}`,
        name: `${String((n.data as { name?: string }).name ?? 'Class')}Copy`,
      },
    }))
    const next = [...nodesRef.current.map(n => ({ ...n, selected: false })), ...clones]
    nodesRef.current = next
    setNodes(next)
    emitChange(next, edgesRef.current)
  }, [readOnly, setNodes, emitChange])

  const onNodesDelete = useCallback(() => {
    // CanvasView fires this; handleNodesChange already emits on remove
  }, [])

  const addNode = useCallback(
    (nodeType: NodeType) => {
      if (readOnly) return
      const id = `n-${nanoid(6)}`
      const elementId = `el-${nanoid(6)}`
      const name = nodeType === 'interface' ? 'NewInterface' : 'NewClass'
      const node: Node = {
        id,
        type: nodeType,
        position: { x: 80 + Math.random() * 120, y: 80 + Math.random() * 80 },
        data: {
          elementId,
          name,
          nodeType,
          methods: [],
          attributes: [],
          isEditing: true,
        } satisfies UMLNodeData & { elementId: string },
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
        <CanvasView
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onConnectStart={editable ? onConnectStart : undefined}
          onReconnect={editable ? onReconnect : undefined}
          onInit={inst => {
            rfInstance.current = inst
            requestAnimationFrame(() => {
              inst.fitView({ padding: 0.18, maxZoom: 1.15, duration: 200 })
            })
          }}
          onNodesDelete={onNodesDelete}
          onNodeClickExtra={onNodeClick}
          onEdgeClickExtra={onEdgeClick}
          canvasMode={readOnly ? 'pan' : 'select'}
          selectedCount={readOnly ? 0 : selectedCount}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onClearSelection={handleClearSelection}
          readOnly={readOnly}
          hideSelectionBar={hideEditChrome || readOnly}
        />
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
