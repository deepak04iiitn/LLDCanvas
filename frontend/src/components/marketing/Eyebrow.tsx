export function Eyebrow({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
      <span className="text-gold">¶{index}</span> — {children}
    </p>
  )
}
