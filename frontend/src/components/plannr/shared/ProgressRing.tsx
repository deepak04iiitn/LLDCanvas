'use client'

interface ProgressRingProps {
  percent: number
  size?: number
  stroke?: number
  className?: string
  label?: string
}

export function ProgressRing({ percent, size = 88, stroke = 7, className, label }: ProgressRingProps) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const filled = circ * (Math.min(100, Math.max(0, percent)) / 100)

  return (
    <div className={`relative inline-flex items-center justify-center ${className ?? ''}`}
         style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="currentColor" strokeWidth={stroke} className="text-hairline" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="currentColor" strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          className="text-brand transition-all duration-700 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-bold text-ink leading-none">{percent}%</span>
        {label && <span className="text-[9px] text-ink-faint mt-0.5">{label}</span>}
      </div>
    </div>
  )
}
