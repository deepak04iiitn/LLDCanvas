import { useCallback } from 'react'
import type { DiagramData } from '@/types'

// ─── Storage keys ──────────────────────────────────────────────────────────────
export const LOCAL_DATA_KEY   = 'lldcanvas-local-data'
export const LOCAL_TITLE_KEY  = 'lldcanvas-local-title'
export const MIGRATE_FLAG_KEY = 'lldcanvas-migrate-pending'

// ─── Read helpers (safe — run on server returns null/fallback) ────────────────
function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota */ }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Read the stored local diagram data (may be null on first visit). */
export function getLocalDiagramData(): DiagramData | null {
  return readJson<DiagramData>(LOCAL_DATA_KEY)
}

/** Read the stored local diagram title. */
export function getLocalTitle(): string {
  return localStorage.getItem(LOCAL_TITLE_KEY) ?? 'Untitled Diagram'
}

/** Persist diagram data + title to localStorage. */
export function saveLocalDiagram(data: DiagramData, title: string): void {
  writeJson(LOCAL_DATA_KEY, data)
  try { localStorage.setItem(LOCAL_TITLE_KEY, title) } catch { /* quota */ }
}

/** Mark that a migration to cloud should happen after the next sign-in. */
export function setMigratePending(): void {
  try { localStorage.setItem(MIGRATE_FLAG_KEY, '1') } catch { /* quota */ }
}

/** Check whether a pending migration exists. */
export function hasMigratePending(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MIGRATE_FLAG_KEY) === '1'
}

/** Clear all local diagram storage (call after successful migration). */
export function clearLocalDiagram(): void {
  localStorage.removeItem(LOCAL_DATA_KEY)
  localStorage.removeItem(LOCAL_TITLE_KEY)
  localStorage.removeItem(MIGRATE_FLAG_KEY)
}

// ─── React hook (for components that need reactive access) ────────────────────

export function useLocalDiagram() {
  const save = useCallback((data: DiagramData, title: string) => {
    saveLocalDiagram(data, title)
  }, [])

  const clear = useCallback(() => clearLocalDiagram(), [])

  return { save, clear }
}
