import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { DiagramData } from '@/types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutosave(id: string | null, data: DiagramData, delay = 1500) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestData = useRef(data)

  // Keep the ref current without re-triggering the effect
  useEffect(() => {
    latestData.current = data
  }, [data])

  useEffect(() => {
    if (!id) return

    if (timer.current) clearTimeout(timer.current)
    setStatus('saving')

    timer.current = setTimeout(async () => {
      try {
        await api.diagrams.save(id, latestData.current)
        setStatus('saved')
      } catch {
        setStatus('error')
      }
    }, delay)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, data, delay])

  return status
}
