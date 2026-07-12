'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  useViewport,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnNodesDelete,
  type ReactFlowInstance,
} from '@xyflow/react'
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

interface CanvasViewProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onInit: (instance: ReactFlowInstance) => void
  onNodesDelete?: OnNodesDelete
}

export function CanvasView({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onInit,
  onNodesDelete,
}: CanvasViewProps) {
  const { theme } = useEditor()
  const [guides, setGuides] = useState<GuideLines>({})

  const canvasBg =
    theme === 'dark' ? '#111111' : theme === 'whiteboard' ? '#FFFFFF' : '#F8F8F8'
  const gridColor =
    theme === 'dark' ? '#2A2A2A' : theme === 'whiteboard' ? '#E8E8E8' : '#E2E2E2'
  const minimapBg =
    theme === 'dark' ? '#1C1C1E' : theme === 'whiteboard' ? '#F5F5F5' : '#EEEEEE'
  const gridVariant =
    theme === 'whiteboard' ? BackgroundVariant.Lines : BackgroundVariant.Dots

  const onNodeDrag = useCallback(
    (_evt: unknown, draggedNode: Node, allNodes: Node[]) => {
      setGuides(computeGuides(draggedNode, allNodes))
    },
    [],
  )

  const onNodeDragStop = useCallback(() => setGuides({}), [])

  return (
    <div className="relative h-full w-full overflow-hidden">
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
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.1}
        maxZoom={4}
        fitView
        deleteKeyCode={null}        // handled manually in EditorShell
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Shift"
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        style={{ background: canvasBg }}
        proOptions={{ hideAttribution: true }}
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
      </ReactFlow>
    </div>
  )
}
