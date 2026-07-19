import { User } from '../models/user.model'

// Ensures the admin email has isAdmin=true in the DB (runs on every startup).
export async function ensureAdminUser(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL env var not set — skipping admin flag.')
    return
  }
  try {
    const result = await User.updateOne({ email: adminEmail.toLowerCase() }, { $set: { isAdmin: true } })
    if (result.matchedCount > 0) {
      console.log(`✓ Admin flag set for ${adminEmail}`)
    }
  } catch (err) {
    console.warn('Could not set admin flag (user may not exist yet):', err)
  }
}
