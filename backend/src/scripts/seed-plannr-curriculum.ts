import 'dotenv/config'
import { connectDB } from '../config/db'
import { JourneyTopic } from '../models/journey/journey-topic.model'
import { legacyJourneyTopics } from './seed-journey-topics'
import { buildTopicModules } from './data/plannr/build-topic-modules'

async function main() {
  await connectDB()

  const enriched = legacyJourneyTopics.map(t => buildTopicModules(t as Parameters<typeof buildTopicModules>[0]))
  let upserted = 0

  for (const topic of enriched) {
    await JourneyTopic.findOneAndUpdate(
      { slug: topic.slug },
      { $set: { ...topic, status: 'published' } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    upserted++
  }

  console.log(`Plannr curriculum upserted ${upserted} topics with modules + practiceSet`)
  const sample = await JourneyTopic.findOne({ slug: 'classes-objects' }).lean()
  console.log(
    `Sample classes-objects: modules=${sample?.modules?.length ?? 0} practice=${sample?.practiceSet?.length ?? 0} cheat=${sample?.cheatSheet?.length ?? 0}`,
  )
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
