'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, CheckCircle2, Lightbulb, Code2, BookOpen, RotateCcw } from 'lucide-react'
import { RevisionNoteDetail } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  note: RevisionNoteDetail
  isRevised: boolean
  bookmarked: boolean
  onClose: () => void
  onMarkRevised: () => void
  onBookmark: () => void
}

type Side = 'front' | 'back'

const SECTIONS = ['summary', 'keyPoints', 'analogy', 'code'] as const
type Section = typeof SECTIONS[number]

const sectionLabels: Record<Section, string> = {
  summary:   'Overview',
  keyPoints: 'Key Concepts',
  analogy:   'Analogy',
  code:      'Code Snippet',
}

const DIFF_META = {
  basic:        { label: 'Basic',        dot: 'bg-emerald-400', color: 'text-emerald-300', bg: 'bg-emerald-900/40', ring: 'ring-emerald-700' },
  intermediate: { label: 'Intermediate', dot: 'bg-amber-400',   color: 'text-amber-300',   bg: 'bg-amber-900/40',  ring: 'ring-amber-700'   },
  advanced:     { label: 'Advanced',     dot: 'bg-red-400',     color: 'text-red-300',     bg: 'bg-red-900/40',    ring: 'ring-red-700'     },
}

export function FlashcardMode({ note, isRevised, bookmarked, onClose, onMarkRevised, onBookmark }: Props) {
  const [side, setSide]         = useState<Side>('front')
  const [section, setSection]   = useState<Section>('summary')
  const [flipping, setFlipping] = useState(false)

  const sectionIdx = SECTIONS.indexOf(section)

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function flip() {
    if (flipping) return
    setFlipping(true)
    setTimeout(() => {
      setSide(s => s === 'front' ? 'back' : 'front')
      setFlipping(false)
    }, 150)
  }

  function goSection(delta: 1 | -1) {
    const next = SECTIONS[sectionIdx + delta]
    if (!next) return
    setSide('front')
    setSection(next)
  }

  const m = DIFF_META[note.difficulty]

  return (
    <div className="fixed inset-0 z-60 bg-stone-950/98 flex flex-col overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-b border-stone-800">
        <div className="flex items-center gap-3 min-w-0">
          <span className={cn(
            'shrink-0 inline-flex items-center gap-1 rounded-full font-mono font-bold uppercase tracking-wider ring-1 px-2 py-0.5 text-[9px]',
            m.bg, m.color, m.ring,
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
            {m.label}
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-stone-500">{note.category}</p>
            <h2 className="text-base font-semibold text-white leading-tight truncate">{note.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onBookmark}
            className={cn(
              'p-2 rounded-lg transition-colors',
              bookmarked ? 'text-amber-400 hover:text-amber-300' : 'text-stone-500 hover:text-amber-400',
            )}
          >
            {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>

          {/* Close — prominent pill button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-xs font-medium"
          >
            <X size={14} />
            Close
            <kbd className="ml-1 font-mono text-[10px] text-stone-500">Esc</kbd>
          </button>
        </div>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-8 gap-6 min-h-full">

          {/* Section tabs */}
          <div className="flex gap-1 bg-stone-900 rounded-xl p-1 w-full max-w-2xl">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setSide('front'); setSection(s) }}
                className={cn(
                  'flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-center',
                  section === s
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200',
                )}
              >
                {sectionLabels[s]}
              </button>
            ))}
          </div>

          {/* Card */}
          <div
            className="w-full max-w-2xl cursor-pointer select-none"
            onClick={flip}
            style={{ perspective: '1000px' }}
          >
            <div
              className="w-full transition-all duration-300 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipping ? 'rotateY(90deg)' : 'rotateY(0deg)',
              }}
            >
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-7 flex flex-col min-h-[280px]">
                {/* Card header */}
                <div className="flex items-center gap-2 mb-5">
                  {section === 'keyPoints' && <BookOpen size={15} className="text-violet-400" />}
                  {section === 'analogy'   && <Lightbulb size={15} className="text-amber-400" />}
                  {section === 'code'      && <Code2 size={15} className="text-emerald-400" />}
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {sectionLabels[section]}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-stone-600">
                    {side === 'front' ? 'tap to reveal' : 'tap to hide'}
                  </span>
                </div>

                {/* Card content */}
                {side === 'front' ? (
                  <div className="flex-1 flex items-center justify-center py-6">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-white mb-3 leading-snug">{note.title}</p>
                      <p className="text-sm text-stone-400 leading-relaxed max-w-md">
                        {section === 'summary'   && 'What is the core idea?'}
                        {section === 'keyPoints' && 'What are the key concepts to remember?'}
                        {section === 'analogy'   && 'Can you recall the real-world analogy?'}
                        {section === 'code'      && 'Can you recall the code structure?'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    {section === 'summary' && (
                      <p className="text-stone-200 leading-relaxed text-[15px]">{note.summary}</p>
                    )}
                    {section === 'keyPoints' && (
                      <div className="space-y-4">
                        {note.keyPoints.map((pt, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="shrink-0 w-5 h-5 rounded-full bg-violet-900/60 flex items-center justify-center mt-0.5">
                              <span className="font-mono text-[10px] font-black text-violet-300">{i + 1}</span>
                            </div>
                            <p className="text-stone-300 text-sm leading-relaxed">{pt}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {section === 'analogy' && (
                      <p className="text-amber-200 leading-relaxed text-[15px] italic">"{note.analogy}"</p>
                    )}
                    {section === 'code' && (
                      <pre className="text-emerald-300 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
                        {note.codeHint}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-3 w-full max-w-2xl justify-center">
            <button
              onClick={() => goSection(-1)}
              disabled={sectionIdx === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <ChevronLeft size={15} /> Prev
            </button>

            <button
              onClick={flip}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-stone-800 text-stone-200 hover:bg-stone-700 transition-colors text-sm"
            >
              <RotateCcw size={13} /> Flip
            </button>

            <button
              onClick={() => goSection(1)}
              disabled={sectionIdx === SECTIONS.length - 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setSide('front'); setSection(s) }}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  s === section ? 'bg-white scale-125' : 'bg-stone-600 hover:bg-stone-400',
                )}
              />
            ))}
          </div>

          {/* Mark as revised */}
          <button
            onClick={onMarkRevised}
            disabled={isRevised}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all mb-2',
              isRevised
                ? 'border border-stone-700 text-stone-500 cursor-default'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95',
            )}
          >
            <CheckCircle2 size={15} />
            {isRevised ? 'Already Revised' : 'Mark as Revised'}
          </button>

        </div>
      </div>
    </div>
  )
}
