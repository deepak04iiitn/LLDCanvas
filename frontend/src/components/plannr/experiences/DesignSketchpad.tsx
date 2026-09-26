'use client'

import { useEffect, useState } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Relationship {
  from: string
  to: string
  type: 'extends' | 'implements' | 'uses' | 'has'
}

interface DesignSketchpadProps {
  onDesignChange: (classCount: number) => void
}

const REL_TYPES: Relationship['type'][] = ['extends', 'implements', 'uses', 'has']

export function DesignSketchpad({ onDesignChange }: DesignSketchpadProps) {
  const [rawText, setRawText] = useState('')
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [relFrom, setRelFrom] = useState('')
  const [relTo, setRelTo] = useState('')
  const [relType, setRelType] = useState<Relationship['type']>('uses')

  // Parse class names from textarea (one per line)
  const classNames = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i) // deduplicate

  useEffect(() => {
    onDesignChange(classNames.length)
  }, [classNames.length, onDesignChange])

  function addRelationship() {
    if (!relFrom || !relTo || relFrom === relTo) return
    setRelationships(prev => [...prev, { from: relFrom, to: relTo, type: relType }])
    setRelFrom('')
    setRelTo('')
  }

  function removeRelationship(idx: number) {
    setRelationships(prev => prev.filter((_, i) => i !== idx))
  }

  const REL_BADGE: Record<Relationship['type'], string> = {
    extends:    'bg-violet-100 text-violet-700',
    implements: 'bg-blue-100 text-blue-700',
    uses:       'bg-amber-100 text-amber-700',
    has:        'bg-green-100 text-green-700',
  }

  const REL_ARROW: Record<Relationship['type'], string> = {
    extends:    '▷',
    implements: '▶',
    uses:       '→',
    has:        '◆→',
  }

  return (
    <div className="space-y-5">
      {/* Class input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
            Classes <span className="normal-case font-normal text-ink-faint">(one per line)</span>
          </label>
          <span className={cn(
            'text-[10px] font-medium px-2 py-0.5 rounded-full',
            classNames.length === 0 ? 'bg-hairline text-ink-faint' : 'bg-brand/10 text-brand',
          )}>
            {classNames.length} class{classNames.length !== 1 ? 'es' : ''}
          </span>
        </div>
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder={'UserService\nOrderRepository\nPaymentGateway'}
          rows={4}
          className="w-full rounded-xl border border-hairline bg-paper p-3 font-mono text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
        />
      </div>

      {/* Class chips */}
      {classNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {classNames.map(name => (
            <div
              key={name}
              className="flex items-center gap-1.5 rounded-xl border border-hairline bg-paper-elevated px-3 py-1.5 text-[12px] font-mono font-medium text-ink"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {name}
            </div>
          ))}
        </div>
      )}

      {/* Relationship builder */}
      {classNames.length >= 2 && (
        <div className="rounded-2xl border border-hairline bg-paper-elevated p-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Add Relationship</p>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={relFrom}
              onChange={e => setRelFrom(e.target.value)}
              className="flex-1 min-w-[120px] rounded-xl border border-hairline bg-paper px-3 py-2 text-[12px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="">From…</option>
              {classNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select
              value={relType}
              onChange={e => setRelType(e.target.value as Relationship['type'])}
              className="rounded-xl border border-hairline bg-paper px-3 py-2 text-[12px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {REL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={relTo}
              onChange={e => setRelTo(e.target.value)}
              className="flex-1 min-w-[120px] rounded-xl border border-hairline bg-paper px-3 py-2 text-[12px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="">To…</option>
              {classNames.filter(n => n !== relFrom).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button
              onClick={addRelationship}
              disabled={!relFrom || !relTo}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-brand text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {relationships.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {relationships.map((rel, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px]">
                  <span className="font-mono font-medium text-ink">{rel.from}</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', REL_BADGE[rel.type])}>
                    {REL_ARROW[rel.type]} {rel.type}
                  </span>
                  <span className="font-mono font-medium text-ink">{rel.to}</span>
                  <button
                    onClick={() => removeRelationship(i)}
                    className="ml-auto text-ink-faint hover:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {classNames.length === 0 && (
        <p className="text-[12px] text-ink-faint text-center py-2">
          Type class names above to start sketching your design
        </p>
      )}
    </div>
  )
}
