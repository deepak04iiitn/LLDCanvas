'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type OnNodesDelete,
  type ReactFlowInstance,
  type Node as RFNode,
  type Edge as RFEdge,
} from '@xyflow/react'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'

import { EditorProvider, useEditor } from '@/contexts/EditorContext'
import { useInterview } from '@/contexts/InterviewContext'
import { CollabProvider, useCollab } from '@/contexts/CollabContext'
import { CanvasView } from '@/components/canvas/CanvasView'
import { RelationshipPicker } from '@/components/canvas/RelationshipPicker'
import { Topbar } from '@/components/editor/Topbar'
import { LeftPanel } from '@/components/editor/LeftPanel'
import { Statusbar } from '@/components/editor/Statusbar'
import { CommandPalette, type CommandPaletteActions } from '@/components/editor/CommandPalette'
import { DismissableLocalBanner } from '@/components/editor/LocalEditorBanner'
import { InterviewNotesDrawer } from '@/components/interview/InterviewNotesDrawer'
import { InterviewSetupModal } from '@/components/interview/InterviewSetupModal'
import { ShareModal } from '@/components/editor/ShareModal'
import { ProblemPanel } from '@/components/editor/ProblemPanel'
import { CollabAvatarStack } from '@/components/collab/CollabAvatarStack'
import { CollabCursors } from '@/components/collab/CollabCursors'
import { DiscussionPanel } from '@/components/collab/DiscussionPanel'
import { CollabPresenceDock } from '@/components/collab/CollabPresenceDock'
import { CollabModal } from '@/components/collab/CollabModal'
import { ViewerBanner } from '@/components/collab/ViewerBanner'
import { useCollabCanvas } from '@/hooks/useCollabCanvas'
import { ImportDraftModal } from '@/components/editor/ImportDraftModal'
import { CodePanel } from '@/components/editor/CodePanel'
import { ProblemDiscussionPanel } from '@/components/editor/ProblemDiscussionPanel'
import { useHistoryStack } from '@/hooks/useHistoryStack'
import { saveLocalDiagram } from '@/hooks/useLocalDiagram'
import { PATTERN_BY_KEY, type PatternData } from '@/data/patterns'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAutosave } from '@/hooks/useAutosave'
import type { DiagramData, UMLNodeData, UMLEdgeData, RelationshipType, CanvasTheme } from '@/types'
import { exportPNG, exportSVG } from '@/lib/export/toPNG'
import { toPlantUML } from '@/lib/export/toPlantUML'
import { toMermaid } from '@/lib/export/toMermaid'
import { serializeToDraft, renderToFlow, type DraftAST } from '@/lib/draft'

interface EditorShellProps {
  diagramId: string | null
  initialTitle: string
  initialData: DiagramData | null
  onRename?: (title: string) => Promise<void>
  /** When true, shows the local-mode banner and persists to localStorage */
  localMode?: boolean
  /** When true, all editing is disabled (shared view-only access) */
  readOnly?: boolean
  /** Share token used for fetching and saving shared diagrams */
  shareToken?: string
  /** Problem slug if this diagram is a practice problem solution */
  problemSlug?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEmptyDiagram(): DiagramData {
  return { version: 1, nodes: [], edges: [], meta: { theme: 'light', zoom: 1, panX: 0, panY: 0 } }
}

function makeCentreNode(
  nodeType: UMLNodeData['nodeType'],
  rfInstance: ReactFlowInstance | null,
  overrides: Partial<UMLNodeData> = {},
): Node<UMLNodeData> {
  const centre = rfInstance
    ? rfInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    : { x: 200, y: 200 }

  const jitter = () => Math.random() * 24 - 12

  const nameMap: Record<UMLNodeData['nodeType'], string> = {
    class: 'ClassName',
    interface: 'InterfaceName',
    enum: 'EnumName',
    'abstract-class': 'AbstractClass',
    note: '',
  }

  if (nodeType === 'note') {
    return {
      id: nanoid(8),
      type: 'note',
      position: { x: centre.x + jitter(), y: centre.y + jitter() },
      data: { nodeType: 'note', name: 'note', attributes: [], methods: [], noteText: '', isEditing: true, ...overrides },
    }
  }

  return {
    id: nanoid(8),
    type: nodeType,
    position: { x: centre.x - 90 + jitter(), y: centre.y - 60 + jitter() },
    data: { nodeType, name: nameMap[nodeType], attributes: [], methods: [], isEditing: true, ...overrides } as UMLNodeData,
  }
}

// ─── Inner editor ─────────────────────────────────────────────────────────────

interface EditorInnerProps {
  diagramId: string | null
  initialTitle: string
  initialNodes: Node[]
  initialEdges: Edge[]
  onRename?: (title: string) => Promise<void>
  localMode?: boolean
  readOnly?: boolean
  shareToken?: string
  problemSlug?: string
}

function EditorInner({ diagramId, initialTitle, initialNodes, initialEdges, onRename, localMode, readOnly, shareToken, problemSlug }: EditorInnerProps) {
  const { theme, togglePanel } = useEditor()
  const { activeSession, endSession } = useInterview()
  const { getNodes, fitView, flowToScreenPosition, getEdges } = useReactFlow()
  const [title, setTitle] = useState(initialTitle)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const rfInstance = useRef<ReactFlowInstance | null>(null)
  const history = useHistoryStack()
  const [interviewSetupOpen, setInterviewSetupOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [problemPanelState, setProblemPanelState] = useState<'open' | 'collapsed'>(
    problemSlug ? 'open' : 'collapsed',
  )
  const [importDraftOpen,    setImportDraftOpen]    = useState(false)
  const [collabModalOpen,    setCollabModalOpen]    = useState(false)
  const [discussionPanelOpen, setDiscussionPanelOpen] = useState(false)
  const [codePanelOpen,             setCodePanelOpen]             = useState(false)
  const [problemDiscussionOpen,     setProblemDiscussionOpen]     = useState(false)

  // ── Collab ────────────────────────────────────────────────────────────────
  const { joinRoom, leaveRoom, moveCursor, myRole, unreadMentions, collaborators } = useCollab()

  useEffect(() => {
    if (!diagramId) return
    joinRoom(diagramId)
    return () => leaveRoom()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramId])

  useCollabCanvas(diagramId, nodes, edges, setNodes as never, setEdges as never)

  // Auto-close Discussion panel when no collaborators are present
  useEffect(() => {
    if (collaborators.length === 0) {
      setDiscussionPanelOpen(false)
    }
  }, [collaborators.length])

  // Cursor tracking on canvas pane
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!diagramId || !rfInstance.current) return
    const pos = rfInstance.current.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    moveCursor(diagramId, pos.x, pos.y)
  }, [diagramId, moveCursor])


  // ── Clipboard ─────────────────────────────────────────────────────────────
  const clipboard = useRef<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] })

  // ── Command palette ───────────────────────────────────────────────────────
  const [paletteOpen, setPaletteOpen] = useState(false)

  // ── Relationship picker state ─────────────────────────────────────────────
  const [pendingConn, setPendingConn] = useState<Connection | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 })

  // ── Autosave ──────────────────────────────────────────────────────────────
  // Memoize so the object reference only changes when nodes/edges/theme actually change,
  // not on every render. Viewport (pan/zoom) is captured lazily inside doSave.
  const diagramData: DiagramData = useMemo(() => ({
    version: 1,
    nodes: nodes as unknown[],
    edges: edges as unknown[],
    meta: { theme, zoom: 1, panX: 0, panY: 0 },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [nodes, edges, theme])
  const { status: saveStatus, retry: retrySave } = useAutosave(diagramId, diagramData, theme, 3000, {
    readOnly,
    shareToken,
  })

  // ── Browser tab title ────────────────────────────────────────────────────
  useEffect(() => {
    document.title = `${title} — LLDCanvas`
    return () => { document.title = 'LLDCanvas' }
  }, [title])

  // ── Offline / online detection ───────────────────────────────────────────
  useEffect(() => {
    const handleOffline = () => toast('Working offline — changes will sync when reconnected.', { duration: Infinity, id: 'offline' })
    const handleOnline  = () => { toast.dismiss('offline'); toast.success('Back online') }
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  // ── Fullscreen API ────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {/* browser blocked */})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {/* no-op */})
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Auto-enter fullscreen the moment a practice session starts — keyed on the
  // session id so it fires once per session, not on every activeSession update
  // (e.g. notes autosave refreshing the object).
  useEffect(() => {
    if (activeSession && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {/* browser blocked */})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?._id])

  // ── End interview session (grab canvas snapshot first) ────────────────────
  const handleEndSession = useCallback(async () => {
    const snapshot = { nodes: getNodes(), edges: getEdges() }
    await endSession(snapshot)
  }, [endSession, getNodes, getEdges])

  // ── Local-mode persistence → localStorage ────────────────────────────────
  // Run after the autosave effect; only active when diagramId is null (local mode).
  // Debounced via a simple useEffect — writes are cheap and instant.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!localMode) return
    saveLocalDiagram(diagramData, title)
  // We intentionally spread diagramData so the effect fires on data changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMode, nodes, edges, title])

  // ── Derived: selection count ──────────────────────────────────────────────
  const selectedCount = nodes.filter(n => n.selected).length
  const [canvasMode, setCanvasMode] = useState<'pan' | 'select'>('pan')

  // ── Clear selection ───────────────────────────────────────────────────────
  const handleClearSelection = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, selected: false })))
  }, [setNodes])

  // ── Connect — open relationship picker instead of creating edge immediately
  const onConnect = useCallback(
    (params: Connection) => {
      // Reject a zero-length loop back onto the exact same handle (an accidental
      // click-and-release on a handle rather than a real drag) and an exact
      // duplicate of an existing edge (same source/target/handles) — neither is
      // a relationship the user meant to draw, and both would render as a
      // degenerate or invisibly-stacked edge.
      const isSameHandle =
        params.source === params.target && params.sourceHandle === params.targetHandle
      const isDuplicate = edges.some(
        e =>
          e.source === params.source &&
          e.target === params.target &&
          (e.sourceHandle ?? null) === (params.sourceHandle ?? null) &&
          (e.targetHandle ?? null) === (params.targetHandle ?? null),
      )
      if (isSameHandle || isDuplicate) {
        if (isDuplicate) toast.info('That relationship already exists')
        return
      }

      setPendingConn(params)

      const allNodes = getNodes()
      const src = allNodes.find(n => n.id === params.source)
      const tgt = allNodes.find(n => n.id === params.target)

      let pos = { x: window.innerWidth / 2 - 130, y: window.innerHeight / 2 - 160 }

      if (src && tgt) {
        const midX = (src.position.x + (src.measured?.width ?? 180) / 2 +
                      tgt.position.x + (tgt.measured?.width ?? 180) / 2) / 2
        const midY = (src.position.y + (src.measured?.height ?? 100) / 2 +
                      tgt.position.y + (tgt.measured?.height ?? 100) / 2) / 2
        const screen = flowToScreenPosition({ x: midX, y: midY })
        pos = { x: screen.x - 130, y: screen.y - 80 }
      }

      setPickerPos(pos)
      setPickerOpen(true)
    },
    [getNodes, flowToScreenPosition, edges],
  )

  // ── Confirm relationship type from picker ─────────────────────────────────
  const onRelationshipPick = useCallback(
    (relType: RelationshipType) => {
      if (!pendingConn) return
      history.push({ nodes, edges })
      setEdges(eds =>
        addEdge(
          {
            ...pendingConn,
            id: nanoid(8),
            type: relType,
            data: {
              relationshipType: relType,
              sourceMultiplicity: undefined,
              targetMultiplicity: undefined,
            } satisfies UMLEdgeData,
          },
          eds,
        ),
      )
      setPendingConn(null)
      setPickerOpen(false)
    },
    [pendingConn, history, nodes, edges, setEdges],
  )

  // ── Insert node ───────────────────────────────────────────────────────────
  const insertNode = useCallback(
    (nodeType: UMLNodeData['nodeType'], overrides: Partial<UMLNodeData> = {}) => {
      const node = makeCentreNode(nodeType, rfInstance.current, overrides)
      history.push({ nodes, edges })
      setNodes(prev => [...prev, node as Node])
    },
    [history, nodes, edges, setNodes],
  )

  // ── Insert with stereotype ────────────────────────────────────────────────
  const insertStereotype = useCallback(
    (stereotype: string) => insertNode('class', { stereotype } as Partial<UMLNodeData>),
    [insertNode],
  )

  // ── Insert design pattern skeleton ────────────────────────────────────────
  // Not Pro-gated for now — every pattern is freely insertable until a real
  // paid plan exists to gate it behind.
  const insertPattern = useCallback(
    (patternKey: string) => {
      const pattern: PatternData | undefined = PATTERN_BY_KEY.get(patternKey)
      if (!pattern) return

      const centre = rfInstance.current
        ? rfInstance.current.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
        : { x: 300, y: 200 }

      // Build old→new ID map for edge remapping
      const idMap = new Map<string, string>()
      const newNodes = pattern.nodes.map(n => {
        const newId = `${n.id}-${nanoid(6)}`
        idMap.set(n.id, newId)
        return {
          ...n,
          id: newId,
          position: {
            x: n.position.x + centre.x - 300,
            y: n.position.y + centre.y - 150,
          },
          data: { ...n.data, isEditing: false },
        }
      })

      const newEdges = pattern.edges.map(e => ({
        ...e,
        id: nanoid(8),
        source: idMap.get(e.source) ?? e.source,
        target: idMap.get(e.target) ?? e.target,
      }))

      history.push({ nodes, edges })
      setNodes(prev => [...prev, ...newNodes as Node[]])
      setEdges(prev => [...prev, ...newEdges as Edge[]])

      toast.success(`${pattern.name} pattern inserted`)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, edges, history, setNodes, setEdges],
  )

  // ── Import a Draft Notation snippet — one-shot, additive (not a live panel) ─
  // The editor deliberately only supports importing already-written code, not
  // authoring it live — that workflow lives in the standalone Playground.
  const importDraft = useCallback(
    (ast: DraftAST) => {
      const { nodes: parsedNodes, edges: parsedEdges } = renderToFlow(ast)
      if (parsedNodes.length === 0) return

      const centre = rfInstance.current
        ? rfInstance.current.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
        : { x: 300, y: 200 }

      // Re-centre the parsed layout (which starts at 0,0) on the viewport
      const minX = Math.min(...parsedNodes.map(n => n.position.x))
      const minY = Math.min(...parsedNodes.map(n => n.position.y))
      const maxX = Math.max(...parsedNodes.map(n => n.position.x))
      const maxY = Math.max(...parsedNodes.map(n => n.position.y))
      const offsetX = centre.x - (minX + maxX) / 2
      const offsetY = centre.y - (minY + maxY) / 2

      const newNodes = parsedNodes.map(n => ({
        ...n,
        position: { x: n.position.x + offsetX, y: n.position.y + offsetY },
      }))

      history.push({ nodes, edges })
      setNodes(prev => [...prev, ...newNodes as Node[]])
      setEdges(prev => [...prev, ...parsedEdges as Edge[]])
      setImportDraftOpen(false)
      toast.success(`Imported ${parsedNodes.length} class${parsedNodes.length === 1 ? '' : 'es'}`)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, edges, history, setNodes, setEdges],
  )

  // ── Delete selected ───────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    const allNodes = getNodes()
    const selected = allNodes.filter(n => n.selected)
    if (selected.length === 0) return
    const selectedIds = new Set(selected.map(n => n.id))
    history.push({ nodes, edges })
    setNodes(nds => nds.filter(n => !selectedIds.has(n.id)))
    setEdges(eds => eds.filter(e => !selectedIds.has(e.source) && !selectedIds.has(e.target)))
  }, [getNodes, history, nodes, edges, setNodes, setEdges])

  const onNodesDelete: OnNodesDelete = useCallback(
    deleted => { if (deleted.length > 0) history.push({ nodes, edges }) },
    [history, nodes, edges],
  )

  // ── Copy ──────────────────────────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    const selected = nodes.filter(n => n.selected)
    if (selected.length === 0) return
    const selectedIds = new Set(selected.map(n => n.id))
    clipboard.current = {
      nodes: selected,
      edges: edges.filter(e => selectedIds.has(e.source) && selectedIds.has(e.target)),
    }
    toast.success(`${selected.length} node${selected.length !== 1 ? 's' : ''} copied`)
  }, [nodes, edges])

  // ── Paste ─────────────────────────────────────────────────────────────────
  const handlePaste = useCallback(() => {
    const { nodes: clipNodes, edges: clipEdges } = clipboard.current
    if (clipNodes.length === 0) return
    const idMap = new Map<string, string>()
    const pasted = clipNodes.map(n => {
      const newId = nanoid(8)
      idMap.set(n.id, newId)
      return {
        ...n,
        id: newId,
        position: { x: n.position.x + 32, y: n.position.y + 32 },
        selected: false,
        data: { ...(n.data as UMLNodeData), isEditing: false },
      }
    })
    const pastedEdges: Edge[] = clipEdges
      .filter(e => idMap.has(e.source) && idMap.has(e.target))
      .map(e => ({
        ...e,
        id: nanoid(8),
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
      }))
    history.push({ nodes, edges })
    setNodes(prev => [...prev, ...pasted as Node[]])
    setEdges(prev => [...prev, ...pastedEdges])
  }, [history, nodes, edges, setNodes, setEdges])

  // ── Duplicate selected ────────────────────────────────────────────────────
  const handleDuplicate = useCallback(() => {
    const selected = nodes.filter(n => n.selected)
    if (selected.length === 0) return
    const idMap = new Map<string, string>()
    const duped = selected.map(n => {
      const newId = nanoid(8)
      idMap.set(n.id, newId)
      return {
        ...n,
        id: newId,
        position: { x: n.position.x + 32, y: n.position.y + 32 },
        selected: false,
        data: { ...(n.data as UMLNodeData), isEditing: false },
      }
    })
    const dupedEdges: Edge[] = edges
      .filter(e => idMap.has(e.source) && idMap.has(e.target))
      .map(e => ({
        ...e,
        id: nanoid(8),
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
      }))
    history.push({ nodes, edges })
    setNodes(prev => [...prev, ...duped as Node[]])
    setEdges(prev => [...prev, ...dupedEdges])
  }, [nodes, edges, history, setNodes, setEdges])

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    const prev = history.undo({ nodes, edges })
    if (prev) { setNodes(prev.nodes); setEdges(prev.edges) }
  }, [history, nodes, edges, setNodes, setEdges])

  const handleRedo = useCallback(() => {
    const next = history.redo({ nodes, edges })
    if (next) { setNodes(next.nodes); setEdges(next.edges) }
  }, [history, nodes, edges, setNodes, setEdges])

  // ── Fit View ──────────────────────────────────────────────────────────────
  const handleFitView = useCallback(
    () => fitView({ padding: 0.12, duration: 400 }),
    [fitView],
  )

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExportPNG = useCallback(async () => {
    try { await exportPNG(theme, title); toast.success('Exported as PNG') }
    catch { toast.error('PNG export failed') }
  }, [theme, title])

  const handleExportSVG = useCallback(async () => {
    try { await exportSVG(theme, title); toast.success('Exported as SVG') }
    catch { toast.error('SVG export failed') }
  }, [theme, title])

  const handleExportPlantUML = useCallback(() => {
    const text = toPlantUML(nodes as RFNode<UMLNodeData>[], edges as RFEdge<UMLEdgeData>[])
    navigator.clipboard.writeText(text).then(() => toast.success('PlantUML copied to clipboard'))
  }, [nodes, edges])

  const handleExportMermaid = useCallback(() => {
    const text = toMermaid(nodes as RFNode<UMLNodeData>[], edges as RFEdge<UMLEdgeData>[])
    navigator.clipboard.writeText(text).then(() => toast.success('Mermaid copied to clipboard'))
  }, [nodes, edges])

  const handleExportDraft = useCallback(() => {
    const text = serializeToDraft(nodes as RFNode<UMLNodeData>[], edges as RFEdge<UMLEdgeData>[])
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.draft`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported as .draft file')
  }, [nodes, edges, title])

  // ── Rename ────────────────────────────────────────────────────────────────
  const handleRename = useCallback(
    async (newTitle: string) => {
      setTitle(newTitle)
      try { await onRename?.(newTitle) } catch { /* silent */ }
    },
    [onRename],
  )

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useKeyboardShortcuts({
    onAddClass:           () => insertNode('class'),
    onAddInterface:       () => insertNode('interface'),
    onAddEnum:            () => insertNode('enum'),
    onAddAbstract:        () => insertNode('abstract-class'),
    onDelete:             handleDelete,
    onDuplicate:          handleDuplicate,
    onUndo:               handleUndo,
    onRedo:               handleRedo,
    onOpenCommandPalette: () => setPaletteOpen(true),
    onFitView:            handleFitView,
    onTogglePanel:        togglePanel,
    onCopy:               handleCopy,
    onPaste:              handlePaste,
  })

  // ── Command palette actions ───────────────────────────────────────────────
  const paletteActions: CommandPaletteActions = {
    addClass:      () => insertNode('class'),
    addInterface:  () => insertNode('interface'),
    addEnum:       () => insertNode('enum'),
    addAbstract:   () => insertNode('abstract-class'),
    addNote:       () => insertNode('note'),
    addStereotype: insertStereotype,
    insertPattern,
    fitView:       handleFitView,
    togglePanel,
    exportPNG:     handleExportPNG,
    exportSVG:     handleExportSVG,
    exportPlantUML: handleExportPlantUML,
    exportMermaid: handleExportMermaid,
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden" data-theme={theme}>
      <ViewerBanner />
      <Topbar
        title={title}
        onRename={readOnly ? () => {} : handleRename}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
        onExportPlantUML={handleExportPlantUML}
        onExportMermaid={handleExportMermaid}
        onExportDraft={handleExportDraft}
        onOpenImportDraft={() => setImportDraftOpen(true)}
        saveStatus={saveStatus}
        onRetrySave={retrySave}
        selectedCount={selectedCount}
        onClearSelection={handleClearSelection}
        canvasMode={canvasMode}
        onCanvasModeChange={setCanvasMode}
        onStartInterview={() => setInterviewSetupOpen(true)}
        onEndInterview={handleEndSession}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        diagramId={diagramId}
        readOnly={readOnly}
        onOpenShare={() => setShareModalOpen(true)}
        onOpenCollab={() => setCollabModalOpen(true)}
        onOpenDiscussion={diagramId && collaborators.length > 0 ? () => setDiscussionPanelOpen(v => !v) : undefined}
        unreadMentions={unreadMentions}
        onOpenCode={() => setCodePanelOpen(v => !v)}
        codePanelOpen={codePanelOpen}
        problemSlug={problemSlug}
        onOpenProblemDiscussion={problemSlug ? () => setProblemDiscussionOpen(v => !v) : undefined}
        problemDiscussionOpen={problemDiscussionOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {!readOnly && (
          <LeftPanel
            onAddClass={() => insertNode('class')}
            onAddInterface={() => insertNode('interface')}
            onAddEnum={() => insertNode('enum')}
            onAddAbstract={() => insertNode('abstract-class')}
            onAddNote={() => insertNode('note')}
            onAddStereotype={insertStereotype}
            onInsertPattern={insertPattern}
          />
        )}

        <main
          className="relative flex-1 overflow-hidden"
          onMouseMove={handleCanvasMouseMove}
        >
          <CanvasView
            nodes={nodes}
            edges={edges}
            onNodesChange={readOnly ? () => {} : onNodesChange}
            onEdgesChange={readOnly ? () => {} : onEdgesChange}
            onConnect={readOnly ? () => {} : onConnect}
            onInit={inst => { rfInstance.current = inst }}
            onNodesDelete={readOnly ? () => {} : onNodesDelete}
            canvasMode={canvasMode}
            selectedCount={selectedCount}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onClearSelection={handleClearSelection}
            readOnly={readOnly}
          />

          {/* Collab overlays */}
          {diagramId && <CollabCursors />}
          {diagramId && collaborators.length > 0 && <CollabPresenceDock />}
          {diagramId && (
            <DiscussionPanel
              open={discussionPanelOpen}
              onClose={() => setDiscussionPanelOpen(false)}
              diagramId={diagramId}
            />
          )}

          {/* Code execution panel */}
          <CodePanel
            open={codePanelOpen}
            onClose={() => setCodePanelOpen(false)}
          />

          {/* Problem community discussion panel */}
          {problemSlug && (
            <ProblemDiscussionPanel
              open={problemDiscussionOpen}
              onClose={() => setProblemDiscussionOpen(false)}
              slug={problemSlug}
            />
          )}

          <RelationshipPicker
            open={pickerOpen}
            position={pickerPos}
            onSelect={onRelationshipPick}
            onClose={() => { setPickerOpen(false); setPendingConn(null) }}
          />
        </main>

        {/* Problem panel — right sidebar when practicing */}
        {problemSlug && (
          <ProblemPanel
            slug={problemSlug}
            collapsed={problemPanelState === 'collapsed'}
            onCollapse={() => setProblemPanelState('collapsed')}
            onExpand={() => setProblemPanelState('open')}
            diagramId={diagramId}
          />
        )}
      </div>

      {localMode && <DismissableLocalBanner />}

      {/* ── Interview notes drawer ──────────────────────────────────────── */}
      <InterviewNotesDrawer />

      <Statusbar />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        actions={paletteActions}
      />

      <InterviewSetupModal
        open={interviewSetupOpen}
        onClose={() => setInterviewSetupOpen(false)}
        currentDiagramId={diagramId}
      />

      {diagramId && !readOnly && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          diagramId={diagramId}
          diagramTitle={title}
        />
      )}

      {!readOnly && (
        <ImportDraftModal
          open={importDraftOpen}
          onOpenChange={setImportDraftOpen}
          onImport={importDraft}
        />
      )}

      {diagramId && (
        <CollabModal
          open={collabModalOpen}
          onOpenChange={setCollabModalOpen}
          diagramId={diagramId}
          diagramTitle={title}
        />
      )}
    </div>
  )
}

// ─── Public shell ─────────────────────────────────────────────────────────────
export function EditorShell({ diagramId, initialTitle, initialData, onRename, localMode, readOnly, shareToken, problemSlug }: EditorShellProps) {
  const data = initialData ?? makeEmptyDiagram()
  const initialTheme = (data.meta?.theme ?? 'light') as CanvasTheme
  const initialNodes = (data.nodes ?? []) as Node[]
  const initialEdges = (data.edges ?? []) as Edge[]

  return (
    <CollabProvider diagramId={diagramId}>
      <EditorProvider initialTheme={initialTheme}>
        <ReactFlowProvider>
          <EditorInner
            diagramId={diagramId}
            initialTitle={initialTitle}
            initialNodes={initialNodes}
            initialEdges={initialEdges}
            onRename={onRename}
            localMode={localMode}
            readOnly={readOnly}
            shareToken={shareToken}
            problemSlug={problemSlug}
          />
        </ReactFlowProvider>
      </EditorProvider>
    </CollabProvider>
  )
}
