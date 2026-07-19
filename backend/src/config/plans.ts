export type PlanName = 'free' | 'pro' | 'ultimate'

export interface PlanLimits {
  codeExecutionsPerDay: number      // successful runs per day
  patternTemplates: number          // Infinity = all
  exportFormats: string[]           // [] = no export
  problemAccess: 'easy_medium' | 'all'
  hintsAccess: boolean
  communityDiscussion: boolean
  revisionBookmarks: boolean
  interviewSessionsPerMonth: number // Infinity = unlimited
  maxCollaborators: number          // 0 = no collab
  activityTimeline: boolean
  versionHistory: boolean
  analyticsLevel: 'none' | 'basic' | 'full'
  betaFeatures: boolean
}

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    codeExecutionsPerDay: 15,
    patternTemplates: 5,
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
  },
  pro: {
    codeExecutionsPerDay: 25,
    patternTemplates: Infinity,
    exportFormats: ['plantuml', 'mermaid', 'draft'],
    problemAccess: 'all',
    hintsAccess: true,
    communityDiscussion: true,
    revisionBookmarks: true,
    interviewSessionsPerMonth: 10,
    maxCollaborators: 3,
    activityTimeline: false,
    versionHistory: false,
    analyticsLevel: 'basic',
    betaFeatures: false,
  },
  ultimate: {
    codeExecutionsPerDay: 50,
    patternTemplates: Infinity,
    exportFormats: ['plantuml', 'mermaid', 'draft', 'png', 'svg', 'json'],
    problemAccess: 'all',
    hintsAccess: true,
    communityDiscussion: true,
    revisionBookmarks: true,
    interviewSessionsPerMonth: Infinity,
    maxCollaborators: Infinity,
    activityTimeline: true,
    versionHistory: true,
    analyticsLevel: 'full',
    betaFeatures: true,
  },
}

export function getLimits(plan: PlanName): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free
}

/** The 5 patterns available on the free tier (most uncommon / least used GoF patterns) */
export const FREE_PATTERN_KEYS = [
  'flyweight',
  'visitor',
  'interpreter',
  'mediator',
  'memento',
] as const

/** Razorpay plan IDs from env — resolves correct plan based on tier + billing interval */
export function getRazorpayPlanId(tier: 'pro' | 'ultimate', yearly: boolean): string {
  if (tier === 'pro') {
    return yearly
      ? process.env.RAZORPAY_PRO_YEARLY!
      : process.env.RAZORPAY_PRO_MONTHLY!
  }
  return yearly
    ? process.env.RAZORPAY_ULT_YEARLY!
    : process.env.RAZORPAY_ULT_MONTHLY!
}

/** Map Razorpay plan ID back to our PlanName */
export function planFromRazorpayId(planId: string): PlanName {
  const proIds = [
    process.env.RAZORPAY_PRO_MONTHLY,
    process.env.RAZORPAY_PRO_YEARLY,
  ]
  const ultIds = [
    process.env.RAZORPAY_ULT_MONTHLY,
    process.env.RAZORPAY_ULT_YEARLY,
  ]
  if (proIds.includes(planId)) return 'pro'
  if (ultIds.includes(planId)) return 'ultimate'
  return 'free'
}

export const PRICING = {
  pro: {
    monthly: { INR: 199, USD: 6 },
    yearly:  { INR: 1999, USD: 60 },
  },
  ultimate: {
    monthly: { INR: 299, USD: 10 },
    yearly:  { INR: 2999, USD: 100 },
  },
} as const
