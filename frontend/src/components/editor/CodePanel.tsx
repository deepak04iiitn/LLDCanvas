'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { rust } from '@codemirror/lang-rust'
import { go } from '@codemirror/lang-go'
import { php } from '@codemirror/lang-php'
import { javascript } from '@codemirror/lang-javascript'
import { EditorView } from '@codemirror/view'
import {
  Play, ChevronDown, ChevronUp, ArrowLeft, Clock, MemoryStick, Terminal,
  Loader2, AlertTriangle, CheckCircle2, Copy, Check, RotateCcw,
  Ban, Zap, History, Keyboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { RunHistoryDrawer } from './RunHistoryDrawer'

// ─── Language config ─────────────────────────────────────────────────────────

const LANGUAGES = [
  { label: 'Python 3.14',       value: 'python-3.14',      ext: python() },
  { label: 'C (GCC 15)',        value: 'gcc-15',           ext: cpp() },
  { label: 'C++ (G++ 15)',      value: 'g++-15',           ext: cpp() },
  { label: 'Java 25',           value: 'openjdk-25',       ext: java() },
  { label: 'C# (.NET 9)',       value: 'dotnet-csharp-9',  ext: cpp() },
  { label: 'F# (.NET 9)',       value: 'dotnet-fsharp-9',  ext: null },
  { label: 'PHP 8.5',           value: 'php-8.5',          ext: php() },
  { label: 'Ruby 4.0',          value: 'ruby-4.0',         ext: null },
  { label: 'Haskell 9.12',      value: 'haskell-9.12',     ext: null },
  { label: 'Go 1.26',           value: 'go-1.26',          ext: go() },
  { label: 'Rust 1.93',         value: 'rust-1.93',        ext: rust() },
  { label: 'TypeScript (Deno)', value: 'typescript-deno',  ext: javascript({ typescript: true }) },
] as const

type LangValue = (typeof LANGUAGES)[number]['value']

// ─── Starter snippets ────────────────────────────────────────────────────────

const STARTERS: Record<LangValue, string> = {
  'python-3.14': `# Python 3.14\nname = input("Enter your name: ")\nprint(f"Hello, {name}!")`,
  'gcc-15':
`// C (GCC 15)
#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  'g++-15':
`// C++ (G++ 15)
#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  'openjdk-25':
`// Java 25
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  'dotnet-csharp-9':
`// C# .NET 9
using System;
Console.WriteLine("Hello, World!");`,
  'dotnet-fsharp-9':
`// F# .NET 9
printfn "Hello, World!"`,
  'php-8.5':
`<?php
// PHP 8.5
echo "Hello, World!\\n";`,
  'ruby-4.0':
`# Ruby 4.0
puts "Hello, World!"`,
  'haskell-9.12':
`-- Haskell GHC 9.12
main :: IO ()
main = putStrLn "Hello, World!"`,
  'go-1.26':
`// Go 1.26
package main
import "fmt"
func main() {
    fmt.Println("Hello, World!")
}`,
  'rust-1.93':
`// Rust 1.93
fn main() {
    println!("Hello, World!");
}`,
  'typescript-deno':
`// TypeScript (Deno)
const name: string = "World";
console.log(\`Hello, \${name}!\`);`,
}

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface CodePanelProps {
  open: boolean
  onClose: () => void
  problemSlug?: string
}

type ConsoleTab = 'output' | 'stdin'

// ─── Editor theme (warm paper palette) ───────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

export function CodePanel({ open, onClose, problemSlug }: CodePanelProps) {
  const [lang,         setLang]         = useState<LangValue>('python-3.14')
  const [code,         setCode]         = useState(STARTERS['python-3.14'])
  const [stdin,        setStdin]        = useState('')
  const [consoleTab,   setConsoleTab]   = useState<ConsoleTab>('output')
  const [consoleOpen,  setConsoleOpen]  = useState(false)
  const [running,      setRunning]      = useState(false)
  const [result,       setResult]       = useState<CodeResult | null>(null)
  const [copied,       setCopied]       = useState(false)
  const [banned,       setBanned]       = useState<string | null>(null)
  const [dailyLimitHit, setDailyLimitHit] = useState(false)
  const [langOpen,     setLangOpen]     = useState(false)
  const [bottomHeight, setBottomHeight] = useState(200)
  const [historyOpen,  setHistoryOpen]  = useState(false)
  const [runCount,     setRunCount]     = useState(0)

  const vResizingRef = useRef(false)
  const vStartYRef   = useRef(0)
  const vStartHRef   = useRef(200)

  const currentLang = LANGUAGES.find(l => l.value === lang)!
  const stdinLines  = stdin.trim() ? stdin.split('\n').length : 0

  function openConsole(tab: ConsoleTab = 'output') {
    setConsoleTab(tab)
    setConsoleOpen(true)
  }

  function switchLang(v: LangValue) {
    setLang(v)
    setCode(STARTERS[v])
    setResult(null)
    setLangOpen(false)
  }

  const run = useCallback(async () => {
    if (running || !code.trim()) return
    setRunning(true)
    setResult(null)
    setConsoleTab('output')
    setConsoleOpen(true)
    try {
      const data = await api.code.run({ compiler: lang, code, input: stdin, ...(problemSlug ? { problemSlug } : {}) })
      setResult(data as CodeResult)
      setRunCount(c => c + 1)
    } catch (err: unknown) {
      const apiErr = err as Error & { banned?: boolean; status?: number }
      if (apiErr.banned) {
        setBanned(apiErr.message)
        return
      }
      if (apiErr.status === 429) {
        setDailyLimitHit(true)
        return
      }
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
  }, [running, code, lang, stdin, problemSlug])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        run()
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        if (langOpen) { setLangOpen(false); return }
        if (historyOpen) { setHistoryOpen(false); return }
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, run, onClose, langOpen, historyOpen])

  const startVerticalResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    vResizingRef.current = true
    vStartYRef.current   = e.clientY
    vStartHRef.current   = bottomHeight

    function onMove(ev: MouseEvent) {
      if (!vResizingRef.current) return
      const delta = vStartYRef.current - ev.clientY
      const next  = Math.min(520, Math.max(120, vStartHRef.current + delta))
      setBottomHeight(next)
    }
    function onUp() {
      vResizingRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [bottomHeight])

  function copyOutput() {
    const text = result?.output || result?.error || ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const extensions = currentLang.ext ? [currentLang.ext, editorTheme] : [editorTheme]
  const canRun = !running && !!code.trim() && !banned && !dailyLimitHit

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: open ? 1 : 0,
        y: open ? 0 : 10,
      }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'absolute inset-0 z-40 flex flex-col',
        'bg-[linear-gradient(180deg,#F7F4EC_0%,#FBF9F4_28%,#FBF9F4_100%)]',
        !open && 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      {/* ── Alerts ─────────────────────────────────────────────────────── */}
      {banned && (
        <div className="shrink-0 border-b border-red-200/80 bg-red-50/90 px-5 py-3 flex items-start gap-2.5 backdrop-blur-sm">
          <Ban className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-red-700">Code execution revoked</p>
            <p className="mt-0.5 text-xs text-red-600 leading-relaxed">{banned}</p>
          </div>
        </div>
      )}

      {dailyLimitHit && !banned && (
        <div className="shrink-0 border-b border-amber-200/80 bg-amber-50/90 px-5 py-3 flex items-center gap-2.5 backdrop-blur-sm">
          <Zap className="h-4 w-4 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-amber-800">Daily limit reached</p>
            <p className="text-xs text-amber-700">You&apos;ve used all your executions for today.</p>
          </div>
          <a
            href="/pricing"
            className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground hover:bg-brand-hover transition-colors"
          >
            Upgrade
          </a>
        </div>
      )}

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-4 pt-3 pb-2.5 sm:px-5">
        <div className="flex items-center gap-3">
          {/* Mode switch */}
          <div className="flex items-center rounded-xl border border-hairline bg-paper-elevated/80 p-0.5 shadow-sm backdrop-blur-sm">
            <button
              onClick={onClose}
              title="Back to UML (Esc)"
              className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-hairline/70 hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">UML</span>
            </button>
            <div className="flex items-center gap-1.5 rounded-[10px] bg-brand px-2.5 py-1.5 text-xs font-semibold text-brand-foreground shadow-sm">
              <Terminal className="h-3.5 w-3.5 opacity-90" />
              Code
            </div>
          </div>

          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl border border-hairline bg-paper-elevated/90 px-3 py-1.5',
                'text-xs font-medium text-ink shadow-sm transition hover:border-hairline-strong hover:bg-paper-elevated',
                langOpen && 'border-brand/30 ring-2 ring-brand/10',
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {currentLang.label}
              <ChevronDown className={cn('h-3 w-3 text-ink-faint transition-transform', langOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-0 top-full z-20 mt-1.5 w-56 overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-xl"
                  >
                    <div className="max-h-72 overflow-y-auto py-1">
                      {LANGUAGES.map(l => (
                        <button
                          key={l.value}
                          onClick={() => switchLang(l.value)}
                          className={cn(
                            'flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition',
                            lang === l.value
                              ? 'bg-brand-tint font-semibold text-brand'
                              : 'text-ink hover:bg-brand-tint/60 hover:text-brand',
                          )}
                        >
                          <span className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            lang === l.value ? 'bg-brand' : 'bg-hairline-strong',
                          )} />
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => { setCode(STARTERS[lang]); setResult(null) }}
              title="Reset to starter code"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition hover:bg-hairline/80 hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setHistoryOpen(v => !v)}
              title="Run history"
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition',
                historyOpen
                  ? 'bg-brand-tint text-brand'
                  : 'text-ink-faint hover:bg-hairline/80 hover:text-ink',
              )}
            >
              <History className="h-3.5 w-3.5" />
            </button>

            <div className="mx-0.5 hidden h-5 w-px bg-hairline sm:block" />

            <button
              onClick={run}
              disabled={!canRun}
              className={cn(
                'group flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-sm transition',
                'bg-brand text-brand-foreground hover:bg-brand-hover',
                'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
              )}
              title={banned ? 'Code execution revoked by admin' : 'Run (Ctrl+Enter)'}
            >
              {running
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Play className="h-3.5 w-3.5 fill-current" />
              }
              {running ? 'Running…' : 'Run'}
              {!running && (
                <kbd className="hidden items-center rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-brand-foreground/80 sm:inline-flex">
                  ⌃↵
                </kbd>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Editor surface ─────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 px-3 pb-2 sm:px-4">
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-hairline bg-paper-elevated shadow-[0_1px_2px_rgba(32,31,28,0.04),0_8px_24px_rgba(32,31,28,0.06)]">
          <div className="flex items-center gap-2 border-b border-hairline/80 bg-[#F7F4EC]/70 px-3.5 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#E8C4B8]" />
              <span className="h-2 w-2 rounded-full bg-[#E2D6A8]" />
              <span className="h-2 w-2 rounded-full bg-[#B8D4C4]" />
            </div>
            <span className="ml-1.5 font-mono text-[10px] font-medium tracking-wide text-ink-faint">
              main · {currentLang.label.split(' ')[0]}
            </span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-ink-faint">
              <Keyboard className="h-3 w-3" />
              Esc → UML
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <CodeMirror
              value={code}
              onChange={setCode}
              extensions={extensions}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                foldGutter: false,
                autocompletion: true,
                bracketMatching: true,
                closeBrackets: true,
                indentOnInput: true,
                tabSize: 2,
              }}
              height="100%"
              style={{ height: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* ── Console ────────────────────────────────────────────────────── */}
      <div className="mx-3 mb-3 shrink-0 sm:mx-4 sm:mb-4">
        {!consoleOpen ? (
          /* Collapsed bar — entire row expands */
          <div
            role="button"
            tabIndex={0}
            onClick={() => openConsole(result ? 'output' : consoleTab)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openConsole(result ? 'output' : consoleTab)
              }
            }}
            className="flex w-full cursor-pointer items-center gap-1 rounded-xl border border-hairline bg-paper-elevated px-2 py-1.5 text-left shadow-[0_1px_2px_rgba(32,31,28,0.04)] transition hover:border-hairline-strong hover:bg-[#F7F4EC]/80"
          >
            <button
              type="button"
              onClick={e => { e.stopPropagation(); openConsole('output') }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-ink-muted transition hover:bg-brand-tint hover:text-brand"
            >
              Output
              {result && (
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  result.status === 'success' ? 'bg-emerald-500' : 'bg-red-500',
                )} />
              )}
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); openConsole('stdin') }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-ink-muted transition hover:bg-brand-tint hover:text-brand"
            >
              Stdin
              {stdinLines > 0 && (
                <span className="rounded-md bg-brand/15 px-1.5 py-px text-[9px] font-bold text-brand">
                  {stdinLines}
                </span>
              )}
            </button>
            <span className="ml-auto flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-ink-faint">
              Expand
              <ChevronUp className="h-3.5 w-3.5" />
            </span>
          </div>
        ) : (
          /* Expanded console */
          <div className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-paper-elevated shadow-[0_1px_2px_rgba(32,31,28,0.04),0_8px_24px_rgba(32,31,28,0.06)]">
            <div
              onMouseDown={startVerticalResize}
              className="group flex h-2.5 shrink-0 cursor-row-resize items-center justify-center border-b border-hairline/60 bg-[#F7F4EC]/50"
            >
              <div className="h-0.5 w-10 rounded-full bg-hairline-strong transition-colors group-hover:bg-brand/40" />
            </div>

            <div className="flex min-h-0 flex-col" style={{ height: bottomHeight }}>
              {/* Header row — click empty space to collapse */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setConsoleOpen(false)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setConsoleOpen(false) } }}
                className="flex shrink-0 cursor-pointer items-center gap-0.5 border-b border-hairline px-2.5 py-1.5 transition hover:bg-[#F7F4EC]/50"
                title="Click to collapse"
              >
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setConsoleTab('output') }}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition',
                    consoleTab === 'output'
                      ? 'bg-brand-tint text-brand'
                      : 'text-ink-muted hover:bg-hairline/70 hover:text-ink',
                  )}
                >
                  Output
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setConsoleTab('stdin') }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition',
                    consoleTab === 'stdin'
                      ? 'bg-brand-tint text-brand'
                      : 'text-ink-muted hover:bg-hairline/70 hover:text-ink',
                  )}
                >
                  Stdin
                  {stdinLines > 0 && (
                    <span className="rounded-md bg-brand/15 px-1.5 py-px text-[9px] font-bold text-brand">
                      {stdinLines}
                    </span>
                  )}
                </button>

                <div className="ml-auto flex items-center gap-1 pr-0.5">
                  {result && consoleTab === 'output' && (
                    <>
                      <span
                        onClick={e => e.stopPropagation()}
                        className={cn(
                          'flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold',
                          result.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-600',
                        )}
                      >
                        {result.status === 'success'
                          ? <CheckCircle2 className="h-2.5 w-2.5" />
                          : <AlertTriangle className="h-2.5 w-2.5" />
                        }
                        {result.status === 'success' ? 'Success' : `Exit ${result.exit_code}`}
                      </span>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); copyOutput() }}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint transition hover:bg-hairline hover:text-ink"
                        title="Copy output"
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </>
                  )}
                  <span className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden bg-[#FFFEFB]">
                {consoleTab === 'stdin' ? (
                  <textarea
                    value={stdin}
                    onChange={e => setStdin(e.target.value)}
                    placeholder="Program input — one value per line…"
                    className="h-full w-full resize-none bg-transparent px-4 py-3 font-mono text-[12.5px] leading-relaxed text-ink placeholder:text-ink-faint outline-none"
                    spellCheck={false}
                  />
                ) : (
                  <div className="flex h-full min-h-0 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
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
                        <div className="space-y-2">
                          {result.output && (
                            <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-ink">
                              {result.output}
                            </pre>
                          )}
                          {result.error && (
                            <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-red-600">
                              {result.error}
                            </pre>
                          )}
                          {!result.output && !result.error && (
                            <p className="text-xs italic text-ink-faint">No output produced.</p>
                          )}
                        </div>
                      )}
                    </div>

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
                        {result.signal !== null && (
                          <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                            Signal {result.signal}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <RunHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        problemSlug={problemSlug}
        runCount={runCount}
        onRestoreCode={(restoredCode, language) => {
          setCode(restoredCode)
          setLang(language as typeof lang)
          setResult(null)
        }}
      />
    </motion.div>
  )
}
