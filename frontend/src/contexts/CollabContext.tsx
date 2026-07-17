'use client'

import {
  createContext, useContext, useEffect, useRef, useState, useCallback,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { getSocket } from '@/lib/socket'
import type { CollabUser, CollabComment } from '@/types'

interface CursorPos { x: number; y: number }
type PatchHandler = (nodes: unknown[], edges: unknown[], userId: string) => void

interface CollabContextValue {
  collaborators:        CollabUser[]
  cursors:              Map<string, CursorPos>
  comments:             CollabComment[]
  myRole:               'owner' | 'editor' | 'viewer' | null
  myColor:              string
  myUserId:             string
  myName:               string
  connected:            boolean
  unreadMentions:       number
  joinRoom:             (diagramId: string) => void
  leaveRoom:            () => void
  moveCursor:           (diagramId: string, x: number, y: number) => void
  patchCanvas:          (diagramId: string, nodes: unknown[], edges: unknown[]) => void
  addComment:           (diagramId: string, payload: AddCommentPayload) => void
  replyComment:         (diagramId: string, commentId: string, content: string, mentions?: string[]) => void
  resolveComment:       (diagramId: string, commentId: string) => void
  deleteComment:        (diagramId: string, commentId: string) => void
  setComments:          (c: CollabComment[]) => void
  clearUnreadMentions:  () => void
  registerPatchHandler: (handler: PatchHandler) => void
}

interface AddCommentPayload {
  content:   string
  position:  { x: number; y: number }
  nodeId?:   string
  mentions?: string[]
}

const CollabContext = createContext<CollabContextValue | null>(null)

export function CollabProvider({ children, diagramId }: { children: ReactNode; diagramId: string | null }) {
  const [collaborators,   setCollaborators]   = useState<CollabUser[]>([])
  const [cursors,         setCursors]         = useState<Map<string, CursorPos>>(new Map())
  const [comments,        setComments]        = useState<CollabComment[]>([])
  const [myRole,          setMyRole]          = useState<'owner' | 'editor' | 'viewer' | null>(null)
  const [myColor,         setMyColor]         = useState('#234E3F')
  const [myUserId,        setMyUserId]        = useState('')
  const [myName,          setMyName]          = useState('')
  const [connected,       setConnected]       = useState(false)
  const [unreadMentions,  setUnreadMentions]  = useState(0)
  const currentRoom   = useRef<string | null>(null)
  const panelOpen     = useRef(false)           // set by DiscussionPanel to suppress badge increments
  const myNameRef     = useRef('')              // always-current snapshot for event handlers
  const onCanvasPatch = useRef<PatchHandler | null>(null)

  const registerPatchHandler = useCallback((handler: PatchHandler) => {
    onCanvasPatch.current = handler
  }, [])

  const clearUnreadMentions = useCallback(() => {
    setUnreadMentions(0)
    panelOpen.current = true
  }, [])

  // Called by DiscussionPanel when it closes
  const markPanelClosed = useCallback(() => {
    panelOpen.current = false
  }, [])

  useEffect(() => { myNameRef.current = myName }, [myName])

  useEffect(() => {
    if (!diagramId) return
    const socket = getSocket()

    const handleConnect    = () => setConnected(true)
    const handleDisconnect = () => {
      setConnected(false)
      setCollaborators([])
      setCursors(new Map())
    }

    socket.on('connect',    handleConnect)
    socket.on('disconnect', handleDisconnect)

    socket.on('room:state', ({
      collaborators: colls,
      comments: cmts,
      myRole: role,
      myColor: color,
      myUserId: uid,
      myName: name,
    }: {
      collaborators: CollabUser[]
      comments: CollabComment[]
      myRole: 'owner' | 'editor' | 'viewer'
      myColor: string
      myUserId: string
      myName: string
    }) => {
      setCollaborators(colls)
      setComments(cmts)
      setMyRole(role)
      setMyColor(color)
      setMyUserId(uid)
      setMyName(name)
    })

    socket.on('user:joined', ({ user }: { user: CollabUser }) => {
      setCollaborators(prev => [...prev.filter(u => u.userId !== user.userId), user])
      toast(`${user.name} joined`, { description: `Joined as ${user.role}`, duration: 3000 })
    })

    socket.on('user:left', ({ userId }: { userId: string }) => {
      setCollaborators(prev => {
        const leaving = prev.find(u => u.userId === userId)
        if (leaving) toast(`${leaving.name} left`, { duration: 2500 })
        return prev.filter(u => u.userId !== userId)
      })
      setCursors(prev => {
        const next = new Map(prev)
        next.delete(userId)
        return next
      })
    })

    socket.on('cursor:update', ({ userId, x, y }: { userId: string; x: number; y: number }) => {
      setCursors(prev => new Map(prev).set(userId, { x, y }))
    })

    socket.on('canvas:patch', ({ nodes, edges, userId }: { nodes: unknown[]; edges: unknown[]; userId: string }) => {
      onCanvasPatch.current?.(nodes, edges, userId)
    })

    socket.on('comment:new', (comment: CollabComment) => {
      setComments(prev => [...prev, comment])
      // Increment unread badge if current user is @mentioned and panel is not open
      const name = myNameRef.current.toLowerCase()
      if (name && !panelOpen.current) {
        const mentioned = comment.mentions?.some(m => m.toLowerCase() === name)
          || comment.content.toLowerCase().includes(`@${name}`)
        if (mentioned) setUnreadMentions(n => n + 1)
      }
    })

    socket.on('comment:replied', ({ comment }: { comment: CollabComment }) => {
      setComments(prev => prev.map(c => c._id === comment._id ? comment : c))
    })

    socket.on('comment:resolved', ({ commentId }: { commentId: string }) => {
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, resolved: true } : c))
    })

    socket.on('comment:deleted', ({ commentId }: { commentId: string }) => {
      setComments(prev => prev.filter(c => c._id !== commentId))
    })

    socket.on('room:error', ({ message }: { message: string }) => {
      toast.error(message)
    })

    if (!socket.connected) socket.connect()

    return () => {
      socket.off('connect',        handleConnect)
      socket.off('disconnect',     handleDisconnect)
      socket.off('room:state')
      socket.off('user:joined')
      socket.off('user:left')
      socket.off('cursor:update')
      socket.off('canvas:patch')
      socket.off('comment:new')
      socket.off('comment:replied')
      socket.off('comment:resolved')
      socket.off('comment:deleted')
      socket.off('room:error')
    }
  }, [diagramId])

  const joinRoom = useCallback((id: string) => {
    currentRoom.current = id
    getSocket().emit('room:join', { diagramId: id })
  }, [])

  const leaveRoom = useCallback(() => {
    if (currentRoom.current) {
      getSocket().emit('room:leave', { diagramId: currentRoom.current })
      currentRoom.current = null
    }
    setCollaborators([])
    setCursors(new Map())
    setMyRole(null)
    setUnreadMentions(0)
  }, [])

  const moveCursor = useCallback((id: string, x: number, y: number) => {
    getSocket().emit('cursor:move', { diagramId: id, x, y })
  }, [])

  const patchCanvas = useCallback((id: string, nodes: unknown[], edges: unknown[]) => {
    getSocket().emit('canvas:patch', { diagramId: id, nodes, edges })
  }, [])

  const addComment = useCallback((id: string, payload: AddCommentPayload) => {
    getSocket().emit('comment:add', { diagramId: id, ...payload })
  }, [])

  const replyComment = useCallback((id: string, commentId: string, content: string, mentions?: string[]) => {
    getSocket().emit('comment:reply', { diagramId: id, commentId, content, mentions })
  }, [])

  const resolveComment = useCallback((id: string, commentId: string) => {
    getSocket().emit('comment:resolve', { diagramId: id, commentId })
  }, [])

  const deleteComment = useCallback((id: string, commentId: string) => {
    getSocket().emit('comment:delete', { diagramId: id, commentId })
  }, [])

  return (
    <CollabContext.Provider value={{
      collaborators, cursors, comments, myRole, myColor, myUserId, myName,
      connected, unreadMentions,
      joinRoom, leaveRoom, moveCursor, patchCanvas,
      addComment, replyComment, resolveComment, deleteComment, setComments,
      clearUnreadMentions, registerPatchHandler,
      // expose panel state setter so DiscussionPanel can mark itself closed
      ...({ _markPanelClosed: markPanelClosed } as object),
    }}>
      {children}
    </CollabContext.Provider>
  )
}

export function useCollab() {
  const ctx = useContext(CollabContext)
  if (!ctx) throw new Error('useCollab must be used within CollabProvider')
  return ctx
}
