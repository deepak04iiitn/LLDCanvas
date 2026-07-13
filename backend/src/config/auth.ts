import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { MongoClient } from 'mongodb'

// Native MongoDB client — used exclusively by Better Auth for its own
// collections (users, sessions, accounts, verifications).
// Mongoose remains the ORM for our own models (Diagram, etc.).
let client: MongoClient

export async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
  }
  return client
}

export async function createAuth() {
  const mongoClient = await getMongoClient()
  const db = mongoClient.db()

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4000',
    database: mongodbAdapter(db),

    // ─── Social providers ──────────────────────────────────────────────
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },

    // ─── Email + password (optional secondary) ─────────────────────────
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },

    // ─── Session ──────────────────────────────────────────────────────
    session: {
      expiresIn: 60 * 60 * 24 * 30,          // 30 days
      updateAge: 60 * 60 * 24,               // refresh token if older than 1 day
    },

    // ─── Cross-origin cookie config ────────────────────────────────────
    // Frontend (Vercel) and backend (Railway) are on different domains in
    // production — SameSite=None + Secure is required for the cookie to
    // be sent cross-site. In local dev both run on localhost so this is
    // transparent, but it must be correct before staging/prod deploy.
    advanced: {
      defaultCookieAttributes: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      },
    },

    trustedOrigins: [process.env.CLIENT_URL ?? 'http://localhost:3000'],
  })
}

// Singleton — resolved once on server startup, reused for every request
let _auth: Awaited<ReturnType<typeof createAuth>> | null = null

export async function getAuth() {
  if (!_auth) _auth = await createAuth()
  return _auth
}
