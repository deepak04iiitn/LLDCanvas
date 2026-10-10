import type { FeatureBlogSeed } from './types'

/** Feature: Refactor — break apart monolithic but working designs. */
export const refactorBlog: FeatureBlogSeed = {
  featurePath: '/features/refactor',
  featureName: 'Refactor',
  seoPlan: {
    primaryKeyword: 'refactoring for LLD interviews',
    secondaryKeywords: [
      'extract class refactoring',
      'refactor monolithic design',
      'separation of concerns practice',
      'legacy design interview question',
    ],
    searchIntent: 'How-to — improve structure without changing behavior',
    suggestedCoverAlt: 'Monolithic UML class being split into focused modules while behavior stays equivalent',
  },
  slug: 'refactoring-monolithic-design-lld',
  title: 'Refactoring Monolithic Designs for LLD Interviews',
  subtitle: 'How to break apart a working-but-messy model without changing what it does',
  excerpt:
    'A practical guide to LLD refactoring interviews: identify smells in a monolithic design, extract classes safely, apply separation of concerns, and prove functional equivalence.',
  category: 'Object-Oriented Design',
  tags: ['Refactoring', 'LLD', 'Monolith', 'SOLID', 'Separation of Concerns', 'Interview Prep'],
  isFeatured: false,
  relatedSlugs: [
    'how-to-fix-broken-ood-design',
    'common-lld-design-mistakes',
    'solid-principles-explained',
    'open-closed-principle-requirement-changes',
  ],
  seo: {
    metaTitle: 'Refactoring Monolithic Designs for LLD Interviews | LLDCanvas',
    metaDescription:
      'Learn how to refactor monolithic LLD designs in interviews: spot smells, extract classes, keep behavior equivalent, and apply separation of concerns under time pressure.',
    keywords: [
      'refactoring for LLD interviews',
      'extract class refactoring',
      'refactor monolithic design',
      'separation of concerns practice',
      'legacy design interview question',
    ],
  },
  faq: [
    {
      q: 'What is a refactoring question in an LLD interview?',
      a: 'You receive a working design (often “legacy”) and must improve structure without changing external behavior. Interviewers score smell recognition and clean extractions.',
    },
    {
      q: 'How is refactoring different from redesigning from scratch?',
      a: 'Refactoring keeps observable behavior stable and changes internals incrementally. Greenfield redesign may rewrite freely — different constraint, different scoring.',
    },
    {
      q: 'When should I stop refactoring in an interview?',
      a: 'When the named smells are gone and boundaries are clear. Diminishing returns and perfectionism waste the clock.',
    },
  ],
  content: [
    {
      type: 'paragraph',
      text: 'Not every LLD prompt starts from a blank canvas. Senior-leaning rounds often hand you a **working monolith** and ask you to make it maintainable. That is a different sport from Designing Parking Lot from scratch: behavior is sacred; structure is not.',
    },
    {
      type: 'paragraph',
      text: 'This guide focuses on **refactoring for LLD interviews** — extracting classes, clarifying seams, and leaving a design that still does the same job.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'The Non-Negotiable Rule: Functional Equivalence' },
    {
      type: 'paragraph',
      text: 'If the system used to support “book seat → pay → email ticket,” your refactored model must still support that path. You may introduce interfaces and collaborators, but you may not quietly drop features to make the diagram pretty.',
    },
    {
      type: 'bullets',
      items: [
        'List the public use cases before you move boxes.',
        'Treat that list as a regression suite for your design.',
        'If you change a behavior, say so — that is a product change, not a refactor.',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Smell → Move Mapping' },
    {
      type: 'table',
      headers: ['Smell in the monolith', 'Safe first move', 'Done when'],
      rows: [
        ['Giant class', 'Extract class by responsibility', 'Each type has one clear job phrase'],
        ['Long method as “god operation”', 'Extract method / helper type', 'Orchestrator reads as a short script'],
        ['Duplicated policy logic', 'Extract strategy / shared policy', 'One place to change the rule'],
        ['UI + domain mixed', 'Split presentation from domain', 'Domain types have no render methods'],
        ['Persistence sprinkled everywhere', 'Repository / gateway', 'Domain no longer imports SQL details'],
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'A Compact Refactoring Script (Interview Pace)' },
    {
      type: 'numbered',
      items: [
        '**Read aloud** the monolith’s responsibilities (2 minutes).',
        '**Tag smells** on the diagram — do not fix yet (2 minutes).',
        '**Pick the highest-leverage cut** — usually the biggest SRP breach (1 minute).',
        '**Extract and rewire** (10–15 minutes).',
        '**Walk a use case** across the new types (3 minutes).',
        '**Stop** when the tagged smells are resolved.',
      ],
    },
    {
      type: 'heading', level: 3, text: 'Example cut',
    },
    {
      type: 'paragraph',
      text: '`LibrarySystem` handles catalog search, member registration, loan rules, fine calculation, and email reminders. First extract `LoanPolicy` and `NotificationGateway`. Leave catalog and members for a second cut if time remains. Two clean seams beat five half-finished ones.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'What Interviewers Listen For' },
    {
      type: 'bullets',
      items: [
        'You preserve behavior deliberately.',
        'You explain *why* a boundary exists (“fines change independently of search”).',
        'You avoid pattern theater.',
        'You can describe a migration path (facade over old entry point).',
      ],
    },
    {
      type: 'quote',
      text: 'LLDCanvas [Refactor](/features/refactor) starts you on monolithic designs with smell tags and asks you to restructure while staying functionally equivalent — the exact constraint these interviews use.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Worked Sketch: TicketBookingSystem Monolith' },
    {
      type: 'paragraph',
      text: 'Imagine one class that searches shows, holds seats, charges cards, emails tickets, and applies promo codes. Under a behavior lock, a strong first cut looks like:',
    },
    {
      type: 'code',
      lang: 'text',
      code: 'TicketBookingFacade          // keeps old entry API stable\n  CatalogService              // search shows\n  SeatHoldService             // reservations + expiry\n  PaymentGateway (port)\n  PricingPolicy (port)        // promos / base fare\n  TicketNotifier (port)\n\n// External behavior unchanged:\nbook(showId, seatIds, userId, promo?)',
    },
    {
      type: 'paragraph',
      text: 'You did not redesign the product. You gave each reason-to-change a home and left a facade so callers do not break mid-interview. That is the refactoring story interviewers want to hear.',
    },
    {
      type: 'bullets',
      items: [
        'If time remains, extract `PromoCode` rules from a generic `PricingPolicy`.',
        'If time is gone, stop — a clear facade + three ports already beats a half-migrated mess.',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Refactor vs Debug-and-Fix vs OCP Drills' },
    {
      type: 'paragraph',
      text: '**Refactor** assumes a working mess and equivalence. **Debug & Fix** centers on resolving specific violations against a target clean design. **Change-one-requirement** drills stress OCP when a new need arrives mid-design. Use each for the skill it trains; see also [open-closed principle under requirement changes](/blog/open-closed-principle-requirement-changes).',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Key Takeaways' },
    {
      type: 'bullets',
      items: [
        'Refactoring interviews grade structure under a behavior lock.',
        'Tag smells first; extract the highest-leverage seam second.',
        'Walk use cases after every major cut.',
        'Stop at clarity — not perfection.',
      ],
    },
    {
      type: 'quote',
      text: 'Practice on authored monoliths in [Refactor](/features/refactor) and keep a side journal of which smells you still miss under time.',
    },
  ],
}
