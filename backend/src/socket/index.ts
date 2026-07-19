import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { verifyAuthToken } from '../utils/jwt'
import { User } from '../models/user.model'
import { registerCollabHandlers } from './collab.handler'

export function initSocketServer(httpServer: HttpServer, allowedOrigins: string[]) {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  })

  // ── Auth middleware ──────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined
      if (!token) return next(new Error('Unauthorized'))

      const payload = verifyAuthToken(token)
      const user = await User.findById(payload.id)
      if (!user) return next(new Error('Unauthorized'))
      if (user.blocked) return next(new Error('Account blocked'))

      socket.data.user = {
        id:    user.id,
        email: user.email,
        name:  user.name,
        image: user.image ?? undefined,
      }

      next()
    } catch {
      next(new Error('Authentication failed'))
    }
  })

  // ── Register handlers per connection ────────────────────────────────────
  io.on('connection', (socket) => {
    registerCollabHandlers(io, socket)
  })

  return io
}
