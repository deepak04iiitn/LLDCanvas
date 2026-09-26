'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { rust } from '@codemirror/lang-rust'
import { go } from '@codemirror/lang-go'
import { javascript } from '@codemirror/lang-javascript'
import { EditorView } from '@codemirror/view'
import {
  Play, ChevronDown, Clock, MemoryStick,
  Loader2, AlertTriangle, CheckCircle2, RotateCcw, Bug,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { learnApi, type DebuggerChallenge } from '@/lib/learn-api'

// ─── Language helpers ─────────────────────────────────────────────────────────

function langDisplayName(lang: string): string {
  const map: Record<string, string> = {
    'python-3.14':    'Python 3',
    'openjdk-25':     'Java 25',
    'g++-15':         'C++ 15',
    'gcc-15':         'C (GCC)',
    'rust-1.93':      'Rust',
    'go-1.26':        'Go',
    'typescript-deno': 'TypeScript',
  }
  return map[lang] ?? lang
}

function getLangExtension(lang: string) {
  if (lang.includes('python'))                              return python()
  if (lang.includes('java') || lang.includes('openjdk'))   return java()
  if (lang.includes('c++') || lang.includes('g++') || lang.includes('gcc')) return cpp()
  if (lang.includes('go'))                                  return go()
  if (lang.includes('rust'))                                return rust()
  if (lang.includes('typescript'))                          return javascript({ typescript: true })
  return null
}

// ─── Editor theme (warm paper palette — identical to CodePanel.tsx) ───────────

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: '#FFFEFB',
    color: '#201F1C',
    fontSize: '13.5px',
    fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Consolas, monospace',
    height: '100%',
  },
  '.cm-scroller': { overflow: 'auto', fontFamily: 'inherit' },
  '.cm-content': {
    padding: '16px 8px 48px',
    caretColor: '#234E3F',
    lineHeight: '1.65',
  },
  '.cm-cursor': { borderLeftColor: '#234E3F', borderLeftWidth: '2px' },
  '.cm-selectionBackground, ::selection': { backgroundColor: '#234E3F22' },
  '.cm-gutters': {
    backgroundColor: '#F7F4EC',
    borderRight: '1px solid #E7E2D6',
    color: '#A69F8C',
    minWidth: '3.25rem',
  },
  '.cm-activeLineGutter': { backgroundColor: '#E7F0EB', color: '#234E3F', fontWeight: '600' },
  '.cm-activeLine': { backgroundColor: '#E7F0EB40' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 12px 0 8px' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: '#234E3F30' },
  '.cm-matchingBracket': { backgroundColor: '#234E3F18', outline: '1px solid #234E3F40' },
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface CodeResult {
  output: string
  error: string
  status: 'success' | 'error'
  exit_code: number
  signal: number | null
  time: string
  total: string
  memory: string
}

interface Props {
  challenge: DebuggerChallenge
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function outputMatches(actual: string, expected: string): boolean {
  return actual.trim() === expected.trim()
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DebuggerSession({ challenge }: Props) {
  const firstVariant = challenge.variants[0]

  const [selectedLang,  setSelectedLang]  = useState<string>(firstVariant?.language ?? 'python-3.14')
  const [code,          setCode]          = useState(firstVariant?.buggyCode ?? '')
  const [result,        setResult]        = useState<CodeResult | null>(null)
  const [running,       setRunning]       = useState(false)
  const [solved,        setSolved]        = useState(false)
  const [explanation,   setExplanation]   = useState<string | null>(null)
  const [showExpected,  setShowExpected]  = useState(false)
  const [showHint,      setShowHint]      = useState(false)
  const [runCount,      setRunCount]      = useState(0)
  const [consoleOpen,   setConsoleOpen]   = useState(false)
  const [bottomHeight,  setBottomHeight]  = useState(220)
  const [langOpen,      setLangOpen]      = useState(false)

  const startTimeRef    = useRef(Date.now())
  const vResizingRef    = useRef(false)
  const vStartYRef      = useRef(0)
  const vStartHRef      = useRef(220)
  const hResizingRef    = useRef(false)
  const hStartXRef      = useRef(0)
  const hStartWRef      = useRef(320)
  const [leftWidth,     setLeftWidth]     = useState(320)

  const currentVariant = challenge.variants.find(v => v.language === selectedLang) ?? firstVariant

  const langExt    = getLangExtension(selectedLang)
  const extensions = langExt ? [langExt, editorTheme] : [editorTheme]

  function switchLanguage(lang: string) {
    setSelectedLang(lang)
    const variant = challenge.variants.find(v => v.language === lang)
    if (variant) setCode(variant.buggyCode)
    setResult(null)
    setSolved(false)
    setExplanation(null)
    setShowExpected(false)
    setRunCount(0)
  }

  // Auto-reveal expected after first failed run
  useEffect(() => {
    if (runCount > 0 && result && !solved) {
      setShowExpected(true)
    }
  }, [runCount, result, solved])

  // Close lang dropdown on outside click
  useEffect(() => {
    if (!langOpen) return
    function close() { setLangOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [langOpen])

  const run = useCallback(async () => {
    if (running || !code.trim()) return
    setRunning(true)
    setResult(null)
    setConsoleOpen(true)
    try {
      const data = await api.code.run({
        compiler: selectedLang,
        code,
        input: challenge.testInput,
      })
      const res = data as CodeResult
      setResult(res)
      setRunCount(c => c + 1)
      if (
        !solved &&
        res.status === 'success' &&
        outputMatches(res.output, challenge.expectedOutput)
      ) {
        const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000)
        setSolved(true)
        try {
          const solveRes = await learnApi.debugger.recordSolve(
            challenge.slug || challenge._id || challenge.id || '',
            timeTaken,
          )
          setExplanation(solveRes.explanation)
        } catch {
          // explanation fetch failure is non-fatal
        }
      }
    } catch (err: unknown) {
      const apiErr = err as Error & { status?: number }
      setResult({
        output: '',
        error: apiErr instanceof Error ? apiErr.message : 'Unknown error',
        status: 'error',
        exit_code: 1,
        signal: null,
        time: '0',
        total: '0',
        memory: '0',
      })
    } finally {
      setRunning(false)
    }
  }, [running, code, challenge, solved, selectedLang])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        run()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [run])

  const startVerticalResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    vResizingRef.current = true
    vStartYRef.current   = e.clientY
    vStartHRef.current   = bottomHeight
    function onMove(ev: MouseEvent) {
      if (!vResizingRef.current) return
      const delta = vStartYRef.current - ev.clientY
      setBottomHeight(Math.min(520, Math.max(120, vStartHRef.current + delta)))
    }
    function onUp() {
      vResizingRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [bottomHeight])

  const startHorizontalResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    hResizingRef.current = true
    hStartXRef.current   = e.clientX
    hStartWRef.current   = leftWidth
    function onMove(ev: MouseEvent) {
      if (!hResizingRef.current) return
      const delta = ev.clientX - hStartXRef.current
      setLeftWidth(Math.min(600, Math.max(200, hStartWRef.current + delta)))
    }
    function onUp() {
      hResizingRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [leftWidth])

  const passed = result && result.status === 'success' && outputMatches(result.output, challenge.expectedOutput)

  return (
    <div
      className="flex min-h-0 flex-1 overflow-hidden"
      style={{ userSelect: hResizingRef.current ? 'none' : undefined }}
    >
      {/* ── Left info panel ─────────────────────────────────────────────── */}
      <aside
        style={{ width: leftWidth, minWidth: 200, maxWidth: 600 }}
        className="shrink-0 flex flex-col overflow-y-auto border-r border-hairline bg-paper-elevated"
      >
        <div className="flex flex-col gap-4 p-5">
          {/* Header badge */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-red-600">
              <Bug size={11} />
              Bug Hunt
            </span>
            <span className={cn(
              'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]',
              challenge.difficulty === 'easy'   && 'bg-emerald-50 text-emerald-700',
              challenge.difficulty === 'medium' && 'bg-amber-50   text-amber-700',
              challenge.difficulty === 'hard'   && 'bg-red-50     text-red-600',
            )}>
              {challenge.difficulty}
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-serif text-xl font-medium text-ink">{challenge.title}</h1>
            {/* Language pills */}
            <div className="mt-2 flex flex-wrap gap-1">
              {challenge.variants.map(v => (
                <span
                  key={v.language}
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-mono border transition-colors',
                    v.language === selectedLang
                      ? 'bg-brand/10 border-brand/30 text-brand font-semibold'
                      : 'bg-paper border-hairline text-ink-faint',
                  )}
                >
                  {langDisplayName(v.language)}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint mb-1">
              What it should do
            </p>
            <p className="text-[13px] leading-relaxed text-ink">{challenge.description}</p>
          </section>

          {/* Test input */}
          {challenge.testInput && (
            <section>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint mb-1">
                Test Input
              </p>
              <pre className="rounded-lg border border-hairline bg-[#F7F4EC] px-3 py-2 font-mono text-[12px] leading-relaxed text-ink whitespace-pre-wrap">
                {challenge.testInput}
              </pre>
            </section>
          )}

          {/* Expected output */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint mb-1">
              Expected Output
            </p>
            {showExpected || solved ? (
              <pre className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 font-mono text-[12px] leading-relaxed text-emerald-800 whitespace-pre-wrap">
                {challenge.expectedOutput}
              </pre>
            ) : (
              <button
                type="button"
                onClick={() => setShowExpected(true)}
                className="flex items-center gap-1.5 rounded-lg border border-hairline bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-muted transition hover:bg-brand-tint hover:text-brand hover:border-brand/30"
              >
                👁 View Expected Output
              </button>
            )}
          </section>

          {/* Hint */}
          <section>
            <button
              type="button"
              onClick={() => setShowHint(h => !h)}
              className="flex items-center gap-1.5 text-[12px] font-medium text-ink-muted transition hover:text-brand"
            >
              💡 {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {showHint && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-[12px] leading-relaxed text-amber-800">
                {challenge.hint}
              </p>
            )}
          </section>

          {/* Success state */}
          {solved && (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-emerald-800 text-[14px]">Bug Squashed! 🎉</span>
              </div>
              {explanation ? (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-600 mb-1">
                    Explanation
                  </p>
                  <p className="text-[12.5px] leading-relaxed text-emerald-900">{explanation}</p>
                </>
              ) : (
                <p className="text-[12px] text-emerald-700 italic">Great work fixing the bug!</p>
              )}
              <div className="mt-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  {challenge.bugType}
                </span>
              </div>
            </section>
          )}
        </div>
      </aside>

      {/* ── Horizontal resize handle ─────────────────────────────────────── */}
      <div
        onMouseDown={startHorizontalResize}
        className="group relative z-10 flex w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-hairline/40 transition-colors hover:bg-brand/30 active:bg-brand/50"
        title="Drag to resize"
      >
        <div className="h-8 w-0.5 rounded-full bg-hairline-strong transition-colors group-hover:bg-brand/60" />
      </div>

      {/* ── Right editor area ───────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,#F7F4EC_0%,#FBF9F4_28%,#FBF9F4_100%)]">
        {/* Topbar */}
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-hairline px-3">
          {/* Language selector */}
          {challenge.variants.length > 1 ? (
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 rounded-lg border border-hairline bg-paper-elevated px-2.5 py-1.5 text-[12px] font-medium text-ink transition hover:border-brand/40"
              >
                {langDisplayName(selectedLang)}
                <ChevronDown className="h-3 w-3 text-ink-faint" />
              </button>
              {langOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 min-w-[180px] rounded-xl border border-hairline bg-paper shadow-lg">
                  {challenge.variants.map(v => (
                    <button
                      key={v.language}
                      type="button"
                      onClick={() => { switchLanguage(v.language); setLangOpen(false) }}
                      className={cn(
                        'w-full px-3 py-2 text-left text-[12px] transition hover:bg-paper-elevated',
                        selectedLang === v.language ? 'text-brand font-semibold' : 'text-ink',
                      )}
                    >
                      {langDisplayName(v.language)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="rounded-md bg-brand/10 px-2 py-1 text-[11px] font-semibold text-brand">
              {langDisplayName(selectedLang)}
            </span>
          )}

          <div className="flex-1" />
          <button
            type="button"
            title="Reset to original buggy code"
            onClick={() => {
              setCode(currentVariant?.buggyCode ?? '')
              setResult(null)
              setSolved(false)
              setExplanation(null)
            }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-muted transition hover:bg-brand-tint hover:text-brand"
          >
            <RotateCcw size={13} />
            Reset
          </button>
          <button
            type="button"
            onClick={run}
            disabled={running || !code.trim()}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition',
              running || !code.trim()
                ? 'bg-brand/30 text-white cursor-not-allowed'
                : 'bg-brand text-white hover:bg-brand/90',
            )}
          >
            {running ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Play size={13} />
            )}
            Run
          </button>
          <span className="hidden sm:flex items-center gap-0.5 text-[10px] text-ink-faint ml-1">
            <kbd className="rounded border border-hairline bg-[#F7F4EC] px-1 py-0.5 font-mono text-[9px] font-medium text-ink-muted">Ctrl</kbd>
            +
            <kbd className="rounded border border-hairline bg-[#F7F4EC] px-1 py-0.5 font-mono text-[9px] font-medium text-ink-muted">↵</kbd>
          </span>
        </div>

        {/* Editor */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <CodeMirror
            value={code}
            onChange={setCode}
            extensions={extensions}
            basicSetup={{ lineNumbers: true, foldGutter: false, autocompletion: true }}
            style={{ height: '100%' }}
          />
        </div>

        {/* Console panel */}
        <div className="shrink-0 border-t border-hairline px-3 pb-3 pt-0">
          {!consoleOpen ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setConsoleOpen(true)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setConsoleOpen(true) }}
              className="flex cursor-pointer items-center gap-1.5 py-2 text-[11px] font-semibold text-ink-muted transition hover:text-ink"
            >
              <span>Output</span>
              {result && (
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  passed ? 'bg-emerald-500' : 'bg-red-500',
                )} />
              )}
              <span className="ml-auto flex items-center gap-1">
                Expand
                <ChevronDown className="h-3.5 w-3.5 rotate-180" />
              </span>
            </div>
          ) : (
            <div className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-paper-elevated shadow-[0_1px_2px_rgba(32,31,28,0.04),0_8px_24px_rgba(32,31,28,0.06)]">
              {/* Resize handle */}
              <div
                onMouseDown={startVerticalResize}
                className="group flex h-2.5 shrink-0 cursor-row-resize items-center justify-center border-b border-hairline/60 bg-[#F7F4EC]/50"
              >
                <div className="h-0.5 w-10 rounded-full bg-hairline transition-colors group-hover:bg-brand/40" />
              </div>
              <div className="flex min-h-0 flex-col" style={{ height: bottomHeight }}>
                {/* Header row */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setConsoleOpen(false)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setConsoleOpen(false) }}
                  className="flex shrink-0 cursor-pointer items-center gap-0.5 border-b border-hairline px-2.5 py-1.5 transition hover:bg-[#F7F4EC]/50"
                  title="Click to collapse"
                >
                  <span className="rounded-lg px-2.5 py-1 text-[11px] font-semibold bg-brand-tint text-brand">
                    Output
                  </span>
                  <div className="ml-auto flex items-center gap-2 pr-0.5">
                    {result && (
                      <span className={cn(
                        'flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold',
                        result.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600',
                      )}>
                        {result.status === 'success'
                          ? <CheckCircle2 className="h-2.5 w-2.5" />
                          : <AlertTriangle className="h-2.5 w-2.5" />
                        }
                        {result.status === 'success' ? 'Success' : `Exit ${result.exit_code}`}
                      </span>
                    )}
                    <span className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                {/* Output content */}
                <div className="min-h-0 flex-1 overflow-y-auto bg-[#FFFEFB] px-4 py-3">
                  {running && (
                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
                      Executing…
                    </div>
                  )}
                  {!running && !result && (
                    <div className="flex h-full min-h-14 items-center justify-center">
                      <p className="text-xs text-ink-faint">
                        Press{' '}
                        <kbd className="rounded border border-hairline bg-[#F7F4EC] px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-muted">Ctrl</kbd>
                        {' + '}
                        <kbd className="rounded border border-hairline bg-[#F7F4EC] px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-muted">Enter</kbd>
                        {' '}or click{' '}
                        <span className="font-semibold text-brand">Run</span>
                      </p>
                    </div>
                  )}
                  {!running && result && (
                    <div className="space-y-3">
                      {/* Actual output */}
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint mb-1">
                          Actual Output
                        </p>
                        {result.output ? (
                          <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-ink">
                            {result.output}
                          </pre>
                        ) : result.error ? (
                          <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-red-600">
                            {result.error}
                          </pre>
                        ) : (
                          <p className="text-xs italic text-ink-faint">No output produced.</p>
                        )}
                      </div>

                      {/* Pass / fail indicator */}
                      {result.status === 'success' && (
                        <div className={cn(
                          'flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold',
                          passed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-600 border border-red-200',
                        )}>
                          {passed ? (
                            <><CheckCircle2 size={14} /> Output matches! Bug fixed! 🎉</>
                          ) : (
                            <><AlertTriangle size={14} /> Not quite — keep debugging</>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer stats */}
                {result && !running && (
                  <div className="flex shrink-0 items-center gap-3 border-t border-hairline bg-[#F7F4EC]/60 px-4 py-2">
                    <span className="flex items-center gap-1.5 text-[10px] text-ink-faint">
                      <Clock className="h-3 w-3" />
                      {parseFloat(result.time) < 0.001
                        ? `${Math.round(parseFloat(result.total) * 1000)} ms`
                        : `${Math.round(parseFloat(result.time) * 1000)} ms · ${Math.round(parseFloat(result.total) * 1000)} ms total`
                      }
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-ink-faint">
                      <MemoryStick className="h-3 w-3" />
                      {Math.round(parseInt(result.memory) / 1024)} MB
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
