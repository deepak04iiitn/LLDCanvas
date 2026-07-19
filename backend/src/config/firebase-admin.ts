import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function ensureFirebaseApp() {
  if (getApps().length) return

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  // Env vars typically escape real newlines as literal "\n" — restore them.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY must be set in environment variables'
    )
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
}

export interface VerifiedFirebaseUser {
  uid: string
  email: string
  name: string
  picture?: string
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser> {
  ensureFirebaseApp()
  const decoded = await getAuth().verifyIdToken(idToken)
  if (!decoded.email) throw new Error('Firebase account has no email')
  return {
    uid: decoded.uid,
    email: decoded.email,
    name: (decoded.name as string | undefined) ?? decoded.email.split('@')[0],
    picture: decoded.picture as string | undefined,
  }
}
