import { QueryClient } from '@tanstack/react-query'
import { getAuthToken } from './auth-token'

/**
 * One QueryClient for the whole app. It is shared by <QueryClientProvider>
 * (so components can use useQuery directly) and by the API layer below, so
 * every GET made through lib/*-api.ts is cached and de-duplicated.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false, // the API layer already has its own error handling
    },
  },
})

// GETs that must always hit the server: live editor state, collaboration,
// billing/auth, and in-progress attempts that are timed or resumed.
const NO_CACHE: RegExp[] = [
  /^\/auth\//,
  /^\/billing\//,
  /^\/collab\//,
  /^\/artifacts\//,
  /^\/diagrams\/[^/?]+(\?|$)/,   // single diagram (editor load, shared edit sessions)
  /^\/studio\/attempts\//,
  /^\/blog\/[^/]+\/(comments|my-reaction)/,
]

const STALE_BY_PATH: [RegExp, number][] = [
  [/^\/(public|patterns|testimonials)/, 30 * 60 * 1000],
  [/^\/problems(\?|$)|^\/studio\/packs|^\/learn\/(debugger|detective)\b/, 10 * 60 * 1000],
]

function isGet(init?: RequestInit) {
  return !init?.method || init.method.toUpperCase() === 'GET'
}

/**
 * Wraps an API module's raw request function.
 *  - GET  -> served from the TanStack cache (per user token), de-duplicated.
 *  - else -> runs the request, then invalidates cached GETs so lists never
 *            show stale data after a change.
 */
export async function cachedRequest<T>(
  path: string,
  init: RequestInit | undefined,
  raw: () => Promise<T>,
): Promise<T> {
  if (isGet(init)) {
    if (NO_CACHE.some(re => re.test(path))) return raw()
    const stale = STALE_BY_PATH.find(([re]) => re.test(path))?.[1]
    return queryClient.fetchQuery({
      queryKey: ['api', getAuthToken() ?? 'anon', path],
      queryFn: raw,
      ...(stale ? { staleTime: stale } : {}),
    })
  }

  const result = await raw()
  // Autosave fires every few seconds: only refresh diagram lists for it.
  if (/^\/diagrams\/[^/?]+/.test(path) && init?.method?.toUpperCase() === 'PUT') {
    queryClient.invalidateQueries({
      predicate: q => /^\/(diagrams|collab)(\?|\/?$)/.test(String(q.queryKey[2])),
    })
  } else if (!/^\/(analytics|blog\/[^/]+\/view|artifacts\/[^/]+\/replay)/.test(path)) {
    queryClient.invalidateQueries({ queryKey: ['api'] })
  }
  return result
}

/** Call on sign-in / sign-out so one user's data is never shown to another. */
export function clearApiCache() {
  queryClient.clear()
}
