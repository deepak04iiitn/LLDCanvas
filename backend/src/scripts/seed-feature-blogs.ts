/**
 * Feature SEO blog posts (Plannr, Daily Quiz, Roguelike, Debug Lab, Debug & Fix,
 * Refactor, Change One Thing, Evolution, Budget Pressure).
 *
 * Content lives in ./data/feature-blogs/ — written and ready, NOT seeded by default.
 *
 * Usage:
 *   # Dry-run only (default) — validates content, prints plan, no DB writes
 *   npx ts-node -r dotenv/config src/scripts/seed-feature-blogs.ts
 *
 *   # Upsert as drafts (still not public)
 *   npx ts-node -r dotenv/config src/scripts/seed-feature-blogs.ts --apply
 *
 *   # Upsert and publish
 *   npx ts-node -r dotenv/config src/scripts/seed-feature-blogs.ts --apply --publish
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { Blog } from '../models/blog.model'
import { buildTocAndIds, calcReadingTime } from '../utils/blog-content'
import { FEATURE_BLOGS } from './data/feature-blogs'

const AUTHOR = { name: 'LLDCanvas Team', role: 'Engineering', avatar: '' }

function hasFlag(name: string): boolean {
  return process.argv.includes(name)
}

function printPlan(apply: boolean, publish: boolean) {
  console.log('\n=== Feature blog seed plan ===')
  console.log(`Mode: ${apply ? (publish ? 'APPLY + PUBLISH' : 'APPLY as draft') : 'DRY-RUN (no DB writes)'}`)
  console.log(`Posts: ${FEATURE_BLOGS.length}\n`)

  for (const b of FEATURE_BLOGS) {
    const { blocks, toc } = buildTocAndIds(b.content)
    const readingTime = calcReadingTime(blocks)
    console.log(`• /blog/${b.slug}`)
    console.log(`  title:     ${b.title}`)
    console.log(`  feature:   ${b.featurePath} (${b.featureName})`)
    console.log(`  primary:   ${b.seoPlan.primaryKeyword}`)
    console.log(`  intent:    ${b.seoPlan.searchIntent}`)
    console.log(`  meta:      ${b.seo.metaTitle}`)
    console.log(`  blocks:    ${blocks.length}  |  toc: ${toc.length}  |  ~${readingTime} min`)
    console.log(`  cover alt: ${b.seoPlan.suggestedCoverAlt}`)
    console.log('')
  }

  if (!apply) {
    console.log('No database writes performed.')
    console.log('Re-run with --apply to upsert drafts, or --apply --publish to publish.\n')
  }
}

async function applySeeds(publish: boolean) {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not set. Aborting.')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log('Connected to MongoDB\n')

  let created = 0
  let updated = 0
  const status = publish ? 'published' : 'draft'

  for (const b of FEATURE_BLOGS) {
    const { blocks, toc } = buildTocAndIds(b.content)
    const readingTime = calcReadingTime(blocks)
    const existing = await Blog.findOne({ slug: b.slug })

    const $set: Record<string, unknown> = {
      title: b.title,
      subtitle: b.subtitle,
      excerpt: b.excerpt,
      category: b.category,
      tags: b.tags,
      isFeatured: b.isFeatured,
      relatedSlugs: b.relatedSlugs,
      seo: b.seo,
      faq: b.faq,
      content: blocks,
      toc,
      readingTime,
      author: AUTHOR,
      status,
      coverImageAlt: b.seoPlan.suggestedCoverAlt,
    }

    if (publish) {
      $set.publishedAt = existing?.publishedAt ?? new Date()
    }

    await Blog.findOneAndUpdate(
      { slug: b.slug },
      {
        $set,
        $setOnInsert: publish ? {} : { publishedAt: undefined },
      },
      { upsert: true, new: true },
    )

    if (existing) {
      console.log(`  UPDATE ${b.slug}  (${readingTime} min, status=${status})`)
      updated++
    } else {
      console.log(`  CREATE ${b.slug}  (${readingTime} min, status=${status})`)
      created++
    }
  }

  console.log(`\nDone — created ${created}, updated ${updated} (status=${status})`)
  await mongoose.disconnect()
}

async function main() {
  const apply = hasFlag('--apply')
  const publish = hasFlag('--publish')

  if (publish && !apply) {
    console.error('Refusing --publish without --apply.')
    process.exit(1)
  }

  // Always show the plan first
  printPlan(apply, publish)

  // Validate every post has a feature link somewhere in content
  const missingLinks: string[] = []
  for (const b of FEATURE_BLOGS) {
    const blob = JSON.stringify(b.content)
    if (!blob.includes(b.featurePath)) {
      missingLinks.push(`${b.slug} missing link to ${b.featurePath}`)
    }
  }
  if (missingLinks.length) {
    console.error('Validation failed:')
    for (const m of missingLinks) console.error(`  - ${m}`)
    process.exit(1)
  }
  console.log('Validation: every post links to its feature page.\n')

  if (!apply) return

  await applySeeds(publish)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
