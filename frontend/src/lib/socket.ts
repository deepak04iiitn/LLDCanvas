import { io, type Socket } from 'socket.io-client'
import { getAuthToken } from './auth-token'

let _socket: Socket | null = null

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000', {
      withCredentials: true,
      auth: (cb) => cb({ token: getAuthToken() ?? undefined }),
      transports: ['websocket', 'polling'],
      autoConnect: false,
    })
  }
  return _socket
}

export function destroySocket() {
  if (_socket) {
    _socket.disconnect()
    _socket = null
  }
}
