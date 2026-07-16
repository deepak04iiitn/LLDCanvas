'use client'

import { useAnalytics } from '@/hooks/useAnalytics'

/** Drop anywhere in the tree — runs the analytics hook globally. */
export function AnalyticsProvider() {
  useAnalytics()
  return null
}
