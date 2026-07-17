'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCollab } from '@/contexts/CollabContext'

export function CollabPresenceDock() {
  const { collaborators, connected, myColor, myName } = useCollab()
  const [expanded, setExpanded] = useState(false)

  // Only render when connected and there are others in the session
  if (!connected && collaborators.length === 0) return null

  const total = collaborators.length + 1 // +1 = current user

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-3 left-3 z-30"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex items-center gap-1.5 rounded-full border border-hairline bg-paper/90 px-2.5 py-1.5 shadow-md backdrop-blur-sm">

        {/* Pulsing live dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>

        {/* Avatar stack — current user first */}
        <div className="flex items-center">
          {/* Me */}
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full border border-white text-[9px] font-bold text-white shadow-sm"
            style={{ backgroundColor: myColor }}
            title={`${myName} (you)`}
          >
            {myName?.[0]?.toUpperCase() ?? '?'}
          </div>

          {/* Others */}
          <AnimatePresence>
            {collaborators.slice(0, 4).map((u, i) => (
              <motion.div
                key={u.userId}
                initial={{ opacity: 0, scale: 0.5, x: -4 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15, delay: i * 0.04 }}
                className="-ml-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white text-[9px] font-bold text-white shadow-sm"
                style={{ backgroundColor: u.color, zIndex: 10 - i }}
                title={u.name}
              >
                {u.name[0].toUpperCase()}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Count label */}
        <span className="text-[10px] font-medium text-ink-muted">
          {total === 1 ? 'Just you' : `${total} online`}
        </span>
      </div>

      {/* Expanded names tooltip */}
      <AnimatePresence>
        {expanded && collaborators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-0 mb-2 min-w-[140px] overflow-hidden rounded-xl border border-hairline bg-paper shadow-lg"
          >
            {/* Me */}
            <div className="flex items-center gap-2 px-3 py-2 text-xs">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ backgroundColor: myColor }}
              >
                {myName?.[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="font-medium text-ink">{myName}</span>
              <span className="ml-auto text-[10px] text-ink-faint">you</span>
            </div>
            {collaborators.map(u => (
              <div key={u.userId} className="flex items-center gap-2 border-t border-hairline px-3 py-2 text-xs">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: u.color }}
                >
                  {u.name[0].toUpperCase()}
                </span>
                <span className="font-medium text-ink">{u.name}</span>
                <span className="ml-auto capitalize text-[10px] text-ink-faint">{u.role}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
