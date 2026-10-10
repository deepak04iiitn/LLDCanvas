/**
 * Transforms legacy flat journey topic content into the block-based Plannr module schema.
 */

type Diff = 'easy' | 'medium' | 'hard'
type Level = 'scratch' | 'oop' | 'basic-lld' | 'solving'

export interface LegacyTopicContent {
  learn: string
  whyItMatters: string
  interviewTip: string
  realExperience?: string
  spotItPrompt?: string
  spotItDesign?: string
  spotItAnswer?: string
  fixItPrompt?: string
  fixItAnswer?: string
  interviewQuestion?: string
  interviewAnswer?: string
  followUp?: string
  followUpAnswer?: string
}

export interface LegacyTopic {
  slug: string
  title: string
  subtitle: string
  stage: number
  order: number
  type: string
  description: string
  estimatedMinutes: number
  icon: string
  content: LegacyTopicContent
  difficultyDimensions: Record<string, Diff>
  buildsSkills: string[]
  prerequisites: string[]
  interviewerProbes: string[]
  commonMistakes: string[]
  patternMapSteps: { label: string; description: string }[]
  tags: string[]
  status: string
  linkedStudioPack?: string
  linkedLearnExercise?: string
}

const ALL_ROLES = ['sde1', 'sde2', 'backend', 'fullstack', 'general']

function minLevelForStage(stage: number): Level {
  if (stage <= 1) return 'scratch'
  if (stage === 2) return 'oop'
  if (stage === 3) return 'basic-lld'
  return 'solving'
}

function emphasisForStage(stage: number): Record<string, number> {
  const base: Record<string, number> = {
    sde1: 1,
    sde2: 1,
    backend: 1,
    fullstack: 1,
    general: 1,
  }
  if (stage <= 2) {
    base.sde1 = 1.4
    base.general = 1.2
  } else if (stage === 3) {
    base.backend = 1.3
    base.fullstack = 1.2
    base.sde2 = 1.25
  } else {
    base.sde2 = 1.4
    base.backend = 1.3
  }
  return base
}

function mcqOptions(
  correct: string,
  wrongs: string[],
): { id: string; label: string; correct?: boolean }[] {
  const opts = [
    { id: 'a', label: correct, correct: true },
    ...wrongs.slice(0, 2).map((label, i) => ({
      id: String.fromCharCode(98 + i),
      label,
      correct: false,
    })),
  ]
  // Stable shuffle by rotating based on string length
  const rot = correct.length % opts.length
  return [...opts.slice(rot), ...opts.slice(0, rot)]
}

export function buildTopicModules(topic: LegacyTopic) {
  const { slug, content: c } = topic
  const firstMistake = topic.commonMistakes[0] ?? 'Rushing into code without naming entities'
  const secondMistake = topic.commonMistakes[1] ?? 'Ignoring extensibility'

  const modules = [
    {
      id: `${slug}-concept`,
      kind: 'concept' as const,
      title: 'Core idea',
      durationMin: Math.max(3, Math.round(topic.estimatedMinutes * 0.25)),
      body: c.learn,
    },
    {
      id: `${slug}-why`,
      kind: 'real_world' as const,
      title: 'Why it matters',
      durationMin: 2,
      body: c.whyItMatters,
      variants: [
        {
          role: 'sde1',
          body: `${c.whyItMatters}\n\nAs an SDE-1 candidate, interviewers look for clean entity naming and clear ownership more than pattern fluency.`,
        },
        {
          role: 'sde2',
          body: `${c.whyItMatters}\n\nAs an SDE-2 candidate, expect follow-ups that stress extensibility and tradeoff clarity.`,
        },
        {
          role: 'backend',
          body: `${c.whyItMatters}\n\nBackend interviews often probe service boundaries, coupling, and how this idea shows up at API/service seams.`,
        },
      ],
    },
    ...(c.realExperience
      ? [
          {
            id: `${slug}-example`,
            kind: 'example' as const,
            title: 'Worked example',
            durationMin: 3,
            body: c.realExperience,
            steps: (topic.patternMapSteps ?? []).map(s => ({
              title: s.label,
              body: s.description,
            })),
          },
        ]
      : []),
    {
      id: `${slug}-check`,
      kind: 'knowledge_check' as const,
      title: 'Quick check',
      durationMin: 2,
      checks: [
        {
          id: `${slug}-kc1`,
          prompt: `Which statement best captures "${topic.title}" in an LLD interview?`,
          type: 'mcq' as const,
          options: mcqOptions(
            `Apply ${topic.title.toLowerCase()} deliberately when naming entities and responsibilities.`,
            [
              'Skip clarifying requirements and jump straight to microservices.',
              'Put all behavior in one God class for speed.',
            ],
          ),
          explanation: c.interviewTip || c.whyItMatters.slice(0, 280),
        },
        {
          id: `${slug}-kc2`,
          prompt: 'What is a common mistake on this topic?',
          type: 'mcq' as const,
          options: mcqOptions(firstMistake, [
            'Clarifying ambiguous requirements out loud',
            'Keeping classes focused on one responsibility',
          ]),
          explanation: `Avoid: ${firstMistake}. Also watch for: ${secondMistake}.`,
        },
      ],
    },
    {
      id: `${slug}-tips`,
      kind: 'tips' as const,
      title: 'Interview tips',
      durationMin: 2,
      body: c.interviewTip,
      bullets: topic.interviewerProbes.slice(0, 4),
    },
    {
      id: `${slug}-mistakes`,
      kind: 'mistakes' as const,
      title: 'Common mistakes',
      durationMin: 2,
      bullets: topic.commonMistakes,
    },
    ...(c.interviewQuestion
      ? [
          {
            id: `${slug}-explain`,
            kind: 'explain' as const,
            title: 'Explain like an interviewer',
            durationMin: 3,
            body: c.interviewQuestion,
            checks: [
              {
                id: `${slug}-explain1`,
                prompt: c.interviewQuestion,
                type: 'short' as const,
                modelAnswer: c.interviewAnswer ?? '',
                explanation: 'Compare your answer to the model — cover ownership, tradeoffs, and follow-up readiness.',
              },
            ],
          },
        ]
      : []),
    {
      id: `${slug}-summary`,
      kind: 'summary' as const,
      title: 'Takeaways',
      durationMin: 1,
      bullets: [
        c.learn.split('\n').find(l => l.trim().length > 40)?.trim() ?? topic.description,
        c.interviewTip.split('\n')[0]?.trim() || topic.subtitle,
        ...(topic.commonMistakes.slice(0, 2).map(m => `Avoid: ${m}`)),
      ].filter(Boolean),
    },
  ]

  const practiceSet = [
    {
      id: `${slug}-p-easy`,
      difficulty: 'easy' as const,
      prompt:
        c.spotItPrompt ??
        `Identify the key classes and responsibilities for a small system related to "${topic.title}". List 4–6 entities and one sentence each on what they own.`,
      hints: [
        'Start with nouns in the problem statement.',
        'Ask: who owns this data? Who changes it?',
        c.spotItAnswer?.slice(0, 160) || 'Prefer focused classes over a single service bag of methods.',
      ],
      solution: {
        explanation: c.spotItAnswer ?? c.fixItAnswer ?? c.learn.slice(0, 500),
        codeSnippet: c.spotItDesign,
        codeLanguage: 'typescript',
      },
      commonMistakes: topic.commonMistakes.slice(0, 3),
      checks: c.spotItPrompt
        ? {
            type: 'short' as const,
            modelAnswer: c.spotItAnswer ?? '',
            explanation: 'Self-score honestly against the model answer.',
          }
        : {
            type: 'mcq' as const,
            options: mcqOptions(
              'Name entities first, then assign clear ownership of data and behavior.',
              [
                'Write every function as a global helper.',
                'Model every association as inheritance.',
              ],
            ),
            explanation: c.whyItMatters.slice(0, 240),
          },
      buildsSkills: topic.buildsSkills.slice(0, 3),
    },
    {
      id: `${slug}-p-medium`,
      difficulty: 'medium' as const,
      prompt:
        c.fixItPrompt ??
        `Redesign a flawed approach for "${topic.title}". Call out what breaks under a realistic follow-up requirement.`,
      hints: [
        'Name the smell (God class, tight coupling, wrong inheritance…).',
        'Propose a smaller set of classes or interfaces that absorb change.',
        c.fixItAnswer?.slice(0, 160) || 'Leave an extension point before the follow-up arrives.',
      ],
      solution: {
        explanation: c.fixItAnswer ?? c.interviewAnswer ?? c.whyItMatters,
        codeSnippet: c.fixItAnswer?.includes('class ') ? c.fixItAnswer : undefined,
        codeLanguage: 'typescript',
      },
      commonMistakes: topic.commonMistakes.slice(0, 3),
      checks: {
        type: 'short' as const,
        modelAnswer: c.fixItAnswer ?? c.interviewAnswer ?? '',
        explanation: 'Score yourself on clarity of ownership and extensibility.',
      },
      buildsSkills: topic.buildsSkills,
    },
    {
      id: `${slug}-p-hard`,
      difficulty: 'hard' as const,
      prompt:
        c.followUp ??
        c.interviewQuestion ??
        `Interview follow-up: extend your design for "${topic.title}" when a new constraint arrives. Explain the tradeoff you accept.`,
      hints: [
        'Restate the new constraint before redesigning.',
        'Prefer composition / strategy / interfaces over editing every caller.',
        c.followUpAnswer?.slice(0, 160) || c.interviewAnswer?.slice(0, 160) || 'Say what you would NOT change and why.',
      ],
      solution: {
        explanation: c.followUpAnswer ?? c.interviewAnswer ?? c.learn.slice(0, 500),
      },
      commonMistakes: [
        ...topic.commonMistakes.slice(0, 2),
        'Redesigning everything instead of adding one extension point',
      ],
      checks: {
        type: 'short' as const,
        modelAnswer: c.followUpAnswer ?? c.interviewAnswer ?? '',
        explanation: 'Strong answers name the extension point and the tradeoff.',
      },
      buildsSkills: topic.buildsSkills,
    },
  ]

  const cheatSheet = [
    {
      title: topic.title,
      bullets: [
        topic.subtitle,
        ...(c.learn
          .split('\n')
          .map(l => l.replace(/^[•→\-\*]\s*/, '').trim())
          .filter(l => l.length > 20)
          .slice(0, 4)),
      ],
    },
    {
      title: 'Interview cue',
      bullets: [c.interviewTip, ...topic.interviewerProbes.slice(0, 3)].filter(Boolean),
    },
    {
      title: 'Avoid',
      bullets: topic.commonMistakes.slice(0, 4),
    },
  ]

  const interviewBank = [
    ...(c.interviewQuestion
      ? [{ question: c.interviewQuestion, answer: c.interviewAnswer ?? '', tags: topic.tags }]
      : []),
    ...(c.followUp
      ? [{ question: c.followUp, answer: c.followUpAnswer ?? '', tags: ['follow-up', ...topic.tags] }]
      : []),
    ...topic.interviewerProbes.slice(0, 3).map(q => ({
      question: q,
      answer: `Relate your answer to ${topic.title}: state the decision, the alternative, and why this fits the requirements.`,
      tags: ['probe'],
    })),
  ]

  const takeaways = [
    topic.description,
    c.interviewTip.split('\n')[0]?.trim() || topic.subtitle,
    `Watch for: ${firstMistake}`,
    ...(topic.patternMapSteps.slice(0, 2).map(s => `${s.label}: ${s.description}`)),
  ].filter(Boolean)

  return {
    ...topic,
    content: c,
    modules,
    practiceSet,
    cheatSheet,
    interviewBank,
    takeaways,
    recommendedRoles: ALL_ROLES,
    minLevel: minLevelForStage(topic.stage),
    emphasisWeightByRole: emphasisForStage(topic.stage),
    gatePracticeUntilChecksPass: topic.stage <= 2,
    masteryThreshold: 70,
    externalPractice: {
      blurb: 'Want more volume practice outside this module?',
      studioPacks: topic.linkedStudioPack ? [topic.linkedStudioPack] : [],
      learnSlugs: topic.linkedLearnExercise ? [topic.linkedLearnExercise] : [],
    },
  }
}
