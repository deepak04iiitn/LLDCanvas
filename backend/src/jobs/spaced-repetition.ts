import { JourneyProfile } from '../models/journey/journey-profile.model'
import { JourneyTopic } from '../models/journey/journey-topic.model'
import { SpacedRepetitionQueue } from '../models/spaced-repetition-queue.model'
import { QuizRevisit } from '../models/learn/quiz-revisit.model'

export async function runSpacedRepetitionJob() {
  const profiles = await JourneyProfile.find({ isActive: true, onboardingComplete: true })

  for (const profile of profiles) {
    const userId = profile.userId
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // 1. Topics completed > 7 days ago with low skill scores
    const completedTopics = await JourneyTopic.find({ slug: { $in: profile.topicsCompleted } })
    for (const topic of completedTopics) {
      const topicCompletedLongAgo =
        !profile.lastActiveDate || profile.lastActiveDate < sevenDaysAgo

      if (!topicCompletedLongAgo) continue

      const needsReview = (topic.buildsSkills as string[]).some(
        (skill: string) =>
          ((profile.skills as unknown as Record<string, number>)[skill] ?? 10) < 60,
      )

      if (needsReview) {
        await SpacedRepetitionQueue.updateOne(
          { userId, itemType: 'topic', itemId: topic.slug, isActive: true },
          {
            $setOnInsert: {
              userId,
              itemType:  'topic',
              itemId:    topic.slug,
              itemTitle: topic.title,
              itemHref:  `/plannr/topic/${topic.slug}`,
              dueDate:   new Date(),
              reviewCount: 0,
            },
          },
          { upsert: true },
        )
      }
    }

    // 2. Incorrect quiz questions from revisit bank
    const revisits = await QuizRevisit.find({ userId, isResolved: false })
      .populate('questionId')
      .limit(10)

    for (const r of revisits) {
      const q = r.questionId as any
      if (q) {
        await SpacedRepetitionQueue.updateOne(
          { userId, itemType: 'quiz_question', itemId: r.questionId.toString(), isActive: true },
          {
            $setOnInsert: {
              userId,
              itemType:  'quiz_question',
              itemId:    r.questionId.toString(),
              itemTitle: q.prompt ?? 'Quiz Question',
              itemHref:  '/learn/quiz',
              dueDate:   new Date(),
              reviewCount: 0,
            },
          },
          { upsert: true },
        )
      }
    }
  }

  console.log('[spaced-repetition] Job complete. Processed', profiles.length, 'profiles.')
}

export function startSpacedRepetitionJob() {
  // Run once at startup after a short delay, then every 24 hours
  setTimeout(async () => {
    await runSpacedRepetitionJob().catch(console.error)
  }, 10_000)

  setInterval(async () => {
    await runSpacedRepetitionJob().catch(console.error)
  }, 24 * 60 * 60 * 1000)
}
