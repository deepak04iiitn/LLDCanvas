'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Eye, ThumbsUp, Search, X, ChevronRight,
  Rss, TrendingUp,
} from 'lucide-react'
import { api, type BlogSummary } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtDateLong(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const CATEGORY_ACCENT: Record<string, { pill: string; bar: string }> = {
  'System Design':          { pill: 'bg-blue-50 text-blue-700 border-blue-200',       bar: 'bg-blue-500' },
  'Low-Level Design':       { pill: 'bg-brand/10 text-brand border-brand/20',         bar: 'bg-brand' },
  'Design Patterns':        { pill: 'bg-purple-50 text-purple-700 border-purple-200', bar: 'bg-purple-500' },
  'Object-Oriented Design': { pill: 'bg-amber-50 text-amber-700 border-amber-200',    bar: 'bg-amber-500' },
  'Interview Prep':         { pill: 'bg-rose-50 text-rose-700 border-rose-200',       bar: 'bg-rose-500' },
  'Backend Engineering':    { pill: 'bg-slate-100 text-slate-700 border-slate-200',   bar: 'bg-slate-500' },
}

function accent(cat: string) {
  return CATEGORY_ACCENT[cat] ?? { pill: 'bg-ink/5 text-ink-muted border-ink/10', bar: 'bg-ink-faint' }
}

function CategoryPill({ cat, small = false }: { cat: string; small?: boolean }) {
  const a = accent(cat)
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-semibold tracking-wide uppercase',
      small ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]',
      a.pill,
    )}>
      {cat}
    </span>
  )
}

// ─── Featured hero card (top story) ──────────────────────────────────────────

function HeroCard({ blog }: { blog: BlogSummary }) {
  const a = accent(blog.category)
  return (
    <Link href={`/blog/${blog.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-white transition-all duration-300 hover:border-brand/30 hover:shadow-xl">

        <div className="p-8 sm:p-10">
          {/* Label */}
          <div className="mb-5 flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand">
              <TrendingUp className="h-3 w-3" /> Featured
            </span>
            <CategoryPill cat={blog.category} />
          </div>

          {/* Title */}
          <h2 className="font-serif text-3xl font-bold leading-tight text-ink transition-colors group-hover:text-brand sm:text-4xl lg:text-[2.6rem]">
            {blog.title}
          </h2>

          {/* Excerpt */}
          <p className="mt-4 text-base leading-relaxed text-ink-muted line-clamp-3">
            {blog.excerpt}
          </p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-[12px] text-ink-faint">
            <span>{blog.author?.name ?? 'LLDCanvas Team'}</span>
            <span className="h-1 w-1 rounded-full bg-ink-faint/40" />
            <span>{fmtDateLong(blog.publishedAt)}</span>
            <span className="h-1 w-1 rounded-full bg-ink-faint/40" />
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {blog.readingTime} min read</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {blog.views.toLocaleString()} views</span>
            <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {blog.likes}</span>
          </div>

          {/* CTA */}
          <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-brand">
            Read article
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Secondary featured card ──────────────────────────────────────────────────

function SecondaryCard({ blog }: { blog: BlogSummary }) {
  const a = accent(blog.category)
  return (
    <Link href={`/blog/${blog.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-hairline bg-white transition-all duration-200 hover:border-brand/30 hover:shadow-md">
      <div className="flex flex-1 flex-col p-5">
        <CategoryPill cat={blog.category} small />
        <h3 className="mt-3 text-base font-bold leading-snug text-ink transition-colors group-hover:text-brand line-clamp-2">
          {blog.title}
        </h3>
        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-muted line-clamp-2">{blog.excerpt}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-ink-faint">
            <Clock className="h-3 w-3" /> {blog.readingTime} min
            <span className="mx-1 h-1 w-1 rounded-full bg-ink-faint/30" />
            <Eye className="h-3 w-3" /> {blog.views.toLocaleString()}
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-brand opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

// ─── List-row card (archive style) ───────────────────────────────────────────

function RowCard({ blog, index }: { blog: BlogSummary; index: number }) {
  const a = accent(blog.category)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/blog/${blog.slug}`} className="group flex items-start gap-5 border-b border-hairline py-5 transition-colors hover:bg-paper-elevated/60">
        {/* Issue number */}
        <span className="mt-0.5 w-7 shrink-0 font-mono text-[11px] font-bold text-ink-faint/40 tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Left accent bar */}
        <div className="mt-1.5 h-full w-0.5 shrink-0 self-stretch rounded-full bg-brand opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <CategoryPill cat={blog.category} small />
            {blog.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="rounded px-1.5 py-0.5 text-[9px] font-medium bg-hairline text-ink-faint uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-sm font-bold leading-snug text-ink transition-colors group-hover:text-brand sm:text-base">
            {blog.title}
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted line-clamp-1 hidden sm:block">{blog.excerpt}</p>
        </div>

        {/* Right meta */}
        <div className="shrink-0 text-right hidden md:block">
          <p className="text-[11px] text-ink-faint">{fmtDate(blog.publishedAt)}</p>
          <div className="mt-1.5 flex items-center justify-end gap-2 text-[10px] text-ink-faint/70">
            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {blog.readingTime}m</span>
            <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {blog.views.toLocaleString()}</span>
            <span className="flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" /> {blog.likes}</span>
          </div>
        </div>

        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BlogListingClient() {
  const [blogs,      setBlogs]      = useState<BlogSummary[]>([])
  const [featured,   setFeatured]   = useState<BlogSummary[]>([])
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [pages,      setPages]      = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [sort,       setSort]       = useState('latest')
  const debouncedSearch = useDebounce(search, 400)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.blog.categories().then(setCategories).catch(() => {})
    api.blog.list({ featured: true, limit: 3 }).then(r => setFeatured(r.blogs)).catch(() => {})
  }, [])

  const loadBlogs = useCallback(async (pg: number) => {
    setLoading(true)
    try {
      const r = await api.blog.list({
        category: activeCategory || undefined,
        q: debouncedSearch || undefined,
        sort,
        page: pg,
        limit: 10,
      })
      setBlogs(r.blogs)
      setTotal(r.total)
      setPage(r.page)
      setPages(r.pages)
    } catch {
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, activeCategory, sort])

  useEffect(() => { loadBlogs(1) }, [loadBlogs])

  function goPage(p: number) {
    loadBlogs(p)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const SORTS = [
    { value: 'latest',  label: 'Latest' },
    { value: 'popular', label: 'Popular' },
    { value: 'viewed',  label: 'Most Viewed' },
    { value: 'liked',   label: 'Most Liked' },
  ]

  return (
    <div className="min-h-screen bg-paper">

      {/* ── Chronicle Masthead ──────────────────────────────────────────────── */}
      <div className="border-b border-hairline-strong bg-paper">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">

          {/* Top strip */}
          <div className="flex items-center justify-between border-b border-hairline py-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-ink-faint uppercase tracking-widest">
              <Rss className="h-3 w-3 text-brand" />
              LLDCanvas Chronicle
            </div>
            <p className="hidden text-[10px] font-mono text-ink-faint sm:block">{today}</p>
            <p className="text-[10px] font-mono text-ink-faint">{total > 0 ? `${total} articles` : 'Engineering Blog'}</p>
          </div>

          {/* Main masthead */}
          <div className="py-8 text-center">
            <h1 className="font-serif text-5xl font-black tracking-tight text-ink sm:text-6xl lg:text-7xl">
              The Chronicle
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
              Expert articles on System Design, Low-Level Design, Design Patterns, and Software Engineering Interview Preparation
            </p>
          </div>

          {/* Category tab bar */}
          <div className="flex items-center gap-0 overflow-x-auto border-t border-hairline-strong scrollbar-none pb-0">
            {[{ category: '', count: total }, ...categories].map(c => {
              const label = c.category || 'All Topics'
              const active = activeCategory === c.category
              return (
                <button
                  key={c.category}
                  onClick={() => setActiveCategory(c.category)}
                  className={cn(
                    'shrink-0 border-b-2 px-4 py-3 text-[11px] font-semibold tracking-wide uppercase transition-all whitespace-nowrap',
                    active
                      ? 'border-brand text-brand'
                      : 'border-transparent text-ink-faint hover:text-ink hover:border-ink-faint/30',
                  )}
                >
                  {label}
                  <span className={cn(
                    'ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                    active ? 'bg-brand text-white' : 'bg-hairline text-ink-faint',
                  )}>
                    {c.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">

        {/* ── Featured editorial spread ────────────────────────────────────── */}
        {featured.length > 0 && !activeCategory && !debouncedSearch && page === 1 && (
          <div className="mt-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-hairline-strong" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ink-faint">Editor's Picks</span>
              <div className="h-px flex-1 bg-hairline-strong" />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {/* Main story */}
              <div className="lg:col-span-2">
                <HeroCard blog={featured[0]} />
              </div>

              {/* Side stories */}
              <div className="flex flex-col gap-5">
                {featured.slice(1, 3).map(b => (
                  <SecondaryCard key={b._id} blog={b} />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="mt-10 flex items-center gap-3">
              <div className="h-px flex-1 bg-hairline-strong" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ink-faint">All Articles</span>
              <div className="h-px flex-1 bg-hairline-strong" />
            </div>
          </div>
        )}

        {/* ── Search + sort toolbar ─────────────────────────────────────────── */}
        <div ref={listRef} className={cn('flex flex-wrap items-center gap-3', featured.length > 0 && !activeCategory && !debouncedSearch && page === 1 ? 'mt-5' : 'mt-10')}>
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="w-full rounded-lg border border-hairline-strong bg-white py-2 pl-8 pr-8 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 rounded-lg border border-hairline-strong bg-white p-1">
            {SORTS.map(s => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all',
                  sort === s.value ? 'bg-brand text-white' : 'text-ink-faint hover:text-ink',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active filters */}
        <AnimatePresence>
          {(activeCategory || debouncedSearch) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <span className="text-[11px] text-ink-faint">Filtered by:</span>
              {activeCategory && (
                <button
                  onClick={() => setActiveCategory('')}
                  className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand hover:bg-brand/20"
                >
                  {activeCategory} <X className="h-2.5 w-2.5" />
                </button>
              )}
              {debouncedSearch && (
                <button
                  onClick={() => setSearch('')}
                  className="flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-semibold text-ink-muted hover:bg-ink/10"
                >
                  &ldquo;{debouncedSearch}&rdquo; <X className="h-2.5 w-2.5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Article list ──────────────────────────────────────────────────── */}
        <div className="mt-4">
          {loading ? (
            <div className="space-y-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-start gap-5 border-b border-hairline py-5">
                  <div className="mt-1 h-3 w-6 animate-pulse rounded bg-hairline-strong" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-hairline-strong" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-hairline-strong" />
                    <div className="h-3 w-full animate-pulse rounded bg-hairline" />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 text-5xl font-black text-ink-faint/10 font-serif">¶</div>
              <p className="text-base font-bold text-ink">No articles found</p>
              <p className="mt-1 text-sm text-ink-faint">Try a different search or category</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('') }}
                className="mt-4 rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div>
              {blogs.map((blog, i) => (
                <RowCard key={blog._id} blog={blog} index={(page - 1) * 10 + i} />
              ))}
            </div>
          )}
        </div>

        {/* ── Pagination ────────────────────────────────────────────────────── */}
        {pages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-[11px] text-ink-faint">
              Page {page} of {pages} - {total} articles
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-hairline px-4 py-2 text-xs font-medium text-ink-muted hover:bg-hairline disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(pages, 5) }).map((_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => goPage(p)}
                    className={cn(
                      'h-8 w-8 rounded-lg text-xs font-semibold transition-all',
                      page === p ? 'bg-brand text-white' : 'border border-hairline text-ink-muted hover:bg-hairline',
                    )}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => goPage(page + 1)}
                disabled={page >= pages}
                className="rounded-lg border border-hairline px-4 py-2 text-xs font-medium text-ink-muted hover:bg-hairline disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-brand/20 bg-linear-to-br from-brand/5 to-transparent p-8 text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-brand/60">Ready to practice?</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-ink">Put the theory into practice</h2>
          <p className="mt-2 text-sm text-ink-muted">Solve 110+ LLD interview questions, run code, and design with 23 design patterns</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a href="/features/interview-questions" className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 transition-colors">
              Practice LLD Questions
            </a>
            <a href="/features" className="rounded-lg border border-hairline px-5 py-2.5 text-sm font-medium text-ink-muted hover:bg-hairline transition-colors">
              Explore Features
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
