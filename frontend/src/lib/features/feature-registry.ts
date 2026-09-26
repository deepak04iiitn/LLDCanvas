export type FeatureCategory = 'design-studio' | 'learn'

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
  {
    id: 'microscope',
    category: 'design-studio',
    label: 'Architecture Microscope',
    description:
      'Explore architecture internals — lenses, traces, blast radius, and investigate challenges.',
    href: '/design-studio/microscope',
    adminHref: '/admin/studio/tools',
    flagKey: 'FF_STUDIO_MICROSCOPE',
    analyticsPrefix: 'studio_microscope',
  },
  {
    id: 'dependency-web',
    category: 'design-studio',
    label: 'Dependency Web',
    description:
      'Understand how architecture is connected — and how changes propagate through it.',
    href: '/design-studio/depweb',
    adminHref: '/admin/studio/tools',
    flagKey: 'FF_STUDIO_DEPWEB',
    analyticsPrefix: 'studio_depweb',
  },

  // ── Learn & Practice (5) ───────────────────────────────────────────────────
  {
    id: 'score',
    category: 'learn',
    label: 'Design Score',
    description: 'Heuristic feedback across dimensions — not an absolute grade. Also on diagram → Analyze.',
    href: '/learn',
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
    label: 'Bug Hunt',
    description: 'Find and fix the bug. Run buggy code, observe the wrong output, debug it yourself, and verify your fix.',
    href: '/learn/debugger',
    flagKey: 'FF_LEARN_DEBUGGER',
    analyticsPrefix: 'learn_debugger',
  },
]

export function getFeaturesByCategory(category: FeatureCategory): FeatureDefinition[] {
  return FEATURES.filter(f => f.category === category)
}

export function getFeature(id: string): FeatureDefinition | undefined {
  return FEATURES.find(f => f.id === id)
}
