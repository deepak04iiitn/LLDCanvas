/**
 * Sets seoTitle/seoDescription overrides for a handful of problems, keyed by
 * slug. Uses $set only on these two fields — never touches title, content,
 * requirements, hints, etc. Driven by the Phase 1 quick-win title/meta
 * rewrites from the GSC action plan (docs/LLDCanvas SEO Action Plan.md).
 *
 * Run with:  npx ts-node -r dotenv/config src/scripts/seed-problems-seo-titles.ts
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { Problem } from '../models/problem.model'

interface SeoTitle {
  slug: string
  seoTitle: string
  seoDescription: string
}

const SEO_TITLES: SeoTitle[] = [
  {
    slug: 'notification-service',
    seoTitle: 'Notification Service LLD: Low-Level Design with Class Diagram & Code',
    seoDescription: 'Design a scalable Notification Service for your next LLD interview - full class diagram, the design patterns interviewers expect (Observer, Strategy), and a working code walkthrough.',
  },
  {
    slug: 'amazon-locker',
    seoTitle: 'Amazon Locker System LLD: Low-Level Design (Class Diagram + Code)',
    seoDescription: 'Design the Amazon Locker System for your LLD interview - locker sizing and assignment, secure pickup-code flow, class diagram, and code.',
  },
  {
    slug: 'collaborative-text-editor',
    seoTitle: 'Document Editor LLD (Google Docs): Collaborative Text Editor Design',
    seoDescription: 'Design a real-time collaborative document editor like Google Docs for your LLD interview - OT/CRDT concurrency handling, class diagram, and code.',
  },
  {
    slug: 'meeting-room-booking',
    seoTitle: 'Meeting Room Booking & Scheduler LLD: Low-Level Design with Code',
    seoDescription: 'Design a Meeting Room Booking System (scheduler) for your LLD interview - interval scheduling, conflict detection, class diagram, and code.',
  },
]

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!)
  console.log('Connected to MongoDB')

  let updated = 0
  for (const t of SEO_TITLES) {
    const doc = await Problem.findOneAndUpdate(
      { slug: t.slug },
      { $set: { seoTitle: t.seoTitle, seoDescription: t.seoDescription } },
      { new: true },
    )
    if (doc) { console.log(`  UPDATE ${t.slug}`); updated++ }
    else { console.warn(`  SKIP ${t.slug} - no problem found with this slug`) }
  }

  console.log(`\nDone - updated ${updated}/${SEO_TITLES.length}`)
  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
