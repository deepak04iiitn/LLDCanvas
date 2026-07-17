'use client'

import { useEffect, useRef } from 'react'
import { type Node, type Edge } from '@xyflow/react'
import { useCollab } from '@/contexts/CollabContext'

export function useCollabCanvas(
  diagramId: string | null,
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void,
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void,
) {
  const { patchCanvas, myRole, registerPatchHandler } = useCollab()
  const isRemoteUpdate = useRef(false)
  const emitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep setters in refs so the patch handler never goes stale
  const setNodesRef = useRef(setNodes)
  const setEdgesRef = useRef(setEdges)
  useEffect(() => { setNodesRef.current = setNodes }, [setNodes])
  useEffect(() => { setEdgesRef.current = setEdges }, [setEdges])

  // Register incoming patch handler once
  useEffect(() => {
    registerPatchHandler((incomingNodes, incomingEdges) => {
      isRemoteUpdate.current = true
      setNodesRef.current(incomingNodes as Node[])
      setEdgesRef.current(incomingEdges as Edge[])
    })
  }, [registerPatchHandler])

  // Emit own changes — skip when the change came from a remote patch
  useEffect(() => {
    if (!diagramId || myRole === 'viewer' || myRole === null) return

    // This effect ran because of a remote setNodes/setEdges call — skip emitting back
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false
      return
    }

    if (emitTimer.current) clearTimeout(emitTimer.current)
    emitTimer.current = setTimeout(() => {
      patchCanvas(diagramId, nodes, edges)
    }, 80)

    return () => {
      if (emitTimer.current) clearTimeout(emitTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, diagramId, myRole])
}
