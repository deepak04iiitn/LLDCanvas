import type { FeatureBlogSeed } from './types'

/** Feature: Evolution — multi-stage design growth. */
export const evolutionBlog: FeatureBlogSeed = {
  featurePath: '/features/evolution',
  featureName: 'Evolution',
  seoPlan: {
    primaryKeyword: 'evolving software design',
    secondaryKeywords: [
      'extensible system design LLD',
      'design for change interview',
      'multi stage system design',
      'technical debt in design interviews',
    ],
    searchIntent: 'Informational — senior-leaning how designs age across requirement stages',
    suggestedCoverAlt: 'Timeline of a class design growing across three requirement stages',
  },
  slug: 'evolving-software-design-requirements',
  title: 'Evolving a Software Design as Requirements Grow',
  subtitle: 'How to think in stages: from clean v1 to extensible v3 without painting yourself into a corner',
  excerpt:
    'A guide to multi-stage LLD thinking: how early design choices compound, when to pay down structural debt, and how to evolve a class model as scale and features arrive.',
  category: 'Low-Level Design',
  tags: ['LLD', 'Extensibility', 'System Evolution', 'Technical Debt', 'Senior Interview'],
  isFeatured: false,
  relatedSlugs: [
    'open-closed-principle-requirement-changes',
    'design-trade-offs-under-constraints',
    'how-to-prepare-for-lld-interview',
    'practice-lld-under-pressure',
  ],
  seo: {
    metaTitle: 'Evolving Software Design as Requirements Grow | LLDCanvas',
    metaDescription:
      'Learn multi-stage LLD design: evolve a clean initial model through growth stages, manage structural debt, and keep extensibility without premature overengineering.',
    keywords: [
      'evolving software design',
      'extensible system design LLD',
      'design for change interview',
      'multi stage system design',
      'technical debt in design interviews',
    ],
  },
  faq: [
    {
      q: 'What is a system evolution question in interviews?',
      a: 'You start with an early design and must change it across stages as requirements grow. Each stage constrains the next — testing long-term design judgment, not a single static diagram.',
    },
    {
      q: 'How is evolution different from Open-Closed Principle drills?',
      a: 'OCP drills focus on one change with minimal edits. Evolution spans multiple stages, debt, and trade-offs over time.',
    },
    {
      q: 'Should v1 be fully abstracted?',
      a: 'Usually no. Ship a clear v1 with seams where change is already signaled. Over-abstracting every noun creates ceremony without payoff.',
    },
  ],
  content: [
    {
      type: 'paragraph',
      text: 'A design that looks elegant for today’s three classes can become a liability when the product adds multi-tenant rules, new regions, and audit requirements. Senior LLD conversations are less about “draw the perfect Parking Lot” and more about **how your choices age**.',
    },
    {
      type: 'paragraph',
      text: 'This article teaches **stage-based design thinking**: what to optimize in v1, what to postpone, and how to evolve without a full rewrite every quarter.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Why Single-Shot Designs Mis-train You' },
    {
      type: 'bullets',
      items: [
        'You never feel the cost of an early concrete dependency.',
        'You never choose between paying debt now vs shipping a feature.',
        'You optimize for completeness instead of optionality.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Multi-stage prompts fix that: stage 1 is a simple booking flow; stage 2 adds providers; stage 3 adds compliance logging and rate limits. Your stage-1 shortcuts become visible.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'A Three-Stage Story: Notifications' },
    {
      type: 'table',
      headers: ['Stage', 'Requirement', 'Healthy move', 'Trap'],
      rows: [
        [
          'v1',
          'Email only',
          'EmailNotifier behind a small interface if product hinted at channels',
          'Hard-code SMTP calls inside OrderService',
        ],
        [
          'v2',
          'Add SMS + push',
          'New implementations + selector',
          'Copy-paste send logic into OrderService branches',
        ],
        [
          'v3',
          'Per-user preferences + audit',
          'Preference policy + decorator/wrapper for audit',
          'Stuff preferences into every notifier class',
        ],
      ],
    },
    {
      type: 'paragraph',
      text: 'Notice the theme: each stage **extends** seams instead of rewriting `OrderService`. That is evolution aligned with OCP, stretched across time.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Decision Points You Should Narrate' },
    {
      type: 'numbered',
      items: [
        '**What do we intentionally leave concrete in v1?** (YAGNI with eyes open.)',
        '**Where do we place a seam now because the prompt already foreshadows change?**',
        '**When debt becomes expensive, what is the smallest structural payment?**',
        '**What must remain backward compatible for existing callers?**',
      ],
    },
    {
      type: 'quote',
      text: '[Evolution](/features/evolution) on LLDCanvas walks multi-stage growth — scaling demands, debt accumulation, and trade-off checkpoints — so you practice long-term thinking, not one-off diagrams.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Extensibility Without Gold-Plating' },
    {
      type: 'bullets',
      items: [
        'Abstract volatilities named in the problem; leave boring value objects simple.',
        'Prefer a single interface with two impls over a framework fantasy.',
        'Document the deferred decision: “No event bus in v1; revisit if fan-out > N.”',
        'When constraints tighten (time, headcount), evolution meets budget thinking — see [design trade-offs under constraints](/blog/design-trade-offs-under-constraints).',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Structural Debt Ledger (Keep One While You Evolve)' },
    {
      type: 'table',
      headers: ['Debt item', 'Why we accepted it', 'Revisit trigger'],
      rows: [
        ['Concrete SMTP client in OrderService', 'v1 email-only, one sprint', 'Second channel requested'],
        ['Single DB table for all notification types', 'Speed', 'Query patterns diverge / indexes fight'],
        ['No retry wrapper', 'Provider SLA looked fine', 'Error budget burned twice in a week'],
      ],
    },
    {
      type: 'paragraph',
      text: 'Writing the ledger during practice trains the same muscle as narrating trade-offs in a senior round. Debt without a trigger is just hope.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Practice Prompt' },
    {
      type: 'paragraph',
      text: 'Stage 1: single-warehouse inventory reservation. Stage 2: multi-warehouse with transfer. Stage 3: soft reservations that expire. Sketch each stage for fifteen minutes, carrying types forward. Where did stage 1 force a painful rewrite?',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Key Takeaways' },
    {
      type: 'bullets',
      items: [
        'Designs should be judged across stages, not only at t=0.',
        'Early concrete shortcuts have compound interest — positive or negative.',
        'Pay structural debt when a stage makes the cost obvious.',
        'Extensibility is selective, not universal abstraction.',
      ],
    },
    {
      type: 'quote',
      text: 'Train multi-stage growth in [Evolution](/features/evolution), and keep single-twist OCP sharp with [Change One Thing](/features/change-one-thing).',
    },
  ],
}
