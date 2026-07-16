'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ConnectionMode,
  ConnectionLineType,
  SelectionMode,
  useViewport,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnNodesDelete,
  type ReactFlowInstance,
} from '@xyflow/react'
import { Trash2, CopyPlus } from 'lucide-react'
import '@xyflow/react/dist/style.css'
import { useEditor } from '@/contexts/EditorContext'
import { nodeTypes } from './nodes'
import { edgeTypes } from './edges'
import { UMLMarkers } from './UMLMarkers'

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

    // Vertical guide — left/right edge or center-x alignment
    if (guides.x === undefined) {
      if (Math.abs(dx - nx) < SNAP_THRESHOLD) guides.x = nx
      else if (Math.abs(dx + dw - (nx + nw)) < SNAP_THRESHOLD) guides.x = nx + nw - dw
      else if (Math.abs(dx + dw / 2 - (nx + nw / 2)) < SNAP_THRESHOLD) guides.x = nx + nw / 2 - dw / 2
    }
    // Horizontal guide — top/bottom edge or center-y alignment
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
  onInit: (instance: ReactFlowInstance) => void
  onNodesDelete?: OnNodesDelete
  canvasMode: 'pan' | 'select'
  selectedCount: number
  onDuplicate: () => void
  onDelete: () => void
  onClearSelection: () => void
  readOnly?: boolean
}

export function CanvasView({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onInit,
  onNodesDelete,
  canvasMode,
  selectedCount,
  onDuplicate,
  onDelete,
  onClearSelection,
  readOnly,
}: CanvasViewProps) {
  const { theme } = useEditor()
  const [guides, setGuides] = useState<GuideLines>({})
  const dragRaf = useRef<number | null>(null)

  const canvasBg =
    theme === 'dark' ? '#111111' : theme === 'whiteboard' ? '#FFFFFF' : '#F8F8F8'
  const gridColor =
    theme === 'dark' ? '#2A2A2A' : theme === 'whiteboard' ? '#E8E8E8' : '#E2E2E2'
  const minimapBg =
    theme === 'dark' ? '#1C1C1E' : theme === 'whiteboard' ? '#F5F5F5' : '#EEEEEE'
  const gridVariant =
    theme === 'whiteboard' ? BackgroundVariant.Lines : BackgroundVariant.Dots

  // Throttle guide computation to one state update per animation frame —
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

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      data-mode={canvasMode}
    >
      {/* Force crosshair on the React Flow pane in select mode —
          React Flow sets cursor:grab on .react-flow__pane internally,
          which overrides any style on the outer wrapper. */}
      {canvasMode === 'select' && (
        <style>{`.react-flow__pane { cursor: crosshair !important; }`}</style>
      )}
      <UMLMarkers />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
        selectionOnDrag={canvasMode === 'select'}
        panOnDrag={canvasMode === 'select' ? [1, 2] : true}
        selectionMode={SelectionMode.Partial}
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Shift"
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        style={{ background: canvasBg }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={28}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#6366F1', strokeWidth: 1.5, strokeDasharray: '6 3' }}
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
        <MiniMap
          position="bottom-left"
          pannable
          zoomable
          style={{ background: minimapBg }}
          maskColor={theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)'}
          className="canvas-minimap"
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
