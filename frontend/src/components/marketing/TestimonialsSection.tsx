'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, Quote, X, Send, CheckCircle2, Loader2,
  Sparkles, PenLine, LogIn,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useSession } from '@/lib/auth'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  _id:      string
  name:     string
  role:     string
  content:  string
  rating:   number
  avatar:   string
  featured: boolean
}

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK: Testimonial[] = [
  { _id: '1',  name: 'Arjun Mehta',     role: 'SDE-2 @ Google',              rating: 5, featured: true,  avatar: '', content: 'LLDCanvas completely changed how I prepare for system design interviews. The visual diagram editor paired with the problem library is exactly what I needed.' },
  { _id: '2',  name: 'Priya Sharma',    role: 'CS Final Year, IIT Delhi',     rating: 5, featured: false, avatar: '', content: 'I cracked my Amazon interview after using this platform for just 3 weeks. The Interview Mode timer made me so much faster at thinking through designs.' },
  { _id: '3',  name: 'Rahul Gupta',     role: 'Backend Engineer @ Swiggy',    rating: 5, featured: false, avatar: '', content: 'The design pattern templates are a game changer. I can visualise any pattern in seconds and understand how it maps to real code.' },
  { _id: '4',  name: 'Sneha Patel',     role: 'SDE @ Microsoft',              rating: 5, featured: false, avatar: '', content: 'Draft Notation is pure genius. Writing diagrams in plain English felt so natural. I recommended LLDCanvas to my entire team.' },
  { _id: '5',  name: 'Vikram Singh',    role: 'Software Architect',           rating: 5, featured: false, avatar: '', content: 'Real-time collaboration means I can review LLD designs with my team synchronously. This is enterprise-grade tooling for free.' },
  { _id: '6',  name: 'Ananya Reddy',    role: 'SDE-3 @ Flipkart',            rating: 5, featured: false, avatar: '', content: 'The analytics showing my average time per problem helped me identify my weak spots. My design speed improved 40% in a month.' },
  { _id: '7',  name: 'Karan Bhatia',    role: 'CS Student, NIT Trichy',       rating: 5, featured: false, avatar: '', content: 'As a student, having a free tier with 23 design patterns and community discussions is incredibly generous. I use this daily.' },
  { _id: '8',  name: 'Divya Nair',      role: 'Product Engineer @ Razorpay',  rating: 5, featured: false, avatar: '', content: 'The community discussion on each problem is like having LeetCode discussions but specifically for LLD. Absolutely brilliant.' },
  { _id: '9',  name: 'Rohan Verma',     role: 'Principal SDE @ Oracle',       rating: 5, featured: false, avatar: '', content: 'Code execution integrated right into the diagram tool is something I have wanted for years. Finally it exists.' },
  { _id: '10', name: 'Meera Krishnan',  role: 'Tech Lead @ PhonePe',          rating: 5, featured: false, avatar: '', content: 'My whole interview prep is now centralised — UML diagrams, pattern templates, code, problems — one platform, zero distractions.' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'h-6 w-6' : 'h-3 w-3'
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={cn(cls, n <= rating ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-ink-faint/20')} />
      ))}
    </div>
  )
}

// ─── Testimonial card ─────────────────────────────────────────────────────────

function TestimonialCard({ t, accent = false }: { t: Testimonial; accent?: boolean }) {
  return (
    <div className={cn(
      'group relative mx-3 flex w-[320px] shrink-0 flex-col gap-3 overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
      accent
        ? 'border-brand/30 bg-brand/3 shadow-[0_2px_12px_rgba(61,106,82,0.08)]'
        : 'border-hairline bg-paper shadow-sm',
    )}>
      <Quote className="absolute right-4 top-4 h-8 w-8 text-ink-faint/8 transition-colors group-hover:text-brand/10" />
      <StarRow rating={t.rating} />
      <p className="flex-1 text-[13px] leading-relaxed text-ink-muted line-clamp-4">
        &ldquo;{t.content}&rdquo;
      </p>
      <div className="flex items-center gap-3 border-t border-hairline pt-3">
        {t.avatar ? (
          <img
            src={t.avatar}
            alt={`${t.name}${t.role ? `, ${t.role}` : ''} — LLDCanvas user`}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-hairline"
          />
        ) : (
          <div className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1',
            accent ? 'bg-brand/15 text-brand ring-brand/20' : 'bg-hairline text-ink-muted ring-hairline-strong',
          )}>
            {initials(t.name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-ink">{t.name}</p>
          {t.role && <p className="truncate text-[10px] text-ink-faint">{t.role}</p>}
        </div>
        {t.featured && (
          <span className="ml-auto shrink-0 rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand">
            Featured
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Infinite marquee row ─────────────────────────────────────────────────────

function MarqueeRow({ items, reverse = false, speed = 40 }: {
  items: Testimonial[]
  reverse?: boolean
  speed?: number
}) {
  const doubled = [...items, ...items]
  const duration = items.length * speed

  return (
    <div className="overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <motion.div
        className="flex"
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t._id}-${i}`} t={t} accent={t.featured} />
        ))}
      </motion.div>
    </div>
  )
}

// ─── Submit panel ─────────────────────────────────────────────────────────────

function SubmitPanel({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession()
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [role,    setRole]    = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  const starLabels = ['Terrible', 'Not great', 'Okay', 'Good', 'Amazing!']
  const activeRating = hovered || rating

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating || !content.trim()) return
    setLoading(true)
    try {
      await api.testimonials.submit({ role: role.trim(), content: content.trim(), rating })
      setDone(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 340, damping: 36 }}
      className="fixed right-0 top-0 z-50 flex h-full w-[440px] max-w-[100vw] flex-col border-l border-hairline bg-paper shadow-2xl"
    >
      {/* Decorative top bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand/50 via-brand to-emerald-400/50" />

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-hairline bg-paper-elevated px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/20">
            <Quote className="h-4 w-4 text-brand" />
          </div>
          <div>
            <p className="font-semibold text-ink">Share your experience</p>
            <p className="text-[11px] text-ink-faint">Help others discover LLDCanvas</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-hairline hover:text-ink transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* Not logged in */}
          {!session ? (
            <motion.div
              key="unauth"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-5 px-8 py-16 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-brand/20">
                <LogIn className="h-7 w-7 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-ink">Sign in to leave a review</p>
                <p className="mt-1.5 text-sm text-ink-faint leading-relaxed">
                  Your testimonial will be linked to your account and shown on this page after a quick review.
                </p>
              </div>
              <Link
                href="/auth/sign-in"
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 hover:bg-brand/90 transition-colors"
              >
                <LogIn className="h-4 w-4" /> Sign in to continue
              </Link>
            </motion.div>
          ) : done ? (
            /* Success */
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5 px-8 py-16 text-center"
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
                  Your testimonial is pending review. Once approved it will appear right here on this page.
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Usually approved within 24 hours
              </div>
              <button
                onClick={onClose}
                className="mt-2 rounded-xl border border-hairline px-6 py-2.5 text-sm font-medium text-ink-muted hover:bg-hairline transition-colors"
              >
                Close
              </button>
            </motion.div>
          ) : (
            /* Form */
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 px-6 py-6"
            >
              {/* Greeting */}
              <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
                <p className="text-sm font-medium text-ink">
                  Hi, <span className="text-brand">{session.user.name?.split(' ')[0]}</span> 👋
                </p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Your review will appear as <strong>{session.user.name}</strong>.
                </p>
              </div>

              {/* Stars */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  Overall rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <motion.button
                      key={n}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                    >
                      <Star className={cn(
                        'h-9 w-9 transition-colors',
                        n <= activeRating ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-ink-faint/20',
                      )} />
                    </motion.button>
                  ))}
                  {activeRating > 0 && (
                    <motion.span
                      key={activeRating}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-1 text-sm font-semibold text-amber-600"
                    >
                      {starLabels[activeRating - 1]}
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  Your role / title <span className="text-ink-faint/40">(optional)</span>
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
                  rows={5}
                  className="w-full resize-none rounded-lg border border-hairline-strong bg-paper px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
                <p className="text-right text-[10px] text-ink-faint">{content.length}/1000</p>
              </div>

              <button
                type="submit"
                disabled={loading || !rating || !content.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-md shadow-brand/20 transition-all hover:bg-brand/90 disabled:opacity-50"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                  : <><Send className="h-4 w-4" /> Submit Testimonial</>
                }
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK)
  const [panelOpen,    setPanelOpen]    = useState(false)

  useEffect(() => {
    api.testimonials.getApproved()
      .then(data => { if (data.length >= 3) setTestimonials(data) })
      .catch(() => {})
  }, [])

  const mid  = Math.ceil(testimonials.length / 2)
  const row1 = [...testimonials.slice(0, mid)]
  const row2 = [...testimonials.slice(mid)]
  while (row1.length < 4) row1.push(...row1)
  while (row2.length < 4) row2.push(...row2)

  return (
    <>
      <section id="testimonials" className="scroll-mt-20 overflow-hidden py-20">
        {/* Section header */}
        <div className="mx-auto mb-12 max-w-7xl px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="h-px flex-1 bg-hairline" />
            <span className="flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              from our community
            </span>
            <div className="h-px flex-1 bg-hairline" />
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
                Loved by engineers,{' '}
                <em className="not-italic text-brand">trusted by interviewers.</em>
              </h2>
              <p className="mt-2 text-sm text-ink-faint">
                Real stories from developers who aced their LLD and system design interview rounds.
              </p>
            </div>

            {/* Right side: rating badge + CTA */}
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-hairline bg-paper-elevated px-4 py-3 shadow-sm">
                <div className="text-center">
                  <p className="text-2xl font-black text-ink">4.9</p>
                  <StarRow rating={5} />
                </div>
                <div className="h-8 w-px bg-hairline" />
                <div>
                  <p className="text-[11px] font-semibold text-ink">Avg. Rating</p>
                  <p className="text-[10px] text-ink-faint">{testimonials.length}+ reviews</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPanelOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand shadow-sm hover:bg-brand/10 transition-colors"
              >
                <PenLine className="h-4 w-4" />
                Write a review
              </motion.button>
            </div>
          </div>
        </div>

        {/* Dual scrolling rows */}
        <div className="space-y-4">
        <MarqueeRow items={row1} reverse={false} speed={22} />
        <MarqueeRow items={row2} reverse={true}  speed={27} />
        </div>
      </section>

      {/* Sliding submit panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
              onClick={() => setPanelOpen(false)}
            />
            <SubmitPanel onClose={() => setPanelOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
