'use client'

import { cn } from '@/lib/utils'

export interface ConsoleLogEntry {
  t: number
  level: 'info' | 'warn' | 'ok' | string
  message: string
}

export interface DebugConsoleProps {
  entries: ConsoleLogEntry[]
  className?: string
}

function levelClass(level: string) {
  if (level === 'ok') return 'text-emerald-700'
  if (level === 'warn') return 'text-amber-700'
  return 'text-ink-muted'
}

function fmtTime(t: number) {
  const d = new Date(t)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function DebugConsole({ entries, className }: DebugConsoleProps) {
  return (
    <div
      className={cn(
        'flex h-28 shrink-0 flex-col border-t border-hairline bg-paper-elevated',
        className,
      )}
    >
      <div className="flex shrink-0 items-center border-b border-hairline px-3 py-1.5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Debug Console
        </p>
      </div>
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 py-2 font-mono text-[11px]">
        {entries.length === 0 && (
          <li className="text-ink-faint">No events yet — inspect, mark, or trace to log activity.</li>
        )}
        {entries.map((e, i) => (
          <li key={`${e.t}-${i}`} className="flex gap-2 leading-relaxed">
            <span className="shrink-0 text-ink-faint">{fmtTime(e.t)}</span>
            <span className={cn('uppercase', levelClass(e.level))}>{e.level}</span>
            <span className="text-ink">{e.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
