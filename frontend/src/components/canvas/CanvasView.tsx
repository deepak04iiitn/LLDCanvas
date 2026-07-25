'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ConnectionMode,
  SelectionMode,
  useViewport,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnNodesDelete,
  type ReactFlowInstance,
  type OnConnectStart,
} from '@xyflow/react'
import { Trash2, CopyPlus } from 'lucide-react'
import '@xyflow/react/dist/style.css'
import { useEditor } from '@/contexts/EditorContext'
import { nodeTypes } from './nodes'
import { edgeTypes } from './edges'
import { UMLMarkers } from './UMLMarkers'
import { DraftConnectionLine } from './edges/DraftConnectionLine'
import { EraserState } from '@/lib/eraserState'

// SVG eraser cursor encoded as a data URI (20 × 20 px, hotspot at bottom-left)
const ERASER_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'/%3E%3Cpath d='M22 21H7'/%3E%3Cpath d='m5 11 9 9'/%3E%3C/svg%3E") 0 20, crosshair`

// ─── Alignment guide overlay ──────────────────────────────────────────────────

interface GuideLines {
  x?: number  // flow-space X position for a vertical guide
  y?: number  // flow-space Y position for a horizontal guide
}

function AlignmentGuideOverlay({ guides }: { guides: GuideLines }) {
  const { x: vpX, y: vpY, zoom } = useViewport()

  if (!guides.x && !guides.y) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {guides.x !== undefined && (
        <div
          className="absolute top-0 bottom-0 w-px bg-indigo-500/60"
          style={{ left: guides.x * zoom + vpX }}
        />
      )}
      {guides.y !== undefined && (
        <div
          className="absolute left-0 right-0 h-px bg-indigo-500/60"
          style={{ top: guides.y * zoom + vpY }}
        />
      )}
    </div>
  )
}

// ─── Zoom tracker (inside ReactFlow context) ──────────────────────────────────

function ZoomTracker({ nodes }: { nodes: Node[] }) {
  const { setZoom, setNodeCount } = useEditor()
  const { zoom } = useViewport()

  useEffect(() => { setZoom(Math.round(zoom * 100) / 100) }, [zoom, setZoom])
  useEffect(() => { setNodeCount(nodes.length) }, [nodes.length, setNodeCount])

  return null
}

// ─── Snap threshold (in flow units) ──────────────────────────────────────────
const SNAP_THRESHOLD = 6

function computeGuides(draggedNode: Node, allNodes: Node[]): GuideLines {
  const guides: GuideLines = {}
  const dx = draggedNode.position.x
  const dy = draggedNode.position.y
  const dw = (draggedNode.measured?.width ?? 180)
  const dh = (draggedNode.measured?.height ?? 100)

  for (const node of allNodes) {
    if (node.id === draggedNode.id) continue
    const nx = node.position.x
    const ny = node.position.y
    const nw = (node.measured?.width ?? 180)
    const nh = (node.measured?.height ?? 100)

    // Vertical guide - left/right edge or center-x alignment
    if (guides.x === undefined) {
      if (Math.abs(dx - nx) < SNAP_THRESHOLD) guides.x = nx
      else if (Math.abs(dx + dw - (nx + nw)) < SNAP_THRESHOLD) guides.x = nx + nw - dw
      else if (Math.abs(dx + dw / 2 - (nx + nw / 2)) < SNAP_THRESHOLD) guides.x = nx + nw / 2 - dw / 2
    }
    // Horizontal guide - top/bottom edge or center-y alignment
    if (guides.y === undefined) {
      if (Math.abs(dy - ny) < SNAP_THRESHOLD) guides.y = ny
      else if (Math.abs(dy + dh - (ny + nh)) < SNAP_THRESHOLD) guides.y = ny + nh - dh
      else if (Math.abs(dy + dh / 2 - (ny + nh / 2)) < SNAP_THRESHOLD) guides.y = ny + nh / 2 - dh / 2
    }

    if (guides.x !== undefined && guides.y !== undefined) break
  }

  return guides
}

// ─── Main CanvasView ─────────────────────────────────────────────────────────

// ─── Selection action bar ──────────────────────────────────────────────────────
function SelectionBar({
  count, onClone, onDelete, onClear,
}: {
  count: number
  onClone: () => void
  onDelete: () => void
  onClear: () => void
}) {
  if (count === 0) return null
  return (
    <Panel position="bottom-center">
      <div className="mb-4 flex items-center gap-1 rounded-xl border border-gray-200/80
                      bg-white/95 px-2 py-1.5 shadow-lg shadow-black/8 backdrop-blur-sm">
        <span className="mr-1 select-none rounded-full bg-indigo-100 px-2.5 py-0.5
                         font-mono text-[11px] font-semibold text-indigo-700">
          {count} selected
        </span>

        <div className="mx-1 h-4 w-px bg-gray-200" />

        <button
          onClick={onClone}
          title="Clone (Ctrl+D)"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium
                     text-gray-600 transition-all duration-100 hover:bg-gray-100 active:scale-95"
        >
          <CopyPlus className="h-3.5 w-3.5" />
          Clone
        </button>

        <button
          onClick={onDelete}
          title="Delete (Del)"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium
                     text-red-600 transition-all duration-100 hover:bg-red-50 active:scale-95"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>

        <div className="mx-1 h-4 w-px bg-gray-200" />

        <button
          onClick={onClear}
          title="Clear selection (Escape)"
          className="rounded-lg px-2 py-1 text-[11px] text-gray-400
                     transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          Esc
        </button>
      </div>
    </Panel>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface CanvasViewProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onConnectStart?: OnConnectStart
  onInit: (instance: ReactFlowInstance) => void
  onNodesDelete?: OnNodesDelete
  canvasMode: 'pan' | 'select' | 'eraser'
  selectedCount: number
  onDuplicate: () => void
  onDelete: () => void
  onClearSelection: () => void
  onEraseNode?: (nodeId: string) => void
  onEraseEdge?: (edgeId: string) => void
  readOnly?: boolean
}

export function CanvasView({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onConnectStart,
  onInit,
  onNodesDelete,
  canvasMode,
  selectedCount,
  onDuplicate,
  onDelete,
  onClearSelection,
  onEraseNode,
  onEraseEdge,
  readOnly,
}: CanvasViewProps) {
  const { theme } = useEditor()
  const [guides, setGuides] = useState<GuideLines>({})
  const dragRaf = useRef<number | null>(null)

  // Track whether the primary mouse button is held (for drag-to-erase)
  const isMouseDownRef = useRef(false)

  const canvasBg =
    theme === 'dark' ? '#111111' : theme === 'whiteboard' ? '#FFFFFF' : '#F8F8F8'
  const gridColor =
    theme === 'dark' ? '#2A2A2A' : theme === 'whiteboard' ? '#E8E8E8' : '#E2E2E2'
  const gridVariant =
    theme === 'whiteboard' ? BackgroundVariant.Lines : BackgroundVariant.Dots

  // Throttle guide computation to one state update per animation frame -
  // without this, setGuides fires on every pointermove (~600 calls/second at
  // 60 fps), causing a full React reconcile on every mouse move tick.
  const onNodeDrag = useCallback(
    (_evt: unknown, draggedNode: Node, allNodes: Node[]) => {
      if (dragRaf.current !== null) cancelAnimationFrame(dragRaf.current)
      dragRaf.current = requestAnimationFrame(() => {
        setGuides(computeGuides(draggedNode, allNodes))
        dragRaf.current = null
      })
    },
    [],
  )

  const onNodeDragStop = useCallback(() => {
    if (dragRaf.current !== null) { cancelAnimationFrame(dragRaf.current); dragRaf.current = null }
    setGuides({})
  }, [])

  // ── Eraser handlers ───────────────────────────────────────────────────────
  const isEraser = canvasMode === 'eraser'

  const onNodeMouseEnter = useCallback(
    (_: unknown, node: Node) => {
      if (!isEraser) return
      EraserState.setHoveredId(node.id)
      if (isMouseDownRef.current) onEraseNode?.(node.id)
    },
    [isEraser, onEraseNode],
  )

  const onNodeMouseLeave = useCallback(
    (_: unknown, node: Node) => {
      if (!isEraser) return
      if (EraserState.hoveredId === node.id) EraserState.setHoveredId(null)
    },
    [isEraser],
  )

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      if (!isEraser) return
      onEraseNode?.(node.id)
    },
    [isEraser, onEraseNode],
  )

  const onEdgeMouseEnter = useCallback(
    (_: unknown, edge: Edge) => {
      if (!isEraser) return
      EraserState.setHoveredId(edge.id)
      if (isMouseDownRef.current) onEraseEdge?.(edge.id)
    },
    [isEraser, onEraseEdge],
  )

  const onEdgeMouseLeave = useCallback(
    (_: unknown, edge: Edge) => {
      if (!isEraser) return
      if (EraserState.hoveredId === edge.id) EraserState.setHoveredId(null)
    },
    [isEraser],
  )

  const onEdgeClick = useCallback(
    (_: unknown, edge: Edge) => {
      if (!isEraser) return
      onEraseEdge?.(edge.id)
    },
    [isEraser, onEraseEdge],
  )

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      data-mode={canvasMode}
      onMouseDown={(e) => { if (e.button === 0) isMouseDownRef.current = true }}
      onMouseUp={() => { isMouseDownRef.current = false }}
    >
      {/* Force cursor on the React Flow pane based on active tool.
          React Flow sets cursor:grab on .react-flow__pane internally,
          which overrides any style on the outer wrapper. */}
      {canvasMode === 'select' && (
        <style>{`.react-flow__pane { cursor: crosshair !important; }`}</style>
      )}
      {canvasMode === 'eraser' && (
        <style>{`.react-flow__pane, .react-flow__node, .react-flow__edge { cursor: ${ERASER_CURSOR} !important; }`}</style>
      )}
      <UMLMarkers />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={isEraser ? undefined : onConnect}
        onConnectStart={isEraser ? undefined : onConnectStart}
        onInit={onInit}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.1}
        maxZoom={4}
        fitView
        deleteKeyCode={null}
        // In select mode: left-drag box-selects; right/middle-drag pans.
        // In pan mode: left-drag pans; Shift+drag still box-selects.
        // In eraser mode: no drag interaction (only hover + click to erase).
        selectionOnDrag={canvasMode === 'select'}
        panOnDrag={canvasMode === 'select' ? [1, 2] : isEraser ? false : true}
        selectionMode={SelectionMode.Partial}
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Shift"
        onNodeDrag={isEraser ? undefined : onNodeDrag}
        onNodeDragStop={isEraser ? undefined : onNodeDragStop}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeClick={onNodeClick}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        onEdgeClick={onEdgeClick}
        style={{ background: canvasBg }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={!readOnly && !isEraser}
        nodesConnectable={!readOnly && !isEraser}
        elementsSelectable={!readOnly && !isEraser}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={28}
        connectionLineComponent={DraftConnectionLine}
      >
        <Background
          variant={gridVariant}
          gap={16}
          size={gridVariant === BackgroundVariant.Dots ? 1.5 : 1}
          color={gridColor}
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="canvas-controls"
        />
        <ZoomTracker nodes={nodes} />
        <AlignmentGuideOverlay guides={guides} />

        {/* ── Selection action bar ──────────────────────────────────────── */}
        <SelectionBar
          count={selectedCount}
          onClone={onDuplicate}
          onDelete={onDelete}
          onClear={onClearSelection}
        />
      </ReactFlow>
    </div>
  )
}
