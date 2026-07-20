'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

export type PlanName = 'free' | 'pro' | 'ultimate'

export interface PlanLimits {
  codeExecutionsPerDay: number
  patternTemplates: number
  exportFormats: string[]
  problemAccess: 'easy_medium' | 'all'
  hintsAccess: boolean
  communityDiscussion: boolean
  revisionBookmarks: boolean
  interviewSessionsPerMonth: number
  maxCollaborators: number
  activityTimeline: boolean
  versionHistory: boolean
  analyticsLevel: 'none' | 'basic' | 'full'
  betaFeatures: boolean
}

interface PlanData {
  plan: PlanName
  limits: PlanLimits
  subscription: {
    id: string
    razorpaySubId: string
    status: string
    billingInterval: string
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
  } | null
}

interface PlanState extends PlanData {
  loading: boolean
}

const DEFAULT_FREE_LIMITS: PlanLimits = {
  codeExecutionsPerDay: 15,
  patternTemplates: 10,
  exportFormats: [],
  problemAccess: 'easy_medium',
  hintsAccess: false,
  communityDiscussion: false,
  revisionBookmarks: false,
  interviewSessionsPerMonth: 0,
  maxCollaborators: 0,
  activityTimeline: false,
  versionHistory: false,
  analyticsLevel: 'none',
  betaFeatures: false,
}

const CACHE_KEY = 'lld_plan_v1'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function readCache(): PlanData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw) as { data: PlanData; ts: number }
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function writeCache(data: PlanData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

export function clearPlanCache() {
  try { localStorage.removeItem(CACHE_KEY) } catch {}
}

// Module-level singleton: one in-flight fetch shared across all usePlan() callers
let _inflight: Promise<PlanData> | null = null
let _resolved: PlanData | null = null
const _listeners = new Set<(data: PlanData) => void>()

function fetchPlan(): Promise<PlanData> {
  if (_inflight) return _inflight
  _inflight = api.billing.plan().then((raw: Record<string, unknown>) => {
    const data: PlanData = {
      plan:         raw.plan as PlanName,
      limits:       raw.limits as unknown as PlanLimits,
      subscription: raw.subscription as PlanData['subscription'],
    }
    _resolved = data
    writeCache(data)
    _listeners.forEach(fn => fn(data))
    _inflight = null
    return data
  }).catch(() => {
    _inflight = null
    throw new Error('plan fetch failed')
  })
  return _inflight
}

export function invalidatePlan() {
  _resolved = null
  _inflight = null
  clearPlanCache()
}

export function usePlan() {
  const cached = typeof window !== 'undefined' ? (readCache() ?? _resolved) : null

  const [state, setState] = useState<PlanState>(() => ({
    plan:         cached?.plan         ?? 'free',
    limits:       cached?.limits       ?? DEFAULT_FREE_LIMITS,
    subscription: cached?.subscription ?? null,
    // If we have a cache hit, no loading flash
    loading: cached === null,
  }))

  const applyData = useCallback((data: PlanData) => {
    setState({ ...data, loading: false })
  }, [])

  useEffect(() => {
    // Already have fresh resolved data - nothing to do
    if (_resolved && !state.loading) return

    // Subscribe to updates from the shared fetch
    _listeners.add(applyData)

    // Fire the shared fetch (no-ops if already in flight)
    fetchPlan().catch(() => {
      setState(prev => ({ ...prev, loading: false }))
    })

    return () => { _listeners.delete(applyData) }
  }, [applyData, state.loading])

  const refresh = useCallback(async () => {
    invalidatePlan()
    setState(prev => ({ ...prev, loading: true }))
    try {
      const data = await fetchPlan()
      applyData(data)
    } catch {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [applyData])

  // Key fix: isFree / isPro are false while loading so gates stay hidden
  // until we actually know the plan — preventing the lock-flicker
  const isPro      = !state.loading && (state.plan === 'pro' || state.plan === 'ultimate')
  const isUltimate = !state.loading && state.plan === 'ultimate'
  const isFree     = !state.loading && state.plan === 'free'

  return { ...state, isPro, isUltimate, isFree, refresh }
}
