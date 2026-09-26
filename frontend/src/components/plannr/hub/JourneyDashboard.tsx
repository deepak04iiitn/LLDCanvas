'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, BookOpen, Briefcase, Trophy, Zap, Clock, Target, TrendingUp } from 'lucide-react'
import { journeyApi, type JourneyProfile, type JourneyRecommendation, type JourneyActivity } from '@/lib/plannr-api'
import { JourneySidebar } from '@/components/plannr/shared/JourneySidebar'
import { ProgressRing } from '@/components/plannr/shared/ProgressRing'
import { DailyPracticeWidget } from '@/components/shared/DailyPracticeWidget'
import { SpacedRepetitionWidget } from '@/components/plannr/hub/SpacedRepetitionWidget'
import { cn } from '@/lib/utils'

function RecommendationCard({ rec }: { rec: JourneyRecommendation }) {
  return (
    <div className="rounded-xl border border-brand/20 bg-brand-tint/30 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
          <Target size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-wider text-brand mb-1">
            Next Recommended
          </p>
          <h3 className="font-serif text-base font-medium text-ink">{rec.topicTitle}</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">{rec.reason}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-ink-faint">
              <Clock size={11} />
              ~{rec.estimatedMinutes} min
            </span>
            <Link
              href={`/plannr/topic/${rec.topicSlug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Start Now
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickStats({ completed, total, percent }: { completed: number; total: number; percent: number }) {
  const stats = [
    { label: 'Topics Done', value: `${completed}/${total}`, icon: BookOpen, color: 'text-blue-600' },
    { label: 'Progress', value: `${percent}%`, icon: TrendingUp, color: 'text-green-600' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map(s => (
        <div key={s.label} className="rounded-xl border border-hairline bg-paper-elevated p-4">
          <div className={cn('mb-1', s.color)}>
            <s.icon size={16} strokeWidth={1.75} />
          </div>
          <p className="font-mono text-lg font-bold text-ink">{s.value}</p>
          <p className="text-[11px] text-ink-faint">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

function ActivityItem({ activity }: { activity: JourneyActivity }) {
  const typeLabels: Record<string, string> = {
    read: 'Read topic', practice: 'Practiced', quiz: 'Quiz', design: 'Designed',
    explain: 'Explained', followup: 'Follow-up', experience: 'Experience',
  }
  const perfColors: Record<string, string> = {
    excellent: 'text-green-600', good: 'text-blue-600', fair: 'text-amber-600', poor: 'text-red-500',
  }
  return (
    <div className="flex items-start gap-2.5 py-2">
      <div className="h-1.5 w-1.5 mt-1.5 rounded-full bg-brand shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-ink truncate">
          {typeLabels[activity.activityType] ?? activity.activityType}
          {activity.topicSlug && <span className="text-ink-muted"> · {activity.topicSlug.replace(/-/g, ' ')}</span>}
        </p>
        {activity.performance && (
          <p className={cn('text-[11px] font-medium', perfColors[activity.performance] ?? 'text-ink-faint')}>
            {activity.performance}
          </p>
        )}
      </div>
    </div>
  )
}

const ROLE_LABELS: Record<string, string> = {
  sde1: 'SDE-1', sde2: 'SDE-2', backend: 'Backend Engineer',
  fullstack: 'Full Stack Engineer', general: 'General LLD',
}
const LEVEL_LABELS: Record<string, string> = {
  scratch: 'Starting from scratch', oop: 'Know OOP',
  'basic-lld': 'Know basic LLD', solving: 'Already solving problems',
}

export function JourneyDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    profile: JourneyProfile | null
    recommendation: JourneyRecommendation | null
    recentActivity: JourneyActivity[]
    completedCount: number
    totalTopics: number
    progressPercent: number
    onboarded: boolean
  } | null>(null)

  useEffect(() => {
    journeyApi.getDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!data || !data.onboarded || !data.profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-paper flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <div className="mb-6 text-5xl">🧭</div>
          <h1 className="font-serif text-3xl font-medium text-ink mb-3">Your Plannr</h1>
          <p className="text-[15px] leading-relaxed text-ink-muted mb-8">
            A guided preparation system that takes you from "I don't know how to prepare for LLD" to
            "I can approach, solve, explain, and defend any LLD interview."
          </p>
          <div className="mb-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: '📚', label: 'Learn theory', sub: 'Simple, clear explanations' },
              { icon: '🎯', label: 'Practice problems', sub: 'Real interview questions' },
              { icon: '📊', label: 'Track progress', sub: '15 skill dimensions' },
            ].map(f => (
              <div key={f.label} className="rounded-xl border border-hairline bg-paper-elevated p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-[12px] font-medium text-ink">{f.label}</p>
                <p className="text-[11px] text-ink-faint">{f.sub}</p>
              </div>
            ))}
          </div>
          <Link
            href="/plannr/setup"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Start Your Journey
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  const { profile, recommendation, recentActivity, completedCount, totalTopics, progressPercent } = data
  const daysLeft = profile.preparationDays - Math.floor(
    (Date.now() - new Date(profile.startDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-paper">
      <JourneySidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
              {ROLE_LABELS[profile.targetRole] ?? profile.targetRole} · {LEVEL_LABELS[profile.currentLevel] ?? profile.currentLevel}
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">
              Your Plannr
            </h1>
            <p className="mt-2 text-[14px] text-ink-muted">
              {daysLeft > 0 ? `${daysLeft} days left in your ${profile.preparationDays}-day plan` : 'Journey complete — keep practicing!'}
            </p>
          </div>

          {/* Daily Practice Widget — shown at the top of the dashboard */}
          <div className="mb-6">
            <DailyPracticeWidget />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Progress card */}
              <div className="rounded-2xl border border-hairline bg-paper-elevated p-6">
                <div className="flex items-center gap-6">
                  <ProgressRing percent={progressPercent} size={88} label="complete" />
                  <div className="flex-1">
                    <h2 className="font-serif text-lg font-medium text-ink mb-1">Overall Progress</h2>
                    <p className="text-[13px] text-ink-muted mb-3">
                      {completedCount} of {totalTopics} topics completed
                    </p>
                    <div className="w-full h-1.5 rounded-full bg-hairline overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              {recommendation ? (
                <RecommendationCard rec={recommendation} />
              ) : (
                <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <p className="font-medium text-green-800">All topics completed! You are interview-ready.</p>
                  <Link href="/plannr/experiences" className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-green-700">
                    Try interview experiences <ArrowRight size={12} />
                  </Link>
                </div>
              )}

              {/* Recent activity */}
              {recentActivity.length > 0 && (
                <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
                  <h3 className="font-medium text-[13px] text-ink mb-3">Recent Activity</h3>
                  <div className="divide-y divide-hairline/50">
                    {recentActivity.map(a => (
                      <ActivityItem key={a._id} activity={a} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <QuickStats completed={completedCount} total={totalTopics} percent={progressPercent} />

              {/* Spaced repetition */}
              <SpacedRepetitionWidget />

              {/* Quick links */}
              <div className="rounded-xl border border-hairline bg-paper-elevated p-4 space-y-1">
                <p className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider mb-2">Quick Access</p>
                {[
                  { href: '/plannr/roadmap', label: 'View Roadmap', icon: '🗺️' },
                  { href: '/plannr/experiences', label: 'Interview Experiences', icon: '💼' },
                  { href: '/plannr/cheatsheet', label: 'Pre-Interview Cheat Sheet', icon: '📋' },
                  { href: '/plannr/skills', label: 'My Skill Profile', icon: '📊' },
                  { href: '/plannr/tips', label: 'Interview Tips', icon: '💡' },
                ].map(({ href, label, icon }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-ink-muted hover:bg-paper hover:text-ink transition-colors">
                    <span>{icon}</span> {label}
                    <ArrowRight size={11} className="ml-auto opacity-0 group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
