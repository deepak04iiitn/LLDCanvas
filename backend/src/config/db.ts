import mongoose from 'mongoose'

// Cached across warm serverless invocations so we never open a second
// connection while one is already pending/established, and so every caller
// within the same execution context awaits the SAME connect attempt instead
// of racing it (see backend/api/index.ts's bootstrap gate).
let connectionPromise: Promise<typeof mongoose> | null = null

export function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose)
  }

  if (connectionPromise) return connectionPromise

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables')

  mongoose.connection.on('connected', () => console.log('✓ MongoDB connected'))
  mongoose.connection.on('error', (err) => console.error('✗ MongoDB error:', err))
  // A dropped connection (e.g. after a frozen serverless container thaws with
  // a stale socket) must not leave every future request permanently stuck
  // waiting on an already-settled promise — clear the cache so the next
  // connectDB() call reconnects instead of buffering forever.
  mongoose.connection.on('disconnected', () => {
    console.warn('✗ MongoDB disconnected — will reconnect on next request')
    connectionPromise = null
  })

  connectionPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  }).catch((err) => {
    // Let the next request retry from a clean slate instead of every future
    // call permanently reusing this one rejected promise.
    connectionPromise = null
    throw err
  })

  return connectionPromise
}
