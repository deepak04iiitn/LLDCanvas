'use client'

import { useCallback, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  type Connection,
  type NodeTypes,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { cn } from '@/lib/utils'

export interface SimpleNode {
  id: string
  x: number
  y: number
  label: string
  type?: 'class' | 'interface' | 'service' | 'database'
}

export interface SimpleEdge {
  id: string
  source: string
  target: string
  label?: string
  type?: 'uses' | 'implements' | 'extends' | 'depends'
}

interface Props {
  nodes: SimpleNode[]
  edges: SimpleEdge[]
  onChange: (nodes: SimpleNode[], edges: SimpleEdge[]) => void
  readOnly?: boolean
}

// Custom node component
function DiagramNode({ data, selected }: { data: { label: string; nodeType: string }; selected?: boolean }) {
  const isInterface = data.nodeType === 'interface'
  const isDatabase = data.nodeType === 'database'
  const isService = data.nodeType === 'service'

  return (
    <div className={cn(
      'min-w-[100px] rounded border-2 bg-paper text-center px-3 py-2 text-[12px] shadow-sm cursor-default',
      selected ? 'border-brand' : 'border-gray-300',
      isDatabase && 'rounded-2xl border-blue-400',
      isService && 'border-purple-400 font-bold',
      isInterface && 'border-dashed border-teal-400',
    )}>
      {isInterface && <div className="text-[9px] text-teal-600 font-mono mb-0.5">«interface»</div>}
      {isDatabase && <div className="text-[9px] text-blue-500 font-mono mb-0.5">«db»</div>}
      {isService && <div className="text-[9px] text-purple-500 font-mono mb-0.5">«service»</div>}
      <div className={cn('text-ink font-medium text-[12px]', isService && 'text-purple-700')}>
        {data.label}
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  diagramNode: DiagramNode,
}

function toFlowNodes(simpleNodes: SimpleNode[]): Node[] {
  return simpleNodes.map(n => ({
    id: n.id,
    type: 'diagramNode',
    position: { x: n.x, y: n.y },
    data: { label: n.label, nodeType: n.type ?? 'class' },
  }))
}

function toFlowEdges(simpleEdges: SimpleEdge[]): Edge[] {
  return simpleEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: e.type === 'implements' || e.type === 'depends',
    style: e.type === 'implements' || e.type === 'extends' ? { strokeDasharray: '5,5' } : undefined,
  }))
}

function fromFlowNodes(flowNodes: Node[]): SimpleNode[] {
  return flowNodes.map(n => ({
    id: n.id,
    x: n.position.x,
    y: n.position.y,
    label: (n.data as { label: string }).label,
    type: (n.data as { nodeType: string }).nodeType as SimpleNode['type'],
  }))
}

function fromFlowEdges(flowEdges: Edge[]): SimpleEdge[] {
  return flowEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: typeof e.label === 'string' ? e.label : undefined,
  }))
}

let nodeCounter = 1

function CanvasInner({ nodes: initialNodes, edges: initialEdges, onChange, readOnly }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(toFlowNodes(initialNodes))
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(initialEdges))

  const notifyChange = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      onChange(fromFlowNodes(newNodes), fromFlowEdges(newEdges))
    },
    [onChange],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(eds => {
        const next = addEdge(connection, eds)
        notifyChange(nodes, next)
        return next
      })
    },
    [setEdges, nodes, notifyChange],
  )

  function addNode(type: SimpleNode['type']) {
    const id = `node-${Date.now()}-${nodeCounter++}`
    const label = type === 'class' ? 'NewClass' : type === 'interface' ? 'IName' : type === 'service' ? 'Service' : 'Database'
    const newNode: Node = {
      id,
      type: 'diagramNode',
      position: { x: 200 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: { label, nodeType: type },
    }
    setNodes(nds => {
      const next = [...nds, newNode]
      notifyChange(next, edges)
      return next
    })
  }

  function clearAll() {
    setNodes([])
    setEdges([])
    onChange([], [])
  }

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes)
      // Notify with a slight delay to get updated state
      setTimeout(() => {
        setNodes(nds => {
          notifyChange(nds, edges)
          return nds
        })
      }, 0)
    },
    [onNodesChange, setNodes, edges, notifyChange],
  )

  return (
    <div className="flex h-full flex-col">
      {!readOnly && (
        <div className="flex shrink-0 items-center gap-2 border-b border-hairline bg-paper-elevated px-3 py-1.5">
          {(['class', 'interface', 'service', 'database'] as const).map(t => (
            <button
              key={t}
              onClick={() => addNode(t)}
              className="rounded-md border border-hairline bg-paper px-2 py-1 text-[11px] text-ink-muted hover:bg-hairline/40 hover:text-ink transition-colors capitalize"
            >
              + {t === 'class' ? '📦 Class' : t === 'interface' ? '🔌 Interface' : t === 'service' ? '⚙️ Service' : '🗄️ DB'}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={clearAll}
            className="rounded-md px-2 py-1 text-[11px] text-red-500 hover:bg-red-50 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          nodesConnectable={!readOnly}
          nodesDraggable={!readOnly}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          deleteKeyCode="Delete"
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={16} size={0.5} color="#e2e8f0" />
        </ReactFlow>
      </div>
    </div>
  )
}

export function RoguelikeCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}
