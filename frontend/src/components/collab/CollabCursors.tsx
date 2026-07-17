'use client'

import { useStore } from '@xyflow/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCollab } from '@/contexts/CollabContext'

function CursorSVG({ color }: { color: string }) {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 2L2 16.5L6.5 12L9.5 18.5L11.5 17.5L8.5 11H14L2 2Z"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CollabCursors() {
  const { collaborators, cursors } = useCollab()

  // Get current viewport transform from React Flow store
  const transform = useStore(s => s.transform)
  const [tx, ty, zoom] = transform

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 1000 }}>
      <AnimatePresence>
        {collaborators.map(user => {
          const pos = cursors.get(user.userId)
          if (!pos) return null

          // Convert flow coordinates to screen coordinates
          const screenX = pos.x * zoom + tx
          const screenY = pos.y * zoom + ty

          return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
              style={{
                position:  'absolute',
                left:      screenX,
                top:       screenY,
                transform: 'translate(-2px, -2px)',
                transition: 'left 75ms linear, top 75ms linear',
              }}
            >
              <CursorSVG color={user.color} />
              <div
                className="mt-0.5 ml-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white shadow-sm"
                style={{ backgroundColor: user.color, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {user.name.split(' ')[0]}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
