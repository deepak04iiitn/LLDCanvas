'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

// ─── Why this exists ───────────────────────────────────────────────────────────
// The landing page draws real connected diagrams (class boxes + relationship
// lines) as its actual layout mechanism, not screenshots. Connector lines are
// computed from each node's REAL rendered bounding box (measured via
// getBoundingClientRect after layout/resize/font-load), never from hand-typed
// coordinates — two independently-guessed numbers is how a line ends up not
// touching the box it's supposed to connect to.

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

interface Rect { x: number; y: number; w: number; h: number }
type Side = 'left' | 'right' | 'top' | 'bottom'

function anchorPoint(r: Rect, side: Side) {
  switch (side) {
    case 'left':   return { x: r.x, y: r.y + r.h / 2 }
    case 'right':  return { x: r.x + r.w, y: r.y + r.h / 2 }
    case 'top':    return { x: r.x + r.w / 2, y: r.y }
    case 'bottom': return { x: r.x + r.w / 2, y: r.y + r.h }
  }
}

function elbowPath(a: { x: number; y: number }, b: { x: number; y: number }, bend: 'h' | 'v') {
  if (bend === 'h') {
    const midX = (a.x + b.x) / 2
    return `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`
  }
  const midY = (a.y + b.y) / 2
  return `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`
}

// A 'h' bend exits/enters both anchors horizontally (correct for left/right
// sides) — its final approach segment runs at a fixed y, which is exactly
// wrong for a 'top'/'bottom' anchor: that segment ends up traveling flush
// along the target box's own border for most of its length instead of
// dropping into it perpendicularly, reading as the line visually fusing with
// the box edge. Deriving the bend from the actual sides being connected
// (rather than trusting a caller-supplied default) makes that whole bug class
// structurally impossible instead of something to remember per-edge.
function autoBend(fromSide: Side, toSide: Side): 'h' | 'v' {
  const vertical = (s: Side) => s === 'top' || s === 'bottom'
  return vertical(fromSide) && vertical(toSide) ? 'v' : 'h'
}

// ─── Marker defs (brand-colored, shared across every diagram on the page) ─────
function DiagramDefs() {
  return (
    <defs>
      <marker id="mk-arrow" markerWidth="9" markerHeight="8" refX="7.5" refY="4" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M0,0 L8,4 L0,8" fill="none" stroke="var(--brand)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </marker>
      <marker id="mk-diamond" markerWidth="13" markerHeight="9" refX="11" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M0,4.5 L5.5,0 L11,4.5 L5.5,9 Z" fill="var(--paper-elevated)" stroke="var(--brand)" strokeWidth="1.2" />
      </marker>
      <marker id="mk-diamond-filled" markerWidth="13" markerHeight="9" refX="11" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M0,4.5 L5.5,0 L11,4.5 L5.5,9 Z" fill="var(--brand)" stroke="var(--brand)" strokeWidth="1" />
      </marker>
    </defs>
  )
}

// ─── Stage context — lets a DiagramNode register its element for measurement ──
interface StageCtx {
  registerNode: (id: string) => (el: HTMLDivElement | null) => void
}
const StageContext = createContext<StageCtx | null>(null)

export interface DiagramEdge {
  id: string
  from: { node: string; side: Side }
  to: { node: string; side: Side }
  /** Defaults to whatever `from`/`to` sides imply (see autoBend) — only set this to override that. */
  bend?: 'h' | 'v'
  variant?: 'solid' | 'dashed'
  marker?: 'arrow' | 'diamond' | 'diamond-filled' | 'none'
  /** Which end the marker sits on. Composition/aggregation diamonds belong on
   * the "whole" end, which is usually `from` rather than `to` — default 'end'
   * covers plain directional arrows (dependency, realization). */
  markerSide?: 'start' | 'end'
}

interface DiagramStageProps {
  children: ReactNode
  edges: DiagramEdge[]
  className?: string
  style?: CSSProperties
}

export function DiagramStage({ children, edges, className = '', style }: DiagramStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeEls = useRef<Map<string, HTMLDivElement>>(new Map())
  const callbackCache = useRef<Map<string, (el: HTMLDivElement | null) => void>>(new Map())
  const [rects, setRects] = useState<Map<string, Rect>>(new Map())

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const cBox = container.getBoundingClientRect()
    const next = new Map<string, Rect>()
    nodeEls.current.forEach((el, id) => {
      const b = el.getBoundingClientRect()
      next.set(id, { x: b.left - cBox.left, y: b.top - cBox.top, w: b.width, h: b.height })
    })
    setRects(next)
  }, [])

  const registerNode = useCallback((id: string) => {
    let cb = callbackCache.current.get(id)
    if (!cb) {
      cb = (el) => {
        if (el) nodeEls.current.set(id, el)
        else nodeEls.current.delete(id)
      }
      callbackCache.current.set(id, cb)
    }
    return cb
  }, [])

  // Mount-only: measure once, then re-measure on resize of the stage/nodes and
  // once web fonts finish loading (Fraunces/Geist swapping in reflows text,
  // which changes box heights after the first paint).
  useIsomorphicLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    nodeEls.current.forEach((el) => ro.observe(el))
    window.addEventListener('resize', measure)
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(measure).catch(() => {})
    }
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  return (
    <StageContext.Provider value={{ registerNode }}>
      <div ref={containerRef} className={cn('relative', className)} style={style}>
        {children}
        {/* Rendered after (and z-indexed above) the nodes — otherwise each
            box's opaque background paints over the very marker/line-end that's
            supposed to visibly touch its border, making connections look
            broken right where they matter most. */}
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible" aria-hidden>
          <DiagramDefs />
          {edges.map((e) => {
            const a = rects.get(e.from.node)
            const b = rects.get(e.to.node)
            if (!a || !b) return null
            const p1 = anchorPoint(a, e.from.side)
            const p2 = anchorPoint(b, e.to.side)
            const d = elbowPath(p1, p2, e.bend ?? autoBend(e.from.side, e.to.side))
            const markerUrl =
              e.marker === 'arrow' ? 'url(#mk-arrow)'
              : e.marker === 'diamond' ? 'url(#mk-diamond)'
              : e.marker === 'diamond-filled' ? 'url(#mk-diamond-filled)'
              : undefined
            const markerSide = e.markerSide ?? 'end'
            return (
              <path
                key={e.id}
                d={d}
                fill="none"
                stroke="var(--ink-faint)"
                strokeWidth={1.3}
                strokeDasharray={e.variant === 'dashed' ? '5 4' : undefined}
                markerEnd={markerSide === 'end' ? markerUrl : undefined}
                markerStart={markerSide === 'start' ? markerUrl : undefined}
              />
            )
          })}
        </svg>
      </div>
    </StageContext.Provider>
  )
}

interface DiagramNodeProps {
  id: string
  className?: string
  style?: CSSProperties
  children: ReactNode
  /** 'absolute' (default) for freely-pinned layouts; 'flow' to let a parent flex/grid position it normally. */
  mode?: 'absolute' | 'flow'
}

export function DiagramNode({ id, className = '', style, children, mode = 'absolute' }: DiagramNodeProps) {
  const ctx = useContext(StageContext)
  if (!ctx) throw new Error('DiagramNode must be rendered inside a DiagramStage')
  return (
    <div ref={ctx.registerNode(id)} className={cn(mode === 'absolute' && 'absolute', className)} style={style}>
      {children}
    </div>
  )
}

// ─── Visual primitive: a class/interface box, matching the editor's own notation ─
interface DiagramBoxProps {
  name: string
  stereotype?: string
  fields?: string[]
  methods?: string[]
  dashed?: boolean
  className?: string
}

export function DiagramBox({ name, stereotype, fields = [], methods = [], dashed = false, className = '' }: DiagramBoxProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border bg-paper-elevated text-left shadow-sm',
        dashed ? 'border-dashed border-hairline-strong' : 'border-hairline-strong',
        className,
      )}
    >
      <div className="border-b border-hairline px-3 py-2">
        {stereotype && (
          <p className="font-mono text-[9px] leading-tight text-gold italic">&laquo;{stereotype}&raquo;</p>
        )}
        <p className="font-mono text-[12px] font-semibold text-ink">{name}</p>
      </div>
      {fields.length > 0 && (
        <div className="border-b border-hairline px-3 py-1.5">
          {fields.map((f, i) => (
            <p key={i} className="font-mono text-[10.5px] leading-5 text-ink-muted">{f}</p>
          ))}
        </div>
      )}
      {methods.length > 0 && (
        <div className="px-3 py-1.5">
          {methods.map((m, i) => (
            <p key={i} className="font-mono text-[10.5px] leading-5 text-brand">{m}</p>
          ))}
        </div>
      )}
    </div>
  )
}
