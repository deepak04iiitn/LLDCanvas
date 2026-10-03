export type FeatureCategory = 'design-studio' | 'learn' | 'plannr'

export type FeaturePlan = 'free' | 'pro' | 'ultimate'

export interface FeatureDefinition {
  id: string
  category: FeatureCategory
  label: string
  description: string
  href: string
  adminHref?: string
  minPlan?: FeaturePlan
  flagKey: string
  analyticsPrefix: string
}

/** All Interactive LLD features — hubs and plan gates read from this list. */
export const FEATURES: FeatureDefinition[] = [
  // ── Design Studio (8) ─────────────────────────────────────────────────────
  {
    id: 'debugger',
    category: 'design-studio',
    label: 'Design Debugger',
    description: 'Find flaws in authored broken designs — mark issues, submit, reveal.',
    href: '/design-studio/debugger',
    adminHref: '/admin/studio/debugger',
    minPlan: 'pro',
    flagKey: 'FF_STUDIO_DEBUGGER',
    analyticsPrefix: 'studio_debugger',
  },
  {
    id: 'refactor',
    category: 'design-studio',
    label: 'Refactoring Mode',
    description: 'Fix a locked broken design and see explained before/after deltas.',
    href: '/design-studio/refactor',
    adminHref: '/admin/studio/refactor',
    minPlan: 'pro',
    flagKey: 'FF_STUDIO_REFACTOR',
    analyticsPrefix: 'studio_refactor',
  },
  {
    id: 'change-one',
    category: 'design-studio',
    label: 'Change One Thing',
    description: 'Meet a new requirement with the smallest semantic change.',
    href: '/design-studio/change',
    adminHref: '/admin/studio/change-one',
    minPlan: 'pro',
    flagKey: 'FF_STUDIO_CHANGE_ONE',
    analyticsPrefix: 'studio_change_one',
  },
  {
    id: 'evolution',
    category: 'design-studio',
    label: 'Architecture Evolution',
    description: 'Grow a design across staged requirements and version checkpoints.',
    href: '/design-studio/evolution',
    adminHref: '/admin/studio/evolution',
    minPlan: 'pro',
    flagKey: 'FF_STUDIO_EVOLUTION',
    analyticsPrefix: 'studio_evolution',
  },
  {
    id: 'budget',
    category: 'design-studio',
    label: 'Architecture Budget',
    description:
      'Marketplace prioritization under scarce budgets — invest, reserve, and face opportunity cost.',
    href: '/design-studio/budget',
    adminHref: '/admin/studio/budget',
    minPlan: 'pro',
    flagKey: 'FF_STUDIO_BUDGET',
    analyticsPrefix: 'studio_budget',
  },

  // ── Learn & Practice (5) ───────────────────────────────────────────────────
  {
    id: 'score',
    category: 'learn',
    label: 'Design Score',
    description: 'Track your UML design quality and score history over time.',
    href: '/learn/score',
    adminHref: '/admin/learn/score',
    flagKey: 'FF_LEARN_SCORE',
    analyticsPrefix: 'learn_score',
  },
  {
    id: 'quiz',
    category: 'learn',
    label: 'Daily LLD Quiz',
    description: 'Short daily questions with a leaderboard to stay sharp.',
    href: '/learn/quiz',
    adminHref: '/admin/learn/quiz',
    flagKey: 'FF_LEARN_QUIZ',
    analyticsPrefix: 'learn_quiz',
  },
  {
    id: 'detective',
    category: 'learn',
    label: 'Pattern Detective',
    description: 'Identify, detect, and explain patterns in UML scenarios.',
    href: '/learn/detective',
    adminHref: '/admin/learn/detective',
    minPlan: 'pro',
    flagKey: 'FF_LEARN_DETECTIVE',
    analyticsPrefix: 'learn_detective',
  },
  {
    id: 'roguelike',
    category: 'learn',
    label: 'LLD Roguelike',
    description: 'Run-based LLD practice with modifiers and escalating levels.',
    href: '/learn/roguelike',
    adminHref: '/admin/learn/roguelike',
    minPlan: 'ultimate',
    flagKey: 'FF_LEARN_ROGUELIKE',
    analyticsPrefix: 'learn_roguelike',
  },
  {
    id: 'code-debugger',
    category: 'learn',
    label: 'Debug Lab',
    description: 'Code bugs & Design bugs — fix buggy code or hunt structural flaws in UML diagrams and sharpen your design instincts.',
    href: '/learn/debugger',
    flagKey: 'FF_LEARN_DEBUGGER',
    analyticsPrefix: 'learn_debugger',
  },

  // ── Plannr (1) ──────────────────────────────────────────────
  {
    id: 'plannr',
    category: 'plannr',
    label: 'Plannr',
    description: 'Personalised roadmap, theory, interview experiences, tips & tricks, skill tracking — everything you need to ace LLD interviews.',
    href: '/plannr',
    flagKey: 'FF_PLANNR',
    analyticsPrefix: 'plannr',
  },
]

export function getFeaturesByCategory(category: FeatureCategory): FeatureDefinition[] {
  return FEATURES.filter(f => f.category === category)
}

export function getFeature(id: string): FeatureDefinition | undefined {
  return FEATURES.find(f => f.id === id)
}
