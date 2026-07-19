import jwt from 'jsonwebtoken'

// Verifies Firebase ID tokens WITHOUT the firebase-admin SDK. Its 'auth'
// submodule pulls in jwks-rsa@^4, which itself does a plain CJS require()
// of jose@^6 (pure ESM) — that require() throws immediately at module load
// on any pure-CommonJS Node project (this isn't Vercel-specific; it would
// fail the same way anywhere), which crashed every route on this server
// merely by having auth.controller.ts import that submodule.
//
// This is Firebase's own documented fallback for environments where the
// Admin SDK doesn't work: fetch Google's public certs for the token signer
// and verify the JWT signature + claims directly. Verifying the signature
// against Google's public key is exactly what the Admin SDK does internally
// too — this needs no service-account credentials, just the project ID.
const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
const DEFAULT_CACHE_MS = 60 * 60 * 1000 // fallback if no cache-control header

let certsCache: { certs: Record<string, string>; expiresAt: number } | null = null

async function getGoogleCerts(): Promise<Record<string, string>> {
  if (certsCache && certsCache.expiresAt > Date.now()) return certsCache.certs

  const res = await fetch(CERTS_URL)
  if (!res.ok) throw new Error(`Failed to fetch Google public certs: ${res.status}`)
  const certs = (await res.json()) as Record<string, string>

  const cacheControl = res.headers.get('cache-control') ?? ''
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/)
  const ttlMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : DEFAULT_CACHE_MS

  certsCache = { certs, expiresAt: Date.now() + ttlMs }
  return certs
}

export interface VerifiedFirebaseUser {
  uid: string
  email: string
  name: string
  picture?: string
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser> {
  const projectId = process.env.FIREBASE_PROJECT_ID
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID is not defined in environment variables')

  const decodedHeader = jwt.decode(idToken, { complete: true })
  const kid = decodedHeader?.header.kid
  if (!kid) throw new Error('Invalid Firebase ID token: missing key id')

  const certs = await getGoogleCerts()
  const cert = certs[kid]
  if (!cert) throw new Error('Invalid Firebase ID token: unknown signing key')

  const payload = jwt.verify(idToken, cert, {
    algorithms: ['RS256'],
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  }) as jwt.JwtPayload

  if (!payload.sub) throw new Error('Invalid Firebase ID token: missing subject')
  if (!payload.email) throw new Error('Firebase account has no email')

  return {
    uid: payload.sub,
    email: payload.email as string,
    name: (payload.name as string | undefined) ?? (payload.email as string).split('@')[0],
    picture: payload.picture as string | undefined,
  }
}
