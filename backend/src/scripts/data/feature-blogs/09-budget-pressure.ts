import type { FeatureBlogSeed } from './types'

/** Feature: Budget Pressure — design under explicit constraints. */
export const budgetPressureBlog: FeatureBlogSeed = {
  featurePath: '/features/budget-pressure',
  featureName: 'Budget Pressure',
  seoPlan: {
    primaryKeyword: 'design trade-offs interview',
    secondaryKeywords: [
      'LLD under constraints',
      'software design trade offs',
      'pragmatic system design decisions',
      'engineering budget design',
    ],
    searchIntent: 'Informational — senior interviews scoring justification under limits',
    suggestedCoverAlt: 'Balance scale weighing design elegance against time and engineering budget',
  },
  slug: 'design-trade-offs-under-constraints',
  title: 'Design Trade-Offs Under Constraints: How Senior LLD Interviews Really Work',
  subtitle: 'When you cannot afford the “perfect” architecture, what do you cut — and how do you justify it?',
  excerpt:
    'Learn how to make and explain design trade-offs under time, complexity, and engineering-budget constraints — the skill that separates textbook designs from shippable ones in senior interviews.',
  category: 'Low-Level Design',
  tags: ['Trade-offs', 'LLD', 'Constraints', 'Senior Interview', 'Pragmatic Design'],
  isFeatured: false,
  relatedSlugs: [
    'evolving-software-design-requirements',
    'practice-lld-under-pressure',
    'how-to-prepare-for-lld-interview',
    'open-closed-principle-requirement-changes',
  ],
  seo: {
    metaTitle: 'Design Trade-Offs Under Constraints (LLD Interviews) | LLDCanvas',
    metaDescription:
      'How to make pragmatic LLD design trade-offs under time, budget, and complexity constraints — and justify them clearly in senior interviews.',
    keywords: [
      'design trade-offs interview',
      'LLD under constraints',
      'software design trade offs',
      'pragmatic system design decisions',
      'engineering budget design',
    ],
  },
  faq: [
    {
      q: 'What constraints appear in senior design interviews?',
      a: 'Common ones: limited engineering time (sprint budget), headcount, complexity caps, performance budgets, and “do not gold-plate.” The point is forced prioritization with justification.',
    },
    {
      q: 'Is the simplest design always best under constraints?',
      a: 'No. Simplest can become most expensive later. Prefer cuts that preserve load-bearing seams and sacrifice ceremony or speculative generality.',
    },
    {
      q: 'How should I talk about a trade-off in an interview?',
      a: 'State the constraint, the option you rejected, what you optimized for, and the risk you accept — in two or three sentences.',
    },
  ],
  content: [
    {
      type: 'paragraph',
      text: 'Junior prompts reward completeness. Senior prompts reward **judgment under scarcity**. “Design the ideal notification platform” becomes “You have two engineers and one sprint — what ships, what waits, and why?”',
    },
    {
      type: 'paragraph',
      text: 'This guide is about making **design trade-offs under constraints** without sounding careless — and without gold-plating when the budget says no.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Constraints You Should Expect' },
    {
      type: 'table',
      headers: ['Constraint', 'What it stresses', 'Typical cut'],
      rows: [
        ['Time / sprint points', 'Scope control', 'Defer secondary channels, admin UIs'],
        ['Headcount', 'Parallelism & ownership', 'Fewer moving parts; clearer module boundaries'],
        ['Complexity budget', 'Cognitive load', 'Avoid speculative frameworks'],
        ['Performance budget', 'Hot paths', 'Simple sync flow first; async later if measured'],
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'A Decision Framework That Fits in an Interview' },
    {
      type: 'numbered',
      items: [
        '**Restate the constraint** in your own words.',
        '**Separate must-haves from differentiators** for this release.',
        '**Protect load-bearing seams** (identity, money, correctness).',
        '**Cut ceremony first** (extra layers, unused patterns).',
        '**Name the risk** of each cut and a revisit trigger.',
      ],
    },
    {
      type: 'heading', level: 3, text: 'Example justification (say this out loud)',
    },
    {
      type: 'quote',
      text: '“Given a one-sprint budget, I’m shipping email-only notifications behind a Notifier interface. SMS waits. The interface keeps blast radius small when SMS lands next sprint — I’m optimizing for a safe seam, not for feature parity today.”',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'What Not to Cut' },
    {
      type: 'bullets',
      items: [
        'Invariants around money, inventory, or authorization.',
        'A clear module boundary you will need within one known upcoming requirement.',
        'Observability on the failure path you already know is flaky.',
        'Tests or design clarity that prevent silent corruption — “speed” that ships wrongness is not a win.',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Common Failure Modes Under Budget Pressure' },
    {
      type: 'bullets',
      items: [
        '**Gold-plating anyway** — building the event-driven mesh “for scale” with no traffic.',
        '**Cutting the seam** — hard-coding the volatile part to “save time,” guaranteeing a rewrite.',
        '**Silent scope lies** — claiming full multi-channel support while designing only email.',
        '**No revisit trigger** — “we’ll fix it later” with no metric or date.',
      ],
    },
    {
      type: 'quote',
      text: '[Budget Pressure](/features/budget-pressure) on LLDCanvas forces explicit allocations under story-point, timeline, or headcount limits — and asks you to justify trade-offs the way senior interviews do.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Relate Constraints to Evolution and Pressure Practice' },
    {
      type: 'paragraph',
      text: 'Constraints are one axis; time is another. Multi-stage growth ([evolving software design](/blog/evolving-software-design-requirements)) asks what you defer across releases. Timed decision drills ([practice LLD under pressure](/blog/practice-lld-under-pressure)) ask whether you can choose at all. Budget scenarios ask whether your choices are economically sane.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Score Yourself the Way Interviewers Do' },
    {
      type: 'bullets',
      items: [
        '**Constraint adherence** — did you actually stay inside the budget you restated?',
        '**Trade-off quality** — did you cut ceremony, or did you cut a correctness seam?',
        '**Justification clarity** — can a listener repeat your rationale in one sentence?',
        '**Honesty** — did the diagram match the scope you claimed?',
      ],
    },
    {
      type: 'paragraph',
      text: 'Perfect diagrams that ignore the budget fail the prompt. Ugly-but-justified designs that protect money paths and defer cosmetics often pass.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Practice Exercise' },
    {
      type: 'paragraph',
      text: 'Design a document-approval workflow. Budget: 8 story points. Must: submit, approve/reject, audit log. Nice-to-have: Slack alerts, parallel approvers, SSO. Allocate points, draw the must-have model, and write three sentences justifying what you deferred.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Key Takeaways' },
    {
      type: 'bullets',
      items: [
        'Senior LLD scores justification under scarcity.',
        'Cut ceremony before cutting correctness seams.',
        'State rejected options and revisit triggers.',
        'Pragmatism is not an excuse for hidden scope cuts.',
      ],
    },
    {
      type: 'quote',
      text: 'Practice constrained allocation and trade-off write-ups in [Budget Pressure](/features/budget-pressure).',
    },
  ],
}
