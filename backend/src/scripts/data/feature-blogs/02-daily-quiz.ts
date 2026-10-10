import type { FeatureBlogSeed } from './types'

/** Feature: Daily Quiz — retention via short daily LLD drills. */
export const dailyQuizBlog: FeatureBlogSeed = {
  featurePath: '/features/daily-quiz',
  featureName: 'Daily Quiz',
  seoPlan: {
    primaryKeyword: 'LLD quiz',
    secondaryKeywords: [
      'design patterns quiz',
      'SOLID principles quiz',
      'daily LLD practice',
      'object oriented design questions',
    ],
    searchIntent: 'Informational / practice — people wanting short daily drills and retention tactics',
    suggestedCoverAlt: 'Short multiple-choice LLD quiz cards covering design patterns and SOLID',
  },
  slug: 'daily-lld-practice-habit',
  title: 'Build a Daily LLD Practice Habit (Without Burning Out)',
  subtitle: 'Why short, frequent design quizzes beat weekend cramming for interviews',
  excerpt:
    'How to use daily LLD quizzes and micro-drills to retain SOLID principles, design patterns, and design judgment — with a sustainable cadence that fits a full-time job.',
  category: 'Low-Level Design',
  tags: ['LLD', 'Quiz', 'Design Patterns', 'SOLID', 'Spaced Practice', 'Interview Prep'],
  isFeatured: false,
  relatedSlugs: [
    'how-to-prepare-for-lld-interview',
    'solid-principles-explained',
    'design-patterns-cheat-sheet',
    'lld-interview-questions',
  ],
  seo: {
    metaTitle: 'Daily LLD Practice Habit: Quizzes That Stick | LLDCanvas',
    metaDescription:
      'Build a sustainable daily LLD practice habit with short quizzes on SOLID and design patterns. Better retention than weekend cramming — with a simple weekly cadence.',
    keywords: [
      'LLD quiz',
      'design patterns quiz',
      'SOLID principles quiz',
      'daily LLD practice',
      'object oriented design questions',
    ],
  },
  faq: [
    {
      q: 'How long should a daily LLD practice session be?',
      a: 'Fifteen to twenty minutes is enough for retention if you show up most days. Longer sessions are for timed full problems, not for daily quizzes.',
    },
    {
      q: 'Are multiple-choice quizzes enough for LLD interviews?',
      a: 'No. Quizzes lock vocabulary and recognition. You still need diagram practice and timed problems. Use quizzes to keep concepts warm between deep sessions.',
    },
    {
      q: 'What topics should a daily LLD quiz cover?',
      a: 'Rotate SOLID principles, pattern intent vs structure, composition vs inheritance, UML relationship meaning, and “which pattern fits this change?” scenarios.',
    },
  ],
  content: [
    {
      type: 'paragraph',
      text: 'You can explain the Open-Closed Principle on Sunday and blank on it by Thursday. That is not a character flaw — it is how memory works without retrieval practice. LLD interviews punish exactly this gap: you “know” Observer until the interviewer asks when you would *not* use it.',
    },
    {
      type: 'paragraph',
      text: 'A **daily LLD practice habit** fixes retention without demanding another two-hour study block after work. Short quizzes and micro-scenarios keep pattern vocabulary and design judgment available when a timed round starts.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Why Weekend Cramming Fails LLD Prep' },
    {
      type: 'bullets',
      items: [
        '**Recognition ≠ recall** — nodding along to a video is not the same as choosing Strategy under a timer.',
        '**Interference** — learning eight patterns in one sitting blends their intents together.',
        '**No feedback loop** — you do not discover misconceptions until the mock (or the real interview).',
        '**Identity mismatch** — “I studied all Saturday” feels virtuous but leaves Monday empty.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Spaced, low-friction retrieval beats marathons for durable knowledge. Your deep work still matters — Parking Lot still needs a 40-minute canvas — but quizzes protect the foundation those sessions stand on.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'What a Strong Daily LLD Quiz Actually Tests' },
    {
      type: 'paragraph',
      text: 'Avoid trivia like “In which year was Design Patterns published?” Prefer questions that mirror interview judgment:',
    },
    {
      type: 'table',
      headers: ['Question type', 'Example prompt', 'Skill trained'],
      rows: [
        [
          'Pattern selection',
          'Prices change by region and campaign — Strategy or Decorator?',
          'Matching volatility to a pattern',
        ],
        [
          'SOLID diagnosis',
          'A class both persists orders and sends emails — which principle?',
          'Smell recognition',
        ],
        [
          'Relationship meaning',
          'Filled diamond vs empty diamond in UML',
          'Composition vs aggregation fluency',
        ],
        [
          'Anti-pattern',
          'When is Singleton a smell rather than a solution?',
          'Trade-off awareness',
        ],
      ],
    },
    {
      type: 'heading', level: 3, text: 'Sample drill you can do today',
    },
    {
      type: 'paragraph',
      text: 'Scenario: a `NotificationService` has `if` chains for Email, SMS, Push, and Slack. Product wants WhatsApp next week.',
    },
    {
      type: 'bullets',
      items: [
        'Which SOLID principle is under the most pressure?',
        'Which pattern removes the need to edit the service for each channel?',
        'What interface method would every channel implement?',
      ],
    },
    {
      type: 'paragraph',
      text: 'Answers in short: **OCP** (and SRP if the service also formats messages), **Strategy** (or a channel interface + registry), something like `send(NotificationPayload)`. Writing the three answers in ninety seconds is a quiz; spending twenty minutes drawing it is practice.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'A Sustainable Cadence (Full-Time Job Friendly)' },
    {
      type: 'numbered',
      items: [
        '**Mon–Fri (15 min):** 5–10 quiz items; note any miss in a one-line mistake log.',
        '**Wed or Thu (40 min):** one timed mini-design or half problem.',
        '**Weekend (60–90 min):** one full LLD problem or mock.',
        '**Never zero twice:** if you miss a day, do five questions the next morning — do not “catch up” with a guilt binge.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Consistency beats intensity. Twenty quiet days outperform two heroic weekends and twelve days of avoidance.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'How to Review Wrong Answers' },
    {
      type: 'bullets',
      items: [
        'Rewrite the correct idea in your own words — one sentence.',
        'Draw a three-box diagram if the miss was structural.',
        'Tag the miss: *pattern mix-up*, *SOLID*, *UML*, or *requirements*.',
        'Revisit the same tag within 48 hours with a fresh question.',
      ],
    },
    {
      type: 'quote',
      text: 'A daily quiz is only as good as the feedback. LLDCanvas [Daily Quiz](/features/daily-quiz) rotates SOLID and design-pattern prompts so you practice judgment, not trivia — useful between deeper sessions on the canvas.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Seven High-Yield Quiz Themes to Rotate' },
    {
      type: 'numbered',
      items: [
        '**Strategy vs Decorator** — varying an algorithm vs stacking optional behavior.',
        '**Factory vs constructor sprawl** — when creation logic deserves a home.',
        '**Observer vs callbacks** — many listeners vs a single completion hook.',
        '**Composition vs inheritance** — has-a flexibility vs is-a contracts.',
        '**SRP naming** — “reasons to change” count for a suspicious class.',
        '**ISP** — fat interfaces forcing empty methods on implementors.',
        '**UML arrows** — inheritance, realization, association, aggregation, composition.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Keep a running “miss streak” per theme. When one theme hits three misses in a week, promote it to a 30-minute diagram drill instead of another quiz pass.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Example self-check set (answer, then verify)',
    },
    {
      type: 'bullets',
      items: [
        'A report exporter needs PDF and CSV next quarter — which seam do you introduce today?',
        'Why might Singleton make unit testing painful?',
        'Name one Liskov violation involving a subclass that throws on a parent method.',
        'When is Template Method a better fit than Strategy?',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Pair Quizzes with Deeper Practice' },
    {
      type: 'paragraph',
      text: 'Quizzes will not replace drawing a class diagram for [common LLD interview questions](/blog/lld-interview-questions). Use them as the glue between larger sessions, and keep your overall plan sequenced — see [how to prepare for an LLD interview](/blog/how-to-prepare-for-lld-interview).',
    },
    {
      type: 'paragraph',
      text: 'When a quiz repeatedly flags the same smell (God class, wrong inheritance), graduate that topic into a critique session — spotting violations on a diagram trains a different muscle than picking an answer option.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Key Takeaways' },
    {
      type: 'bullets',
      items: [
        'Daily retrieval keeps LLD vocabulary interview-ready.',
        'Prefer scenario questions over definition trivia.',
        'Fifteen focused minutes most days beat irregular marathons.',
        'Log misses by theme and re-test within two days.',
      ],
    },
    {
      type: 'quote',
      text: 'Ready for a low-friction daily loop? Try the [Daily LLD Quiz](/features/daily-quiz) and keep a longer problem reserved for the weekend.',
    },
  ],
}
