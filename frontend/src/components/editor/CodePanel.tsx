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
  X, Play, ChevronDown, ChevronRight, GripVertical,
  Clock, MemoryStick, Terminal, Loader2, AlertTriangle,
  CheckCircle2, Copy, Check, RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

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
}

// ─── Light theme for CodeMirror to match app ─────────────────────────────────

const lightTheme = EditorView.theme({
  '&': { backgroundColor: '#FAFAF9', color: '#1C1917', fontSize: '13px', fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace' },
  '.cm-content': { padding: '12px 4px', caretColor: '#3D6A52' },
  '.cm-cursor': { borderLeftColor: '#3D6A52' },
  '.cm-selectionBackground, ::selection': { backgroundColor: '#3D6A5220' },
  '.cm-gutters': { backgroundColor: '#F5F5F4', borderRight: '1px solid #E7E5E4', color: '#A8A29E' },
  '.cm-activeLineGutter': { backgroundColor: '#EEF2EE' },
  '.cm-activeLine': { backgroundColor: '#EEF2EE50' },
  '.cm-lineNumbers': { minWidth: '3em' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: '#3D6A5230' },
})

// ─── Component ───────────────────────────────────────────────────────────────

export function CodePanel({ open, onClose }: CodePanelProps) {
  const [lang,         setLang]         = useState<LangValue>('python-3.14')
  const [code,         setCode]         = useState(STARTERS['python-3.14'])
  const [stdin,        setStdin]        = useState('')
  const [stdinOpen,    setStdinOpen]    = useState(false)
  const [running,      setRunning]      = useState(false)
  const [result,       setResult]       = useState<CodeResult | null>(null)
  const [copied,       setCopied]       = useState(false)
  const [panelWidth,   setPanelWidth]   = useState(480)
  const [langOpen,     setLangOpen]     = useState(false)

  const panelRef    = useRef<HTMLElement>(null)
  const resizingRef = useRef(false)
  const startXRef   = useRef(0)
  const startWRef   = useRef(480)

  const currentLang = LANGUAGES.find(l => l.value === lang)!

  // Switch language — reset code to starter snippet
  function switchLang(v: LangValue) {
    setLang(v)
    setCode(STARTERS[v])
    setResult(null)
    setLangOpen(false)
  }

  // Run code
  const run = useCallback(async () => {
    if (running || !code.trim()) return
    setRunning(true)
    setResult(null)
    try {
      const data = await api.code.run({ compiler: lang, code, input: stdin })
      setResult(data as CodeResult)
    } catch (err: unknown) {
      setResult({
        output: '',
        error: err instanceof Error ? err.message : 'Unknown error',
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
  }, [running, code, lang, stdin])

  // Ctrl+Enter to run
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        run()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, run])

  // Drag-resize from left edge
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    resizingRef.current = true
    startXRef.current   = e.clientX
    startWRef.current   = panelWidth

    function onMove(ev: MouseEvent) {
      if (!resizingRef.current) return
      const delta = startXRef.current - ev.clientX
      const next  = Math.min(800, Math.max(320, startWRef.current + delta))
      setPanelWidth(next)
    }
    function onUp() {
      resizingRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [panelWidth])

  // Copy output
  function copyOutput() {
    const text = result?.output || result?.error || ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const extensions = currentLang.ext ? [currentLang.ext, lightTheme] : [lightTheme]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/10"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            ref={panelRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            style={{ width: panelWidth }}
            className="absolute right-0 top-0 z-50 flex h-full flex-col border-l border-hairline bg-paper-elevated shadow-2xl"
          >
            {/* Drag handle — left edge */}
            <div
              onMouseDown={startResize}
              className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-brand/20 transition-colors z-10 group"
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex h-12 w-1.5 items-center justify-center">
                <GripVertical className="h-4 w-4 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 border-b border-hairline px-4 py-3 shrink-0">
              <Terminal className="h-4 w-4 text-brand shrink-0" />
              <span className="font-semibold text-sm text-ink">Code</span>

              {/* Language selector */}
              <div className="relative ml-1">
                <button
                  onClick={() => setLangOpen(v => !v)}
                  className="flex items-center gap-1.5 rounded-md border border-hairline bg-paper px-2.5 py-1 text-xs font-medium text-ink transition hover:bg-hairline"
                >
                  {currentLang.label}
                  <ChevronDown className={cn('h-3 w-3 text-ink-faint transition-transform', langOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-xl"
                    >
                      {LANGUAGES.map(l => (
                        <button
                          key={l.value}
                          onClick={() => switchLang(l.value)}
                          className={cn(
                            'flex w-full items-center px-3 py-2 text-xs text-left transition hover:bg-brand-tint hover:text-brand',
                            lang === l.value && 'bg-brand-tint text-brand font-semibold',
                          )}
                        >
                          {l.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="ml-auto flex items-center gap-2">
                {/* Reset to starter */}
                <button
                  onClick={() => { setCode(STARTERS[lang]); setResult(null) }}
                  title="Reset to starter code"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-hairline hover:text-ink transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>

                {/* Run */}
                <button
                  onClick={run}
                  disabled={running || !code.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-50"
                  title="Run (Ctrl+Enter)"
                >
                  {running
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Play className="h-3.5 w-3.5 fill-current" />
                  }
                  {running ? 'Running…' : 'Run'}
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-hairline hover:text-ink transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Code Editor ──────────────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden min-h-0">
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
                style={{ height: '100%', fontSize: '13px' }}
              />
            </div>

            {/* ── Stdin accordion ──────────────────────────────────────────── */}
            <div className="shrink-0 border-t border-hairline">
              <button
                onClick={() => setStdinOpen(v => !v)}
                className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-ink-muted hover:bg-hairline/60 transition"
              >
                {stdinOpen
                  ? <ChevronDown className="h-3.5 w-3.5" />
                  : <ChevronRight className="h-3.5 w-3.5" />
                }
                Standard Input (stdin)
                {stdin && (
                  <span className="ml-auto rounded-full bg-brand-tint px-1.5 py-0.5 text-[9px] font-bold text-brand">
                    {stdin.split('\n').length} line{stdin.split('\n').length > 1 ? 's' : ''}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {stdinOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={stdin}
                      onChange={e => setStdin(e.target.value)}
                      placeholder="Enter stdin input (one value per line)…"
                      rows={4}
                      className="w-full resize-none border-t border-hairline bg-paper px-4 py-2 font-mono text-xs text-ink placeholder:text-ink-faint outline-none focus:bg-paper-elevated"
                      spellCheck={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Output pane ──────────────────────────────────────────────── */}
            <div className="shrink-0 border-t border-hairline bg-paper" style={{ minHeight: 160 }}>
              {/* Output header */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-hairline">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                  Output
                </span>
                {result && (
                  <span className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
                    result.status === 'success'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-600',
                  )}>
                    {result.status === 'success'
                      ? <CheckCircle2 className="h-2.5 w-2.5" />
                      : <AlertTriangle className="h-2.5 w-2.5" />
                    }
                    {result.status === 'success' ? 'Success' : `Exit ${result.exit_code}`}
                  </span>
                )}
                {result && (
                  <button
                    onClick={copyOutput}
                    className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-ink-faint hover:bg-hairline transition"
                    title="Copy output"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                )}
              </div>

              {/* Output content */}
              <div className="max-h-[200px] overflow-y-auto px-4 py-3">
                {running && (
                  <div className="flex items-center gap-2 text-xs text-ink-faint">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
                    Executing…
                  </div>
                )}

                {!running && !result && (
                  <p className="text-xs text-ink-faint">
                    Press <kbd className="rounded border border-hairline bg-hairline px-1 py-0.5 font-mono text-[10px]">Ctrl</kbd>
                    {' + '}
                    <kbd className="rounded border border-hairline bg-hairline px-1 py-0.5 font-mono text-[10px]">Enter</kbd>
                    {' or click '}
                    <span className="font-medium text-brand">Run</span>
                    {' to execute.'}
                  </p>
                )}

                {!running && result && (
                  <div className="space-y-2">
                    {result.output && (
                      <pre className="whitespace-pre-wrap font-mono text-xs text-ink leading-relaxed">
                        {result.output}
                      </pre>
                    )}
                    {result.error && (
                      <pre className="whitespace-pre-wrap font-mono text-xs text-red-600 leading-relaxed">
                        {result.error}
                      </pre>
                    )}
                    {!result.output && !result.error && (
                      <p className="text-xs text-ink-faint italic">No output produced.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Stats footer */}
              {result && !running && (
                <div className="flex items-center gap-3 border-t border-hairline px-4 py-2">
                  <span className="flex items-center gap-1 text-[10px] text-ink-faint">
                    <Clock className="h-3 w-3" />
                    {parseFloat(result.time) < 0.001
                      ? `${Math.round(parseFloat(result.total) * 1000)} ms total`
                      : `${Math.round(parseFloat(result.time) * 1000)} ms exec · ${Math.round(parseFloat(result.total) * 1000)} ms total`
                    }
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-ink-faint">
                    <MemoryStick className="h-3 w-3" />
                    {Math.round(parseInt(result.memory) / 1024)} MB
                  </span>
                  {result.signal !== null && (
                    <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                      Signal {result.signal}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
