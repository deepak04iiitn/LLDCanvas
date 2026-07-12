'use client'

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect } from 'react'
import { useEditor } from '@/contexts/EditorContext'

// Placeholder node/edge types — real ones are wired in Phase 4 & 5
const nodeTypes = {}
const edgeTypes = {}

interface CanvasViewProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onInit: (instance: ReactFlowInstance) => void
}

// Inner component with access to useReactFlow() context
function CanvasInner({ nodes }: { nodes: Node[] }) {
  const { setZoom, setNodeCount } = useEditor()
  const { getViewport } = useReactFlow()

  useEffect(() => {
    setNodeCount(nodes.length)
  }, [nodes.length, setNodeCount])

  useEffect(() => {
    const vp = getViewport()
    setZoom(vp.zoom)
  }, [getViewport, setZoom])

  return null
}

export function CanvasView({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onInit,
}: CanvasViewProps) {
  const { theme, setZoom } = useEditor()

  // Theme-derived canvas colours
  const canvasBg =
    theme === 'dark' ? '#111111' : theme === 'whiteboard' ? '#FFFFFF' : '#F8F8F8'
  const gridColor =
    theme === 'dark' ? '#2A2A2A' : theme === 'whiteboard' ? '#E8E8E8' : '#E2E2E2'
  const minimapBg =
    theme === 'dark' ? '#1C1C1E' : theme === 'whiteboard' ? '#F5F5F5' : '#EEEEEE'
  const gridVariant =
    theme === 'whiteboard' ? BackgroundVariant.Lines : BackgroundVariant.Dots

  return (
    <div className="relative h-full w-full overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.1}
        maxZoom={4}
        fitView
        deleteKeyCode={['Delete', 'Backspace']}
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Shift"
        onMoveEnd={(_, vp) => setZoom(Math.round(vp.zoom * 100) / 100)}
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
        <CanvasInner nodes={nodes} />
      </ReactFlow>
    </div>
  )
}
