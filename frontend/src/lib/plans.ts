/** Mirror of backend/src/config/plans.ts — keep in sync */

export type PlanName = 'free' | 'pro' | 'ultimate'

/**
 * Design patterns locked behind Pro — the 5 most frequently tested patterns
 * in real LLD interviews. Everything else is free.
 */
export const PRO_ONLY_PATTERN_KEYS = new Set([
  'singleton',              // #1 most asked LLD pattern
  'factory-method',         // #1 creational in system design
  'abstract-factory',       // advanced creational — multi-family objects
  'observer',               // #1 behavioral in event-driven designs
  'strategy',               // extremely common in OOP design questions
  'decorator',              // frequently asked (middleware, logging, etc.)
  'chain-of-responsibility', // common in request pipelines & middleware
])

/**
 * FREE_PATTERN_KEYS = all patterns NOT in PRO_ONLY_PATTERN_KEYS.
 * Kept for backward compatibility — computed at import time.
 */
export const FREE_PATTERN_KEYS = new Set([
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
])

/** Export formats allowed per plan */
export const PLAN_EXPORT_FORMATS: Record<PlanName, string[]> = {
  free:     [],
  pro:      ['draft', 'plantuml', 'mermaid'],
  ultimate: ['png', 'svg', 'draft', 'plantuml', 'mermaid'],
}

/** Returns whether a plan can access a specific export format */
export function canExport(plan: PlanName, format: 'png' | 'svg' | 'plantuml' | 'mermaid' | 'draft'): boolean {
  return PLAN_EXPORT_FORMATS[plan].includes(format)
}

export const PLAN_LABELS: Record<PlanName, string> = {
  free:     'Free',
  pro:      'Pro',
  ultimate: 'Ultimate',
}
