'use client'

import { useState } from 'react'
import { Lightbulb, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { studioApi } from '@/lib/studio-api'
import { cn } from '@/lib/utils'

export interface HintButtonProps {
  attemptId: string
  elementId?: string | null
  disabled?: boolean
  onHint?: (hint: string, hintsUsed: number) => void
  className?: string
}

export function HintButton({
  attemptId,
  elementId,
  disabled,
  onHint,
  className,
}: HintButtonProps) {
  const [loading, setLoading] = useState(false)
  const [lastHint, setLastHint] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await studioApi.debuggerSession.hint(
        attemptId,
        elementId ? { elementId } : undefined,
      )
      setLastHint(res.hint)
      onHint?.(res.hint, res.hintsUsed)
      toast.message('Hint', { description: res.hint })
    } catch (err) {
      toast.error((err as Error).message ?? 'No hint available')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border border-hairline bg-paper px-2.5 py-1.5 text-[12px] font-medium text-ink transition-colors',
          'hover:border-brand/30 hover:bg-brand-tint/40 disabled:opacity-50',
        )}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Lightbulb className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.75} />
        )}
        Hint
      </button>
      {lastHint && (
        <p className="max-w-xs text-[11px] leading-relaxed text-ink-muted">{lastHint}</p>
      )}
    </div>
  )
}
