/**
 * seed-design-bugs-batch2.ts
 * Upserts 102 new DesignBug problems (orders 7-108) into MongoDB.
 * Uses raw collection to bypass Mongoose schema casting on subdocument arrays.
 * Run: npx ts-node -r dotenv/config src/scripts/seed-design-bugs-batch2.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { EASY_BUGS } from './data/design-bugs-easy'
import { MEDIUM_BUGS } from './data/design-bugs-medium'
import { HARD_BUGS } from './data/design-bugs-hard'

const ALL = [...EASY_BUGS, ...MEDIUM_BUGS, ...HARD_BUGS]

async function main() {
  await connectDB()
  const mongoose = (await import('mongoose')).default
  const col = mongoose.connection.collection('designbugs')

  let created = 0
  let updated = 0

  for (const bug of ALL) {
    const doc = { ...bug, status: 'published', updatedAt: new Date() }
    const exists = await col.findOne({ slug: bug.slug })
    if (exists) {
      await col.replaceOne({ slug: bug.slug }, { ...doc, createdAt: exists.createdAt })
      console.log(`  ↺  ${bug.slug}`)
      updated++
    } else {
      await col.insertOne({ ...doc, createdAt: new Date() })
      console.log(`  ✓  ${bug.slug}`)
      created++
    }
  }

  console.log(`\nDone — ${created} created, ${updated} updated (batch 2)`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
