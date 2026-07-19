import { MongoClient } from 'mongodb'
import { dynamicImport } from '../utils/dynamic-import'

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
  const [{ betterAuth }, { mongodbAdapter }, { bearer }] = await Promise.all([
    dynamicImport<typeof import('better-auth')>('better-auth'),
    dynamicImport<typeof import('better-auth/adapters/mongodb')>('better-auth/adapters/mongodb'),
    dynamicImport<typeof import('better-auth/plugins')>('better-auth/plugins'),
  ])

  const mongoClient = await getMongoClient()
  const db = mongoClient.db()

  // Strip trailing slashes — Vercel env vars often have them, but Better Auth
  // and browser Origin headers never include them, causing silent mismatches.
  const normalizeUrl = (u: string) => u.trim().replace(/\/+$/, '')

  return betterAuth({
    baseURL: normalizeUrl(process.env.BETTER_AUTH_URL ?? 'http://localhost:4000'),
    database: mongodbAdapter(db),

    // ─── User additional fields ────────────────────────────────────────
    user: {
      additionalFields: {
        isAdmin: {
          type: 'boolean' as const,
          required: false,
          defaultValue: false,
          input: false,   // not settable by users via API
        },
        blocked: {
          type: 'boolean' as const,
          required: false,
          defaultValue: false,
          input: false,
        },
      },
    },

    // ─── Social providers ──────────────────────────────────────────────
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },

    // ─── Email + password ──────────────────────────────────────────────
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },

    // ─── Session ──────────────────────────────────────────────────────
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },

    // ─── Cross-origin cookie config ────────────────────────────────────
    advanced: {
      defaultCookieAttributes: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      },
    },

    trustedOrigins: (
      process.env.CORS_ORIGINS ?? process.env.CLIENT_URL ?? 'http://localhost:3000'
    )
      .split(',')
      .map(normalizeUrl)
      .filter(Boolean),

    // Frontend and backend live on different *.vercel.app subdomains, which
    // browsers treat as separate sites — third-party cookie blocking drops
    // the session cookie on cross-site requests. The bearer plugin lets the
    // client authenticate via an `Authorization: Bearer <token>` header
    // instead, sidestepping cookies entirely.
    plugins: [bearer()],
  })
}

// Ensures the admin email has isAdmin=true in the DB (runs on every startup).
export async function ensureAdminUser() {
  try {
    const mongoClient = await getMongoClient()
    const db = mongoClient.db()
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      console.warn('ADMIN_EMAIL env var not set — skipping admin flag.')
      return
    }
    const result = await db.collection('user').updateOne(
      { email: adminEmail },
      { $set: { isAdmin: true } }
    )
    if (result.matchedCount > 0) {
      console.log(`✓ Admin flag set for ${adminEmail}`)
    }
  } catch (err) {
    console.warn('Could not set admin flag (user may not exist yet):', err)
  }
}

// Singleton — resolved once on server startup, reused for every request
let _auth: Awaited<ReturnType<typeof createAuth>> | null = null

export async function getAuth() {
  if (!_auth) _auth = await createAuth()
  return _auth
}
