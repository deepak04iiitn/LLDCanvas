import { useCallback, useEffect, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'

const STORAGE_KEY_NODES = 'lldcanvas-local-nodes'
const STORAGE_KEY_EDGES = 'lldcanvas-local-edges'

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function useLocalDiagram() {
  const [nodes, setNodes] = useState<Node[]>(() => loadFromStorage(STORAGE_KEY_NODES, []))
  const [edges, setEdges] = useState<Edge[]>(() => loadFromStorage(STORAGE_KEY_EDGES, []))

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes))
    } catch {
      // Storage full — silently ignore
    }
  }, [nodes])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EDGES, JSON.stringify(edges))
    } catch {}
  }, [edges])

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_NODES)
    localStorage.removeItem(STORAGE_KEY_EDGES)
    setNodes([])
    setEdges([])
  }, [])

  const hasLocalData = nodes.length > 0 || edges.length > 0

  return { nodes, setNodes, edges, setEdges, clear, hasLocalData }
}
