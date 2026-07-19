'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquarePlus, X, Bug, Lightbulb, TrendingUp, Wrench,
  Send, CheckCircle2, ChevronRight, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useSession } from '@/lib/auth-client'

// ─── Types ────────────────────────────────────────────────────────────────────

type FbType = 'bug' | 'feature' | 'improvement' | 'other'

const FB_TYPES: { id: FbType; label: string; Icon: typeof Bug; color: string; bg: string; ring: string; desc: string }[] = [
  { id: 'bug',         label: 'Bug Report',     Icon: Bug,              color: 'text-red-600',     bg: 'bg-red-50',     ring: 'ring-red-200',     desc: 'Something is broken or not working as expected' },
  { id: 'feature',     label: 'Feature Request', Icon: Lightbulb,        color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200',   desc: 'Suggest a new feature or capability' },
  { id: 'improvement', label: 'Improvement',     Icon: TrendingUp,       color: 'text-brand',       bg: 'bg-brand-tint', ring: 'ring-brand/20',    desc: 'Make an existing feature better' },
  { id: 'other',       label: 'Other',           Icon: Wrench,           color: 'text-ink-muted',   bg: 'bg-hairline',   ring: 'ring-hairline',    desc: 'General feedback or anything else' },
]

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function FeedbackWidget() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const [open,     setOpen]     = useState(false)
  const [step,     setStep]     = useState<'type' | 'form' | 'done'>('type')
  const [fbType,   setFbType]   = useState<FbType | null>(null)
  const [title,    setTitle]    = useState('')
  const [desc,     setDesc]     = useState('')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [submitting, setSub]    = useState(false)
  const [error,    setError]    = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  // Pre-fill from session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? '')
      setEmail(session.user.email ?? '')
    }
  }, [session])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleOpen() {
    setOpen(true)
    setStep('type')
    setFbType(null)
    setTitle('')
    setDesc('')
    setError('')
  }

  function handleSelectType(t: FbType) {
    setFbType(t)
    setStep('form')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !desc.trim() || !fbType) return
    setSub(true)
    setError('')
    try {
      await api.feedback.submit({
        type:        fbType,
        title:       title.trim(),
        description: desc.trim(),
        name:        name.trim() || undefined,
        email:       email.trim() || undefined,
        pageUrl:     window.location.href,
      })
      setStep('done')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSub(false)
    }
  }

  const selectedType = FB_TYPES.find(t => t.id === fbType)

  // Only show on the home/landing page
  if (pathname !== '/') return null

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>

      {/* Floating trigger button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={open ? () => setOpen(false) : handleOpen}
        className="flex h-13 w-13 items-center justify-center rounded-full
                   bg-brand text-white shadow-lg shadow-brand/30
                   transition-colors hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2"
        aria-label="Send feedback"
        style={{ height: 52, width: 52 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open
            ? <motion.span key="x"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="h-5 w-5" /></motion.span>
            : <motion.span key="fb" initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><MessageSquarePlus className="h-5 w-5" /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Tooltip label */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="pointer-events-none absolute bottom-1 right-14 whitespace-nowrap
                       rounded-lg bg-ink/90 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-md"
          >
            Feedback
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="absolute bottom-16 right-0 w-[360px] overflow-hidden rounded-2xl
                       border border-hairline bg-paper shadow-xl shadow-black/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-hairline bg-paper-elevated px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10">
                  <MessageSquarePlus className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {step === 'type' ? 'Share Feedback' : step === 'done' ? 'Thank you!' : selectedType?.label}
                  </p>
                  <p className="text-[10px] text-ink-faint">
                    {step === 'type' ? 'Help us improve LLDCanvas' : step === 'done' ? "We'll look into it" : selectedType?.desc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-hairline hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <AnimatePresence mode="wait">

              {/* Step 1 — pick type */}
              {step === 'type' && (
                <motion.div key="type" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="p-4 space-y-2">
                  {FB_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectType(t.id)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-hairline bg-paper p-3.5
                                 text-left transition-all hover:border-brand/30 hover:bg-brand/5 hover:shadow-sm"
                    >
                      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1', t.bg, t.ring)}>
                        <t.Icon className={cn('h-4.5 w-4.5', t.color)} style={{ height: 18, width: 18 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">{t.label}</p>
                        <p className="text-[11px] text-ink-faint leading-relaxed">{t.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-ink-faint/50 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Step 2 — form */}
              {step === 'form' && (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-3 p-4"
                >
                  {/* Back */}
                  <button
                    type="button"
                    onClick={() => setStep('type')}
                    className="flex items-center gap-1 text-[11px] text-ink-faint hover:text-ink transition-colors"
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" /> Back
                  </button>

                  <div className="space-y-2.5">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={fbType === 'bug' ? 'e.g. Export button not working' : 'Brief summary…'}
                        maxLength={200}
                        required
                        className="h-9 w-full rounded-lg border border-hairline-strong bg-paper px-3 text-sm
                                   outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        placeholder={fbType === 'bug' ? 'Steps to reproduce, what you expected vs what happened…' : 'Describe your idea or feedback in detail…'}
                        maxLength={5000}
                        required
                        rows={4}
                        className="w-full resize-none rounded-lg border border-hairline-strong bg-paper px-3 py-2 text-sm
                                   outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                      />
                    </div>

                    {/* Only show name/email if not logged in */}
                    {!session?.user && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Name</label>
                          <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your name"
                            className="h-9 w-full rounded-lg border border-hairline-strong bg-paper px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Email</label>
                          <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            type="email"
                            className="h-9 w-full rounded-lg border border-hairline-strong bg-paper px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !title.trim() || !desc.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5
                               text-sm font-semibold text-white shadow-md shadow-brand/20
                               transition-all hover:bg-brand/90 disabled:opacity-50"
                  >
                    {submitting
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                      : <><Send className="h-4 w-4" /> Submit Feedback</>
                    }
                  </button>
                </motion.form>
              )}

              {/* Step 3 — success */}
              {step === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 px-6 py-10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200"
                  >
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </motion.div>
                  <div>
                    <p className="text-base font-semibold text-ink">Feedback received!</p>
                    <p className="mt-1 text-sm text-ink-faint">
                      Our team reviews every submission. We&apos;ll act on it as soon as possible.
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-hairline px-6 py-2 text-sm font-medium text-ink-muted hover:bg-hairline transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
