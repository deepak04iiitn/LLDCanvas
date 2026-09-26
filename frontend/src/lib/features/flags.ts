/**
 * Feature flags — `NEXT_PUBLIC_FF_*` env vars.
 * Foundation Analyze tools default ON when unset so hubs/scaffolding work locally.
 */

import { DEV_UNLOCK } from '@/lib/dev-unlock'

const FOUNDATION_DEFAULT_ON = new Set([
  'FF_STUDIO_DEBUGGER',
  'FF_STUDIO_REFACTOR',
  'FF_STUDIO_CHANGE_ONE',
  'FF_STUDIO_EVOLUTION',
  'FF_STUDIO_BUDGET',
  'FF_STUDIO_REPLAY',
  'FF_STUDIO_MICROSCOPE',
  'FF_STUDIO_DEPWEB',
  'FF_STUDIO_ANALYSIS',
  'FF_LEARN_SCORE',
  'FF_LEARN_QUIZ',
  'FF_LEARN_DETECTIVE',
  'FF_LEARN_MASHUP',
  'FF_LEARN_ROGUELIKE',
  'FF_LEARN_DEBUGGER',
  'FF_COMMUNITY_GALLERY',
  'FF_COMMUNITY_FORKS',
  'FF_COMMUNITY_ALTERNATIVES',
  'FF_COMMUNITY_WATCH',
  'FF_PLANNR',
])

function envKey(flagKey: string): string {
  return flagKey.startsWith('NEXT_PUBLIC_') ? flagKey : `NEXT_PUBLIC_${flagKey}`
}

export function isFeatureEnabled(flagKey: string): boolean {
  if (DEV_UNLOCK) return true
  const raw = process.env[envKey(flagKey)]
  if (raw === undefined || raw === '') {
    return FOUNDATION_DEFAULT_ON.has(flagKey.replace(/^NEXT_PUBLIC_/, '')) || FOUNDATION_DEFAULT_ON.has(flagKey)
  }
  const v = raw.trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'on' || v === 'yes'
}
