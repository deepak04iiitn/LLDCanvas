// Phase 1: will be replaced with:
// import { createAuthClient } from 'better-auth/react'
// export const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_API_URL })

// Placeholder auth client used during Phase 0 so imports don't break
export const authClient = {
  signIn: {
    social: async (_opts: { provider: string }) => {},
    email: async (_opts: { email: string; password: string }) => {},
  },
  signOut: async () => {},
  useSession: () => ({ data: null, isPending: false }),
}
