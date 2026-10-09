/**
 * Upserts 102 new Design Studio Architecture Budget packs (orders 700–801).
 * Run: npx tsx src/scripts/seed-studio-budget-batch2.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { BATCH2_ALL } from './data/studio-budget-batch2-all'

async function main() {
  await connectDB()
  const mongoose = (await import('mongoose')).default
  const col = mongoose.connection.collection('challengepacks')

  let created = 0
  let updated = 0

  for (const pack of BATCH2_ALL) {
    const doc = { ...pack, status: 'published', updatedAt: new Date() }
    const exists = await col.findOne({ slug: pack.slug })
    if (exists) {
      await col.replaceOne({ slug: pack.slug }, { ...doc, createdAt: exists.createdAt })
      console.log(`  ↺  ${pack.slug} (${pack.payload.stages.length} stages, budget ${pack.payload.budget.total})`)
      updated++
    } else {
      await col.insertOne({ ...doc, createdAt: new Date() })
      console.log(`  ✓  ${pack.slug} (${pack.payload.stages.length} stages, budget ${pack.payload.budget.total})`)
      created++
    }
  }

  const easy = BATCH2_ALL.filter(p => p.difficulty === 'easy').length
  const medium = BATCH2_ALL.filter(p => p.difficulty === 'medium').length
  const hard = BATCH2_ALL.filter(p => p.difficulty === 'hard').length

  console.log(`\nDone — ${created} created, ${updated} updated (studio budget batch 2)`)
  console.log(`Total in batch: ${BATCH2_ALL.length} (easy ${easy}, medium ${medium}, hard ${hard})`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
