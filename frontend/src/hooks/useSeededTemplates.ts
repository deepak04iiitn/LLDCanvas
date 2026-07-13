'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface SeededTemplatesState {
  /** Real Mongo `_id`, keyed by the seed document's `title` — see DiagramTemplate.seedTitle. */
  idByTitle: Map<string, string>
  loading: boolean
}

/**
 * Resolves the static template metadata in lib/data/templates.ts to the real
 * backend documents from GET /diagrams/templates. A template is only
 * creatable once its `seedTitle` matches a title returned here — this is
 * what lets the UI show "coming soon" for templates that aren't seeded yet
 * instead of sending a bogus id to POST /diagrams and erroring.
 */
export function useSeededTemplates(): SeededTemplatesState {
  const [idByTitle, setIdByTitle] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    api.diagrams.templates()
      .then(({ templates }) => {
        if (cancelled) return
        setIdByTitle(new Map(templates.map((t) => [t.title, t._id])))
      })
      .catch(() => {
        // Degrade to "nothing available" rather than surfacing an error —
        // the modal/gallery still render, just with every card disabled.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { idByTitle, loading }
}
