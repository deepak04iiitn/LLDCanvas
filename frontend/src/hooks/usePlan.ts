'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { DEV_UNLOCK } from '@/lib/dev-unlock'

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
  /** Max people per diagram including owner (Pro = 2). */
  maxCollaborators: number
  /** New invites allowed per calendar month (Pro = 3). */
  collaborationsPerMonth: number
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
  collaborationsPerMonth: 0,
  activityTimeline: false,
  versionHistory: false,
  analyticsLevel: 'none',
  betaFeatures: false,
}

const CACHE_KEY = 'lld_plan_v2'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function readCache(): PlanData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw) as { data: PlanData; ts: number }
    if (Date.now() - ts > CACHE_TTL) return null
    return { ...data, limits: normalizeLimits(data.limits) }
  } catch {
    return null
  }
}

function writeCache(data: PlanData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

/** JSON turns Infinity into null — revive unlimited numeric plan fields. */
function reviveLimit(n: number | null | undefined, fallback = 0): number {
  if (n === null || n === Infinity) return Infinity
  if (typeof n !== 'number' || Number.isNaN(n)) return fallback
  return n
}

function normalizeLimits(raw: PlanLimits | Record<string, unknown> | null | undefined): PlanLimits {
  const base = { ...DEFAULT_FREE_LIMITS, ...(raw ?? {}) } as PlanLimits
  return {
    ...base,
    patternTemplates:          reviveLimit(base.patternTemplates as number | null, DEFAULT_FREE_LIMITS.patternTemplates),
    interviewSessionsPerMonth: reviveLimit(base.interviewSessionsPerMonth as number | null, 0),
    maxCollaborators:          reviveLimit(base.maxCollaborators as number | null, 0),
    collaborationsPerMonth:    reviveLimit(base.collaborationsPerMonth as number | null, 0),
  }
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
      limits:       normalizeLimits(raw.limits as PlanLimits),
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
  // Always start identical on server + client to avoid hydration mismatches.
  // Cache is applied after mount in useEffect.
  const [state, setState] = useState<PlanState>(() => ({
    plan:         'free',
    limits:       DEFAULT_FREE_LIMITS,
    subscription: null,
    loading:      true,
  }))

  const applyData = useCallback((data: PlanData) => {
    setState({ ...data, loading: false })
  }, [])

  useEffect(() => {
    const cached = readCache() ?? _resolved
    if (cached) {
      applyData(cached)
    }

    _listeners.add(applyData)

    fetchPlan().catch(() => {
      setState(prev => ({ ...prev, loading: false }))
    })

    return () => { _listeners.delete(applyData) }
  }, [applyData])

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
  // until we actually know the plan - preventing the lock-flicker
  const isPro      = DEV_UNLOCK || (!state.loading && (state.plan === 'pro' || state.plan === 'ultimate'))
  const isUltimate = DEV_UNLOCK || (!state.loading && state.plan === 'ultimate')
  const isFree     = !DEV_UNLOCK && !state.loading && state.plan === 'free'

  // When DEV_UNLOCK is on, surface as ultimate so every gate passes
  const plan: PlanName = DEV_UNLOCK ? 'ultimate' : state.plan

  return { ...state, plan, isPro, isUltimate, isFree, refresh }
}
