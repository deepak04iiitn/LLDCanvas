'use client'

import { useEffect, useState, useRef } from 'react'
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

const REL_BADGE: Record<Relationship['type'], string> = {
  extends:    'bg-brand-tint text-brand',
  implements: 'bg-brand-tint text-brand',
  uses:       'bg-paper border border-hairline text-ink-muted',
  has:        'bg-paper border border-hairline text-ink-muted',
}

const REL_ARROW: Record<Relationship['type'], string> = {
  extends:    '▷',
  implements: '▶',
  uses:       '→',
  has:        '◆→',
}

export function DesignSketchpad({ onDesignChange }: DesignSketchpadProps) {
  const [classNames, setClassNames] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [relFrom, setRelFrom] = useState('')
  const [relTo, setRelTo] = useState('')
  const [relType, setRelType] = useState<Relationship['type']>('uses')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    onDesignChange(classNames.length)
  }, [classNames.length, onDesignChange])

  function addClass() {
    const name = inputValue.trim()
    if (!name || classNames.includes(name)) {
      setInputValue('')
      return
    }
    setClassNames(prev => [...prev, name])
    setInputValue('')
    inputRef.current?.focus()
  }

  function removeClass(name: string) {
    setClassNames(prev => prev.filter(n => n !== name))
    setRelationships(prev => prev.filter(r => r.from !== name && r.to !== name))
    if (relFrom === name) setRelFrom('')
    if (relTo === name) setRelTo('')
  }

  function addRelationship() {
    if (!relFrom || !relTo || relFrom === relTo) return
    setRelationships(prev => [...prev, { from: relFrom, to: relTo, type: relType }])
    setRelFrom('')
    setRelTo('')
  }

  function removeRelationship(idx: number) {
    setRelationships(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated p-4 space-y-4">
      {/* Class input row */}
      <div className="space-y-2">
        <label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          Add Classes
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addClass()}
            placeholder="e.g. UserService"
            className="flex-1 rounded-xl border border-hairline bg-paper px-3 py-2 font-mono text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            onClick={addClass}
            disabled={!inputValue.trim()}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-brand text-white text-[12px] font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      {/* Class chips */}
      {classNames.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {classNames.map(name => (
            <div
              key={name}
              className="flex items-center gap-1.5 rounded-xl border-2 border-hairline bg-paper px-3 py-2 text-[12px] font-mono font-medium text-ink"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {name}
              <button
                onClick={() => removeClass(name)}
                className="ml-1 text-ink-faint hover:text-ink transition-colors"
                title={`Remove ${name}`}
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-ink-faint text-center py-2">
          Type a class name and press Add to start sketching your design
        </p>
      )}

      {/* Relationship builder */}
      {classNames.length >= 2 && (
        <div className="rounded-xl border border-hairline bg-paper p-3 space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
            Add Relationship
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={relFrom}
              onChange={e => setRelFrom(e.target.value)}
              className="flex-1 min-w-[100px] rounded-xl border border-hairline bg-paper px-3 py-1.5 text-[12px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="">From…</option>
              {classNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select
              value={relType}
              onChange={e => setRelType(e.target.value as Relationship['type'])}
              className="rounded-xl border border-hairline bg-paper px-3 py-1.5 text-[12px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {REL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={relTo}
              onChange={e => setRelTo(e.target.value)}
              className="flex-1 min-w-[100px] rounded-xl border border-hairline bg-paper px-3 py-1.5 text-[12px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="">To…</option>
              {classNames.filter(n => n !== relFrom).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button
              onClick={addRelationship}
              disabled={!relFrom || !relTo}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
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
                    className="ml-auto text-ink-faint hover:text-ink transition-colors"
                    title="Remove relationship"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Class count badge */}
      <div className="flex justify-end">
        <span className={cn(
          'font-mono text-[10px] font-medium px-2 py-0.5 rounded-full',
          classNames.length === 0 ? 'bg-hairline text-ink-faint' : 'bg-brand-tint text-brand',
        )}>
          {classNames.length} class{classNames.length !== 1 ? 'es' : ''}
        </span>
      </div>
    </div>
  )
}
