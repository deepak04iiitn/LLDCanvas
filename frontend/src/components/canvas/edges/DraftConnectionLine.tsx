'use client'

import { useEffect, useState } from 'react'
import type { ConnectionLineComponentProps } from '@xyflow/react'
import {
  updateConnectionDraft,
  getConnectionDraftWaypoints,
  subscribeConnectionDraft,
} from '@/lib/connectionDraft'
import { useEditor } from '@/contexts/EditorContext'

/**
 * Custom React Flow ConnectionLineComponent.
 *
 * Renders the in-progress edge as a multi-segment polyline while the user
 * drags from a source handle. Stop briefly to drop a breakpoint, then continue
 * dragging to the next bend or target.
 */
export function DraftConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  connectionStatus,
}: ConnectionLineComponentProps) {
  const { theme } = useEditor()
  const dark = theme === 'dark'
  const [, setTick] = useState(0)

  // Pause commits happen on a timer (no toX/toY change) — force a redraw.
  useEffect(() => subscribeConnectionDraft(() => setTick(t => t + 1)), [])

  useEffect(() => {
    updateConnectionDraft(toX, toY)
  }, [toX, toY])

  const waypoints = getConnectionDraftWaypoints()

  const pts = [{ x: fromX, y: fromY }, ...waypoints, { x: toX, y: toY }]
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')

  const color =
    connectionStatus === 'valid'
      ? dark
        ? '#34d399'
        : '#10b981'
      : dark
        ? '#818CF8'
        : '#6366F1'

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="6 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {waypoints.map((wp, i) => (
        <circle key={i} cx={wp.x} cy={wp.y} r={3.5} fill={color} opacity={0.85} />
      ))}
    </g>
  )
}
