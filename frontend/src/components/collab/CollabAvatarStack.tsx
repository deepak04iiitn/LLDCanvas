'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCollab } from '@/contexts/CollabContext'

function UserAvatar({ name, color, image, delay = 0 }: { name: string; color: string; image?: string; delay?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <Tooltip>
      <TooltipTrigger className="cursor-default focus:outline-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, x: 8 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2, delay }}
          className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} className="h-full w-full rounded-full object-cover" />
          ) : initials}
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-400" />
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {name} · Online
      </TooltipContent>
    </Tooltip>
  )
}

interface CollabAvatarStackProps {
  onOpenInvite: () => void
}

export function CollabAvatarStack({ onOpenInvite }: CollabAvatarStackProps) {
  const { collaborators, connected, myRole } = useCollab()

  const visible = collaborators.slice(0, 4)
  const overflow = collaborators.length - 4

  if (!connected && collaborators.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      {/* Live indicator */}
      {connected && collaborators.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="hidden text-[11px] font-medium text-emerald-700 sm:inline">Live</span>
        </motion.div>
      )}

      {/* Avatar stack */}
      <div className="flex items-center">
        <AnimatePresence mode="popLayout">
          {visible.map((user, i) => (
            <div key={user.userId} className="-ml-2 first:ml-0" style={{ zIndex: 10 - i }}>
              <UserAvatar
                name={user.name}
                color={user.color}
                image={user.image}
                delay={i * 0.05}
              />
            </div>
          ))}
        </AnimatePresence>

        {overflow > 0 && (
          <div className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-hairline text-[10px] font-semibold text-ink-muted shadow-sm">
            +{overflow}
          </div>
        )}
      </div>

      {/* Invite button — only owner/editor sees this */}
      {(myRole === 'owner' || myRole === 'editor') && (
        <Tooltip>
          <TooltipTrigger
            onClick={onOpenInvite}
            className="flex items-center gap-1.5 rounded-md border border-hairline-strong bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-hairline hover:text-ink"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0">
              <circle cx="5.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 11c0-2.21 2.015-4 4.5-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M10 8v4M8 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span className="hidden sm:inline">Invite</span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Invite collaborators</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
