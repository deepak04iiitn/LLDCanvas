'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RelationshipType } from '@/types'

interface RelationshipPickerProps {
  open: boolean
  position: { x: number; y: number }
  onSelect: (type: RelationshipType) => void
  onClose: () => void
}

// ─── Mini SVG icons for each relationship type ────────────────────────────────

function LineIcon({ dashed = false }: { dashed?: boolean }) {
  return (
    <line
      x1="2" y1="8" x2="30" y2="8"
      stroke="currentColor" strokeWidth="1.5"
      strokeDasharray={dashed ? '4 2' : undefined}
    />
  )
}

function ArrowIcon({ dashed = false, both = false }: { dashed?: boolean; both?: boolean }) {
  return (
    <>
      <line
        x1="2" y1="8" x2="26" y2="8"
        stroke="currentColor" strokeWidth="1.5"
        strokeDasharray={dashed ? '4 2' : undefined}
      />
      <polyline points="20,4 28,8 20,12" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {both && <polyline points="10,4 2,8 10,12" fill="none" stroke="currentColor" strokeWidth="1.5" />}
    </>
  )
}

function TriangleIcon({ dashed = false }: { dashed?: boolean }) {
  return (
    <>
      <line
        x1="2" y1="8" x2="16" y2="8"
        stroke="currentColor" strokeWidth="1.5"
        strokeDasharray={dashed ? '4 2' : undefined}
      />
      <polygon points="16,3 28,8 16,13" fill="white" stroke="currentColor" strokeWidth="1.5" />
    </>
  )
}

function DiamondIcon({ filled = false }: { filled?: boolean }) {
  return (
    <>
      <line x1="16" y1="8" x2="32" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <polygon
        points="0,8 7,3 14,8 7,13"
        fill={filled ? 'currentColor' : 'white'}
        stroke="currentColor" strokeWidth="1.5"
      />
    </>
  )
}

// ─── Picker items ─────────────────────────────────────────────────────────────

const ITEMS: { type: RelationshipType; label: string; icon: React.ReactNode; hint: string }[] = [
  {
    type: 'inheritance',
    label: 'Inheritance',
    icon: <TriangleIcon />,
    hint: 'Child → Parent (extends)',
  },
  {
    type: 'realization',
    label: 'Realization',
    icon: <TriangleIcon dashed />,
    hint: 'Class → Interface (implements)',
  },
  {
    type: 'association',
    label: 'Association',
    icon: <ArrowIcon />,
    hint: 'General uses relationship',
  },
  {
    type: 'bidirectional',
    label: 'Bidirectional',
    icon: <ArrowIcon both />,
    hint: 'Mutual association',
  },
  {
    type: 'dependency',
    label: 'Dependency',
    icon: <ArrowIcon dashed />,
    hint: 'Uses temporarily (dashed)',
  },
  {
    type: 'aggregation',
    label: 'Aggregation',
    icon: <DiamondIcon />,
    hint: 'Part → Whole (hollow diamond)',
  },
  {
    type: 'composition',
    label: 'Composition',
    icon: <DiamondIcon filled />,
    hint: 'Part → Composite (filled diamond)',
  },
]

// ─── Picker component ─────────────────────────────────────────────────────────

export function RelationshipPicker({ open, position, onSelect, onClose }: RelationshipPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
    }
  }, [open, onClose])

  // Compute clamped position so picker never goes off-screen
  const PANEL_W = 260
  const PANEL_H = ITEMS.length * 40 + 12
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const left = Math.min(position.x, vw - PANEL_W - 8)
  const top = Math.min(position.y, vh - PANEL_H - 8)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.94, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
          style={{ left, top }}
          className="pointer-events-auto fixed z-50 w-[260px] overflow-hidden rounded-xl
                     border border-gray-200 bg-white shadow-xl shadow-black/10
                     dark:border-[#2C2C2E] dark:bg-[#1C1C1E]"
        >
          {/* Header */}
          <div className="border-b border-gray-100 px-3 py-2 dark:border-[#2C2C2E]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Choose Relationship
            </p>
          </div>

          {/* Items */}
          <div className="p-1.5">
            {ITEMS.map(item => (
              <button
                key={item.type}
                onClick={() => onSelect(item.type)}
                className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2
                           text-left transition-colors
                           hover:bg-indigo-50 hover:text-indigo-700
                           dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300"
              >
                {/* Icon */}
                <svg
                  width="36"
                  height="16"
                  viewBox="0 0 36 16"
                  className="shrink-0 text-gray-500 group-hover:text-indigo-500"
                >
                  {item.icon}
                </svg>

                {/* Label + hint */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700
                                dark:text-gray-200 dark:group-hover:text-indigo-300">
                    {item.label}
                  </p>
                  <p className="truncate text-[10px] text-gray-400 dark:text-gray-600">
                    {item.hint}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
