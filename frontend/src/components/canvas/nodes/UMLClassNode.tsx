'use client'

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
} from 'react'
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
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { UMLNodeData, UMLAttribute, UMLMethod } from '@/types'
import { formatAttribute, parseAttribute, formatMethod, parseMethod } from '@/lib/uml/parser'
import { cn } from '@/lib/utils'

// ─── Handle appearance ────────────────────────────────────────────────────────
const HANDLE_CLS =
  '!h-3 !w-3 !rounded-full !border-2 !border-white !bg-indigo-500 ' +
  '!opacity-0 !transition-opacity group-hover:!opacity-100 hover:!opacity-100 ' +
  '!shadow-sm'

// ─── Inline edit hook ─────────────────────────────────────────────────────────
function useInlineEdit(initial: string, onCommit: (val: string) => void) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initial)
  const inputRef = useRef<HTMLInputElement>(null)

  const open = useCallback(
    (val?: string) => {
      setDraft(val ?? initial)
      setEditing(true)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    },
    [initial],
  )

  const commit = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed) onCommit(trimmed)
    setEditing(false)
  }, [draft, onCommit])

  const cancel = useCallback(() => {
    setDraft(initial)
    setEditing(false)
  }, [initial])

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); commit() }
    if (e.key === 'Escape') { e.preventDefault(); cancel() }
    e.stopPropagation()
  }

  return { editing, draft, setDraft, open, commit, cancel, onKeyDown, inputRef }
}

// ─── Section divider ──────────────────────────────────────────────────────────
function Divider() {
  return <div className="h-px bg-slate-200 dark:bg-slate-700" />
}

// ─── Attribute row ────────────────────────────────────────────────────────────
interface AttrRowProps {
  attr: UMLAttribute
  onUpdate: (id: string, updates: Partial<UMLAttribute>) => void
  onDelete: (id: string) => void
}

function AttrRow({ attr, onUpdate, onDelete }: AttrRowProps) {
  const formatted = formatAttribute(attr)
  const edit = useInlineEdit(formatted, val => {
    const parsed = parseAttribute(val)
    onUpdate(attr.id, parsed)
  })

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    edit.onKeyDown(e)
  }

  return (
    <div className="group/row relative flex items-center px-2 py-[3px]">
      {edit.editing ? (
        <input
          ref={edit.inputRef}
          value={edit.draft}
          onChange={e => edit.setDraft(e.target.value)}
          onBlur={edit.commit}
          onKeyDown={handleKeyDown}
          placeholder="+ field: Type"
          className="w-full rounded bg-indigo-50/80 px-1 font-mono text-[11px] text-gray-800
                     outline-none ring-1 ring-indigo-300 dark:bg-indigo-950/60 dark:text-gray-200"
        />
      ) : (
        <span
          onDoubleClick={() => edit.open()}
          className={cn(
            'flex-1 cursor-text font-mono text-[11px] text-gray-700 dark:text-gray-300',
            'select-none truncate leading-5',
            attr.isStatic && 'underline',
          )}
        >
          {formatted}
        </span>
      )}
      {!edit.editing && (
        <button
          onClick={() => onDelete(attr.id)}
          className="ml-1 flex-shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-opacity
                     hover:text-red-500 group-hover/row:opacity-100"
          tabIndex={-1}
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  )
}

// ─── Method row ───────────────────────────────────────────────────────────────
interface MethodRowProps {
  method: UMLMethod
  className: string
  onUpdate: (id: string, updates: Partial<UMLMethod>) => void
  onDelete: (id: string) => void
}

function MethodRow({ method, className, onUpdate, onDelete }: MethodRowProps) {
  const formatted = formatMethod(method, className)
  const edit = useInlineEdit(formatted, val => {
    const parsed = parseMethod(val)
    onUpdate(method.id, parsed)
  })

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    edit.onKeyDown(e)
  }

  return (
    <div className="group/row relative flex items-center px-2 py-[3px]">
      {edit.editing ? (
        <input
          ref={edit.inputRef}
          value={edit.draft}
          onChange={e => edit.setDraft(e.target.value)}
          onBlur={edit.commit}
          onKeyDown={handleKeyDown}
          placeholder="+ method(param: Type): ReturnType"
          className="w-full rounded bg-indigo-50/80 px-1 font-mono text-[11px] text-gray-800
                     outline-none ring-1 ring-indigo-300 dark:bg-indigo-950/60 dark:text-gray-200"
        />
      ) : (
        <span
          onDoubleClick={() => edit.open()}
          className={cn(
            'flex-1 cursor-text font-mono text-[11px] text-gray-700 dark:text-gray-300',
            'select-none truncate leading-5',
            method.isStatic && 'underline',
            method.isAbstract && 'italic',
          )}
        >
          {formatted}
        </span>
      )}
      {!edit.editing && (
        <button
          onClick={() => onDelete(method.id)}
          className="ml-1 flex-shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-opacity
                     hover:text-red-500 group-hover/row:opacity-100"
          tabIndex={-1}
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  )
}

// ─── Main UML Class Node ──────────────────────────────────────────────────────
export function UMLClassNode({ id, data: rawData, selected }: NodeProps) {
  const data = rawData as UMLNodeData
  const nodeRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const updateNodeInternals = useUpdateNodeInternals()
  const { setNodes, getNodes, setEdges } = useReactFlow()
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(data.name)

  // ── Auto-resize observer ────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new ResizeObserver(() => updateNodeInternals(id))
    if (nodeRef.current) observer.observe(nodeRef.current)
    return () => observer.disconnect()
  }, [id, updateNodeInternals])

  // ── Sync nameDraft when data.name changes externally ────────────────────────
  useEffect(() => { setNameDraft(data.name) }, [data.name])

  // ── Auto-focus name when node is first inserted ─────────────────────────────
  useEffect(() => {
    if (data.isEditing) {
      setEditingName(true)
      setNodes(nds =>
        nds.map(n => n.id === id ? { ...n, data: { ...n.data, isEditing: false } } : n),
      )
      setTimeout(() => {
        nameInputRef.current?.focus()
        nameInputRef.current?.select()
      }, 40)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.isEditing])

  // ── Data mutation ────────────────────────────────────────────────────────────
  const updateData = useCallback(
    (updates: Partial<UMLNodeData>) => {
      setNodes(nds =>
        nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n),
      )
    },
    [id, setNodes],
  )

  // ── Name editing ─────────────────────────────────────────────────────────────
  function commitName() {
    const trimmed = nameDraft.trim() || data.name
    updateData({
      name: trimmed,
      // Auto-rename constructor methods
      methods: data.methods.map(m =>
        m.isConstructor ? { ...m, name: trimmed } : m,
      ),
    })
    setEditingName(false)
  }

  function cancelName() {
    setNameDraft(data.name)
    setEditingName(false)
  }

  function onNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); commitName() }
    if (e.key === 'Escape') { e.preventDefault(); cancelName() }
    e.stopPropagation()
  }

  // ── Attribute CRUD ────────────────────────────────────────────────────────────
  function addAttribute() {
    const newAttr: UMLAttribute = {
      id: nanoid(6), visibility: '+', name: 'field', type: 'String', isStatic: false,
    }
    updateData({ attributes: [...data.attributes, newAttr] })
  }

  function updateAttribute(attrId: string, updates: Partial<UMLAttribute>) {
    updateData({
      attributes: data.attributes.map(a =>
        a.id === attrId ? { ...a, ...updates } : a,
      ),
    })
  }

  function deleteAttribute(attrId: string) {
    updateData({ attributes: data.attributes.filter(a => a.id !== attrId) })
  }

  // ── Method CRUD ───────────────────────────────────────────────────────────────
  function addMethod() {
    const newMethod: UMLMethod = {
      id: nanoid(6), visibility: '+', name: 'method', params: '', returnType: 'void',
      isStatic: false, isAbstract: false, isConstructor: false,
    }
    updateData({ methods: [...data.methods, newMethod] })
  }

  function addConstructor() {
    const ctor: UMLMethod = {
      id: nanoid(6), visibility: '+', name: data.name, params: '',
      returnType: '', isStatic: false, isAbstract: false, isConstructor: true,
    }
    updateData({ methods: [ctor, ...data.methods] })
  }

  function updateMethod(methodId: string, updates: Partial<UMLMethod>) {
    updateData({
      methods: data.methods.map(m =>
        m.id === methodId ? { ...m, ...updates } : m,
      ),
    })
  }

  function deleteMethod(methodId: string) {
    updateData({ methods: data.methods.filter(m => m.id !== methodId) })
  }

  // ── Convert node type ─────────────────────────────────────────────────────────
  function convertTo(nodeType: UMLNodeData['nodeType']) {
    updateData({ nodeType })
  }

  // ── Duplicate node ────────────────────────────────────────────────────────────
  function duplicateNode() {
    const original = getNodes().find(n => n.id === id)
    if (!original) return
    setNodes(nds => [
      ...nds,
      {
        ...original,
        id: nanoid(8),
        position: { x: original.position.x + 32, y: original.position.y + 32 },
        selected: false,
        data: { ...original.data, name: `${original.data.name}Copy` },
      },
    ])
  }

  // ── Delete this node ──────────────────────────────────────────────────────────
  function deleteNode() {
    setNodes(nds => nds.filter(n => n.id !== id))
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id))
  }

  // ── Style derivations ─────────────────────────────────────────────────────────
  const isInterface = data.nodeType === 'interface'
  const isAbstract = data.nodeType === 'abstract-class'
  const isEnum = data.nodeType === 'enum'

  const effectiveStereotype =
    data.stereotype ??
    (isInterface ? 'interface' : isEnum ? 'enum' : undefined)

  const borderStyle = isInterface ? 'border-dashed' : 'border-solid'

  const containerCls = cn(
    'group relative min-w-[180px] rounded-md border bg-white text-gray-900',
    'shadow-sm transition-shadow dark:bg-[#1E1E1E] dark:text-gray-100',
    borderStyle,
    selected
      ? 'border-indigo-500 border-[2px] shadow-[0_0_0_3px_rgba(99,102,241,0.18)]'
      : 'border-slate-300 dark:border-slate-600',
  )

  // Tab navigation refs are handled per-row via nextRef prop

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div ref={nodeRef} className={containerCls}>
          {/* ── Handles (all 4 sides) ──────────────────────────────── */}
          <Handle type="source" position={Position.Top}    className={HANDLE_CLS} />
          <Handle type="source" position={Position.Right}  className={HANDLE_CLS} />
          <Handle type="source" position={Position.Bottom} className={HANDLE_CLS} />
          <Handle type="source" position={Position.Left}   className={HANDLE_CLS} />
          <Handle type="target" position={Position.Top}    className={HANDLE_CLS} style={{ opacity: 0 }} />
          <Handle type="target" position={Position.Right}  className={HANDLE_CLS} style={{ opacity: 0 }} />
          <Handle type="target" position={Position.Bottom} className={HANDLE_CLS} style={{ opacity: 0 }} />
          <Handle type="target" position={Position.Left}   className={HANDLE_CLS} style={{ opacity: 0 }} />

          {/* ── Header: stereotype + name ───────────────────────────── */}
          <div className="px-3 pt-2 pb-1.5 text-center">
            {effectiveStereotype && (
              <p className="mb-0.5 text-[10px] italic text-gray-500 dark:text-gray-400 leading-none">
                &laquo;{effectiveStereotype}&raquo;
              </p>
            )}

            {editingName ? (
              <input
                ref={nameInputRef}
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={onNameKeyDown}
                className="w-full rounded bg-indigo-50/80 px-1 text-center text-sm font-bold
                           text-gray-900 outline-none ring-1 ring-indigo-300
                           dark:bg-indigo-950/60 dark:text-gray-100"
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

            {/* Constraints row */}
            {data.constraints && data.constraints.length > 0 && (
              <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                {`{${data.constraints.join(', ')}}`}
              </p>
            )}
          </div>

          {/* ── Attributes section ──────────────────────────────────── */}
          <Divider />
          <div className="py-0.5">
            {data.attributes.map((attr) => (
              <AttrRow
                key={attr.id}
                attr={attr}
                onUpdate={updateAttribute}
                onDelete={deleteAttribute}
              />
            ))}
            {data.attributes.length === 0 && (
              <p
                onDoubleClick={addAttribute}
                className="cursor-default px-2 py-[3px] text-[10px] italic text-gray-300 dark:text-gray-600 select-none"
              >
                {isEnum ? '(no constants)' : '(no attributes)'}
              </p>
            )}
          </div>

          {/* ── Methods section (skip for enum) ─────────────────────── */}
          {!isEnum && (
            <>
              <Divider />
              <div className="py-0.5">
                {data.methods.map((method) => (
                  <MethodRow
                    key={method.id}
                    method={method}
                    className={data.name}
                    onUpdate={updateMethod}
                    onDelete={deleteMethod}
                  />
                ))}
                {data.methods.length === 0 && (
                  <p
                    onDoubleClick={addMethod}
                    className="cursor-default px-2 py-[3px] text-[10px] italic text-gray-300 dark:text-gray-600 select-none"
                  >
                    (no methods)
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── Bottom padding ──────────────────────────────────────── */}
          <div className="h-1" />
        </div>
      </ContextMenuTrigger>

      {/* ── Context Menu ─────────────────────────────────────────────── */}
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
          className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700
                     dark:focus:bg-red-950/40"
        >
          <Trash2 className="h-4 w-4" />
          Delete
          <span className="ml-auto text-[10px] text-gray-400">Del</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
