'use client'

import { useState, useCallback } from 'react'
import {
  getSmoothStepPath,
  getBezierPath,
  EdgeLabelRenderer,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react'
import { useEditor } from '@/contexts/EditorContext'
import type { UMLEdgeData, RelationshipType } from '@/types'

// ─── Marker resolution ────────────────────────────────────────────────────────

function markerId(base: string, dark: boolean) {
  return `url(#${base}${dark ? '-dark' : ''})`
}

interface MarkerConfig {
  markerEnd?: string
  markerStart?: string
  strokeDasharray?: string
}

function getMarkers(type: RelationshipType, dark: boolean): MarkerConfig {
  switch (type) {
    case 'inheritance':
      return { markerEnd: markerId('uml-inheritance', dark) }
    case 'realization':
      return { markerEnd: markerId('uml-realization', dark), strokeDasharray: '6 3' }
    case 'dependency':
      return { markerEnd: markerId('uml-dependency', dark), strokeDasharray: '6 3' }
    case 'association':
      return { markerEnd: markerId('uml-dependency', dark) }
    case 'bidirectional':
      return {
        markerEnd: markerId('uml-dependency', dark),
        markerStart: markerId('uml-dependency', dark),
      }
    case 'aggregation':
      return { markerEnd: markerId('uml-aggregation', dark) }
    case 'composition':
      return { markerEnd: markerId('uml-composition', dark) }
    default:
      return {}
  }
}

// ─── Multiplicity label ────────────────────────────────────────────────────────

interface MultiLabelProps {
  value?: string
  x: number
  y: number
  onChange: (val: string) => void
  dark: boolean
}

const MULTIPLICITY_OPTIONS = ['1', '0..1', '1..*', '0..*']

function MultiplicityLabel({ value, x, y, onChange, dark }: MultiLabelProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [showPicker, setShowPicker] = useState(false)

  if (!value && !editing) return null

  function commit() {
    onChange(draft.trim())
    setEditing(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); commit() }
    if (e.key === 'Escape') { setDraft(value ?? ''); setEditing(false) }
    e.stopPropagation()
  }

  const textColor = dark ? '#D1D5DB' : '#374151'
  const bgColor = dark ? '#1C1C1E' : '#FFFFFF'

  return (
    <div
      style={{ transform: `translate(-50%, -50%)`, position: 'absolute', left: x, top: y, zIndex: 10 }}
      className="nodrag nopan pointer-events-auto"
    >
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            value={draft}
            autoFocus
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            className="w-14 rounded border border-indigo-300 px-1 text-center font-mono text-[10px]
                       outline-none ring-1 ring-indigo-300"
            style={{ background: bgColor, color: textColor }}
          />
          <div className="absolute top-full left-0 mt-1 z-50 flex gap-0.5 rounded border bg-white shadow-md p-1">
            {MULTIPLICITY_OPTIONS.map(opt => (
              <button
                key={opt}
                onMouseDown={e => { e.preventDefault(); onChange(opt); setEditing(false) }}
                className="rounded px-1.5 py-0.5 font-mono text-[10px] text-gray-700 hover:bg-indigo-50"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <span
          onDoubleClick={e => { e.stopPropagation(); setDraft(value ?? ''); setEditing(true) }}
          className="cursor-text rounded px-1 font-mono text-[10px] font-medium select-none"
          style={{ color: textColor, background: bgColor, border: `1px solid transparent` }}
          title="Double-click to edit multiplicity"
        >
          {value}
        </span>
      )}
    </div>
  )
}

// ─── Main UML Edge ─────────────────────────────────────────────────────────────

export function UMLEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data: rawData,
  selected,
  source,
  target,
}: EdgeProps) {
  const edgeData = (rawData ?? {}) as Partial<UMLEdgeData>
  const relType: RelationshipType = edgeData.relationshipType ?? 'association'
  const { theme } = useEditor()
  const dark = theme === 'dark'
  const { setEdges } = useReactFlow()

  const edgeColor = dark ? '#9CA3AF' : '#374151'
  const selectedColor = '#6366F1'
  const stroke = selected ? selectedColor : edgeColor
  const strokeWidth = selected ? 2 : 1.5

  const markers = getMarkers(relType, dark)

  // ── Self-loop (source === target) ──────────────────────────────────────────
  const isSelfLoop = source === target
  let edgePath: string
  let labelX: number
  let labelY: number

  if (isSelfLoop) {
    const offset = 80
    ;[edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX: targetX + offset,
      targetY: targetY - offset,
      targetPosition,
    })
    labelX = sourceX + offset / 2
    labelY = sourceY - offset / 2
  } else {
    ;[edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 8,
    })
  }

  // ── Multiplicity update helpers ────────────────────────────────────────────
  const updateMultiplicity = useCallback(
    (field: 'sourceMultiplicity' | 'targetMultiplicity', val: string) => {
      setEdges(eds =>
        eds.map(e =>
          e.id === id
            ? { ...e, data: { ...(e.data ?? {}), [field]: val || undefined } }
            : e,
        ),
      )
    },
    [id, setEdges],
  )

  // ── Source/target label positions ──────────────────────────────────────────
  const srcLabelX = sourceX + (targetX - sourceX) * 0.12
  const srcLabelY = sourceY + (targetY - sourceY) * 0.12
  const tgtLabelX = sourceX + (targetX - sourceX) * 0.88
  const tgtLabelY = sourceY + (targetY - sourceY) * 0.88

  return (
    <>
      {/* Invisible wider hit area for easier selection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        className="react-flow__edge-interaction"
      />

      {/* Visible edge path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={markers.strokeDasharray}
        markerEnd={markers.markerEnd}
        markerStart={markers.markerStart}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors"
      />

      {/* Edge label (relationship type) — shown when selected */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{ transform: 'translate(-50%, -50%)', position: 'absolute', left: labelX, top: labelY, zIndex: 20 }}
            className="nodrag nopan pointer-events-none"
          >
            <span
              className="rounded-full border border-indigo-200 bg-indigo-50 px-1.5 py-0.5
                         text-[9px] font-medium text-indigo-600 dark:border-indigo-700
                         dark:bg-indigo-950/60 dark:text-indigo-400"
            >
              {relType}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Multiplicity labels */}
      <EdgeLabelRenderer>
        <MultiplicityLabel
          value={edgeData.sourceMultiplicity}
          x={srcLabelX}
          y={srcLabelY}
          onChange={v => updateMultiplicity('sourceMultiplicity', v)}
          dark={dark}
        />
        <MultiplicityLabel
          value={edgeData.targetMultiplicity}
          x={tgtLabelX}
          y={tgtLabelY}
          onChange={v => updateMultiplicity('targetMultiplicity', v)}
          dark={dark}
        />
      </EdgeLabelRenderer>
    </>
  )
}
