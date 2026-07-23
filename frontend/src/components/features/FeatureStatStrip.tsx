export interface FeatureStat { value: string; label: string }

export function FeatureStatStrip({ stats }: { stats: FeatureStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 rounded-xl border border-hairline bg-paper-elevated px-6 py-6 sm:grid-cols-4">
      {stats.map(s => (
        <div key={s.label}>
          <p className="font-mono text-2xl font-bold text-ink">{s.value}</p>
          <p className="mt-0.5 font-mono text-[10px] tracking-wide text-ink-faint uppercase">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
