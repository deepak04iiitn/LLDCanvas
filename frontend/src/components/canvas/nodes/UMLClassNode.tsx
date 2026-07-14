'use client'

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import {
  Handle,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
  type NodeProps,
} from '@xyflow/react'
import { nanoid } from 'nanoid'
import {
  Plus,
  Trash2,
  Copy,
  RefreshCw,
  FunctionSquare,
  Check,
  X,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { UMLNodeData, UMLAttribute, UMLMethod, Visibility } from '@/types'
import { formatAttribute, formatMethod } from '@/lib/uml/parser'
import { cn } from '@/lib/utils'

// ─── Handle appearance ────────────────────────────────────────────────────────
const HANDLE_CLS =
  '!h-3 !w-3 !rounded-full !border-2 !border-white !bg-indigo-500 ' +
  '!opacity-0 !transition-all !duration-150 group-hover:!opacity-100 hover:!opacity-100 ' +
  'hover:!scale-125 !shadow-sm'

const HANDLE_POSITIONS = [
  { id: 'top',    position: Position.Top    },
  { id: 'right',  position: Position.Right  },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left',   position: Position.Left   },
] as const

// ─── Type autocomplete list ───────────────────────────────────────────────────
const COMMON_TYPES = [
  'void', 'boolean', 'int', 'long', 'float', 'double', 'char', 'byte', 'short',
  'String', 'Object', 'Integer', 'Long', 'Float', 'Double', 'Boolean', 'Character',
  'List<>', 'ArrayList<>', 'LinkedList<>', 'Map<,>', 'HashMap<,>', 'TreeMap<,>',
  'Set<>', 'HashSet<>', 'TreeSet<>', 'Queue<>', 'Deque<>', 'Stack<>', 'PriorityQueue<>',
  'Optional<>', 'Iterator<>', 'Iterable<>', 'Comparable<>', 'Enum',
]

// ─── Visibility config ────────────────────────────────────────────────────────
const VIS_ORDER: Visibility[] = ['+', '-', '#', '~']
const VIS_NEXT: Record<Visibility, Visibility> = { '+': '-', '-': '#', '#': '~', '~': '+' }
const VIS_BADGE: Record<Visibility, string> = {
  '+': 'bg-emerald-500 text-white',
  '-': 'bg-red-500    text-white',
  '#': 'bg-amber-500  text-white',
  '~': 'bg-sky-500    text-white',
}
const VIS_TITLE: Record<Visibility, string> = {
  '+': 'public (+)', '-': 'private (−)', '#': 'protected (#)', '~': 'package (~)',
}

// ─── Single cycling visibility badge ─────────────────────────────────────────
function VisibilityCycle({
  value,
  onChange,
}: {
  value: Visibility
  onChange: (v: Visibility) => void
}) {
  return (
    <button
      type="button"
      title={`${VIS_TITLE[value]} — click to change`}
      onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onChange(VIS_NEXT[value]) }}
      className={cn(
        'shrink-0 h-[18px] w-[18px] rounded text-[10px] font-bold font-mono',
        'flex items-center justify-center transition-all hover:scale-110',
        VIS_BADGE[value],
      )}
    >
      {value}
    </button>
  )
}

// ─── Type combobox — dropdown rendered in a portal to escape canvas clipping ──
interface TypeComboboxProps {
  value: string
  onChange: (v: string) => void
  onEnter?: () => void
  onEscape?: () => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

function TypeCombobox({ value, onChange, onEnter, onEscape, placeholder = 'Type', className, autoFocus }: TypeComboboxProps) {
  const [open, setOpen]       = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [pos, setPos]         = useState({ top: 0, left: 0, width: 0 })
  const inputRef              = useRef<HTMLInputElement>(null)

  const filtered = COMMON_TYPES.filter(
    t => !value || t.toLowerCase().includes(value.toLowerCase()),
  )

  function openDrop() {
    if (inputRef.current) {
      const r = inputRef.current.getBoundingClientRect()
      setPos({ top: r.bottom, left: r.left, width: Math.max(r.width, 140) })
    }
    setOpen(true)
  }

  function select(t: string) {
    onChange(t)
    setOpen(false)
    setActiveIdx(-1)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault(); e.stopPropagation()
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
      if (!open) openDrop()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); e.stopPropagation()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault(); e.stopPropagation()
      if (activeIdx >= 0 && filtered[activeIdx]) { select(filtered[activeIdx]) }
      else { setOpen(false); onEnter?.() }
    } else if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation()
      setOpen(false); onEscape?.()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  const dropdown = open && filtered.length > 0 && (
    <div
      style={{ position: 'fixed', top: pos.top + 2, left: pos.left, width: pos.width, zIndex: 99999 }}
      className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl
                 dark:border-slate-700 dark:bg-[#1a1a1a]"
      onMouseDown={e => e.stopPropagation()}
    >
      {filtered.map((t, i) => (
        <div
          key={t}
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); select(t) }}
          className={cn(
            'cursor-pointer px-3 py-1.5 font-mono text-[11px] transition-colors',
            i === activeIdx
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-gray-700 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-slate-800/60',
          )}
        >
          {t}
        </div>
      ))}
    </div>
  )

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        value={value}
        onChange={e => { onChange(e.target.value); openDrop(); setActiveIdx(-1) }}
        onFocus={openDrop}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        onPointerDown={e => e.stopPropagation()}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-200 bg-white px-2 py-0.5
                   font-mono text-[11px] text-gray-800 outline-none
                   focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                   dark:border-slate-600 dark:bg-slate-900 dark:text-gray-200
                   dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
      />
      {typeof window !== 'undefined' && open && createPortal(dropdown, document.body)}
    </div>
  )
}

// ─── Toggle pill (static / abstract) ─────────────────────────────────────────
function TogglePill({
  active, label, onToggle, activeClass,
}: {
  active: boolean
  label: string
  onToggle: () => void
  activeClass: string
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onToggle() }}
      className={cn(
        'rounded-full border px-2 py-px text-[9px] font-mono font-semibold uppercase',
        'tracking-wide transition-all select-none',
        active
          ? cn('border-transparent shadow-sm', activeClass)
          : ('border-slate-200 text-gray-400 hover:border-slate-300 hover:text-gray-600 ' +
             'dark:border-slate-600 dark:text-gray-500 dark:hover:border-slate-500 dark:hover:text-gray-300'),
      )}
    >
      {label}
    </button>
  )
}

// ─── Section divider ──────────────────────────────────────────────────────────
function Divider() {
  return <div className="h-px bg-slate-200 dark:bg-slate-700" />
}

// ─── Shared editor action row (save / cancel) ─────────────────────────────────
function EditorActions({ onCancel, onCommit }: { onCancel: () => void; onCommit: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title="Cancel (Esc)"
        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onCancel() }}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200
                   text-gray-400 transition-colors
                   hover:border-red-200 hover:bg-red-50 hover:text-red-600
                   dark:border-slate-600 dark:text-gray-500
                   dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Save (Enter)"
        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onCommit() }}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-indigo-200
                   bg-indigo-50 text-indigo-600 shadow-sm transition-colors
                   hover:border-indigo-300 hover:bg-indigo-100
                   dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400
                   dark:hover:bg-indigo-900/40"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Attribute row ────────────────────────────────────────────────────────────
interface AttrRowProps {
  attr: UMLAttribute
  onUpdate: (id: string, updates: Partial<UMLAttribute>) => void
  onDelete: (id: string) => void
  autoOpen?: boolean
}

function AttrRow({ attr, onUpdate, onDelete, autoOpen = false }: AttrRowProps) {
  const [editing, setEditing] = useState(autoOpen)
  const [draft, setDraft]     = useState<UMLAttribute>(attr)

  function open()   { setDraft({ ...attr }); setEditing(true) }
  function cancel() { setDraft({ ...attr }); setEditing(false) }
  function commit() {
    const name = draft.name.trim()
    if (name) onUpdate(attr.id, { visibility: draft.visibility, name, type: draft.type.trim() || 'String', isStatic: draft.isStatic })
    setEditing(false)
  }

  const kd = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter')  { e.preventDefault(); commit() }
    if (e.key === 'Escape') { e.preventDefault(); cancel() }
    e.stopPropagation()
  }

  if (editing) {
    return (
      <div
        className="nodrag space-y-1.5 border-b border-indigo-100 bg-indigo-50/60 px-2 py-2
                   dark:border-indigo-900/30 dark:bg-indigo-950/20"
        onPointerDown={e => e.stopPropagation()}
      >
        {/* Row 1: vis badge + name + type — all inline */}
        <div className="flex items-center gap-1.5">
          <VisibilityCycle value={draft.visibility} onChange={v => setDraft(d => ({ ...d, visibility: v }))} />
          <input
            autoFocus
            value={draft.name}
            onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            onKeyDown={kd}
            onPointerDown={e => e.stopPropagation()}
            placeholder="fieldName"
            className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 py-0.5
                       font-mono text-[11px] text-gray-800 outline-none
                       focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                       dark:border-slate-600 dark:bg-slate-900 dark:text-gray-200"
          />
          <span className="shrink-0 select-none text-[11px] text-slate-400">:</span>
          <TypeCombobox
            value={draft.type}
            onChange={v => setDraft(d => ({ ...d, type: v }))}
            onEnter={commit}
            onEscape={cancel}
            placeholder="String"
            className="w-[92px] shrink-0"
          />
        </div>

        {/* Row 2: modifiers + actions */}
        <div className="flex items-center justify-between">
          <TogglePill
            active={draft.isStatic}
            label="static"
            onToggle={() => setDraft(d => ({ ...d, isStatic: !d.isStatic }))}
            activeClass="bg-indigo-500 text-white dark:bg-indigo-500"
          />
          <EditorActions onCancel={cancel} onCommit={commit} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="group/row nodrag flex cursor-pointer items-center px-2 py-[3px]
                 hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
      onPointerDown={e => e.stopPropagation()}
      onClick={open}
      title="Click to edit"
    >
      <span className={cn(
        'flex-1 select-none truncate font-mono text-[11px] leading-5 text-gray-700 dark:text-gray-300',
        attr.isStatic && 'underline',
      )}>
        {formatAttribute(attr)}
      </span>
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onDelete(attr.id) }}
        className="ml-1 shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-all
                   hover:text-red-500 hover:opacity-100 group-hover/row:opacity-60
                   dark:text-gray-600 dark:hover:text-red-400"
        tabIndex={-1}
        title="Remove"
      >
        <Trash2 className="h-2.5 w-2.5" />
      </button>
    </div>
  )
}

// ─── Method row ───────────────────────────────────────────────────────────────
interface MethodRowProps {
  method: UMLMethod
  className: string
  onUpdate: (id: string, updates: Partial<UMLMethod>) => void
  onDelete: (id: string) => void
  autoOpen?: boolean
}

function MethodRow({ method, className: nodeClassName, onUpdate, onDelete, autoOpen = false }: MethodRowProps) {
  const [editing, setEditing] = useState(autoOpen)
  const [draft, setDraft]     = useState<UMLMethod>(method)

  function open()   { setDraft({ ...method }); setEditing(true) }
  function cancel() { setDraft({ ...method }); setEditing(false) }
  function commit() {
    const name = draft.name.trim()
    if (name) {
      onUpdate(method.id, {
        visibility: draft.visibility,
        name,
        params:     draft.params,
        returnType: draft.isConstructor ? '' : (draft.returnType.trim() || 'void'),
        isStatic:   draft.isStatic,
        isAbstract: draft.isAbstract,
      })
    }
    setEditing(false)
  }

  const kd = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter')  { e.preventDefault(); commit() }
    if (e.key === 'Escape') { e.preventDefault(); cancel() }
    e.stopPropagation()
  }

  // Width of the visibility badge — used as a spacer so rows 2-4 align under the name input
  const VIS_W = 'w-[18px] shrink-0'

  if (editing) {
    return (
      <div
        className="nodrag space-y-1.5 border-b border-indigo-100 bg-indigo-50/60 px-2 py-2
                   dark:border-indigo-900/30 dark:bg-indigo-950/20"
        onPointerDown={e => e.stopPropagation()}
      >
        {/* Row 1: vis badge + name */}
        <div className="flex items-center gap-1.5">
          <VisibilityCycle value={draft.visibility} onChange={v => setDraft(d => ({ ...d, visibility: v }))} />
          <input
            autoFocus
            value={draft.isConstructor ? nodeClassName : draft.name}
            readOnly={draft.isConstructor}
            onChange={e => { if (!draft.isConstructor) setDraft(d => ({ ...d, name: e.target.value })) }}
            onKeyDown={kd}
            onPointerDown={e => e.stopPropagation()}
            placeholder="methodName"
            className={cn(
              'min-w-0 flex-1 rounded-md border px-2 py-0.5 font-mono text-[11px] outline-none',
              'focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
              'dark:text-gray-200 dark:focus:border-indigo-500',
              draft.isConstructor
                ? 'border-slate-200 bg-slate-100 text-gray-400 dark:bg-slate-800 dark:border-slate-700'
                : 'border-slate-200 bg-white text-gray-800 dark:bg-slate-900 dark:border-slate-600',
            )}
          />
        </div>

        {/* Row 2: params + return type, combined */}
        <div className="flex items-center gap-1.5">
          <div className={VIS_W} />
          {/* ( ) brackets are decorative — input is inside */}
          <div className="flex min-w-0 flex-[1.4] items-center gap-px rounded-md border border-slate-200
                          bg-white px-1.5 py-0.5 font-mono text-[11px]
                          focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100
                          dark:border-slate-600 dark:bg-slate-900">
            <span className="shrink-0 select-none text-slate-400">(</span>
            <input
              value={draft.params}
              onChange={e => setDraft(d => ({ ...d, params: e.target.value }))}
              onKeyDown={kd}
              onPointerDown={e => e.stopPropagation()}
              placeholder="a: Type, b: Type"
              className="min-w-0 flex-1 bg-transparent px-1 text-gray-800 outline-none
                         placeholder:text-slate-300 dark:text-gray-200 dark:placeholder:text-slate-600"
            />
            <span className="shrink-0 select-none text-slate-400">)</span>
          </div>
          {!draft.isConstructor && (
            <>
              <span className="shrink-0 select-none text-[11px] text-slate-400">→</span>
              <TypeCombobox
                value={draft.returnType}
                onChange={v => setDraft(d => ({ ...d, returnType: v }))}
                onEnter={commit}
                onEscape={cancel}
                placeholder="void"
                className="w-[74px] shrink-0"
              />
            </>
          )}
        </div>

        {/* Row 3: modifiers (aligned with inputs) + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className={VIS_W} />
            {!draft.isConstructor && (
              <>
                <TogglePill
                  active={draft.isStatic}
                  label="static"
                  onToggle={() => setDraft(d => ({ ...d, isStatic: !d.isStatic }))}
                  activeClass="bg-indigo-500 text-white dark:bg-indigo-500"
                />
                <TogglePill
                  active={draft.isAbstract}
                  label="abstract"
                  onToggle={() => setDraft(d => ({ ...d, isAbstract: !d.isAbstract }))}
                  activeClass="bg-violet-500 text-white dark:bg-violet-500"
                />
              </>
            )}
          </div>
          <EditorActions onCancel={cancel} onCommit={commit} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="group/row nodrag flex cursor-pointer items-center px-2 py-[3px]
                 hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
      onPointerDown={e => e.stopPropagation()}
      onClick={open}
      title="Click to edit"
    >
      <span className={cn(
        'flex-1 select-none truncate font-mono text-[11px] leading-5 text-gray-700 dark:text-gray-300',
        method.isStatic && 'underline',
        method.isAbstract && 'italic',
      )}>
        {formatMethod(method, nodeClassName)}
      </span>
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onDelete(method.id) }}
        className="ml-1 shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-all
                   hover:text-red-500 hover:opacity-100 group-hover/row:opacity-60
                   dark:text-gray-600 dark:hover:text-red-400"
        tabIndex={-1}
        title="Remove"
      >
        <Trash2 className="h-2.5 w-2.5" />
      </button>
    </div>
  )
}

// ─── Inline name edit hook (node header only) ─────────────────────────────────
function useInlineEdit(initial: string, onCommit: (val: string) => void) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(initial)
  const inputRef              = useRef<HTMLInputElement>(null)

  const open = useCallback((val?: string) => {
    setDraft(val ?? initial)
    setEditing(true)
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 0)
  }, [initial])

  const commit = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed) onCommit(trimmed)
    setEditing(false)
  }, [draft, onCommit])

  const cancel = useCallback(() => { setDraft(initial); setEditing(false) }, [initial])

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter')  { e.preventDefault(); commit() }
    if (e.key === 'Escape') { e.preventDefault(); cancel() }
    e.stopPropagation()
  }

  return { editing, draft, setDraft, open, commit, cancel, onKeyDown, inputRef }
}

// ─── Main UML Class Node ──────────────────────────────────────────────────────
export function UMLClassNode({ id, data: rawData, selected }: NodeProps) {
  const data = rawData as UMLNodeData
  const nodeRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const updateNodeInternals = useUpdateNodeInternals()
  const { setNodes, getNodes, setEdges } = useReactFlow()
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft]     = useState(data.name)

  // Which just-added row should mount already open for editing. State, not a
  // ref mutated inline during render — React (in dev, under StrictMode)
  // double-invokes render bodies to catch impure renders, and a ref cleared
  // mid-render gets nulled out before the row that needed it ever mounts,
  // which is exactly why "add attribute" stopped auto-opening. Clearing it in
  // an effect (after commit) instead is pure and safe to double-invoke.
  const [pendingAttrId, setPendingAttrId]     = useState<string | null>(null)
  const [pendingMethodId, setPendingMethodId] = useState<string | null>(null)

  useEffect(() => {
    if (pendingAttrId !== null) setPendingAttrId(null)
  }, [pendingAttrId])

  useEffect(() => {
    if (pendingMethodId !== null) setPendingMethodId(null)
  }, [pendingMethodId])

  useEffect(() => {
    const observer = new ResizeObserver(() => updateNodeInternals(id))
    if (nodeRef.current) observer.observe(nodeRef.current)
    return () => observer.disconnect()
  }, [id, updateNodeInternals])

  useEffect(() => { setNameDraft(data.name) }, [data.name])

  useEffect(() => {
    if (data.isEditing) {
      setEditingName(true)
      setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, isEditing: false } } : n))
      setTimeout(() => { nameInputRef.current?.focus(); nameInputRef.current?.select() }, 40)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.isEditing])

  const updateData = useCallback((updates: Partial<UMLNodeData>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n))
  }, [id, setNodes])

  function commitName() {
    const trimmed = nameDraft.trim() || data.name
    updateData({ name: trimmed, methods: data.methods.map(m => m.isConstructor ? { ...m, name: trimmed } : m) })
    setEditingName(false)
  }

  function cancelName() { setNameDraft(data.name); setEditingName(false) }

  function onNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter')  { e.preventDefault(); commitName() }
    if (e.key === 'Escape') { e.preventDefault(); cancelName() }
    e.stopPropagation()
  }

  function addAttribute() {
    const newId = nanoid(6)
    setPendingAttrId(newId)
    updateData({ attributes: [...data.attributes, { id: newId, visibility: '+', name: 'field', type: 'String', isStatic: false }] })
  }

  function updateAttribute(attrId: string, updates: Partial<UMLAttribute>) {
    updateData({ attributes: data.attributes.map(a => a.id === attrId ? { ...a, ...updates } : a) })
  }

  function deleteAttribute(attrId: string) {
    updateData({ attributes: data.attributes.filter(a => a.id !== attrId) })
  }

  function addMethod() {
    const newId = nanoid(6)
    setPendingMethodId(newId)
    updateData({ methods: [...data.methods, { id: newId, visibility: '+', name: 'method', params: '', returnType: 'void', isStatic: false, isAbstract: false, isConstructor: false }] })
  }

  function addConstructor() {
    const newId = nanoid(6)
    setPendingMethodId(newId)
    updateData({ methods: [{ id: newId, visibility: '+', name: data.name, params: '', returnType: '', isStatic: false, isAbstract: false, isConstructor: true }, ...data.methods] })
  }

  function updateMethod(methodId: string, updates: Partial<UMLMethod>) {
    updateData({ methods: data.methods.map(m => m.id === methodId ? { ...m, ...updates } : m) })
  }

  function deleteMethod(methodId: string) {
    updateData({ methods: data.methods.filter(m => m.id !== methodId) })
  }

  function convertTo(nodeType: UMLNodeData['nodeType']) { updateData({ nodeType }) }

  function duplicateNode() {
    const original = getNodes().find(n => n.id === id)
    if (!original) return
    setNodes(nds => [...nds, {
      ...original, id: nanoid(8),
      position: { x: original.position.x + 32, y: original.position.y + 32 },
      selected: false,
      data: { ...original.data, name: `${original.data.name}Copy` },
    }])
  }

  function deleteNode() {
    setNodes(nds => nds.filter(n => n.id !== id))
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id))
  }

  const isInterface = data.nodeType === 'interface'
  const isAbstract  = data.nodeType === 'abstract-class'
  const isEnum      = data.nodeType === 'enum'

  const effectiveStereotype =
    data.stereotype ?? (isInterface ? 'interface' : isEnum ? 'enum' : undefined)

  const containerCls = cn(
    'group relative min-w-[200px] rounded-lg border bg-white text-gray-900',
    'shadow-sm transition-shadow dark:bg-[#1E1E1E] dark:text-gray-100',
    isInterface ? 'border-dashed' : 'border-solid',
    selected
      ? 'border-indigo-500 border-2 shadow-[0_0_0_3px_rgba(99,102,241,0.18)]'
      : 'border-slate-200 dark:border-slate-600',
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div ref={nodeRef} className={containerCls}>
          {HANDLE_POSITIONS.map(({ id: hid, position }) => (
            <Handle key={hid} id={hid} type="source" position={position} className={HANDLE_CLS} />
          ))}

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="px-3 pt-2 pb-2 text-center">
            {effectiveStereotype && (
              <p className="mb-0.5 text-[10px] italic text-gray-400 dark:text-gray-500 leading-none">
                «{effectiveStereotype}»
              </p>
            )}
            {editingName ? (
              <input
                ref={nameInputRef}
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={onNameKeyDown}
                className="w-full rounded-md border border-indigo-300 bg-indigo-50/60 px-2 py-0.5
                           text-center text-sm font-bold text-gray-900 outline-none
                           focus:ring-2 focus:ring-indigo-200
                           dark:bg-indigo-950/60 dark:text-gray-100 dark:border-indigo-700"
              />
            ) : (
              <p
                onDoubleClick={() => { setEditingName(true); setTimeout(() => { nameInputRef.current?.focus(); nameInputRef.current?.select() }, 0) }}
                className={cn(
                  'cursor-text select-none text-sm font-bold leading-snug text-gray-900 dark:text-gray-100',
                  (isAbstract || isInterface) && 'italic',
                )}
              >
                {data.genericParam ? `${data.name}<${data.genericParam}>` : data.name}
              </p>
            )}
            {data.constraints && data.constraints.length > 0 && (
              <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                {`{${data.constraints.join(', ')}}`}
              </p>
            )}
          </div>

          {/* ── Attributes section ──────────────────────────────────────── */}
          <Divider />
          <div className="py-0.5">
            {data.attributes.map(attr => {
              const isNew = attr.id === pendingAttrId
              return (
                <AttrRow key={attr.id} attr={attr} onUpdate={updateAttribute} onDelete={deleteAttribute} autoOpen={isNew} />
              )
            })}
            <button
              className="nodrag flex w-full items-center gap-1 px-2 py-[3px] text-[10px]
                         text-gray-300 transition-colors
                         hover:bg-indigo-50/80 hover:text-indigo-500
                         dark:text-gray-600 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400"
              onPointerDown={e => e.stopPropagation()}
              onClick={addAttribute}
              title={isEnum ? 'Add constant' : 'Add attribute'}
            >
              <Plus className="h-3 w-3" />
              <span>{isEnum ? 'add constant' : 'add attribute'}</span>
            </button>
          </div>

          {/* ── Methods section ─────────────────────────────────────────── */}
          {!isEnum && (
            <>
              <Divider />
              <div className="py-0.5">
                {data.methods.map(method => {
                  const isNew = method.id === pendingMethodId
                  return (
                    <MethodRow key={method.id} method={method} className={data.name} onUpdate={updateMethod} onDelete={deleteMethod} autoOpen={isNew} />
                  )
                })}
                <div
                  className="nodrag flex items-center"
                  onPointerDown={e => e.stopPropagation()}
                >
                  <button
                    className="flex flex-1 items-center gap-1 px-2 py-[3px] text-[10px]
                               text-gray-300 transition-colors
                               hover:bg-indigo-50/80 hover:text-indigo-500
                               dark:text-gray-600 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400"
                    onClick={addMethod}
                    title="Add method"
                  >
                    <Plus className="h-3 w-3" />
                    <span>add method</span>
                  </button>
                  <button
                    className="px-2 py-[3px] text-gray-300 transition-colors
                               hover:bg-emerald-50/80 hover:text-emerald-600
                               dark:text-gray-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400"
                    onClick={addConstructor}
                    title="Add constructor"
                  >
                    <FunctionSquare className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="h-1" />
        </div>
      </ContextMenuTrigger>

      {/* ── Context Menu ───────────────────────────────────────────────── */}
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={addAttribute} className="gap-2">
          <Plus className="h-4 w-4 text-indigo-500" />
          Add Attribute
          <span className="ml-auto text-[10px] text-gray-400">⌃⇧A</span>
        </ContextMenuItem>
        {!isEnum && (
          <>
            <ContextMenuItem onClick={addMethod} className="gap-2">
              <FunctionSquare className="h-4 w-4 text-indigo-500" />
              Add Method
              <span className="ml-auto text-[10px] text-gray-400">⌃⇧M</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={addConstructor} className="gap-2">
              <FunctionSquare className="h-4 w-4 text-emerald-500" />
              Add Constructor
            </ContextMenuItem>
          </>
        )}
        <ContextMenuSeparator />
        {!isInterface && (
          <ContextMenuItem onClick={() => convertTo('interface')} className="gap-2">
            <RefreshCw className="h-4 w-4 text-sky-500" />
            Convert to Interface
          </ContextMenuItem>
        )}
        {!isAbstract && (
          <ContextMenuItem onClick={() => convertTo('abstract-class')} className="gap-2">
            <RefreshCw className="h-4 w-4 text-violet-500" />
            Convert to Abstract Class
          </ContextMenuItem>
        )}
        {(isInterface || isAbstract) && (
          <ContextMenuItem onClick={() => convertTo('class')} className="gap-2">
            <RefreshCw className="h-4 w-4 text-gray-500" />
            Convert to Class
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={duplicateNode} className="gap-2">
          <Copy className="h-4 w-4 text-gray-500" />
          Duplicate
          <span className="ml-auto text-[10px] text-gray-400">⌃D</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={deleteNode}
          className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/40"
        >
          <Trash2 className="h-4 w-4" />
          Delete
          <span className="ml-auto text-[10px] text-gray-400">Del</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
