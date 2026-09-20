/**
 * Audit studio pack briefings, then enrich any short/unstructured ones.
 * Run: npx tsx src/scripts/enrich-studio-briefings.ts
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

function nodeNames(doc: {
  diagramSnapshot?: { nodes?: { data?: { name?: string } }[] }
}): string[] {
  const nodes = doc.diagramSnapshot?.nodes ?? []
  return nodes
    .map(n => String(n.data?.name ?? '').trim())
    .filter(Boolean)
    .slice(0, 8)
}

function buildRefactorBrief(doc: {
  title?: string
  description?: string
  diagramSnapshot?: { nodes?: { data?: { name?: string } }[] }
}): string {
  const names = nodeNames(doc)
  const nameLine = names.length ? names.join(', ') : 'the classes on the canvas'
  const desc = String(doc.description || doc.title || 'This design needs a cleaner structure.')

  return [
    'What’s going on',
    `This refactor challenge is about: ${doc.title}.`,
    `You’ll see a UML sketch involving: ${nameLine}.`,
    '',
    desc,
    '',
    'The problem (simple terms)',
    'The current structure is awkward to change. Responsibilities may be piled into one place, or classes may depend on concrete details instead of a shared idea. That makes every new product request force edits in the wrong spots.',
    '',
    'What you should do',
    'Improve the architecture on the right canvas. Keep the behaviors the system already has. Prefer smaller, clearer collaborators over wiping the diagram and starting blank.',
    '',
    'Where to start',
    `Open the biggest / central class among (${nameLine}) and read its methods. Then follow the outgoing arrows and ask: “If product added one more variant tomorrow, which class would I be forced to edit again?”`,
  ].join('\n')
}

function buildChangeBrief(doc: {
  title?: string
  description?: string
  payload?: Record<string, unknown>
  diagramSnapshot?: { nodes?: { data?: { name?: string } }[] }
}): { briefing: string; changeRequestBody?: string } {
  const names = nodeNames(doc)
  const nameLine = names.length ? names.join(', ') : 'the classes on the canvas'
  const payload = (doc.payload ?? {}) as Record<string, unknown>
  const cr = (payload.changeRequest ?? {}) as { title?: string; body?: string; type?: string }
  const desc = String(doc.description || doc.title || 'A focused product change is required.')
  const crTitle = String(cr.title || doc.title || 'Apply a focused change')
  const existingBody = String(cr.body || '').trim()

  const briefing = [
    'What’s going on',
    `This Change One Thing challenge starts from a working design involving: ${nameLine}.`,
    '',
    desc,
    '',
    'The problem (simple terms)',
    'Product needs one focused update. Your job is not to redesign everything — it is to make the smallest safe change that satisfies the request while keeping existing behavior.',
    '',
    'What you should do',
    '1) Read the change request carefully.',
    '2) Predict which classes/relationships will be touched.',
    '3) Edit the working (right) canvas with the minimal change.',
    '4) Submit and check blast radius / regressions.',
    '',
    'Where to start',
    `Look at ${nameLine}. Ask which seam absorbs the new need without rewriting unrelated boxes.`,
  ].join('\n')

  const changeRequestBody =
    existingBody.length >= 120
      ? existingBody
      : [
          crTitle + '.',
          '',
          existingBody || desc,
          '',
          'Keep existing happy paths working unless the request explicitly removes something.',
          'Prefer the smallest change that unlocks the new need.',
          names.length
            ? `Relevant classes in the baseline: ${nameLine}.`
            : '',
        ]
          .filter(Boolean)
          .join('\n')

  return { briefing, changeRequestBody }
}

function buildGenericBrief(doc: {
  type?: string
  title?: string
  description?: string
  diagramSnapshot?: { nodes?: { data?: { name?: string } }[] }
}): string {
  const names = nodeNames(doc)
  const nameLine = names.length ? names.join(', ') : 'the classes on the canvas'
  const desc = String(doc.description || doc.title || 'Investigate and improve this design.')

  return [
    'What’s going on',
    `Challenge: ${doc.title}.`,
    `Diagram involves: ${nameLine}.`,
    '',
    desc,
    '',
    'The problem (simple terms)',
    'Something about this design makes the next product change expensive, confusing, or unsafe. Your job is to understand that pressure and improve the design carefully.',
    '',
    'What you should do',
    'Read the diagram before changing anything. Prefer focused edits over a full rewrite. Preserve behavior that should still work.',
    '',
    'Where to start',
    `Start with ${names[0] || 'the central class'} — read methods and follow arrows.`,
  ].join('\n')
}

async function main() {
  await connectDB()
  const packs = await ChallengePack.find({})
  let updated = 0
  let skipped = 0
  const byType: Record<string, { total: number; updated: number }> = {}

  for (const doc of packs) {
    const type = String(doc.type)
    byType[type] ??= { total: 0, updated: 0 }
    byType[type].total++

    const payload = { ...((doc.payload ?? {}) as Record<string, unknown>) }
    const briefing = String(payload.briefing ?? '')
    const needsBrief = !isStructured(briefing) || briefing.length < 180

    let changed = false

    if (type === 'refactor' && needsBrief) {
      payload.briefing = buildRefactorBrief(doc)
      if (!Array.isArray(payload.requirements) || (payload.requirements as unknown[]).length === 0) {
        payload.requirements = ['Existing core behavior still works after your refactor']
      }
      if (!Array.isArray(payload.constraints) || (payload.constraints as unknown[]).length === 0) {
        payload.constraints = [
          'Do not wipe the diagram and start blank',
          'Prefer focused structural improvements',
        ]
      }
      changed = true
    } else if (type === 'change_one' && needsBrief) {
      const built = buildChangeBrief(doc)
      payload.briefing = built.briefing
      const cr = {
        ...((payload.changeRequest as Record<string, unknown>) ?? {}),
      }
      if (built.changeRequestBody) cr.body = built.changeRequestBody
      if (!cr.title) cr.title = doc.title
      if (!cr.type) cr.type = 'capability'
      payload.changeRequest = cr
      if (!Array.isArray(payload.constraints)) payload.constraints = []
      changed = true
    } else if (needsBrief && type !== 'debugger') {
      // evolution / other studio types — enrich briefing only
      payload.briefing = buildGenericBrief(doc)
      changed = true
    }

    // Always enrich short list descriptions a bit for non-debugger
    if (type !== 'debugger') {
      const desc = String(doc.description ?? '')
      if (desc.length < 60) {
        doc.description = `${desc || doc.title}. Open the challenge for a plain-language brief of what is wrong and what to change.`
        changed = true
      }
    }

    if (changed) {
      doc.payload = payload
      doc.markModified('payload')
      await doc.save()
      updated++
      byType[type].updated++
      console.log(`✓ ${type} ${doc.slug}`)
    } else {
      skipped++
    }
  }

  console.log('\nSummary')
  console.log(JSON.stringify(byType, null, 2))
  console.log(`updated=${updated} skipped=${skipped} total=${packs.length}`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
