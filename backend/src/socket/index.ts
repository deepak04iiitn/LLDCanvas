import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { getAuth } from '../config/auth'
import { registerCollabHandlers } from './collab.handler'
import { dynamicImport } from '../utils/dynamic-import'

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
      // Build node-compatible headers from the socket handshake
      const rawHeaders = socket.handshake.headers as Record<string, string | string[] | undefined>
      const [auth, { fromNodeHeaders }] = await Promise.all([
        getAuth(),
        dynamicImport<typeof import('better-auth/node')>('better-auth/node'),
      ])
      const session = await auth.api.getSession({ headers: fromNodeHeaders(rawHeaders) })

      if (!session?.user) {
        return next(new Error('Unauthorized'))
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u = session.user as any
      if (u.blocked) return next(new Error('Account blocked'))

      socket.data.user = {
        id:    session.user.id,
        email: session.user.email,
        name:  session.user.name,
        image: session.user.image ?? undefined,
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
