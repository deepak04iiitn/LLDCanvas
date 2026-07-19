import { createAuthClient } from 'better-auth/react'
import { getAuthToken, setAuthToken, clearAuthToken } from './auth-token'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: () => getAuthToken() ?? undefined,
    },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get('set-auth-token')
      if (token) setAuthToken(token)
    },
  },
})

const { signIn, signUp, useSession } = authClient
export { signIn, signUp, useSession }

export async function signOut(
  ...args: Parameters<typeof authClient.signOut>
): Promise<Awaited<ReturnType<typeof authClient.signOut>>> {
  const result = await authClient.signOut(...args)
  clearAuthToken()
  return result
}

// Extended session user type with custom fields from additionalFields config
type BaseUser = NonNullable<ReturnType<typeof authClient.useSession>['data']>['user']
export type SessionUser = BaseUser & {
  isAdmin?: boolean
  blocked?: boolean
}
