/**
 * seed-roguelike-batch2.ts
 * Upserts ~102 new Roguelike Scenarios (orders 5-106) into MongoDB.
 * Uses raw collection to bypass Mongoose schema casting.
 * Run: npx ts-node -r dotenv/config src/scripts/seed-roguelike-batch2.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { EASY_A } from './data/roguelike-easy-a'
import { EASY_B } from './data/roguelike-easy-b'
import { EASY_C } from './data/roguelike-easy-c'
import { MEDIUM_A } from './data/roguelike-medium-a'
import { MEDIUM_B } from './data/roguelike-medium-b'
import { MEDIUM_C } from './data/roguelike-medium-c'
import { HARD_A } from './data/roguelike-hard-a'
import { HARD_B } from './data/roguelike-hard-b'
import { HARD_C } from './data/roguelike-hard-c'

const ALL = [
  ...EASY_A, ...EASY_B, ...EASY_C,
  ...MEDIUM_A, ...MEDIUM_B, ...MEDIUM_C,
  ...HARD_A, ...HARD_B, ...HARD_C,
]

async function main() {
  await connectDB()
  const mongoose = (await import('mongoose')).default
  const col = mongoose.connection.collection('roguelikescenarios')

  let created = 0
  let updated = 0

  for (const scenario of ALL) {
    const doc = { ...scenario, status: 'published', updatedAt: new Date() }
    const exists = await col.findOne({ slug: scenario.slug })
    if (exists) {
      await col.replaceOne({ slug: scenario.slug }, { ...doc, createdAt: exists.createdAt })
      console.log(`  ↺  ${scenario.slug}`)
      updated++
    } else {
      await col.insertOne({ ...doc, createdAt: new Date() })
      console.log(`  ✓  ${scenario.slug}`)
      created++
    }
  }

  console.log(`\nDone — ${created} created, ${updated} updated (roguelike batch 2)`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
