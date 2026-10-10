/**
 * Dump evolution pack diagrams + stage titles for enriching.
 * Run: npx tsx src/scripts/dump-evolution-packs.ts
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { connectDB } from '../config/db'
import { ChallengePack } from '../models/studio/challenge-pack.model'

async function main() {
  await connectDB()
  const packs = await ChallengePack.find({ type: 'evolution' }).lean()
  const out: Record<string, unknown> = {}
  for (const p of packs as any[]) {
    const stages = p.payload?.stages ?? p.payload?.checkpoints ?? []
    out[p.slug] = {
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      order: p.order,
      tags: p.tags,
      briefing: p.payload?.briefing,
      stageTitles: (stages as any[]).map(s => ({
        id: s.id,
        title: s.title,
        dayLabel: s.dayLabel ?? s.label,
        requirement: s.requirement ?? s.description ?? s.narrative,
      })),
      nodes: (p.diagramSnapshot?.nodes ?? []).map((n: any) => ({
        id: n.id,
        elementId: n.data?.elementId,
        name: n.data?.name,
        x: n.position?.x,
        y: n.position?.y,
        methods: (n.data?.methods ?? []).map((m: any) => (typeof m === 'string' ? m : m.name)),
      })),
      edges: (p.diagramSnapshot?.edges ?? []).map((e: any) => ({
        id: e.id,
        elementId: e.data?.elementId,
        source: e.source,
        target: e.target,
        type: e.data?.relationshipType ?? e.type,
      })),
    }
  }
  const file = path.join(__dirname, 'data', 'evolution-packs-dump.json')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(out, null, 2))
  console.log(`Wrote ${Object.keys(out).length} packs → ${file}`)
  process.exit(0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
