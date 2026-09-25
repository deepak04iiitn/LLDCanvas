'use client'

/**
 * UML arrowhead definitions — must live in the SAME SVG as React Flow edge
 * paths (Chromium often won't paint marker-end/start across SVG roots).
 *
 * Shared by the main editor (CanvasView) and studio canvases.
 * IDs are instance-prefixed so multiple React Flow trees never collide.
 */

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

const MarkerPrefixContext = createContext('uml-')

export function useMarkerPrefix() {
  return useContext(MarkerPrefixContext) || 'uml-'
}

/** Provides a unique marker-id prefix for one React Flow tree. */
export function UMLMarkerScope({ children }: { children: ReactNode }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const prefix = useMemo(() => `uml${rawId}-`, [rawId])
  return (
    <MarkerPrefixContext.Provider value={prefix}>{children}</MarkerPrefixContext.Provider>
  )
}

function MarkerSet({ prefix, dark }: { prefix: string; dark: boolean }) {
  const stroke = dark ? '#9CA3AF' : '#374151'
  const hollowFill = dark ? '#111111' : 'white'
  const suffix = dark ? '-dark' : ''
  const id = (name: string) => `${prefix}${name}${suffix}`

  return (
    <>
      <marker
        id={id('inheritance')}
        markerWidth={10}
        markerHeight={10}
        refX={0}
        refY={4.5}
        orient="auto"
        overflow="visible"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 0 0 L 9 4.5 L 0 9 Z"
          fill={hollowFill}
          stroke={stroke}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </marker>
      <marker
        id={id('realization')}
        markerWidth={10}
        markerHeight={10}
        refX={0}
        refY={4.5}
        orient="auto"
        overflow="visible"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 0 0 L 9 4.5 L 0 9 Z"
          fill={hollowFill}
          stroke={stroke}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </marker>
      <marker
        id={id('dependency')}
        markerWidth={9}
        markerHeight={9}
        refX={8}
        refY={4}
        orient="auto-start-reverse"
        overflow="visible"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 0 0 L 8 4 L 0 8"
          fill="none"
          stroke={stroke}
          strokeWidth={1.4}
          strokeLinecap="butt"
          strokeLinejoin="round"
        />
      </marker>
      <marker
        id={id('aggregation')}
        markerWidth={14}
        markerHeight={10}
        refX={0}
        refY={4.5}
        orient="auto-start-reverse"
        overflow="visible"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 0 4.5 L 6.5 0 L 13 4.5 L 6.5 9 Z"
          fill={hollowFill}
          stroke={stroke}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </marker>
      <marker
        id={id('composition')}
        markerWidth={14}
        markerHeight={10}
        refX={0}
        refY={4.5}
        orient="auto-start-reverse"
        overflow="visible"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 0 4.5 L 6.5 0 L 13 4.5 L 6.5 9 Z"
          fill={stroke}
          stroke={stroke}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </marker>
    </>
  )
}

/**
 * Portals marker <defs> into this canvas's React Flow edges SVG.
 * Render as a child of <ReactFlow> (inside UMLMarkerScope).
 */
export function UMLMarkers() {
  const prefix = useMarkerPrefix()
  const hostRef = useRef<HTMLDivElement>(null)
  const [edgeSvg, setEdgeSvg] = useState<SVGSVGElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || !prefix) return

    const root = host.closest('.react-flow') ?? host.parentElement
    if (!root) return

    const sync = () => {
      const svg =
        (root.querySelector('svg.react-flow__edges') as SVGSVGElement | null) ??
        (root.querySelector('.react-flow__viewport svg') as SVGSVGElement | null)
      setEdgeSvg(prev => (prev === svg ? prev : svg))
    }

    sync()
    const mo = new MutationObserver(() => sync())
    mo.observe(root, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [prefix])

  return (
    <>
      <div
        ref={hostRef}
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      />
      {edgeSvg &&
        createPortal(
          <defs data-uml-markers={prefix}>
            <MarkerSet prefix={prefix} dark={false} />
            <MarkerSet prefix={prefix} dark />
          </defs>,
          edgeSvg,
        )}
    </>
  )
}
