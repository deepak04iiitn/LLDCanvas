'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, CheckCircle2, Loader2, X, Quote, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onClose: () => void
}

export function TestimonialModal({ open, onClose }: Props) {
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [role,    setRole]    = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating || !content.trim()) return
    setLoading(true)
    try {
      await api.testimonials.submit({ role: role.trim(), content: content.trim(), rating })
      setDone(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    onClose()
    setTimeout(() => { setDone(false); setRating(0); setRole(''); setContent('') }, 300)
  }

  const starLabels = ['Terrible', 'Not great', 'Okay', 'Good', 'Amazing!']
  const activeRating = hovered || rating

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-[480px] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-hairline bg-paper shadow-2xl"
          >
            {/* Decorative gradient top */}
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand/60 via-brand to-emerald-400/60" />

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                  <Quote className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <p className="font-semibold text-ink">Share your experience</p>
                  <p className="text-xs text-ink-faint">Help others discover LLDCanvas</p>
                </div>
              </div>
              <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-hairline hover:text-ink transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 px-6 pb-8 pt-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200"
                  >
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </motion.div>
                  <div>
                    <p className="text-base font-semibold text-ink">Thank you so much!</p>
                    <p className="mt-1.5 text-sm text-ink-faint leading-relaxed">
                      Your testimonial is under review. Once approved it will appear on our landing page.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-amber-700">Usually approved within 24 hours</span>
                  </div>
                  <button onClick={handleClose} className="mt-1 rounded-xl border border-hairline px-6 py-2 text-sm font-medium text-ink-muted hover:bg-hairline transition-colors">
                    Close
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
                  {/* Star rating */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      How would you rate LLDCanvas? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <motion.button
                          key={n}
                          type="button"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setRating(n)}
                          onMouseEnter={() => setHovered(n)}
                          onMouseLeave={() => setHovered(0)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star
                            className={cn(
                              'h-8 w-8 transition-colors',
                              n <= activeRating ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-ink-faint/30',
                            )}
                          />
                        </motion.button>
                      ))}
                      {activeRating > 0 && (
                        <motion.span
                          key={activeRating}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="ml-2 text-sm font-medium text-amber-600"
                        >
                          {starLabels[activeRating - 1]}
                        </motion.span>
                      )}
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      Your role / title <span className="text-ink-faint/50">(optional)</span>
                    </label>
                    <input
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      placeholder='e.g. "SDE-2 @ Amazon" or "CS student, IIT Bombay"'
                      maxLength={100}
                      className="h-9 w-full rounded-lg border border-hairline-strong bg-paper px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      Your testimonial <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Tell us how LLDCanvas helped you in your interview prep…"
                      maxLength={1000}
                      required
                      rows={4}
                      className="w-full resize-none rounded-lg border border-hairline-strong bg-paper px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                    <p className="text-right text-[10px] text-ink-faint">{content.length}/1000</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !rating || !content.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3
                               text-sm font-semibold text-white shadow-md shadow-brand/20
                               transition-all hover:bg-brand/90 disabled:opacity-50"
                  >
                    {loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                      : <><Send className="h-4 w-4" /> Submit Testimonial</>
                    }
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
