import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null

// Lazy — Firebase Auth is only ever used client-side (Google sign-in popup),
// but this module is imported transitively by every page via AuthProvider in
// the root layout. Initializing eagerly at module load would run during
// Next.js's server-side prerendering too, where there's no popup to show and
// no need for Firebase at all.
export function getFirebaseAuth(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth is only available in the browser')
  }
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  if (!auth) auth = getAuth(app)
  return auth
}

export const googleProvider = new GoogleAuthProvider()
