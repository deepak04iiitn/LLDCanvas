import { JourneyTopic } from '../../models/journey/journey-topic.model'
import { cached } from '../../utils/memo-cache'

/**
 * Published Plannr topics change only when an admin edits them, but they were
 * re-read in full (lesson modules, practice sets, cheat sheets...) by many
 * endpoints that only need a few light fields. These helpers load the
 * catalogue once per TTL with just the fields each use-case needs.
 *
 * Returned arrays are shared (cached): treat them as read-only.
 */

// Heavy lesson content that list/roadmap/plan/recommendation views never read.
// (Full content is still served by GET /plannr/topic/:slug.)
const HEAVY = '-content -modules -practiceSet -cheatSheet -interviewBank -takeaways'

/** Every published topic without lesson content, in stage/order. */
export function getPublishedTopicsLight() {
  return cached('plannr:topics:light', () =>
    JourneyTopic.find({ status: 'published' }).select(HEAVY).sort({ stage: 1, order: 1 }).lean(),
  )
}

/** Published topics with only what the revise/cheat-sheet pack needs. */
export function getPublishedTopicsForRevise() {
  return cached('plannr:topics:revise', () =>
    JourneyTopic.find({ status: 'published' })
      .select('-content -modules -practiceSet -interviewBank')
      .sort({ stage: 1, order: 1 })
      .lean(),
  )
}

/** Published topics with only the fields the practice hub needs. */
export function getPublishedTopicsForPracticeHub() {
  return cached('plannr:topics:practice-hub', () =>
    JourneyTopic.find({ status: 'published' })
      .select('slug title stage order practiceSet')
      .sort({ stage: 1, order: 1 })
      .lean(),
  )
}
