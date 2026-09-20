/**
 * Upgrade every debugger ChallengePack to the full Design Debugger model
 * (briefing, requirement, revealCount, expectedIssues with hints/keywords,
 * verification) without spoiling diagnoses in user-facing copy.
 *
 * Also writes src/scripts/data/studio-debugger-packs.json for idempotent reseeding.
 *
 * Run: npx tsx src/scripts/migrate-debugger-packs.ts
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { connectDB } from '../config/db'
import { ChallengePack } from '../models/studio/challenge-pack.model'
import {
  DEBUGGER_CATEGORIES,
  type DebuggerCategory,
} from '../services/studio/debuggerGrade'

const CATEGORY_MAP: Record<string, { category: DebuggerCategory; aliases?: string[] }> = {
  'Concrete Dependency': { category: 'DIP Violation', aliases: ['Tight Coupling'] },
  'Tight Coupling': { category: 'Tight Coupling', aliases: ['DIP Violation'] },
  'SRP Violation': { category: 'SRP Violation', aliases: ['God Object'] },
  'OCP Violation': { category: 'OCP Violation', aliases: ['Pattern Misuse'] },
  'DIP Violation': { category: 'DIP Violation', aliases: ['Tight Coupling'] },
  'Circular Dependency': { category: 'Circular Dependency', aliases: ['Tight Coupling'] },
  'Unclear Ownership': { category: 'Other', aliases: ['SRP Violation'] },
  Testability: { category: 'Pattern Misuse', aliases: ['Tight Coupling', 'Poor Encapsulation'] },
  Layering: { category: 'Other', aliases: ['Poor Encapsulation', 'DIP Violation'] },
  'Inconsistent Abstraction': { category: 'Unnecessary Abstraction', aliases: ['Pattern Misuse'] },
  'LSP / Model Smell': { category: 'Incorrect Inheritance', aliases: ['Other'] },
  'Leaky Abstraction': { category: 'Poor Encapsulation', aliases: ['Unnecessary Abstraction'] },
  'God Object': { category: 'God Object', aliases: ['SRP Violation'] },
  'Incorrect Inheritance': { category: 'Incorrect Inheritance' },
  'Pattern Misuse': { category: 'Pattern Misuse', aliases: ['Tight Coupling'] },
  'Poor Encapsulation': { category: 'Poor Encapsulation' },
  'Unnecessary Abstraction': { category: 'Unnecessary Abstraction' },
  Other: { category: 'Other' },
}

function mapCategory(raw: string): { category: DebuggerCategory; aliases: string[] } {
  const hit = CATEGORY_MAP[raw]
  if (hit) return { category: hit.category, aliases: hit.aliases ?? [] }
  if ((DEBUGGER_CATEGORIES as readonly string[]).includes(raw)) {
    return { category: raw as DebuggerCategory, aliases: [] }
  }
  return { category: 'Other', aliases: [raw] }
}

function keywordsFrom(text: string, extra: string[] = []): string[] {
  const stop = new Set([
    'the', 'a', 'an', 'and', 'or', 'to', 'of', 'is', 'are', 'on', 'in', 'for',
    'with', 'into', 'via', 'that', 'this', 'should', 'must', 'not', 'be',
  ])
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stop.has(w))
  const uniq = [...new Set([...extra, ...words])]
  return uniq.slice(0, 10)
}

function softTitle(title: string, slug: string): string {
  const map: Record<string, string> = {
    'payment-concrete-coupling': 'Checkout and Payment Providers',
    'order-god-object': 'Order Service Walkthrough',
    'ride-pricing-if-else': 'Ride Pricing Rules',
    'auth-god-service': 'Auth Service Inspection',
    'cache-dual-concrete': 'API Caching Path',
    'cart-stripe-and-inventory': 'Cart Checkout Path',
    'report-format-explosion': 'Report Export Paths',
    'player-weapon-switch': 'Game Player Loadout',
    'order-inventory-cycle': 'Checkout Service Triangle',
    'media-decoder-coupling': 'Media Player Decoders',
    'booking-mega-service': 'Booking Flow Overview',
    'notifier-concrete-channels': 'Notification Delivery Path',
    'parking-vehicle-switch': 'Parking Lot Vehicle Handling',
    'feed-push-coupling': 'Feed Publishing Path',
    'logger-global-singleton-smell': 'App Logging Path',
    'cart-inventory-side-effect': 'Cart and Inventory Interaction',
    'auth-mailer-otp': 'OTP Delivery Path',
    'report-pdf-only-mindset': 'Report PDF Pipeline',
    'ride-surge-special-case': 'Ride Surge Pricing Path',
    'booking-hotel-api': 'Hotel Booking Supplier Path',
    'game-spell-as-weapon': 'Spells and Weapons Model',
    'parking-fee-in-lot': 'Parking Fee Calculation',
    'feed-follower-store': 'Feed and Followers',
    'order-db-persistence': 'Order Persistence Path',
  }
  if (map[slug]) return map[slug]
  const spoiler =
    /god|dip|ocp|srp|circular|singleton|concrete|coupled|explosion|mega|wired|monolith|hard-codes|does everything|talks to everyone|knows every/i
  if (spoiler.test(title)) {
    return title.replace(spoiler, '').replace(/\s+/g, ' ').trim() || title
  }
  return title
}

function softDescription(desc: string, title: string): string {
  if (!desc?.trim()) return `Inspect the diagram for “${title}” and mark design problems you find.`
  // Strip principle acronyms from list-card blurbs
  return desc
    .replace(/\b(SRP|DIP|OCP|LSP|god object|God Object)\b/gi, 'design')
    .replace(/\s+/g, ' ')
    .trim()
}

function nodeNames(diagram: { nodes?: { data?: { name?: string } }[] }): string[] {
  return (diagram?.nodes ?? [])
    .map(n => String(n.data?.name ?? ''))
    .filter(Boolean)
}

function buildBriefing(pack: {
  title: string
  description?: string
  diagramSnapshot?: { nodes?: { data?: { name?: string; methods?: unknown[] } }[]; edges?: unknown[] }
}): string {
  const names = nodeNames(pack.diagramSnapshot ?? {})
  const listed = names.slice(0, 6).join(', ')
  const sample = (pack.diagramSnapshot?.nodes ?? [])[0]
  const methods = Array.isArray(sample?.data?.methods)
    ? (sample!.data!.methods as { name?: string }[]).map(m => m.name).filter(Boolean).slice(0, 5)
    : []
  const methodLine =
    methods.length > 0
      ? `\n\nStart by opening ${sample?.data?.name ?? 'a class'} and reading its methods (${methods.join(', ')}${methods.length >= 5 ? ', …' : ''}).`
      : ''

  return (
    `This challenge is a broken UML sketch around: ${listed || 'the classes on the canvas'}.\n\n` +
    `Your job is to investigate — click classes and relationships, notice what feels overloaded, oddly connected, or hard to extend — then mark issues with a category and a short “why.”` +
    methodLine +
    `\n\nDo not assume the answer from the title alone; use the diagram.`
  )
}

function buildRequirement(issueCount: number, revealExact: boolean): string {
  if (revealExact) {
    return `There ${issueCount === 1 ? 'is exactly 1 design problem' : `are exactly ${issueCount} design problems`} to find. Inspect the diagram, mark each with a category and a short “why,” then repair so the design is easier to extend without rewriting the same classes for every new case.`
  }
  return `Inspect the diagram and mark every design problem you find with a category and a short “why.” Then repair so the design is easier to change later. The total number of issues is not shown.`
}

function inferVerification(
  issues: { modelAnswer: string; elementIds: string[] }[],
  diagram: { nodes?: { data?: { name?: string; elementId?: string } }[] },
): {
  mustIntroduceElementNames?: string[]
  forbidDirectEdges?: { from: string; to: string }[]
  requireNoEditTo?: string[]
} {
  const text = issues.map(i => i.modelAnswer).join(' ')
  const must: string[] = []
  const candidates = [
    'PaymentGateway',
    'PricingStrategy',
    'NotificationChannel',
    'Cache',
    'ICache',
    'Weapon',
    'Decoder',
    'ReportExporter',
    'FeePolicy',
    'InventoryPort',
    'ILogger',
    'TokenService',
    'CheckoutOrchestrator',
    'PaymentPort',
    'CalendarPort',
  ]
  for (const c of candidates) {
    if (new RegExp(c, 'i').test(text)) must.push(c)
  }
  const names = nodeNames(diagram)
  const requireNoEditTo = names.length > 2 ? [names[0]] : undefined
  return {
    ...(must.length ? { mustIntroduceElementNames: [...new Set(must)].slice(0, 3) } : {}),
    ...(requireNoEditTo ? { requireNoEditTo } : {}),
  }
}

function upgradeIssue(
  raw: Record<string, unknown>,
  index: number,
  slug: string,
): {
  id: string
  elementIds: string[]
  category: DebuggerCategory
  aliases: string[]
  explanationKeywords: string[]
  modelAnswer: string
  hints: [string, string, string]
} {
  const mapped = mapCategory(String(raw.category ?? 'Other'))
  const elementId = String(raw.elementId ?? (raw.elementIds as string[] | undefined)?.[0] ?? `el-unknown-${index}`)
  const elementIds = Array.isArray(raw.elementIds)
    ? (raw.elementIds as string[]).map(String)
    : [elementId]
  const modelAnswer = String(
    raw.modelAnswer ?? raw.explanation ?? `Investigate element ${elementId} for a ${mapped.category} smell.`,
  )
  const existingHints = Array.isArray(raw.hints) ? (raw.hints as string[]) : []
  const hints: [string, string, string] = [
    existingHints[0] ??
      'Inspect the highlighted area of the diagram — methods, fields, and outgoing arrows.',
    existingHints[1] ??
      'Ask what would change if product added one more variant (provider, format, type, channel).',
    existingHints[2] ??
      `${mapped.category} — ${modelAnswer.slice(0, 160)}${modelAnswer.length > 160 ? '…' : ''}`,
  ]
  const extraKw = elementIds.map(id => id.replace(/^el-|^ed-/, ''))
  const explanationKeywords = Array.isArray(raw.explanationKeywords)
    ? (raw.explanationKeywords as string[])
    : keywordsFrom(modelAnswer, extraKw)

  return {
    id: String(raw.id ?? `iss-${slug}-${index + 1}`),
    elementIds,
    category: mapped.category,
    aliases: [...new Set([...(mapped.aliases ?? []), ...((raw.aliases as string[]) ?? [])])],
    explanationKeywords,
    modelAnswer,
    hints,
  }
}

function upgradePack(pack: Record<string, unknown>) {
  const slug = String(pack.slug)
  const payload = (pack.payload ?? {}) as Record<string, unknown>
  const rawIssues = Array.isArray(payload.expectedIssues)
    ? (payload.expectedIssues as Record<string, unknown>[])
    : []

  // Already-rich dbg-* packs: refresh soft copy only if briefing missing spoilers ok
  const issues = rawIssues.map((iss, i) => upgradeIssue(iss, i, slug))
  const difficulty = String(pack.difficulty ?? 'medium')
  const revealExact =
    payload.revealCount === 'exact' ||
    (payload.revealCount !== 'hidden' && difficulty === 'easy' && issues.length <= 2)

  const softT = softTitle(String(pack.title), slug)
  const diagram = (pack.diagramSnapshot ?? { nodes: [], edges: [] }) as {
    nodes?: { data?: { name?: string; methods?: unknown[]; elementId?: string } }[]
    edges?: unknown[]
  }

  const briefing =
    typeof payload.briefing === 'string' && payload.briefing.length > 80 && slug.startsWith('dbg-')
      ? payload.briefing
      : buildBriefing({ title: softT, description: String(pack.description ?? ''), diagramSnapshot: diagram })

  const requirement =
    typeof payload.requirement === 'string' &&
    payload.requirement.length > 40 &&
    !/\b(SRP|DIP|OCP|god object|God Object)\b/i.test(payload.requirement) &&
    slug.startsWith('dbg-')
      ? payload.requirement
      : buildRequirement(issues.length, revealExact)

  const verification =
    payload.verification && typeof payload.verification === 'object'
      ? payload.verification
      : inferVerification(issues, diagram)

  return {
    type: 'debugger' as const,
    slug,
    title: softT,
    difficulty: pack.difficulty,
    description: softDescription(String(pack.description ?? ''), softT),
    status: pack.status ?? 'published',
    planMin: pack.planMin ?? 'free',
    order: pack.order ?? 100,
    tags: pack.tags ?? ['debugger'],
    diagramSnapshot: pack.diagramSnapshot,
    payload: {
      briefing,
      requirement,
      revealCount: revealExact ? 'exact' : 'hidden',
      timeLimitSec: payload.timeLimitSec ?? (difficulty === 'hard' ? 900 : difficulty === 'easy' ? 480 : 720),
      expectedIssues: issues,
      verification,
    },
  }
}

async function main() {
  await connectDB()
  const docs = await ChallengePack.find({ type: 'debugger' }).lean()
  console.log(`Upgrading ${docs.length} debugger packs…`)

  const upgraded = docs.map(d => upgradePack(d as unknown as Record<string, unknown>))

  const dataDir = path.join(__dirname, 'data')
  fs.mkdirSync(dataDir, { recursive: true })
  const outJson = path.join(dataDir, 'studio-debugger-packs.json')
  fs.writeFileSync(outJson, JSON.stringify(upgraded, null, 2))
  console.log(`Wrote ${upgraded.length} packs → ${outJson}`)

  for (const pack of upgraded) {
    await ChallengePack.findOneAndUpdate(
      { slug: pack.slug },
      { $set: pack },
      { upsert: true, new: true },
    )
    console.log(`✓ ${pack.slug} (${pack.payload.expectedIssues.length} issues, reveal=${pack.payload.revealCount})`)
  }

  console.log(`Done — ${upgraded.length} debugger packs upgraded & seeded`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
