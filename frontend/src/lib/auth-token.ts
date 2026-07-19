// Frontend and backend live on different *.vercel.app subdomains, which
// browsers treat as separate sites — third-party cookie blocking drops the
// session cookie on cross-site requests. We authenticate via a bearer token
// (issued in the `set-auth-token` response header by better-auth's bearer
// plugin) stored here instead of relying on cookies.
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
