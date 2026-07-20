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
import {
  AlertCircle, ArrowLeftRight, ArrowRight, BookOpen,
  Check, Code2, Copy, Download, Loader2,
  Zap, GitBranch, RefreshCw, Pencil, MousePointer2,
  Cpu, Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
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

// ─── Playground content sections ──────────────────────────────────────────────

const SYNTAX_TABS = [
  {
    id: 'class',
    label: 'Classes',
    code: `User\nUser knows id: String\nUser knows name: String\nUser knows email: String\nUser can login()\nUser can getProfile(): Profile`,
    hint: 'Class name on its own line. Fields with "knows", methods with "can".',
  },
  {
    id: 'rel',
    label: 'Relationships',
    code: `User has many Order\nOrder owns OrderItem\nPayment extends BaseEntity\nCartService uses InventoryService`,
    hint: '"has many", "owns", "extends", "uses" — all render as proper UML arrows.',
  },
  {
    id: 'enum',
    label: 'Enums',
    code: `enum OrderStatus\n  PENDING\n  CONFIRMED\n  SHIPPED\n  DELIVERED\n\nOrder knows status: OrderStatus`,
    hint: 'Indent enum values under the enum declaration.',
  },
  {
    id: 'iface',
    label: 'Interfaces',
    code: `interface Repository\n  findById(id): Entity\n  save(entity): void\n  delete(id): void\n\nUserRepo implements Repository`,
    hint: 'Interfaces render as <<interface>> stereotype boxes in UML.',
  },
  {
    id: 'abs',
    label: 'Abstract',
    code: `abstract BaseService\nBaseService can validate()\nBaseService can process()\n\nUserService extends BaseService\nOrderService extends BaseService`,
    hint: 'Prefix with "abstract" — shown with italics in the UML box.',
  },
] as const

const STEPS = [
  {
    n: '01',
    icon: Pencil,
    color: 'bg-violet-50 text-violet-600 ring-violet-100',
    title: 'Write in plain English',
    body: 'Describe classes, fields, methods and relationships exactly how you think — no angle brackets, no drag-and-drop.',
  },
  {
    n: '02',
    icon: Cpu,
    color: 'bg-amber-50 text-amber-600 ring-amber-100',
    title: 'Parser runs instantly',
    body: 'Draft parses your text with a 400 ms debounce, resolves types and relationships, and builds an AST.',
  },
  {
    n: '03',
    icon: MousePointer2,
    color: 'bg-brand-tint text-brand ring-brand/20',
    title: 'Canvas renders',
    body: 'The AST is fed to the same rendering engine as the full editor — proper UML 2.x boxes, arrows, and cardinality labels.',
  },
  {
    n: '04',
    icon: RefreshCw,
    color: 'bg-sky-50 text-sky-600 ring-sky-100',
    title: 'Sync back to code',
    body: 'Rearrange nodes visually, then hit "Sync to code" to regenerate the Draft source from your updated layout.',
  },
]

function SyntaxTerminal() {
  const [active, setActive] = useState(0)
  const tab = SYNTAX_TABS[active]
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline shadow-lg">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-[#1a1916] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/70" />
        <span className="h-3 w-3 rounded-full bg-amber-400/70" />
        <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
        <span className="ml-3 font-mono text-[11px] text-white/30">draft-notation.draft</span>
      </div>
      {/* tab row */}
      <div className="flex gap-0 border-b border-white/[0.06] bg-[#14130f]">
        {SYNTAX_TABS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActive(i)}
            className={cn(
              'px-4 py-2.5 font-mono text-[11px] font-medium transition-colors',
              i === active
                ? 'border-b-2 border-emerald-400 text-emerald-300'
                : 'text-white/35 hover:text-white/60',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* code body */}
      <div className="min-h-[160px] bg-[#14130f] px-6 py-5">
        <motion.pre
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="font-mono text-[13px] leading-[1.9] text-emerald-300/90 whitespace-pre"
        >
          {tab.code}
        </motion.pre>
      </div>
      {/* hint bar */}
      <div className="flex items-center gap-2 border-t border-white/[0.06] bg-[#14130f] px-5 py-3">
        <Sparkles size={11} className="shrink-0 text-emerald-400/60" />
        <span className="font-mono text-[11px] text-white/35">{tab.hint}</span>
      </div>
    </div>
  )
}

function PlaygroundContent() {
  return (
    <div className="overflow-hidden">

      {/* ── §1 Split hero ─────────────────────────────────────────────────── */}
      <section className="relative border-b border-hairline">
        {/* subtle dot-grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
            {/* Left */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-1.5">
                <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-brand uppercase">¶01</span>
                <div className="h-3 w-px bg-brand/20" />
                <span className="text-[11px] font-medium text-brand/80">Draft Notation</span>
              </div>
              <h1 className="text-[2.6rem] font-black leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.2rem]">
                The language<br />
                UML was<br />
                <span className="text-brand">waiting for.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted">
                Describe classes, fields, methods and relationships in plain English.
                Draft Notation parses your text and renders a proper UML class diagram — live, in under a millisecond.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/editor/local"
                  className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5
                             text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-95"
                >
                  Open full editor <ArrowRight size={14} />
                </Link>
                <Link
                  href="/docs"
                  className="flex items-center gap-2 rounded-lg border border-hairline-strong px-5 py-2.5
                             text-sm font-medium text-ink-muted transition-all hover:border-brand/30 hover:text-ink"
                >
                  <BookOpen size={14} /> Read the docs
                </Link>
              </div>
            </div>

            {/* Right — bento stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Render latency', value: '< 1ms', sub: 'per keystroke', accent: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'UML constructs', value: '6+', sub: 'class · iface · enum · abstract…', accent: 'text-violet-600', bg: 'bg-violet-50' },
                { label: 'Relationship types', value: '5', sub: 'has · owns · extends · uses · implements', accent: 'text-sky-600', bg: 'bg-sky-50' },
                { label: 'No sign-in needed', value: '100%', sub: 'free in the playground', accent: 'text-amber-600', bg: 'bg-amber-50' },
              ].map(card => (
                <div key={card.label} className={cn('rounded-2xl p-5', card.bg)}>
                  <p className={cn('font-mono text-3xl font-black tracking-tight', card.accent)}>{card.value}</p>
                  <p className="mt-1 text-[11px] font-semibold text-ink">{card.label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── §2 How it works (4-step timeline) ────────────────────────────── */}
      <section className="border-b border-hairline bg-paper-elevated/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1">
              <span className="font-mono text-[10px] font-bold tracking-widest text-gold uppercase">¶02</span>
              <span className="text-[11px] text-ink-faint">How it works</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">Four steps, zero friction.</h2>
          </div>

          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* connector line (desktop) */}
            <div className="absolute top-8 left-0 right-0 hidden h-px bg-linear-to-r from-transparent via-hairline-strong to-transparent lg:block" />

            {STEPS.map((step, i) => (
              <div key={step.n} className="relative flex flex-col gap-4">
                <div className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl ring-4',
                  step.color,
                )}>
                  <step.icon size={20} />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold tracking-widest text-ink-faint/50">{step.n}</span>
                  <p className="mt-1 text-sm font-semibold text-ink">{step.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{step.body}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight size={14} className="absolute -right-3 top-4 hidden text-hairline-strong lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── §3 Interactive syntax terminal ────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
            {/* Left — heading + explanation */}
            <div className="lg:sticky lg:top-24">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1">
                <span className="font-mono text-[10px] font-bold tracking-widest text-gold uppercase">¶03</span>
                <span className="text-[11px] text-ink-faint">Syntax at a glance</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                Every pattern, one click away.
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">
                Click a tab to see how each Draft Notation construct is written.
                Then try it yourself in the live playground below.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { icon: Zap, label: 'Instant — no build step' },
                  { icon: GitBranch, label: 'Infers arrow types automatically' },
                  { icon: RefreshCw, label: 'Bi-directional canvas sync' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                      <Icon size={13} className="text-brand" />
                    </div>
                    <span className="text-[13px] text-ink-muted">{label}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/docs"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-opacity hover:opacity-70"
              >
                Full syntax reference <ArrowRight size={13} />
              </Link>
            </div>

            {/* Right — terminal */}
            <SyntaxTerminal />
          </div>
        </div>
      </section>

    </div>
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
        <SiteNavbar alwaysSolid />

        {/* ── Content sections ───────────────────────────────────────────── */}
        <PlaygroundContent />

        {/* ── Live playground workspace ──────────────────────────────────── */}
        <div className="border-y border-hairline-strong bg-paper-elevated/30 px-6 py-5">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
                <span className="text-gold">¶04</span> — Try it live
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Edit Draft code on the left — your UML diagram updates in real time. No account needed.
              </p>
            </div>
            <button
              onClick={() => setGuideOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-hairline-strong px-3 py-1.5
                         text-xs font-medium text-ink-muted transition-colors hover:border-brand/30 hover:text-ink"
            >
              <BookOpen size={12} /> Syntax guide
            </button>
          </div>
        </div>
        <div className="relative h-[calc(100vh+8rem)] shrink-0 p-2">
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

          {/* Code execution button — bottom-left, mirrors the PiP on the right */}
          <button
            onClick={() => setCodeOpen(v => !v)}
            className={cn(
              'group absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-lg border px-3 py-2',
              'text-xs font-semibold shadow-lg backdrop-blur-sm transition-all duration-150 hover:scale-[1.03] hover:shadow-xl',
              codeOpen
                ? 'border-brand/40 bg-brand/10 text-brand'
                : 'border-hairline-strong bg-paper text-ink-muted hover:border-brand/40 hover:text-brand',
            )}
          >
            <Code2 size={13} />
            <span>Write Code</span>
          </button>

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

        <div className="h-16 border-t border-hairline" />
        <SiteFooter />

        <SyntaxGuideSheet open={guideOpen} onOpenChange={setGuideOpen} />
      </div>
    </EditorProvider>
  )
}
