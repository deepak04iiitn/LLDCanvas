import type { FeatureBlogSeed } from './types'

/** Feature: Plannr — structured LLD interview preparation plan (not the topic syllabus itself). */
export const plannrBlog: FeatureBlogSeed = {
  featurePath: '/features/plannr',
  featureName: 'Plannr',
  seoPlan: {
    primaryKeyword: 'how to prepare for LLD interview',
    secondaryKeywords: [
      'LLD interview preparation plan',
      'low level design study plan',
      'machine coding round preparation',
      'LLD prep timeline',
    ],
    searchIntent: 'Informational / how-to — candidates searching for a practical prep plan and timeline',
    suggestedCoverAlt: 'Calendar and topic checklist representing a structured LLD interview preparation plan',
  },
  slug: 'how-to-prepare-for-lld-interview',
  title: 'How to Prepare for an LLD Interview: A Realistic Study Plan',
  subtitle: 'Turn scattered YouTube videos into a sequenced, trackable preparation plan with weekly milestones',
  excerpt:
    'A practical guide to LLD interview preparation: how long to study, what order to learn topics, how to track progress, and how to know when you are actually interview-ready.',
  category: 'Low-Level Design',
  tags: ['LLD', 'Interview Prep', 'Study Plan', 'Machine Coding', 'Low-Level Design'],
  isFeatured: true,
  relatedSlugs: [
    'lld-interview-roadmap',
    'lld-interview-questions',
    'solid-principles-explained',
    'daily-lld-practice-habit',
  ],
  seo: {
    metaTitle: 'How to Prepare for an LLD Interview: Study Plan & Timeline | LLDCanvas',
    metaDescription:
      'Build a realistic LLD interview preparation plan: weekly milestones, topic order, practice cadence, and progress tracking so you know when you are ready.',
    keywords: [
      'how to prepare for LLD interview',
      'LLD interview preparation',
      'low level design study plan',
      'machine coding round preparation',
      'LLD prep timeline',
    ],
  },
  faq: [
    {
      q: 'How long does LLD interview preparation take?',
      a: 'With basic OOP familiarity, most engineers need 6–10 weeks at about one focused hour per day. If SOLID and common patterns are already comfortable, a compressed 3–4 week plan with heavy practice can work.',
    },
    {
      q: 'What should I learn first for LLD interviews?',
      a: 'Start with OOP clarity (composition vs inheritance, interfaces), then SOLID, then a short list of high-frequency patterns (Strategy, Factory, Observer, Decorator, Singleton used carefully), then timed practice problems.',
    },
    {
      q: 'How do I know I am ready for an LLD interview?',
      a: 'You can clarify requirements in under five minutes, sketch a class diagram without freezing, explain trade-offs for two design options, and finish a mid-difficulty problem in 35–45 minutes with a coherent structure.',
    },
    {
      q: 'Is reading design pattern books enough?',
      a: 'No. Pattern knowledge without timed design practice fails under interview pressure. Pair every concept with a short diagram or problem solve the same day.',
    },
  ],
  content: [
    {
      type: 'paragraph',
      text: 'Most engineers do not fail LLD interviews because they have never heard of Strategy or SOLID. They fail because their preparation has no sequence, no feedback loop, and no honest signal of readiness. Watching twenty pattern videos in random order feels productive — until a Parking Lot prompt lands and the canvas stays empty for ten minutes.',
    },
    {
      type: 'paragraph',
      text: 'This guide is about **how to prepare**, not a full syllabus dump. You will leave with a timeline, a weekly cadence, a way to measure progress, and a clear bar for “interview-ready.” For the topic list itself, pair this with the [LLD Interview Roadmap](/blog/lld-interview-roadmap).',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'What “Prepared” Actually Means in an LLD Round' },
    {
      type: 'paragraph',
      text: 'Interviewers are not grading whether you memorized the Gang of Four catalog. They watch whether you can move from a fuzzy prompt to a maintainable object model under time pressure.',
    },
    {
      type: 'bullets',
      items: [
        '**Clarify** scope, actors, and constraints before drawing classes.',
        '**Model** responsibilities with classes, interfaces, and relationships that match the domain.',
        '**Choose** a pattern only when it removes real duplication or volatility — and say why.',
        '**Defend** trade-offs: composition vs inheritance, sync vs async callbacks, one interface vs three.',
        '**Leave** a design someone else could implement without guessing.',
      ],
    },
    {
      type: 'paragraph',
      text: 'If your study plan only measures “videos watched,” you are optimizing the wrong metric. Measure **problems completed under time**, **diagrams you can explain**, and **mistakes you can name after the fact**.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'A Practical Prep Timeline by Starting Point' },
    {
      type: 'table',
      headers: ['Starting point', 'Suggested duration', 'Daily focus', 'Exit criteria'],
      rows: [
        [
          'Comfortable with OOP, weak on patterns',
          '6–8 weeks',
          '45–60 min patterns + practice',
          '8–10 timed problems with clear diagrams',
        ],
        [
          'Knows SOLID + common patterns',
          '3–5 weeks',
          'Mostly timed design practice',
          'Consistent 40-minute solves on mid problems',
        ],
        [
          'Early career / shaky OOP',
          '8–12 weeks',
          'OOP drills, then SOLID, then problems',
          'Explain composition vs inheritance fluently + 6 practice designs',
        ],
      ],
    },
    {
      type: 'paragraph',
      text: 'Pick the row that matches you, not the row that sounds impressive. Over-ambitious timelines create panic; under-ambitious ones waste calendar time before interviews.',
    },
    { type: 'heading', level: 3, text: 'Suggested weekly shape (one hour a day)' },
    {
      type: 'numbered',
      items: [
        '**Days 1–2 — Concept:** one pattern or SOLID rule, with a tiny diagram of your own.',
        '**Days 3–4 — Apply:** redesign a small subsystem (notifications, pricing, auth providers).',
        '**Day 5 — Timed problem:** 40 minutes, no pausing to “look up the answer.”',
        '**Day 6 — Review:** rewrite the weak parts; note one mistake you will not repeat.',
        '**Day 7 — Light quiz / flash:** definitions and “when would you use X?” prompts.',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Sequence Matters More Than Volume' },
    {
      type: 'paragraph',
      text: 'A common failure mode is jumping to Elevator System before you can cleanly separate interfaces from implementations. Order reduces cognitive load.',
    },
    {
      type: 'numbered',
      items: [
        '**OOP clarity** — classes, interfaces, polymorphism, composition over inheritance.',
        '**SOLID** — especially SRP and OCP; they show up in almost every critique.',
        '**High-frequency patterns** — Strategy, Factory Method, Observer, Decorator, Template Method, Adapter.',
        '**UML fluency** — inheritance vs realization vs association vs composition.',
        '**Full problems** — Parking Lot, Library, Movie Booking, Notification systems, then harder domains.',
      ],
    },
    {
      type: 'quote',
      text: 'If you skip UML notation, interviewers spend your scarce minutes decoding arrows instead of evaluating design judgment. A short pass on [UML in the editor](/features/editor) pays for itself in the first mock.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Track Progress Like an Engineer, Not Like a Content Consumer' },
    {
      type: 'paragraph',
      text: 'Replace “I studied LLD this week” with artifacts you can inspect:',
    },
    {
      type: 'bullets',
      items: [
        'A checklist of topics with **done / shaky / not started**.',
        'A list of problems with **time taken**, **patterns used**, and **one regret**.',
        'A “mistake journal”: God class again, premature inheritance, missing interface for a volatile behavior.',
        'A readiness score you review every Sunday — honest, not aspirational.',
      ],
    },
    {
      type: 'paragraph',
      text: 'This is exactly the gap a sequenced roadmap tool fills. [Plannr](/features/plannr) is built to turn LLD prep into an ordered path with milestones, gap analysis, and a timeline tied to your interview date — so you know what remains instead of guessing.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Common Preparation Mistakes' },
    {
      type: 'bullets',
      items: [
        '**Pattern tourism** — learning twenty patterns and applying none under a timer.',
        '**Code-first panic** — writing methods before responsibilities are clear.',
        '**Ignoring requirements** — designing a distributed fantasy for a single-process LLD prompt.',
        '**No spaced review** — forgetting Strategy two weeks after a video binge.',
        '**Never simulating pressure** — only studying with ChatGPT open and unlimited time.',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'A Four-Week Sprint Example' },
    {
      type: 'paragraph',
      text: 'Use this if your interview is soon and foundations already exist:',
    },
    {
      type: 'table',
      headers: ['Week', 'Focus', 'Practice target'],
      rows: [
        ['1', 'SOLID + Strategy/Factory/Observer', '3 mini designs + 1 timed problem'],
        ['2', 'Decorator, Template Method, Adapter', '2 timed problems + diagram reviews'],
        ['3', 'Classic LLD problems (Parking, Library, Booking)', '3 timed problems'],
        ['4', 'Mocks + weak-spot drills', '2 full mocks + mistake journal cleanup'],
      ],
    },
    {
      type: 'paragraph',
      text: 'Between timed sessions, keep concepts warm with short daily checks — see [building a daily LLD practice habit](/blog/daily-lld-practice-habit).',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Resources Map (Use Sparingly, On Purpose)' },
    {
      type: 'bullets',
      items: [
        '**Concept depth:** [SOLID explained](/blog/solid-principles-explained), [design patterns guide](/blog/design-patterns-guide), [OOP for interviews](/blog/oop-concepts-for-interviews).',
        '**Problem menu:** [Top LLD interview questions](/blog/lld-interview-questions) and the [interview questions hub](/features/interview-questions).',
        '**Syllabus spine:** [LLD interview roadmap](/blog/lld-interview-roadmap) for topic coverage; this article for cadence and readiness.',
        '**Retention:** short daily drills ([daily practice habit](/blog/daily-lld-practice-habit)).',
        '**Pressure:** scenario runs when you stop freezing on purpose ([practice under pressure](/blog/practice-lld-under-pressure)).',
      ],
    },
    {
      type: 'paragraph',
      text: 'The anti-pattern is opening twelve tabs and finishing none. Bind each resource to a week in your plan, then close it.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Interview-Day Checklist' },
    {
      type: 'numbered',
      items: [
        'Restate the problem and confirm out-of-scope items.',
        'List core use cases before classes.',
        'Identify what will change (payment providers, notification channels, pricing rules).',
        'Draw types and relationships; only then flesh methods.',
        'Narrate trade-offs for at least one decision you rejected.',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Key Takeaways' },
    {
      type: 'bullets',
      items: [
        'Preparation is a **plan with milestones**, not a playlist.',
        'Sequence concepts before grinding hard problems.',
        'Measure timed designs and named mistakes, not hours watched.',
        'Leave buffer weeks for mocks — readiness is demonstrated under pressure.',
      ],
    },
    {
      type: 'quote',
      text: 'Want a sequenced path instead of a homemade spreadsheet? Start with [Plannr](/features/plannr) — pick your level, mark what you already know, and follow a roadmap that estimates timeline against your interview date.',
    },
  ],
}
