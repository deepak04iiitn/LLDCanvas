'use client'

/**
 * Legacy entry — prefer DependencyWebSession.
 * Kept so older imports keep working; renders the full interactive web when diagram is passed via graph rebuild.
 */
export { DependencyWebSession as DependencyWebView } from './DependencyWebSession'
export type { DependencyWebSessionProps as DependencyWebViewProps } from './DependencyWebSession'
