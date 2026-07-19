'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react'
import { nanoid } from 'nanoid'
import { AlertCircle, ArrowLeftRight, BookOpen, Check, Code2, Copy, Download, FileInput, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Wordmark } from '@/components/Brand'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { SyntaxGuideSheet } from '@/components/playground/SyntaxGuideSheet'
import { EditorProvider } from '@/contexts/EditorContext'
import { CanvasView } from '@/components/canvas/CanvasView'
import { parse, renderToFlow, serializeToDraft } from '@/lib/draft'
import type { ParseError } from '@/lib/draft'
import type { UMLNodeData, UMLEdgeData } from '@/types'
import { cn } from '@/lib/utils'
import { CodePanel } from '@/components/editor/CodePanel'

const PLACEHOLDER = `# Draft Notation — write a design, watch it render
# Docs: lldcanvas.com/docs

User
User knows id, name: String, email: String
User can login(), getProfile(): Profile

Order
Order knows id, total: number, status: OrderStatus
Order can place(), cancel()

OrderItem
OrderItem knows productId, quantity: int, price: number

enum OrderStatus
  PENDING, CONFIRMED, SHIPPED, DELIVERED

User has many Order
Order owns OrderItem
`

type View = 'code' | 'diagram'

// ─── Code pane ────────────────────────────────────────────────────────────────

interface CodePaneProps {
  code: string
  onChange: (v: string) => void
  errors: ParseError[]
  parsing: boolean
}

function CodePane({ code, onChange, errors, parsing }: CodePaneProps) {
  const [lineCount, setLineCount] = useState(1)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumRef  = useRef<HTMLDivElement>(null)

  useEffect(() => { setLineCount(code.split('\n').length) }, [code])

  function syncScroll() {
    if (lineNumRef.current && textareaRef.current) {
      lineNumRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const s = ta.selectionStart
      const end = ta.selectionEnd
      const next = code.slice(0, s) + '  ' + code.slice(end)
      onChange(next)
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 2 }, 0)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([code], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'playground.draft'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-hairline bg-[#14130f]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-brand/20">
            <span className="font-mono text-[10px] font-black text-emerald-300">{`{}`}</span>
          </div>
          <span className="font-mono text-xs font-semibold text-white/80">Draft Notation</span>
          {parsing && <Loader2 className="h-3 w-3 animate-spin text-white/30" />}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-white/40 transition-colors hover:text-white/70"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-white/40 transition-colors hover:text-white/70"
          >
            <Download size={11} /> .draft
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="relative flex flex-1 overflow-hidden font-mono text-xs leading-5">
        <div
          ref={lineNumRef}
          className="no-scrollbar select-none overflow-hidden border-r border-white/[0.06] bg-white/[0.03] py-3 pr-3 pl-3 text-right text-white/25"
          style={{ width: '38px', lineHeight: '20px' }}
        >
          {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          className="no-scrollbar flex-1 resize-none bg-transparent py-3 pr-4 pl-4 text-white/85
                     outline-none placeholder:text-white/20 caret-emerald-400"
          style={{ lineHeight: '20px', tabSize: 2 }}
        />
      </div>

      {/* Errors / hints */}
      <div className="shrink-0 border-t border-white/[0.06]">
        {errors.length > 0 ? (
          <div className="max-h-24 space-y-1 overflow-y-auto px-3 py-2">
            {errors.map((e, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[10px] text-red-400">
                <AlertCircle size={11} className="mt-px shrink-0" />
                <span>Line {e.line}: {e.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-2">
            <p className="font-mono text-[10px] text-white/25">Diagram updates as you type · 400ms debounce</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Diagram pane (real canvas — same rendering engine as the editor) ─────────

interface DiagramPaneProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  setNodes: (updater: (nds: Node[]) => Node[]) => void
  setEdges: (updater: (eds: Edge[]) => Edge[]) => void
  onSyncToCode: () => void
}

function DiagramPaneInner({ nodes, edges, onNodesChange, onEdgesChange, setNodes, setEdges, onSyncToCode }: DiagramPaneProps) {
  const { getNodes } = useReactFlow()

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(eds =>
        addEdge(
          {
            ...params,
            id: nanoid(8),
            type: 'association',
            data: { relationshipType: 'association' } satisfies UMLEdgeData,
          },
          eds,
        ),
      )
    },
    [setEdges],
  )

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-hairline bg-paper-elevated">
      <div className="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-ink">Live UML Diagram</span>
          <span className="font-mono text-[11px] text-brand">{nodes.length} classes</span>
          <span className="font-mono text-[11px] text-ink-faint">{edges.length} relationships</span>
        </div>
        <button
          onClick={onSyncToCode}
          title="Regenerate the code from any manual changes you've made to the diagram"
          className="flex items-center gap-1.5 rounded-md border border-hairline-strong px-2.5 py-1 text-[11px]
                     font-medium text-ink-muted transition-colors hover:border-brand/40 hover:text-brand"
        >
          <ArrowLeftRight size={11} /> Sync to code
        </button>
      </div>
      <div className="relative flex-1">
        <CanvasView
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={() => {}}
          canvasMode="pan"
          selectedCount={0}
          onDuplicate={() => {}}
          onDelete={() => {
            const selected = getNodes().filter(n => n.selected)
            if (selected.length === 0) return
            const ids = new Set(selected.map(n => n.id))
            setNodes(nds => nds.filter(n => !ids.has(n.id)))
            setEdges(eds => eds.filter(e => !ids.has(e.source) && !ids.has(e.target)))
          }}
          onClearSelection={() => {}}
        />
      </div>
    </div>
  )
}

function DiagramPane(props: DiagramPaneProps) {
  return (
    <ReactFlowProvider>
      <DiagramPaneInner {...props} />
    </ReactFlowProvider>
  )
}

// ─── Picture-in-picture thumbnail of whichever view isn't active ──────────────
// Keeps the other half of the "code ↔ diagram" story always in view, without
// permanently taking half the screen away from whichever one you're actually
// looking at — click it to swap focus.

function PipThumbnail({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  // A <div role="button"> rather than a real <button> — the mini preview
  // inside (CanvasView) renders its own zoom-control buttons, and a <button>
  // can never contain another <button> without breaking HTML validity /
  // hydration.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      title={`Switch to ${label}`}
      className="group absolute right-4 bottom-4 z-20 h-36 w-56 cursor-pointer overflow-hidden rounded-lg
                 border border-hairline-strong bg-paper shadow-lg transition-all duration-150
                 hover:scale-[1.03] hover:shadow-xl"
    >
      <div className="pointer-events-none h-full w-full">{children}</div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between
                       bg-black/70 px-2 py-1 backdrop-blur-sm">
        <span className="text-[10px] font-medium text-white">{label}</span>
        <span className="text-[10px] text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
          Click to view →
        </span>
      </div>
    </div>
  )
}

// Keeps the mini canvas fit to view as nodes change (React Flow's `fitView`
// prop only ever fits once, on mount — this pane never unmounts while it's
// the inactive-view thumbnail, so it needs its own continuous re-fit).
function MiniDiagramFit({ nodeCount }: { nodeCount: number }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const raf = requestAnimationFrame(() => fitView({ padding: 0.25, duration: 200 }))
    return () => cancelAnimationFrame(raf)
  }, [nodeCount, fitView])
  return null
}

function MiniDiagramPreview({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  return (
    <ReactFlowProvider>
      <CanvasView
        nodes={nodes}
        edges={edges}
        onNodesChange={() => {}}
        onEdgesChange={() => {}}
        onConnect={() => {}}
        onInit={() => {}}
        canvasMode="pan"
        selectedCount={0}
        onDuplicate={() => {}}
        onDelete={() => {}}
        onClearSelection={() => {}}
        readOnly
      />
      <MiniDiagramFit nodeCount={nodes.length} />
    </ReactFlowProvider>
  )
}

function MiniCodePreview({ code }: { code: string }) {
  return (
    <pre className="h-full w-full overflow-hidden bg-[#14130f] p-3 font-mono text-[8px] leading-[10px] text-white/50">
      {code}
    </pre>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const [view, setView]           = useState<View>('code')
  const [code, setCode]           = useState(PLACEHOLDER)
  const [errors, setErrors]       = useState<ParseError[]>([])
  const [parsing, setParsing]     = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [codeOpen, setCodeOpen]   = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applyCode = useCallback((text: string) => {
    const { ast, errors: errs } = parse(text)
    setErrors(errs)
    setParsing(false)
    if (ast.nodes.length > 0 || ast.relationships.length > 0) {
      const { nodes: n, edges: e } = renderToFlow(ast)
      setNodes(n as Node[])
      setEdges(e as Edge[])
    }
  }, [setNodes, setEdges])

  // Parse the placeholder once on mount
  useEffect(() => { applyCode(PLACEHOLDER) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCodeChange(v: string) {
    setCode(v)
    setParsing(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => applyCode(v), 400)
  }

  function handleSyncToCode() {
    const text = serializeToDraft(nodes as Node<UMLNodeData>[], edges as Edge<UMLEdgeData>[])
    setCode(text)
    setErrors([])
    toast.success('Code regenerated from the diagram')
  }

  return (
    <EditorProvider>
      <div className="flex min-h-screen flex-col text-ink">
        {/* Single slim toolbar */}
        <header className="relative flex h-16 shrink-0 items-center gap-3 border-b-2 border-hairline-strong bg-paper px-4 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] sm:px-6">
          <Link href="/" className="shrink-0">
            <Wordmark height={40} priority />
          </Link>

          {/* Centered: Playground label + divider + Code toggle */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto flex items-center gap-3">
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                Playground
              </p>
              <div className="h-4 w-px bg-hairline-strong" />
              <button
                onClick={() => setCodeOpen(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 font-mono text-sm font-semibold uppercase tracking-[0.2em] transition-colors',
                  codeOpen ? 'text-brand/60' : 'text-brand hover:text-brand/70',
                )}
              >
                <Code2 size={13} /> Code
              </button>
            </div>
          </div>

          <div className="flex-1" />
          <button
            onClick={() => setGuideOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium
                       text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink"
          >
            <BookOpen size={13} /> <span className="hidden sm:inline">Syntax guide</span>
          </button>
          <Link
            href="/editor/local"
            className={cn(
              'flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold',
              'text-brand-foreground transition-colors hover:bg-brand-hover',
            )}
          >
            <FileInput size={13} /> <span className="hidden sm:inline">Open Editor</span>
          </Link>
        </header>

        {/* Full-bleed workspace — whichever view is active, plus a PiP
            thumbnail of the other */}
        <div className="relative h-[calc(100vh-3.5rem)] shrink-0 p-2">
          {view === 'code' ? (
            <CodePane code={code} onChange={handleCodeChange} errors={errors} parsing={parsing} />
          ) : (
            <DiagramPane
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              setNodes={setNodes}
              setEdges={setEdges}
              onSyncToCode={handleSyncToCode}
            />
          )}

          <PipThumbnail
            label={view === 'code' ? 'Live UML Diagram' : 'Draft Notation'}
            onClick={() => setView(view === 'code' ? 'diagram' : 'code')}
          >
            {view === 'code'
              ? <MiniDiagramPreview nodes={nodes} edges={edges} />
              : <MiniCodePreview code={code} />}
          </PipThumbnail>

          <CodePanel open={codeOpen} onClose={() => setCodeOpen(false)} />
        </div>

        <div className="mt-16 border-t border-hairline-strong" />
        <SiteFooter />

        <SyntaxGuideSheet open={guideOpen} onOpenChange={setGuideOpen} />
      </div>
    </EditorProvider>
  )
}
