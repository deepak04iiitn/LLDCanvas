import { Server, Socket } from 'socket.io'
import { Diagram } from '../models/diagram.model'
import { CollabInvite } from '../models/collab-invite.model'
import { Comment } from '../models/comment.model'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CollabUser {
  socketId: string
  userId:   string
  name:     string
  email:    string
  image?:   string
  color:    string
  role:     'owner' | 'editor' | 'viewer'
}

// In-memory room registry: diagramId → Set of CollabUser
const rooms = new Map<string, Map<string, CollabUser>>()

const COLLAB_COLORS = [
  '#234E3F', // brand green
  '#2563EB', // blue
  '#D97706', // amber
  '#DC2626', // rose
  '#7C3AED', // violet
  '#0891B2', // teal
]

function getColor(roomId: string): string {
  const room = rooms.get(roomId)
  const used = room ? room.size : 0
  return COLLAB_COLORS[used % COLLAB_COLORS.length]
}

function getRoomUsers(roomId: string): CollabUser[] {
  const room = rooms.get(roomId)
  if (!room) return []
  return Array.from(room.values())
}

// Determine role of a user for a diagram
async function resolveRole(
  diagramId: string,
  userId: string,
  email: string,
): Promise<'owner' | 'editor' | 'viewer' | null> {
  const diagram = await Diagram.findById(diagramId).lean()
  if (!diagram) return null
  if (diagram.userId.toString() === userId) return 'owner'

  const invite = await CollabInvite.findOne({
    diagramId,
    email: email.toLowerCase(),
    status: 'accepted',
  }).lean()
  if (invite) return invite.role as 'editor' | 'viewer'

  // Check link-based access stored on diagram (collabLinkEnabled)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = diagram as any
  if (d.collabLinkEnabled) return d.collabLinkRole ?? 'viewer'

  return null
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export function registerCollabHandlers(io: Server, socket: Socket) {
  const user = socket.data.user as {
    id: string; email: string; name: string; image?: string
  }

  // ── room:join ──────────────────────────────────────────────────────────────
  socket.on('room:join', async ({ diagramId }: { diagramId: string }) => {
    try {
      const role = await resolveRole(diagramId, user.id, user.email)
      if (!role) {
        socket.emit('room:error', { message: 'Access denied to this diagram.' })
        return
      }

      // Initialize room map if needed
      if (!rooms.has(diagramId)) rooms.set(diagramId, new Map())
      const room = rooms.get(diagramId)!

      // Remove any stale entry for this user (reconnect scenario)
      for (const [sid, u] of room) {
        if (u.userId === user.id) room.delete(sid)
      }

      const collabUser: CollabUser = {
        socketId: socket.id,
        userId:   user.id,
        name:     user.name,
        email:    user.email,
        image:    user.image,
        color:    getColor(diagramId),
        role,
      }
      room.set(socket.id, collabUser)
      socket.join(diagramId)

      // Send current room state to the joiner
      const comments = await Comment.find({ diagramId }).sort({ createdAt: 1 }).lean()
      socket.emit('room:state', {
        collaborators: getRoomUsers(diagramId).filter(u => u.socketId !== socket.id),
        comments,
        myRole:   role,
        myColor:  collabUser.color,
        myUserId: user.id,
        myName:   user.name,
      })

      // Notify others
      socket.to(diagramId).emit('user:joined', { user: collabUser })

    } catch (err) {
      console.error('[collab] room:join error', err)
      socket.emit('room:error', { message: 'Failed to join room.' })
    }
  })

  // ── room:leave ────────────────────────────────────────────────────────────
  socket.on('room:leave', ({ diagramId }: { diagramId: string }) => {
    leaveRoom(socket, diagramId)
  })

  // ── cursor:move ───────────────────────────────────────────────────────────
  let cursorThrottle: ReturnType<typeof setTimeout> | null = null
  socket.on('cursor:move', ({ diagramId, x, y }: { diagramId: string; x: number; y: number }) => {
    if (cursorThrottle) return
    cursorThrottle = setTimeout(() => { cursorThrottle = null }, 50)
    socket.to(diagramId).emit('cursor:update', { userId: user.id, x, y })
  })

  // ── canvas:patch ──────────────────────────────────────────────────────────
  socket.on('canvas:patch', ({ diagramId, nodes, edges }: { diagramId: string; nodes: unknown[]; edges: unknown[] }) => {
    const room = rooms.get(diagramId)
    if (!room) return
    const collabUser = room.get(socket.id)
    if (!collabUser || collabUser.role === 'viewer') return
    socket.to(diagramId).emit('canvas:patch', { nodes, edges, userId: user.id })
  })

  // ── comment:add ───────────────────────────────────────────────────────────
  socket.on('comment:add', async ({ diagramId, content, position, nodeId, mentions }: {
    diagramId: string; content: string; position: { x: number; y: number };
    nodeId?: string; mentions?: string[]
  }) => {
    try {
      const comment = await Comment.create({
        diagramId, authorId: user.id, authorName: user.name, authorImage: user.image,
        content, position, nodeId: nodeId ?? undefined, mentions: mentions ?? [],
      })
      io.to(diagramId).emit('comment:new', comment.toObject())
    } catch (err) {
      console.error('[collab] comment:add error', err)
    }
  })

  // ── comment:reply ─────────────────────────────────────────────────────────
  socket.on('comment:reply', async ({ diagramId, commentId, content, mentions }: {
    diagramId: string; commentId: string; content: string; mentions?: string[]
  }) => {
    try {
      const reply = {
        authorId: user.id, authorName: user.name, authorImage: user.image,
        content, mentions: mentions ?? [], createdAt: new Date(),
      }
      const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $push: { replies: reply } },
        { new: true },
      )
      if (comment) io.to(diagramId).emit('comment:replied', { commentId, reply, comment: comment.toObject() })
    } catch (err) {
      console.error('[collab] comment:reply error', err)
    }
  })

  // ── comment:resolve ───────────────────────────────────────────────────────
  socket.on('comment:resolve', async ({ diagramId, commentId }: { diagramId: string; commentId: string }) => {
    try {
      await Comment.findByIdAndUpdate(commentId, { resolved: true })
      io.to(diagramId).emit('comment:resolved', { commentId })
    } catch (err) {
      console.error('[collab] comment:resolve error', err)
    }
  })

  // ── comment:delete ────────────────────────────────────────────────────────
  socket.on('comment:delete', async ({ diagramId, commentId }: { diagramId: string; commentId: string }) => {
    try {
      const comment = await Comment.findById(commentId)
      if (!comment) return
      const room = rooms.get(diagramId)
      const collabUser = room?.get(socket.id)
      const isOwner = collabUser?.role === 'owner'
      const isAuthor = comment.authorId === user.id
      if (!isOwner && !isAuthor) return
      await comment.deleteOne()
      io.to(diagramId).emit('comment:deleted', { commentId })
    } catch (err) {
      console.error('[collab] comment:delete error', err)
    }
  })

  // ── disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) leaveRoom(socket, roomId)
    }
  })
}

function leaveRoom(socket: Socket, diagramId: string) {
  const room = rooms.get(diagramId)
  if (!room) return
  const user = room.get(socket.id)
  room.delete(socket.id)
  if (room.size === 0) rooms.delete(diagramId)
  socket.leave(diagramId)
  if (user) {
    socket.to(diagramId).emit('user:left', { userId: user.userId })
  }
}
