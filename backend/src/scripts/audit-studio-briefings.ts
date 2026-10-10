/**
 * Report briefing quality for all studio packs.
 * Run: npx tsx src/scripts/audit-studio-briefings.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { ChallengePack } from '../models/studio/challenge-pack.model'

function isStructured(briefing: string): boolean {
  return (
    briefing.includes('What you should do') ||
    briefing.includes("What's going on") ||
    briefing.includes('What’s going on')
  )
}

async function main() {
  await connectDB()
  const packs = await ChallengePack.find({
    type: { $in: ['refactor', 'change_one', 'evolution'] },
  })
    .select('type slug title description payload')
    .lean()

  let bad = 0
  for (const p of packs as any[]) {
    const briefing = String(p.payload?.briefing ?? '')
    const ok = isStructured(briefing) && briefing.length >= 180
    const cr = String(p.payload?.changeRequest?.body ?? '')
    if (!ok) {
      bad++
      console.log('BAD', p.type, p.slug, 'briefLen=' + briefing.length)
    } else {
      console.log(
        'OK',
        p.type,
        p.slug,
        'briefLen=' + briefing.length,
        p.type === 'change_one' ? 'crLen=' + cr.length : '',
      )
    }
  }
  console.log(`\nbad=${bad} total=${packs.length}`)
  process.exit(bad ? 1 : 0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
