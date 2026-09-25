/**
 * List all evolution packs in DB (slug, title, stage count, briefing len).
 * Run: npx tsx src/scripts/list-evolution-packs.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { ChallengePack } from '../models/studio/challenge-pack.model'

async function main() {
  await connectDB()
  const packs = await ChallengePack.find({ type: 'evolution' })
    .select('slug title description status payload diagramSnapshot')
    .sort({ order: 1, slug: 1 })
    .lean()

  console.log(`evolution packs: ${packs.length}\n`)
  for (const p of packs as any[]) {
    const stages = p.payload?.stages ?? p.payload?.checkpoints ?? p.payload?.versions ?? []
    const briefing = String(p.payload?.briefing ?? '')
    const nodes = p.diagramSnapshot?.nodes?.length ?? 0
    const hasMustChange = Array.isArray(stages) && stages.some((s: any) => typeof s.mustChange === 'boolean')
    const rich =
      Array.isArray(stages) &&
      stages.length >= 2 &&
      hasMustChange &&
      briefing.length >= 120 &&
      stages.every((s: any) => s.narrative && s.pressureOptions?.length)
    console.log(
      `${rich ? 'RICH' : 'THIN'}  ${p.slug.padEnd(36)} stages=${String(stages.length).padStart(2)} brief=${String(briefing.length).padStart(4)} nodes=${nodes}  | ${p.title}`,
    )
  }
  process.exit(0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
