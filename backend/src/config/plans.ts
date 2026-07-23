export type PlanName = 'free' | 'pro' | 'ultimate'

export interface PlanLimits {
  codeExecutionsPerDay: number      // successful runs per day
  patternTemplates: number          // Infinity = all
  exportFormats: string[]           // [] = no export
  problemAccess: 'free_easy_only' | 'easy_and_some_medium' | 'all'
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
    patternTemplates: 16,
    exportFormats: [],
    problemAccess: 'free_easy_only',
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
    problemAccess: 'easy_and_some_medium',
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

/**
 * The 5 design patterns locked behind Pro — the most frequently tested
 * in real LLD/system-design interviews.
 */
export const PRO_ONLY_PATTERN_KEYS = [
  'singleton',               // #1 most asked LLD pattern
  'factory-method',          // most common creational
  'abstract-factory',        // advanced creational — multi-family objects
  'observer',                // most common behavioral
  'strategy',                // extremely common in OOP questions
  'decorator',               // frequently asked (middleware, logging, etc.)
  'chain-of-responsibility', // common in request pipelines & middleware
] as const

/** Free tier patterns — all 23 GoF patterns except the 7 Pro-gated ones above (16 total). */
export const FREE_PATTERN_KEYS = [
  'builder',
  'prototype',
  'adapter',
  'bridge',
  'composite',
  'facade',
  'flyweight',
  'proxy',
  'command',
  'interpreter',
  'iterator',
  'mediator',
  'memento',
  'state',
  'template-method',
  'visitor',
] as const

/**
 * The 10 easy problems available on the free tier.
 * These are the most beginner-friendly, foundational LLD questions.
 */
export const FREE_EASY_PROBLEM_SLUGS = [
  'parking-lot',
  'atm-machine',
  'library-management',
  'vending-machine',
  'elevator-system',
  'tic-tac-toe',
  'chess-game',
  'snake-and-ladder',
  'deck-of-cards',
  'traffic-light-system',
] as const

/**
 * Medium problems accessible to Pro users (less than half of all medium problems).
 * Ultimate users get all medium problems; hard problems require Ultimate.
 */
export const PRO_MEDIUM_PROBLEM_SLUGS = [
  'coupon-system',
  'cricket-scoreboard',
  'recipe-meal-planning',
  'loyalty-points-rewards-program',
  'social-event-planning-app',
  'podcast-platform',
  'online-survey-form-builder',
  'restaurant-pos-kitchen-display',
  'ebook-lending-platform',
  'gym-membership-class-booking',
] as const

export function isProblemAccessible(
  plan: PlanName,
  difficulty: 'easy' | 'medium' | 'hard',
  slug: string,
): boolean {
  // Ultimate — full access to all problems
  if (plan === 'ultimate') return true

  // Pro — all easy + a curated set of medium; hard is Ultimate-only
  if (plan === 'pro') {
    if (difficulty === 'easy')   return true
    if (difficulty === 'medium') return (PRO_MEDIUM_PROBLEM_SLUGS as readonly string[]).includes(slug)
    return false // hard requires Ultimate
  }

  // Free — only the 10 curated easy problems; medium and hard are locked
  if (difficulty === 'easy') return (FREE_EASY_PROBLEM_SLUGS as readonly string[]).includes(slug)
  return false
}

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
