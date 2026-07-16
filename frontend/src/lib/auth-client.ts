import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
})

export const { signIn, signOut, signUp, useSession } = authClient

// Extended session user type with custom fields from additionalFields config
type BaseUser = NonNullable<ReturnType<typeof authClient.useSession>['data']>['user']
export type SessionUser = BaseUser & {
  isAdmin?: boolean
  blocked?: boolean
}
