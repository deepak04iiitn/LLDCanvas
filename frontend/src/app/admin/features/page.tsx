'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Map, Brain, Search, Bug, Gamepad2, Wrench, RefreshCcw,
  Pencil, TrendingUp, DollarSign, ArrowRight, BarChart3,
  BookOpen, CheckCircle2, FileText,
} from 'lucide-react'
import { adminApi } from '@/lib/admin-api'
import { FEATURES, type FeatureConfig } from './_lib/configs'

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  plannr:       Map,
  'daily-quiz': Brain,
  detective:    Search,
  'debug-lab':  Bug,
  roguelike:    Gamepad2,
  'debug-fix':  Wrench,
  refactor:     RefreshCcw,
  'change-one': Pencil,
  evolution:    TrendingUp,
  budget:       DollarSign,
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface FeatureStats {
  total:     number
  published: number
  drafts:    number
}

// ─── Feature card ────────────────────────────────────────────────────────────

function FeatureCard({
  feature, Icon, stats, loading,
}: {
  feature: FeatureConfig
  Icon:    React.ElementType
  stats:   FeatureStats | undefined
  loading: boolean
}) {
  return (
    <Link
      href={`/admin/features/${feature.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-paper-elevated transition-all hover:border-hairline-strong hover:shadow-md"
    >
      {/* Coloured header */}
      <div className={`flex items-center gap-3 border-b px-5 py-4 ${feature.bgClass} ${feature.borderClass}`}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 ${feature.textClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className={`font-semibold leading-tight ${feature.textClass}`}>{feature.label}</p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-faint">{feature.description}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between px-5 py-3.5">
        {loading ? (
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-3.5 w-14 animate-pulse rounded bg-hairline" />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <span>
              <span className="font-semibold text-ink">{stats?.total ?? '—'}</span>
              <span className="ml-1 text-xs text-ink-faint">total</span>
            </span>
            <span>
              <span className="font-semibold text-emerald-600">{stats?.published ?? '—'}</span>
              <span className="ml-1 text-xs text-ink-faint">live</span>
            </span>
            <span>
              <span className="font-semibold text-ink-faint">{stats?.drafts ?? '—'}</span>
              <span className="ml-1 text-xs text-ink-faint">drafts</span>
            </span>
          </div>
        )}
        <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

// ─── Summary stat card ───────────────────────────────────────────────────────

function SummaryCard({ label, value, Icon, sub, accent }: {
  label: string; value: string | number; Icon: React.ElementType; sub?: string; accent?: boolean
}) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border bg-paper-elevated p-4 ${accent ? 'border-brand/30' : 'border-hairline'}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent ? 'bg-brand text-brand-foreground' : 'bg-brand-tint text-brand'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{label}</p>
        <p className="text-xl font-bold text-ink">{value}</p>
        {sub && <p className="text-xs text-ink-faint">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Hub page ────────────────────────────────────────────────────────────────

export default function FeaturesHubPage() {
  const [stats, setStats]   = useState<Record<string, FeatureStats>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [packsRes, quizRes] = await Promise.all([
          adminApi.studio.listPacks(),
          adminApi.learn.listQuiz(),
        ])

        const s: Record<string, FeatureStats> = {}

        // Studio features
        const packTypeBySlug: Record<string, string> = {
          'debug-fix':  'debugger',
          refactor:     'refactor',
          'change-one': 'change_one',
          evolution:    'evolution',
          budget:       'budget',
        }
        for (const [slug, packType] of Object.entries(packTypeBySlug)) {
          const packs = (packsRes.packs ?? []).filter(p => p.type === packType)
          s[slug] = {
            total:     packs.length,
            published: packs.filter(p => p.status === 'published').length,
            drafts:    packs.filter(p => p.status === 'draft').length,
          }
        }

        // Daily Quiz
        const questions = quizRes.questions ?? []
        s['daily-quiz'] = {
          total:     questions.length,
          published: questions.filter(q => q.status === 'published').length,
          drafts:    questions.filter(q => q.status === 'draft').length,
        }

        // Features without direct pack data yet
        for (const slug of ['plannr', 'detective', 'debug-lab', 'roguelike']) {
          s[slug] = { total: 0, published: 0, drafts: 0 }
        }

        setStats(s)
      } catch {
        /* show zeros */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Summary totals
  const allStats       = Object.values(stats)
  const totalProblems  = allStats.reduce((acc, s) => acc + s.total,     0)
  const totalPublished = allStats.reduce((acc, s) => acc + s.published, 0)
  const totalDrafts    = allStats.reduce((acc, s) => acc + s.drafts,    0)

  return (
    <div className="space-y-8 p-4 sm:p-6">

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-medium text-ink">Feature Dashboard</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Analytics, metrics, and problem management for all {FEATURES.length} platform features
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total problems"  value={totalProblems}   Icon={BookOpen}     accent />
        <SummaryCard label="Live / published" value={totalPublished}  Icon={CheckCircle2} />
        <SummaryCard label="Drafts"           value={totalDrafts}     Icon={FileText} />
        <SummaryCard label="Features"         value={FEATURES.length} Icon={BarChart3} />
      </div>

      {/* Feature cards */}
      <div>
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink-faint">All Features</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map(feature => {
            const Icon = ICON_MAP[feature.slug] ?? BookOpen
            return (
              <FeatureCard
                key={feature.slug}
                feature={feature}
                Icon={Icon}
                stats={stats[feature.slug]}
                loading={loading}
              />
            )
          })}
        </div>
      </div>

    </div>
  )
}
