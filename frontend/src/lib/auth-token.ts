// Frontend and backend live on different *.vercel.app subdomains, which
// browsers treat as separate sites — third-party cookie blocking drops any
// session cookie on cross-site requests. We authenticate via a JWT bearer
// token (issued by our own /auth/login, /auth/signup, /auth/google routes)
// stored here instead of relying on cookies.
const KEY = 'lldcanvas_bearer_token'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEY)
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, token)
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}
