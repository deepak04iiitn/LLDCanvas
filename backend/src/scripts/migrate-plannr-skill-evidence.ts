/**
 * One-shot migration for evidence-based skills:
 * - Plans with zero completed topics → reset skills to 0, clear evidence
 * - Plans with progress → keep scores, backfill migration evidence so UI shows assessed
 *
 * Usage: npx ts-node src/scripts/migrate-plannr-skill-evidence.ts
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { JourneyProfile } from '../models/journey/journey-profile.model'
import { emptySkills } from '../services/plannr/skillEvidence'
import { SKILL_KEYS } from '../services/plannr/skillsMeta'

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI
  if (!uri) throw new Error('MONGODB_URI missing')
  await mongoose.connect(uri)
  console.log('Connected')

  const profiles = await JourneyProfile.find({})
  let zeroed = 0
  let backfilled = 0

  for (const p of profiles) {
    const completed = p.topicsCompleted?.length ?? 0
    if (completed === 0) {
      p.skills = emptySkills()
      p.skillEvidence = []
      p.markModified('skills')
      p.markModified('skillEvidence')
      await p.save()
      zeroed++
      continue
    }

    const evidence = p.skillEvidence ?? []
    if (evidence.length === 0) {
      const skills = (p.toObject().skills ?? {}) as unknown as Record<string, number>
      const entries = SKILL_KEYS.filter(k => (skills[k] ?? 0) > 0).map(k => ({
        skillKey: k as string,
        delta: skills[k] ?? 0,
        reason: 'Imported prior progress',
        source: 'migration' as const,
        at: new Date(),
      }))
      if (entries.length) {
        p.skillEvidence = entries
        p.markModified('skillEvidence')
        await p.save()
        backfilled++
      }
    }
  }

  console.log(`Done. Zeroed empty plans: ${zeroed}. Backfilled learners: ${backfilled}.`)
  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
