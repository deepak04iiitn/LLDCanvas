/**
 * Seed Design Studio challenge packs (idempotent by slug).
 *
 * Debugger packs: loaded from data/studio-debugger-packs.json (full model).
 * Regenerate that file with: npx tsx src/scripts/migrate-debugger-packs.ts
 *
 * Other types: inline stubs below + any already in DB kept via migrate of other scripts.
 *
 * Run: npx tsx src/scripts/seed-studio-debugger.ts
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { connectDB } from '../config/db'
import { ChallengePack } from '../models/studio/challenge-pack.model'

type MethodSpec =
  | string
  | {
      name: string
      returnType?: string
      params?: { name: string; type: string }[]
      visibility?: 'public' | 'private' | 'protected'
      isStatic?: boolean
      isAbstract?: boolean
    }

function method(m: MethodSpec) {
  if (typeof m === 'string') {
    return {
      name: m,
      returnType: 'void',
      params: [] as { name: string; type: string }[],
      visibility: 'public' as const,
      isStatic: false,
      isAbstract: false,
    }
  }
  return {
    name: m.name,
    returnType: m.returnType ?? 'void',
    params: m.params ?? [],
    visibility: m.visibility ?? 'public',
    isStatic: m.isStatic ?? false,
    isAbstract: m.isAbstract ?? false,
  }
}

function node(
  id: string,
  elementId: string,
  name: string,
  x: number,
  y: number,
  methods: MethodSpec[] = [],
  attrs: { name: string; type: string; visibility?: string }[] = [],
) {
  return {
    id,
    position: { x, y },
    data: {
      elementId,
      nodeType: 'class',
      name,
      attributes: attrs.map(a => ({
        name: a.name,
        type: a.type,
        visibility: a.visibility ?? 'private',
      })),
      methods: methods.map(method),
    },
  }
}

function edge(
  id: string,
  elementId: string,
  source: string,
  target: string,
  relationshipType: 'dependency' | 'association' | 'inheritance' | 'composition' = 'dependency',
) {
  return { id, source, target, data: { elementId, relationshipType } }
}

const meta = { theme: 'light' as const, zoom: 1, panX: 0, panY: 0 }

function loadDebuggerPacks(): Record<string, unknown>[] {
  const file = path.join(__dirname, 'data', 'studio-debugger-packs.json')
  if (!fs.existsSync(file)) {
    console.warn('Missing data/studio-debugger-packs.json — run migrate-debugger-packs.ts first')
    return []
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>[]
}

/** Non-debugger packs kept in-repo (also upserted). Legacy DB packs of these types remain unless overwritten by slug. */
const OTHER_PACKS = [
  {
    type: 'refactor' as const,
    slug: 'ref-split-order-manager',
    title: 'Split OrderManager',
    difficulty: 'medium' as const,
    description: 'Refactor a fat OrderManager into cohesive services without losing behavior.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 101,
    tags: ['refactor'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-om', 'OrderManager', 200, 40, [
          'placeOrder',
          'charge',
          'reserveStock',
          'notify',
          'log',
        ]),
        node('n2', 'el-db', 'Database', 200, 220, ['save']),
      ],
      edges: [edge('e1', 'ed-om-db', 'n1', 'n2')],
    },
    payload: {
      briefing:
        'OrderManager currently owns placing an order, charging, reserving stock, notifying, and logging. Split it into smaller services without removing behavior.',
      constraints: ['Do not remove functionality', 'Reduce coupling', 'Prefer small services'],
    },
  },
  {
    type: 'change_one' as const,
    slug: 'co-add-payment-gateway',
    title: 'Add a Payment Gateway Port',
    difficulty: 'easy' as const,
    description: 'Make one focused change: introduce a gateway abstraction for Checkout.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 201,
    tags: ['change-one'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-checkout', 'Checkout', 80, 80, ['pay']),
        node('n2', 'el-rz', 'Razorpay', 320, 80, ['charge']),
      ],
      edges: [edge('e1', 'ed-co-rz', 'n1', 'n2')],
    },
    payload: {
      briefing:
        'Checkout talks to Razorpay directly. Make one focused change so Checkout no longer depends on that concrete provider.',
      allowedChange: 'Introduce PaymentGateway and rewire Checkout.',
    },
  },
  {
    type: 'evolution' as const,
    slug: 'evo-multi-provider',
    title: 'Evolve to Multi-Provider Payments',
    difficulty: 'hard' as const,
    description: 'Evolve a single-provider payment design toward multi-provider without breaking Order.',
    status: 'published' as const,
    planMin: 'pro' as const,
    order: 301,
    tags: ['evolution'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 40, 80, ['checkout']),
        node('n2', 'el-pay', 'Payment', 280, 80, ['charge']),
        node('n3', 'el-rz', 'Razorpay', 520, 80, ['createPayment']),
      ],
      edges: [
        edge('e1', 'ed-ord-pay', 'n1', 'n2'),
        edge('e2', 'ed-pay-rz', 'n2', 'n3'),
      ],
    },
    payload: {
      briefing:
        'Year 1 supports a single payment provider. Evolve the design so more providers can be added without breaking Order.',
      goal: 'Support Stripe and Razorpay behind a shared abstraction.',
    },
  },
]

async function upsertPack(pack: Record<string, unknown>) {
  const slug = String(pack.slug)
  await ChallengePack.findOneAndUpdate({ slug }, { $set: pack }, { upsert: true, new: true })
  console.log(`✓ ${pack.type} ${slug}`)
}

async function main() {
  await connectDB()
  const debuggerPacks = loadDebuggerPacks()
  let debuggerCount = 0
  let otherCount = 0

  for (const pack of debuggerPacks) {
    await upsertPack(pack)
    debuggerCount++
  }
  for (const pack of OTHER_PACKS) {
    await upsertPack(pack as unknown as Record<string, unknown>)
    otherCount++
  }

  // Also refresh briefings on legacy non-debugger packs still in DB (do not wipe diagrams)
  const legacyOthers = await ChallengePack.find({
    type: { $in: ['refactor', 'change_one', 'evolution'] },
    slug: { $nin: OTHER_PACKS.map(p => p.slug) },
  })
  for (const doc of legacyOthers) {
    const payload = (doc.payload ?? {}) as Record<string, unknown>
    if (!payload.briefing || String(payload.briefing).length < 20) {
      payload.briefing =
        String(doc.description || doc.title) +
        ' Inspect the starting diagram and apply the challenge rules for this mode.'
      doc.payload = payload
      doc.markModified('payload')
      await doc.save()
      console.log(`✓ refreshed briefing ${doc.type} ${doc.slug}`)
      otherCount++
    }
  }

  console.log(`Done — ${debuggerCount} debugger packs + ${otherCount} other upserts/refreshes`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
