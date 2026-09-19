'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Loader2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ConfirmVariant = 'danger' | 'warning' | 'default'

export interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  /** When true, parent owns the loading spinner (e.g. async already tracked outside). */
  loading?: boolean
  icon?: LucideIcon
}

const VARIANT = {
  danger: {
    iconWrap: 'bg-red-50 text-red-600 ring-1 ring-red-100',
    confirm: 'bg-red-600 text-white hover:bg-red-700',
  },
  warning: {
    iconWrap: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    confirm: 'bg-amber-600 text-white hover:bg-amber-700',
  },
  default: {
    iconWrap: 'bg-brand-tint text-brand ring-1 ring-brand/15',
    confirm: 'bg-brand text-brand-foreground hover:bg-brand-hover',
  },
} as const

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading: controlledLoading,
  icon: Icon = AlertTriangle,
}: ConfirmModalProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  const loading = controlledLoading ?? internalLoading
  const titleId = useId()
  const descId = useId()
  const confirmRef = useRef<HTMLButtonElement>(null)
  const styles = VARIANT[variant]

  useEffect(() => {
    if (!open) {
      setInternalLoading(false)
      return
    }
    const t = window.setTimeout(() => confirmRef.current?.focus(), 50)
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, loading, onClose])

  async function handleConfirm() {
    if (loading) return
    try {
      if (controlledLoading === undefined) setInternalLoading(true)
      await onConfirm()
    } finally {
      if (controlledLoading === undefined) setInternalLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
          <motion.button
            type="button"
            aria-label="Dismiss"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 bg-ink/40"
            onClick={() => { if (!loading) onClose() }}
          />

          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[380px] rounded-xl border border-hairline bg-paper-elevated shadow-[0_16px_48px_rgba(32,31,28,0.16)]"
          >
            <div className="px-5 pt-5 pb-4">
              <div className="flex gap-3.5">
                <div className={cn(
                  'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  styles.iconWrap,
                )}>
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    id={titleId}
                    className="font-sans text-[15px] font-semibold leading-snug text-ink"
                  >
                    {title}
                  </h2>
                  {description && (
                    <div
                      id={descId}
                      className="mt-1.5 font-sans text-[13px] leading-relaxed text-ink-muted [&_span]:font-sans [&_strong]:font-sans [&_strong]:font-semibold [&_strong]:text-ink"
                    >
                      {description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-hairline bg-[#F7F4EC]/50 px-5 py-3">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="rounded-lg px-3.5 py-2 font-sans text-[13px] font-medium text-ink-muted transition hover:bg-hairline/80 hover:text-ink disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 font-sans text-[13px] font-semibold transition disabled:opacity-60',
                  styles.confirm,
                )}
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
