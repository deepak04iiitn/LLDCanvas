import { createAuthClient } from 'better-auth/react'
import type { InferSessionFromClient } from 'better-auth/client'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
})

export const { signIn, signOut, signUp, useSession } = authClient

// Extended session user type with custom fields from additionalFields config
export type SessionUser = InferSessionFromClient<typeof authClient>['user'] & {
  isAdmin?: boolean
  blocked?: boolean
}
