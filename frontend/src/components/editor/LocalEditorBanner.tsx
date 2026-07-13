'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudUpload, X, LogIn } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { setMigratePending } from '@/hooks/useLocalDiagram'

interface LocalEditorBannerProps {
  /** Called to dismiss the banner for this session */
  onDismiss?: () => void
}

export function LocalEditorBanner({ onDismiss }: LocalEditorBannerProps) {
  const [authOpen, setAuthOpen] = useState(false)

  function handleSignIn() {
    // Mark that when sign-in succeeds, the dashboard should migrate local data
    setMigratePending()
    setAuthOpen(true)
  }

  return (
    <>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 38, delay: 0.6 }}
        className="flex items-center gap-3 border-t border-indigo-100 bg-indigo-50
                   px-4 py-2.5
                   dark:border-indigo-900/40 dark:bg-indigo-950/40"
        role="banner"
      >
        {/* Icon */}
        <CloudUpload className="h-4 w-4 shrink-0 text-indigo-500" />

        {/* Message */}
        <p className="flex-1 text-sm text-indigo-800 dark:text-indigo-300">
          <span className="font-medium">Working locally</span>
          {' — sign in to save to the cloud and access your diagrams on any device.'}
        </p>

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5
                     text-xs font-semibold text-white shadow-sm transition-all
                     hover:bg-indigo-700 active:scale-[0.97]"
        >
          <LogIn className="h-3.5 w-3.5" />
          Sign in to save
        </button>

        {/* Dismiss */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss banner"
            className="rounded-md p-1 text-indigo-400 transition-colors
                       hover:bg-indigo-100 hover:text-indigo-600
                       dark:hover:bg-indigo-900/50"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </motion.div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode="signin" />
    </>
  )
}

// ─── Dismissable wrapper (hides the banner once X is clicked) ─────────────────
export function DismissableLocalBanner() {
  const [visible, setVisible] = useState(true)

  return (
    <AnimatePresence>
      {visible && <LocalEditorBanner onDismiss={() => setVisible(false)} />}
    </AnimatePresence>
  )
}
