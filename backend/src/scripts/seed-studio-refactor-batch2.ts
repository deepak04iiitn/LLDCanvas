/**
 * Upserts 102 new Design Studio "Refactor" packs (orders 200–301).
 * Run: npx ts-node -r dotenv/config src/scripts/seed-studio-refactor-batch2.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { EASY_A } from './data/studio-refactor-easy-a'
import { EASY_B } from './data/studio-refactor-easy-b'
import { EASY_C } from './data/studio-refactor-easy-c'
import { MEDIUM_A } from './data/studio-refactor-medium-a'
import { MEDIUM_B } from './data/studio-refactor-medium-b'
import { MEDIUM_C } from './data/studio-refactor-medium-c'
import { HARD_A } from './data/studio-refactor-hard-a'
import { HARD_B } from './data/studio-refactor-hard-b'
import { HARD_C } from './data/studio-refactor-hard-c'

const ALL = [
  ...EASY_A, ...EASY_B, ...EASY_C,
  ...MEDIUM_A, ...MEDIUM_B, ...MEDIUM_C,
  ...HARD_A, ...HARD_B, ...HARD_C,
]

async function main() {
  await connectDB()
  const mongoose = (await import('mongoose')).default
  const col = mongoose.connection.collection('challengepacks')

  let created = 0
  let updated = 0

  for (const pack of ALL) {
    const doc = { ...pack, status: 'published', updatedAt: new Date() }
    const exists = await col.findOne({ slug: pack.slug })
    if (exists) {
      await col.replaceOne({ slug: pack.slug }, { ...doc, createdAt: exists.createdAt })
      console.log(`  ↺  ${pack.slug}`)
      updated++
    } else {
      await col.insertOne({ ...doc, createdAt: new Date() })
      console.log(`  ✓  ${pack.slug}`)
      created++
    }
  }

  console.log(`\nDone — ${created} created, ${updated} updated (studio refactor batch 2)`)
  console.log(`Total packs in this batch: ${ALL.length}`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
