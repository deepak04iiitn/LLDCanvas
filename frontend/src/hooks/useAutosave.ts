import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { DiagramData, CanvasTheme } from '@/types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutosave(
  id: string | null,
  data: DiagramData,
  theme: CanvasTheme = 'light',
  delay = 1500,
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const thumbnailTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestData = useRef(data)
  const latestTheme = useRef(theme)

  // Keep refs current without re-triggering the save effect
  useEffect(() => { latestData.current = data }, [data])
  useEffect(() => { latestTheme.current = theme }, [theme])

  useEffect(() => {
    if (!id) return

    if (timer.current) clearTimeout(timer.current)
    if (thumbnailTimer.current) clearTimeout(thumbnailTimer.current)
    setStatus('saving')

    timer.current = setTimeout(async () => {
      try {
        await api.diagrams.save(id, latestData.current)
        setStatus('saved')

        // After a successful save, fire thumbnail generation non-blocking.
        // Import lazily to avoid SSR issues with DOM access.
        thumbnailTimer.current = setTimeout(async () => {
          try {
            const { generateThumbnail } = await import('@/lib/export/toPNG')
            const thumbnail = await generateThumbnail(latestTheme.current)
            if (thumbnail) {
              // Fire-and-forget — failures are non-critical
              api.diagrams.save(id, latestData.current, thumbnail).catch(() => undefined)
            }
          } catch {
            // Thumbnail is non-critical — silently swallow errors
          }
        }, 300)
      } catch {
        setStatus('error')
      }
    }, delay)

    return () => {
      if (timer.current) clearTimeout(timer.current)
      if (thumbnailTimer.current) clearTimeout(thumbnailTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, data, delay])

  return status
}
