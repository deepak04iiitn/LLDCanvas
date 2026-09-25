'use client'

import { DebuggerCanvas, type DebuggerDiagram } from '@/components/studio/debugger/DebuggerCanvas'
import { cn } from '@/lib/utils'

export interface SplitCanvasProps {
  original: DebuggerDiagram
  working: DebuggerDiagram
  selectedId: string | null
  onSelect: (elementId: string, kind: 'node' | 'edge') => void
  onWorkingChange: (diagram: DebuggerDiagram) => void
  readOnlyWorking?: boolean
  originalLabel?: string
  workingLabel?: string
  className?: string
}

export function SplitCanvas({
  original,
  working,
  selectedId,
  onSelect,
  onWorkingChange,
  readOnlyWorking,
  originalLabel = 'Original design',
  workingLabel = 'Your refactored design',
  className,
}: SplitCanvasProps) {
  return (
    <div
      className={cn(
        'grid h-[70vh] min-h-[480px] grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1',
        className,
      )}
    >
      <div className="flex min-h-0 flex-col border-b border-hairline lg:border-b-0 lg:border-r">
        <div className="shrink-0 border-b border-hairline bg-paper px-3 py-1.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            {originalLabel}
          </p>
        </div>
        <div className="relative min-h-0 flex-1">
          <DebuggerCanvas
            diagram={original}
            readOnly
            selectedId={null}
            onSelect={() => {}}
            className="absolute inset-0"
            hideEditChrome
          />
        </div>
      </div>
      <div className="flex min-h-0 flex-col">
        <div className="shrink-0 border-b border-hairline bg-brand-tint/20 px-3 py-1.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
            {workingLabel}
          </p>
        </div>
        <div className="relative min-h-0 flex-1">
          <DebuggerCanvas
            diagram={working}
            readOnly={Boolean(readOnlyWorking)}
            selectedId={selectedId}
            onSelect={onSelect}
            onDiagramChange={onWorkingChange}
            className="absolute inset-0"
            hideEditChrome
          />
        </div>
      </div>
    </div>
  )
}
