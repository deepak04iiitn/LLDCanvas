'use client'

import { useState, useCallback, useRef } from 'react'
import {
  getSmoothStepPath,
  getStraightPath,
  EdgeLabelRenderer,
  Position,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react'
import { useEditor } from '@/contexts/EditorContext'
import type { UMLEdgeData, RelationshipType, Waypoint } from '@/types'
import { useEraserHighlight } from '@/lib/eraserState'
import { useMarkerPrefix } from '@/components/canvas/UMLMarkers'

// ─── Marker resolution ────────────────────────────────────────────────────────

function markerUrl(prefix: string, base: string, dark: boolean) {
  return `url(#${prefix}${base}${dark ? '-dark' : ''})`
}

interface MarkerConfig {
  markerEnd?: string
  markerStart?: string
  strokeDasharray?: string
}

function getMarkers(type: RelationshipType, dark: boolean, prefix: string): MarkerConfig {
  const m = (base: string) => markerUrl(prefix, base, dark)
  switch (type) {
    case 'inheritance':
      return { markerEnd: m('inheritance') }
    case 'realization':
      return { markerEnd: m('realization'), strokeDasharray: '6 3' }
    case 'dependency':
      return { markerEnd: m('dependency'), strokeDasharray: '6 3' }
    case 'association':
      return { markerEnd: m('dependency') }
    case 'bidirectional':
      return {
        markerEnd: m('dependency'),
        markerStart: m('dependency'),
      }
    // Diamond sits on the WHOLE (source) side — matches RelationshipPicker icons
    case 'aggregation':
      return { markerStart: m('aggregation') }
    case 'composition':
      return { markerStart: m('composition') }
    default:
      return { markerEnd: m('dependency') }
  }
}

// ─── Polyline path helpers ─────────────────────────────────────────────────────

function buildPolylinePath(
  sx: number, sy: number,
  waypoints: Waypoint[],
  tx: number, ty: number,
): string {
  const pts: Waypoint[] = [{ x: sx, y: sy }, ...waypoints, { x: tx, y: ty }]
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
}

function polylineMidpoint(
  sx: number, sy: number,
  waypoints: Waypoint[],
  tx: number, ty: number,
): Waypoint {
  const pts: Waypoint[] = [{ x: sx, y: sy }, ...waypoints, { x: tx, y: ty }]
  if (pts.length < 2) return pts[0]

  let totalLen = 0
  const segLens: number[] = []
  for (let i = 1; i < pts.length; i++) {
    const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
    segLens.push(len)
    totalLen += len
  }

  const halfLen = totalLen / 2
  let runLen = 0
  for (let i = 0; i < segLens.length; i++) {
    if (runLen + segLens[i] >= halfLen) {
      const t = segLens[i] === 0 ? 0 : (halfLen - runLen) / segLens[i]
      return {
        x: pts[i].x + t * (pts[i + 1].x - pts[i].x),
        y: pts[i].y + t * (pts[i + 1].y - pts[i].y),
      }
    }
    runLen += segLens[i]
  }
  return pts[Math.floor(pts.length / 2)]
}

/** Distance from point P to the line segment AB */
function pointToSegDist(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - ax, py - ay)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/**
 * Finds which segment the click is closest to and inserts a new waypoint
 * into that segment. Returns the updated waypoints array.
 */
function insertWaypointNear(
  sx: number, sy: number,
  waypoints: Waypoint[],
  tx: number, ty: number,
  cx: number, cy: number,
): Waypoint[] {
  const pts: Waypoint[] = [{ x: sx, y: sy }, ...waypoints, { x: tx, y: ty }]

  let bestSeg = 0
  let bestDist = Infinity
  for (let i = 0; i < pts.length - 1; i++) {
    const d = pointToSegDist(cx, cy, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y)
    if (d < bestDist) { bestDist = d; bestSeg = i }
  }

  // bestSeg is the segment index in pts (0 = source→wp0 or source→target if no wps)
  // Corresponding insertion index in waypoints is bestSeg (insert before pts[bestSeg+1])
  const next = [...waypoints]
  next.splice(bestSeg, 0, { x: cx, y: cy })
  return next
}

// ─── Multiplicity label ────────────────────────────────────────────────────────

interface MultiLabelProps {
  value?: string
  x: number
  y: number
  onChange: (val: string) => void
  dark: boolean
}

const MULTIPLICITY_OPTIONS = ['1', '0..1', '1..*', '0..*']

function MultiplicityLabel({ value, x, y, onChange, dark }: MultiLabelProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')

  if (!value && !editing) return null

  function commit() {
    onChange(draft.trim())
    setEditing(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); commit() }
    if (e.key === 'Escape') { setDraft(value ?? ''); setEditing(false) }
    e.stopPropagation()
  }

  const textColor = dark ? '#D1D5DB' : '#374151'
  const bgColor = dark ? '#1C1C1E' : '#FFFFFF'

  return (
    <div
      style={{ transform: `translate(-50%, -50%)`, position: 'absolute', left: x, top: y, zIndex: 10 }}
      className="nodrag nopan pointer-events-auto"
    >
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            value={draft}
            autoFocus
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            className="w-14 rounded border border-indigo-300 px-1 text-center font-mono text-[10px]
                       outline-none ring-1 ring-indigo-300"
            style={{ background: bgColor, color: textColor }}
          />
          <div className="absolute top-full left-0 mt-1 z-50 flex gap-0.5 rounded border bg-white shadow-md p-1">
            {MULTIPLICITY_OPTIONS.map(opt => (
              <button
                key={opt}
                onMouseDown={e => { e.preventDefault(); onChange(opt); setEditing(false) }}
                className="rounded px-1.5 py-0.5 font-mono text-[10px] text-gray-700 hover:bg-indigo-50"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <span
          onDoubleClick={e => { e.stopPropagation(); setDraft(value ?? ''); setEditing(true) }}
          className="cursor-text rounded px-1 font-mono text-[10px] font-medium select-none"
          style={{ color: textColor, background: bgColor, border: `1px solid transparent` }}
          title="Double-click to edit multiplicity"
        >
          {value}
        </span>
      )}
    </div>
  )
}

// ─── Waypoint drag handle ──────────────────────────────────────────────────────

interface WaypointHandleProps {
  x: number
  y: number
  index: number
  dark: boolean
  onMove: (index: number, x: number, y: number) => void
  onRemove: (index: number) => void
}

function WaypointHandle({ x, y, index, dark, onMove, onRemove }: WaypointHandleProps) {
  const { screenToFlowPosition } = useReactFlow()
  const dragging = useRef(false)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      dragging.current = true

      const onMove_ = (me: MouseEvent) => {
        if (!dragging.current) return
        const pos = screenToFlowPosition({ x: me.clientX, y: me.clientY })
        onMove(index, pos.x, pos.y)
      }
      const onUp = () => {
        dragging.current = false
        window.removeEventListener('mousemove', onMove_)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove_)
      window.addEventListener('mouseup', onUp)
    },
    [index, onMove, screenToFlowPosition],
  )

  return (
    <circle
      cx={x}
      cy={y}
      r={5}
      fill={dark ? '#818CF8' : '#6366F1'}
      stroke={dark ? '#1f2937' : '#ffffff'}
      strokeWidth={2}
      style={{ cursor: 'move' }}
      onMouseDown={onMouseDown}
      onDoubleClick={e => { e.stopPropagation(); onRemove(index) }}
    >
      <title>Drag to move - double-click to remove</title>
    </circle>
  )
}

// ─── Main UML Edge ─────────────────────────────────────────────────────────────

export function UMLEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data: rawData,
  selected,
  source,
  target,
}: EdgeProps) {
  const edgeData = (rawData ?? {}) as Partial<UMLEdgeData> & { hideChrome?: boolean }
  const relType: RelationshipType = edgeData.relationshipType ?? 'association'
  // 'step' → auto-elbow (legacy); everything else (undefined/'straight') → straight + manual waypoints
  const lineStyle = edgeData.lineStyle === 'step' ? 'step' : 'straight'
  const waypoints: Waypoint[] = Array.isArray(edgeData.waypoints)
    ? (edgeData.waypoints as Waypoint[])
    : []
  const hideChrome = Boolean(edgeData.hideChrome)

  const { theme } = useEditor()
  const dark = theme === 'dark'
  const markerPrefix = useMarkerPrefix()
  const { setEdges, screenToFlowPosition } = useReactFlow()
  const [hovered, setHovered] = useState(false)
  const isEraserTarget = useEraserHighlight(id)

  const edgeColor = dark ? '#9CA3AF' : '#374151'
  const hoverColor = dark ? '#A5B4FC' : '#818CF8'
  const selectedColor = '#6366F1'
  const eraserColor = '#EF4444'
  const stroke = isEraserTarget ? eraserColor : selected ? selectedColor : hovered ? hoverColor : edgeColor
  const strokeWidth = isEraserTarget ? 2.5 : selected ? 2 : hovered ? 2 : 1.5

  const markers = getMarkers(relType, dark, markerPrefix)

  // ── Marker endpoint offset ──────────────────────────────────────────────────
  // Filled markers (triangles at target, diamonds at source) use refX=0.
  // Shorten the path on that end so the outer tip lands on the node border.
  const endMarkerDepth =
    relType === 'inheritance' || relType === 'realization' ? 9 : 0
  const startMarkerDepth =
    relType === 'aggregation' || relType === 'composition' ? 13 : 0

  // Step elbows need room; a short gap produces sideways U-stubs — use straight.
  const span = Math.hypot(targetX - sourceX, targetY - sourceY)
  const effectiveLineStyle =
    lineStyle === 'step' && span < 120 ? 'straight' : lineStyle

  function markerAdjustedTarget(
    px: number,
    py: number,
    tx: number,
    ty: number,
  ): [number, number] {
    if (endMarkerDepth === 0) return [tx, ty]
    const dx = tx - px
    const dy = ty - py
    const len = Math.hypot(dx, dy)
    if (len < 1) return [tx, ty]
    const offset = endMarkerDepth // userSpaceOnUse — absolute flow units
    return [tx - (dx / len) * offset, ty - (dy / len) * offset]
  }

  function markerAdjustedSource(
    sx: number,
    sy: number,
    nx: number,
    ny: number,
  ): [number, number] {
    if (startMarkerDepth === 0) return [sx, sy]
    const dx = nx - sx
    const dy = ny - sy
    const len = Math.hypot(dx, dy)
    if (len < 1) return [sx, sy]
    const offset = startMarkerDepth
    return [sx + (dx / len) * offset, sy + (dy / len) * offset]
  }

  // ── Self-loop (source === target) ──────────────────────────────────────────
  const isSelfLoop = source === target
  let edgePath: string
  let labelX: number
  let labelY: number

  if (isSelfLoop) {
    const DIR_VECTORS: Partial<Record<Position, { x: number; y: number }>> = {
      [Position.Top]: { x: 0, y: -1 },
      [Position.Right]: { x: 1, y: 0 },
      [Position.Bottom]: { x: 0, y: 1 },
      [Position.Left]: { x: -1, y: 0 },
    }
    const dir = DIR_VECTORS[sourcePosition] ?? { x: 1, y: 0 }
    const loopSize = 64
    const c1x = sourceX + dir.x * loopSize
    const c1y = sourceY + dir.y * loopSize
    const c2x = targetX + dir.x * loopSize
    const c2y = targetY + dir.y * loopSize

    edgePath = `M ${sourceX},${sourceY} C ${c1x},${c1y} ${c2x},${c2y} ${targetX},${targetY}`
    labelX = (sourceX + targetX) / 2 + dir.x * loopSize
    labelY = (sourceY + targetY) / 2 + dir.y * loopSize
  } else if (effectiveLineStyle === 'step') {
    let adjSX = sourceX
    let adjSY = sourceY
    let adjTX = targetX
    let adjTY = targetY
    if (endMarkerDepth > 0) {
      const offset = endMarkerDepth
      switch (targetPosition) {
        case Position.Left:
          adjTX = targetX - offset
          break
        case Position.Right:
          adjTX = targetX + offset
          break
        case Position.Top:
          adjTY = targetY - offset
          break
        case Position.Bottom:
          adjTY = targetY + offset
          break
      }
    }
    if (startMarkerDepth > 0) {
      const offset = startMarkerDepth
      switch (sourcePosition) {
        case Position.Left:
          adjSX = sourceX - offset
          break
        case Position.Right:
          adjSX = sourceX + offset
          break
        case Position.Top:
          adjSY = sourceY - offset
          break
        case Position.Bottom:
          adjSY = sourceY + offset
          break
      }
    }
    ;[edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX: adjSX,
      sourceY: adjSY,
      sourcePosition,
      targetX: adjTX,
      targetY: adjTY,
      targetPosition,
      borderRadius: 10,
    })
  } else if (waypoints.length > 0) {
    const firstWP = waypoints[0]
    const lastWP = waypoints[waypoints.length - 1]
    const [adjSX, adjSY] = markerAdjustedSource(sourceX, sourceY, firstWP.x, firstWP.y)
    const [adjTX, adjTY] = markerAdjustedTarget(lastWP.x, lastWP.y, targetX, targetY)
    edgePath = buildPolylinePath(adjSX, adjSY, waypoints, adjTX, adjTY)
    const mid = polylineMidpoint(adjSX, adjSY, waypoints, adjTX, adjTY)
    labelX = mid.x
    labelY = mid.y
  } else {
    const [adjSX, adjSY] = markerAdjustedSource(sourceX, sourceY, targetX, targetY)
    const [adjTX, adjTY] = markerAdjustedTarget(adjSX, adjSY, targetX, targetY)
    ;[edgePath, labelX, labelY] = getStraightPath({
      sourceX: adjSX,
      sourceY: adjSY,
      targetX: adjTX,
      targetY: adjTY,
    })
  }

  // ── Shared edge-data updater ────────────────────────────────────────────────
  const updateEdgeData = useCallback(
    (updates: Partial<UMLEdgeData>) => {
      setEdges(eds =>
        eds.map(e =>
          e.id === id ? { ...e, data: { ...(e.data ?? {}), ...updates } } : e,
        ),
      )
    },
    [id, setEdges],
  )

  // ── Line-style toggle (straight ↔ elbow) ───────────────────────────────────
  const toggleLineStyle = useCallback(() => {
    updateEdgeData({
      lineStyle: lineStyle === 'step' ? 'straight' : 'step',
      // Clear waypoints when switching to elbow — they have no meaning there
      waypoints: lineStyle === 'step' ? [] : undefined,
    })
  }, [lineStyle, updateEdgeData])

  // ── Multiplicity helpers ────────────────────────────────────────────────────
  const updateMultiplicity = useCallback(
    (field: 'sourceMultiplicity' | 'targetMultiplicity', val: string) => {
      updateEdgeData({ [field]: val || undefined })
    },
    [updateEdgeData],
  )

  // ── Waypoint helpers ────────────────────────────────────────────────────────
  const moveWaypoint = useCallback(
    (index: number, x: number, y: number) => {
      const next = [...waypoints]
      next[index] = { x, y }
      updateEdgeData({ waypoints: next })
    },
    [waypoints, updateEdgeData],
  )

  const removeWaypoint = useCallback(
    (index: number) => {
      updateEdgeData({ waypoints: waypoints.filter((_, i) => i !== index) })
    },
    [waypoints, updateEdgeData],
  )

  /**
   * Click on the transparent hit-area path to insert a bend point.
   * Only fires when the edge is already selected and in straight routing mode.
   */
  const onPathClick = useCallback(
    (e: React.MouseEvent) => {
      if (!selected || lineStyle === 'step' || isSelfLoop) return
      e.stopPropagation()
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      updateEdgeData({
        waypoints: insertWaypointNear(
          sourceX, sourceY, waypoints, targetX, targetY,
          pos.x, pos.y,
        ),
      })
    },
    [selected, lineStyle, isSelfLoop, screenToFlowPosition, sourceX, sourceY, waypoints, targetX, targetY, updateEdgeData],
  )

  // ── Multiplicity label positions (near ends of the overall path) ───────────
  const srcLabelX = sourceX + (targetX - sourceX) * 0.12
  const srcLabelY = sourceY + (targetY - sourceY) * 0.12
  const tgtLabelX = sourceX + (targetX - sourceX) * 0.88
  const tgtLabelY = sourceY + (targetY - sourceY) * 0.88

  const canAddBend = selected && !isSelfLoop && lineStyle !== 'step'

  return (
    <>
      {/* Invisible wider hit area — also the click target for adding bends */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        className="react-flow__edge-interaction"
        style={{ cursor: canAddBend ? 'crosshair' : 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onPathClick}
      />

      {/* Visible edge path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={markers.strokeDasharray}
        markerEnd={markers.markerEnd}
        markerStart={markers.markerStart}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-150 ease-out pointer-events-none"
      />

      {/* Waypoint drag handles (visible when edge is selected, straight mode only) */}
      {selected && !isSelfLoop && lineStyle !== 'step' && waypoints.map((wp, i) => (
        <WaypointHandle
          key={i}
          x={wp.x}
          y={wp.y}
          index={i}
          dark={dark}
          onMove={moveWaypoint}
          onRemove={removeWaypoint}
        />
      ))}

      {/* Edge label + routing toggle — shown when selected (hidden in studio/refactor) */}
      {selected && !hideChrome && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: 'translate(-50%, -50%)',
              position: 'absolute',
              left: labelX,
              top: labelY,
              zIndex: 20,
            }}
            className="nodrag nopan pointer-events-auto flex items-center gap-1"
          >
            <span
              className="rounded-full border border-indigo-200 bg-indigo-50 px-1.5 py-0.5
                         text-[9px] font-medium text-indigo-600 dark:border-indigo-700
                         dark:bg-indigo-950/60 dark:text-indigo-400"
            >
              {relType}
            </span>
            {!isSelfLoop && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); toggleLineStyle() }}
                title={lineStyle === 'step' ? 'Switch to straight line' : 'Switch to elbow routing'}
                className="rounded-full border border-gray-200 bg-white px-1.5 py-0.5
                           text-[9px] font-medium text-gray-500 transition-colors
                           hover:border-indigo-300 hover:text-indigo-600
                           dark:border-slate-600 dark:bg-slate-900 dark:text-gray-400
                           dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              >
                {lineStyle === 'step' ? 'elbow' : 'straight'}
              </button>
            )}
            {canAddBend && (
              <span className="text-[8px] text-gray-400 dark:text-gray-600 select-none">
                click path to bend
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Multiplicity labels */}
      {!hideChrome && (
        <EdgeLabelRenderer>
          <MultiplicityLabel
            value={edgeData.sourceMultiplicity}
            x={srcLabelX}
            y={srcLabelY}
            onChange={v => updateMultiplicity('sourceMultiplicity', v)}
            dark={dark}
          />
          <MultiplicityLabel
            value={edgeData.targetMultiplicity}
            x={tgtLabelX}
            y={tgtLabelY}
            onChange={v => updateMultiplicity('targetMultiplicity', v)}
            dark={dark}
          />
        </EdgeLabelRenderer>
      )}
    </>
  )
}
