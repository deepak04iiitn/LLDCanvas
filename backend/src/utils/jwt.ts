import jwt from 'jsonwebtoken'

export interface AuthTokenPayload {
  id: string
  email: string
}

const EXPIRES_IN = '30d'

function secret(): string {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET is not defined in environment variables')
  return s
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: EXPIRES_IN })
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, secret()) as AuthTokenPayload
}
