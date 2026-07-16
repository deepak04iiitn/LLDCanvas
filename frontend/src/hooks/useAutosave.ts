import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { DiagramData, CanvasTheme } from '@/types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutosave(
  id: string | null,
  data: DiagramData,
  theme: CanvasTheme = 'light',
  delay = 1500,
  options: { readOnly?: boolean; shareToken?: string } = {},
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const thumbnailTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestData = useRef(data)
  const latestTheme = useRef(theme)
  const latestShareToken = useRef(options.shareToken)

  useEffect(() => { latestData.current = data }, [data])
  useEffect(() => { latestTheme.current = theme }, [theme])
  useEffect(() => { latestShareToken.current = options.shareToken }, [options.shareToken])

  const doSave = useCallback(async (saveId: string) => {
    const tok = latestShareToken.current
    try {
      await api.diagrams.save(saveId, latestData.current, undefined, tok)
      setStatus('saved')

      // Non-blocking thumbnail generation after a successful save
      thumbnailTimer.current = setTimeout(async () => {
        try {
          const { generateThumbnail } = await import('@/lib/export/toPNG')
          const thumbnail = await generateThumbnail(latestTheme.current)
          if (thumbnail) {
            api.diagrams.save(saveId, latestData.current, thumbnail, tok).catch(() => undefined)
          }
        } catch {
          // Thumbnail is non-critical
        }
      }, 300)
    } catch {
      setStatus('error')
    }
  }, [])

  // Retry the most recent save immediately
  const retry = useCallback(() => {
    if (!id) return
    setStatus('saving')
    doSave(id)
  }, [id, doSave])

  useEffect(() => {
    if (!id || options.readOnly) return

    if (timer.current) clearTimeout(timer.current)
    if (thumbnailTimer.current) clearTimeout(thumbnailTimer.current)
    setStatus('saving')

    timer.current = setTimeout(() => doSave(id), delay)

    return () => {
      if (timer.current) clearTimeout(timer.current)
      if (thumbnailTimer.current) clearTimeout(thumbnailTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, data, delay])

  return { status, retry }
}
