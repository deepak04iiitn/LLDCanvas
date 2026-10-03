import type { ChallengePackType } from '@/lib/admin-api'

export type FeatureType = 'studio' | 'quiz' | 'roguelike' | 'detective' | 'debug-lab' | 'plannr'

export interface FeatureConfig {
  slug: string
  label: string
  description: string
  type: FeatureType
  packType?: ChallengePackType
  /** hex colour for inline styles */
  accentHex: string
  /** Tailwind background class */
  bgClass: string
  /** Tailwind text class */
  textClass: string
  /** Tailwind border class */
  borderClass: string
  /** User-facing feature URL */
  href: string
}

export const FEATURES: FeatureConfig[] = [
  {
    slug:        'plannr',
    label:       'Plannr',
    description: 'AI-powered system design planning and journey builder',
    type:        'plannr',
    accentHex:   '#7C3AED',
    bgClass:     'bg-violet-50',
    textClass:   'text-violet-700',
    borderClass: 'border-violet-200',
    href:        '/dashboard/plannr',
  },
  {
    slug:        'daily-quiz',
    label:       'Daily Quiz',
    description: 'Daily LLD quiz questions to sharpen system design knowledge',
    type:        'quiz',
    accentHex:   '#D97706',
    bgClass:     'bg-amber-50',
    textClass:   'text-amber-700',
    borderClass: 'border-amber-200',
    href:        '/dashboard/learn/quiz',
  },
  {
    slug:        'detective',
    label:       'Pattern Detective',
    description: 'Identify system design patterns in real-world scenarios',
    type:        'detective',
    accentHex:   '#0891B2',
    bgClass:     'bg-cyan-50',
    textClass:   'text-cyan-700',
    borderClass: 'border-cyan-200',
    href:        '/dashboard/learn/detective',
  },
  {
    slug:        'debug-lab',
    label:       'Debug Lab',
    description: 'Find and fix code-level bugs in system design implementations',
    type:        'debug-lab',
    accentHex:   '#E11D48',
    bgClass:     'bg-rose-50',
    textClass:   'text-rose-700',
    borderClass: 'border-rose-200',
    href:        '/dashboard/learn/debugger',
  },
  {
    slug:        'roguelike',
    label:       'LLD Roguelike',
    description: 'Permadeath design decisions — every wrong choice is permanent',
    type:        'roguelike',
    accentHex:   '#059669',
    bgClass:     'bg-emerald-50',
    textClass:   'text-emerald-700',
    borderClass: 'border-emerald-200',
    href:        '/dashboard/learn/roguelike',
  },
  {
    slug:        'debug-fix',
    label:       'Debug and Fix',
    description: 'Find and fix design flaws in architecture diagrams',
    type:        'studio',
    packType:    'debugger',
    accentHex:   '#EA580C',
    bgClass:     'bg-orange-50',
    textClass:   'text-orange-700',
    borderClass: 'border-orange-200',
    href:        '/dashboard/design-studio',
  },
  {
    slug:        'refactor',
    label:       'Refactor',
    description: 'Restructure and improve existing system designs',
    type:        'studio',
    packType:    'refactor',
    accentHex:   '#2563EB',
    bgClass:     'bg-blue-50',
    textClass:   'text-blue-700',
    borderClass: 'border-blue-200',
    href:        '/dashboard/design-studio',
  },
  {
    slug:        'change-one',
    label:       'Change One Thing',
    description: 'Make a single targeted change to meet a new constraint',
    type:        'studio',
    packType:    'change_one',
    accentHex:   '#DB2777',
    bgClass:     'bg-pink-50',
    textClass:   'text-pink-700',
    borderClass: 'border-pink-200',
    href:        '/dashboard/design-studio',
  },
  {
    slug:        'evolution',
    label:       'Evolution',
    description: 'Evolve system designs as requirements grow over time',
    type:        'studio',
    packType:    'evolution',
    accentHex:   '#16A34A',
    bgClass:     'bg-green-50',
    textClass:   'text-green-700',
    borderClass: 'border-green-200',
    href:        '/dashboard/design-studio',
  },
  {
    slug:        'budget',
    label:       'Budget Pressure',
    description: 'Design robust systems within tight cost constraints',
    type:        'studio',
    packType:    'budget',
    accentHex:   '#CA8A04',
    bgClass:     'bg-yellow-50',
    textClass:   'text-yellow-700',
    borderClass: 'border-yellow-200',
    href:        '/dashboard/design-studio',
  },
]

export function getFeature(slug: string): FeatureConfig | undefined {
  return FEATURES.find(f => f.slug === slug)
}
