export type FeatureCategory = 'design-studio' | 'learn' | 'community'

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
  // ── Design Studio (11) ─────────────────────────────────────────────────────
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
    description: 'Inspect a class — responsibilities, deps, and heuristic concerns. Open any diagram → Analyze.',
    href: '/dashboard',
    adminHref: '/admin/studio/tools',
    flagKey: 'FF_STUDIO_MICROSCOPE',
    analyticsPrefix: 'studio_microscope',
  },
  {
    id: 'dependency-web',
    category: 'design-studio',
    label: 'Dependency Web',
    description: 'Graph view of couplings, hubs, cycles, and impact radius. Open any diagram → Analyze.',
    href: '/dashboard',
    adminHref: '/admin/studio/tools',
    flagKey: 'FF_STUDIO_DEPWEB',
    analyticsPrefix: 'studio_depweb',
  },
  {
    id: 'uml-diff',
    category: 'design-studio',
    label: 'UML Diff',
    description: 'Structural before/after diff by stable element IDs — not layout. Open a diagram → History.',
    href: '/dashboard',
    adminHref: '/admin/studio/tools',
    flagKey: 'FF_STUDIO_UML_DIFF',
    analyticsPrefix: 'studio_uml_diff',
  },
  {
    id: 'story',
    category: 'design-studio',
    label: 'Explain as a Story',
    description: 'Walk the design as a narrated path with highlighted elements. Open any diagram → Analyze.',
    href: '/dashboard',
    adminHref: '/admin/studio/tools',
    flagKey: 'FF_STUDIO_STORY',
    analyticsPrefix: 'studio_story',
  },
  {
    id: 'replay',
    category: 'design-studio',
    label: 'Design Replay',
    description: 'Replay how a design was built — powers Community Watch. Open a diagram → History.',
    href: '/dashboard',
    adminHref: '/admin/studio/tools',
    minPlan: 'pro',
    flagKey: 'FF_STUDIO_REPLAY',
    analyticsPrefix: 'studio_replay',
  },
  {
    id: 'decisions',
    category: 'design-studio',
    label: 'Design Decision Log',
    description: 'Annotate why, alternatives, and trade-offs on design elements. Open a diagram → History.',
    href: '/dashboard',
    adminHref: '/admin/studio/tools',
    flagKey: 'FF_STUDIO_DECISIONS',
    analyticsPrefix: 'studio_decisions',
  },

  // ── Learn & Practice (6) ───────────────────────────────────────────────────
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
    id: 'mashup',
    category: 'learn',
    label: 'Architecture Mashup',
    description: 'Combine problem constraints into a single design challenge.',
    href: '/learn/mashup',
    adminHref: '/admin/learn/mashup',
    minPlan: 'pro',
    flagKey: 'FF_LEARN_MASHUP',
    analyticsPrefix: 'learn_mashup',
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
    id: 'uml-code',
    category: 'learn',
    label: 'UML ↔ Code',
    description: 'Round-trip between class diagrams and TypeScript / Java skeletons.',
    href: '/learn/uml-code',
    adminHref: '/admin/learn/uml-code',
    minPlan: 'pro',
    flagKey: 'FF_LEARN_UML_CODE',
    analyticsPrefix: 'learn_uml_code',
  },

  // ── Community (4) ──────────────────────────────────────────────────────────
  {
    id: 'gallery',
    category: 'community',
    label: 'Design Gallery',
    description: 'Browse published community designs and learn from approaches.',
    href: '/community',
    adminHref: '/admin/community/gallery',
    flagKey: 'FF_COMMUNITY_GALLERY',
    analyticsPrefix: 'community_gallery',
  },
  {
    id: 'watch',
    category: 'community',
    label: "Watch Someone's Design",
    description: 'Replay how another designer built their solution step by step.',
    href: '/community',
    adminHref: '/admin/community/gallery',
    minPlan: 'pro',
    flagKey: 'FF_COMMUNITY_WATCH',
    analyticsPrefix: 'community_watch',
  },
  {
    id: 'forks',
    category: 'community',
    label: 'Design Forks',
    description: 'Fork a published design, compare lineage, and diverge intentionally.',
    href: '/community',
    adminHref: '/admin/community/gallery',
    flagKey: 'FF_COMMUNITY_FORKS',
    analyticsPrefix: 'community_forks',
  },
  {
    id: 'alternatives',
    category: 'community',
    label: 'Alternative Solutions',
    description: 'Compare curated approaches to the same problem with trade-offs.',
    href: '/community',
    adminHref: '/admin/community/alternatives',
    flagKey: 'FF_COMMUNITY_ALTERNATIVES',
    analyticsPrefix: 'community_alternatives',
  },
]

export function getFeaturesByCategory(category: FeatureCategory): FeatureDefinition[] {
  return FEATURES.filter(f => f.category === category)
}

export function getFeature(id: string): FeatureDefinition | undefined {
  return FEATURES.find(f => f.id === id)
}
