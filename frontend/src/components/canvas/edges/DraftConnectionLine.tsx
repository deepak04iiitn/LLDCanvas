'use client'

import { useEffect } from 'react'
import type { ConnectionLineComponentProps } from '@xyflow/react'
import { updateConnectionDraft, getConnectionDraftWaypoints } from '@/lib/connectionDraft'
import { useEditor } from '@/contexts/EditorContext'

/**
 * Custom React Flow ConnectionLineComponent.
 *
 * Renders the in-progress edge as a multi-segment polyline while the user
 * drags from a source handle.  Every frame, the cursor position (toX/toY in
 * flow coordinates) is fed into the direction-change tracker; when an
 * intentional bend is detected, a waypoint is committed and the path gains
 * a new segment.
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

  // Feed every cursor-position update into the tracker (effect runs after render)
  useEffect(() => {
    updateConnectionDraft(toX, toY)
  }, [toX, toY])

  // Read the current confirmed waypoints.  Because updateConnectionDraft is
  // called in the effect (after this render), we are reading the state from
  // the PREVIOUS frame — which is exactly what we want: the waypoints list
  // updates one frame after the bend is confirmed, which feels instantaneous
  // given the cursor has already moved past the bend point.
  const waypoints = getConnectionDraftWaypoints()

  // Build a polyline: source → waypoints… → cursor
  const pts = [{ x: fromX, y: fromY }, ...waypoints, { x: toX, y: toY }]
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')

  const color = connectionStatus === 'valid'
    ? (dark ? '#34d399' : '#10b981')   // green when hovering a valid target
    : (dark ? '#818CF8' : '#6366F1')   // indigo default

  return (
    <g>
      {/* Dashed polyline path */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="6 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Small filled circles at each confirmed bend point */}
      {waypoints.map((wp, i) => (
        <circle
          key={i}
          cx={wp.x}
          cy={wp.y}
          r={3.5}
          fill={color}
          opacity={0.85}
        />
      ))}
    </g>
  )
}
