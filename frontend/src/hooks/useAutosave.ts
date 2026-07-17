import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { DiagramData, CanvasTheme } from '@/types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutosave(
  id: string | null,
  data: DiagramData,
  theme: CanvasTheme = 'light',
  delay = 3000,
  options: { readOnly?: boolean; shareToken?: string } = {},
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const thumbnailTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track the last serialized content that was actually saved
  const lastSavedContent = useRef<string>('')
  const latestData = useRef(data)
  const latestTheme = useRef(theme)
  const latestShareToken = useRef(options.shareToken)

  useEffect(() => { latestData.current = data }, [data])
  useEffect(() => { latestTheme.current = theme }, [theme])
  useEffect(() => { latestShareToken.current = options.shareToken }, [options.shareToken])

  const doSave = useCallback(async (saveId: string, content: string) => {
    const tok = latestShareToken.current
    setStatus('saving')
    try {
      await api.diagrams.save(saveId, latestData.current, undefined, tok)
      lastSavedContent.current = content
      setStatus('saved')

      // Revert to idle after 2 seconds so the indicator doesn't linger
      if (savedTimer.current) clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setStatus('idle'), 2000)

      // Thumbnail generation — fire once, well after the save, non-blocking
      if (thumbnailTimer.current) clearTimeout(thumbnailTimer.current)
      thumbnailTimer.current = setTimeout(async () => {
        try {
          const { generateThumbnail } = await import('@/lib/export/toPNG')
          const thumbnail = await generateThumbnail(latestTheme.current)
          if (thumbnail) {
            api.diagrams.save(saveId, latestData.current, thumbnail, tok).catch(() => undefined)
          }
        } catch {
          // non-critical
        }
      }, 8000)
    } catch {
      setStatus('error')
    }
  }, [])

  const retry = useCallback(() => {
    if (!id) return
    doSave(id, JSON.stringify(latestData.current))
  }, [id, doSave])

  useEffect(() => {
    if (!id || options.readOnly) return

    // Serialize to detect real content changes (ignore object reference churn)
    const content = JSON.stringify(data)
    if (content === lastSavedContent.current) return

    // Clear any pending debounce — reset the countdown
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(() => {
      // Double-check content hasn't been saved already in the meantime
      const currentContent = JSON.stringify(latestData.current)
      if (currentContent !== lastSavedContent.current) {
        doSave(id, currentContent)
      }
    }, delay)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, data, delay])

  return { status, retry }
}
