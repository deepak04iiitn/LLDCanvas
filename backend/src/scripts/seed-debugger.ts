import 'dotenv/config'
import { connectDB } from '../config/db'
import { DebuggerChallenge } from '../models/learn/debugger-challenge.model'
import { EASY } from './data/debugger-easy'
import { MEDIUM } from './data/debugger-medium'
import { HARD } from './data/debugger-hard'

const challenges = [...EASY, ...MEDIUM, ...HARD]

async function main() {
  await connectDB()
  let n = 0
  for (const c of challenges) {
    await DebuggerChallenge.findOneAndUpdate({ slug: c.slug }, { $set: c }, { upsert: true, new: true })
    console.log('✓', c.slug)
    n++
  }
  console.log(`\nDone — ${n} Debug Lab challenges upserted`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
