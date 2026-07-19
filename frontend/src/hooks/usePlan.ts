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

interface PlanState {
  plan: PlanName
  limits: PlanLimits | null
  subscription: {
    id: string
    razorpaySubId: string
    status: string
    billingInterval: string
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
  } | null
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

export function usePlan() {
  const [state, setState] = useState<PlanState>({
    plan: 'free',
    limits: DEFAULT_FREE_LIMITS,
    subscription: null,
    loading: true,
  })

  const refresh = useCallback(async () => {
    try {
      const data = await api.billing.plan()
      setState({
        plan:         data.plan as PlanName,
        limits:       data.limits as unknown as PlanLimits,
        subscription: data.subscription,
        loading:      false,
      })
    } catch {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const isPro      = state.plan === 'pro' || state.plan === 'ultimate'
  const isUltimate = state.plan === 'ultimate'
  const isFree     = state.plan === 'free'

  return { ...state, isPro, isUltimate, isFree, refresh }
}
