import type { FeatureBlogSeed } from './types'

/** Feature: Debug & Fix — restructure broken designs. */
export const debugAndFixBlog: FeatureBlogSeed = {
  featurePath: '/features/debug-and-fix',
  featureName: 'Debug and Fix',
  seoPlan: {
    primaryKeyword: 'fix broken object oriented design',
    secondaryKeywords: [
      'restructure god class',
      'fix SRP violation',
      'apply design patterns to legacy design',
      'LLD debugging exercise',
    ],
    searchIntent: 'How-to — systematically repair flawed OO designs',
    suggestedCoverAlt: 'Before-and-after UML showing a God Class split into focused collaborators',
  },
  slug: 'how-to-fix-broken-ood-design',
  title: 'How to Fix a Broken Object-Oriented Design (Step by Step)',
  subtitle: 'A systematic approach to restructuring God Classes, SRP breaches, and brittle inheritance',
  excerpt:
    'Learn a repeatable process for repairing flawed OO designs: diagnose the violation, plan the extraction, apply the right seam or pattern, and validate that behavior stays intact.',
  category: 'Object-Oriented Design',
  tags: ['LLD', 'Refactoring', 'God Class', 'SOLID', 'Design Repair', 'Interview Prep'],
  isFeatured: false,
  relatedSlugs: [
    'common-lld-design-mistakes',
    'refactoring-monolithic-design-lld',
    'solid-principles-explained',
    'design-patterns-guide',
  ],
  seo: {
    metaTitle: 'How to Fix a Broken Object-Oriented Design | LLDCanvas',
    metaDescription:
      'Step-by-step method to fix broken OO designs: diagnose smells, extract classes, introduce interfaces, apply patterns, and validate structural correctness.',
    keywords: [
      'fix broken object oriented design',
      'restructure god class',
      'fix SRP violation',
      'apply design patterns to legacy design',
      'LLD debugging exercise',
    ],
  },
  faq: [
    {
      q: 'What is the difference between spotting a design smell and fixing it?',
      a: 'Spotting names the problem. Fixing changes structure — new types, moved methods, interfaces — while preserving external behavior. Interviews often test both, in that order.',
    },
    {
      q: 'Should I fix designs in code or UML for LLD interviews?',
      a: 'Prefer UML first. Interviewers score responsibilities and relationships. Code can follow once the structure is clear.',
    },
    {
      q: 'Is there always one correct fix?',
      a: 'Not always. Several extractions can be valid. What matters is resolving the violation and being able to explain trade-offs among options.',
    },
  ],
  content: [
    {
      type: 'paragraph',
      text: 'Knowing that a design is “wrong” is not the same skill as making it right. Many candidates can say “this is a God Class” and then freeze — because remediation needs a sequence, not a vibe.',
    },
    {
      type: 'paragraph',
      text: 'This walkthrough gives you a **repeatable repair process** you can use in interviews and in legacy reviews. For a catalog of smells to recognize first, see [common LLD design mistakes](/blog/common-lld-design-mistakes).',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'The Repair Loop' },
    {
      type: 'numbered',
      items: [
        '**Stabilize the contract** — what must still work after the change?',
        '**Name the violation** — SRP, LSP, coupling, wrong relationship.',
        '**Find the seam** — where can you cut without rewriting the world?',
        '**Extract or invert** — new type, interface, or pattern.',
        '**Re-wire** — update relationships; delete dead weight.',
        '**Validate** — does the original violation still exist? Did you invent a new one?',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Worked Example: Breaking Up a God Service' },
    {
      type: 'paragraph',
      text: 'Before: `RideService` books rides, calculates fare, charges cards, sends SMS, and writes analytics.',
    },
    {
      type: 'code',
      lang: 'text',
      code: '// Smell: RideService does everything\nRideService\n  + requestRide()\n  + estimateFare()\n  + chargeCustomer()\n  + notifyDriver()\n  + trackEvent()',
    },
    {
      type: 'heading', level: 3, text: 'Step 1 — List change reasons',
    },
    {
      type: 'bullets',
      items: [
        'Fare rules change → pricing.',
        'Payment provider changes → payments.',
        'SMS vs push → notifications.',
        'Analytics vendor changes → telemetry.',
        'Booking flow changes → ride orchestration.',
      ],
    },
    {
      type: 'heading', level: 3, text: 'Step 2 — Extract by reason-to-change',
    },
    {
      type: 'code',
      lang: 'text',
      code: 'RideService (orchestration only)\n  - FareCalculator\n  - PaymentGateway (interface)\n  - Notifier (interface)\n  - AnalyticsClient (interface)\n\nFareCalculator\nStripePaymentGateway implements PaymentGateway\nSmsNotifier implements Notifier',
    },
    {
      type: 'heading', level: 3, text: 'Step 3 — Validate',
    },
    {
      type: 'bullets',
      items: [
        'Booking flow still goes through `RideService`.',
        'Adding WhatsApp notifications does not edit fare or payment code.',
        'No new circular dependencies between collaborators.',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Choosing the Right Move' },
    {
      type: 'table',
      headers: ['Violation', 'Typical move', 'Pattern that often helps'],
      rows: [
        ['God Class / SRP', 'Extract class / service', 'Facade for the old entry point'],
        ['Provider if-else', 'Introduce interface + impls', 'Strategy'],
        ['Optional behaviors stacked', 'Wrap responsibilities', 'Decorator'],
        ['LSP break', 'Break inheritance; compose', 'Composition + shared interface'],
        ['Feature envy', 'Move method', '—'],
      ],
    },
    {
      type: 'paragraph',
      text: 'Patterns are tools for a diagnosed problem — not stickers. If you cannot name the violation, do not reach for Decorator.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Interview Tips While You Fix' },
    {
      type: 'bullets',
      items: [
        'Narrate the violation before editing: “I’m extracting pricing because fare rules change independently.”',
        'Keep a temporary facade if callers must stay stable.',
        'Prefer many small extractions over one dramatic rewrite mid-interview.',
        'Ask whether functional equivalence is required — in refactor prompts it usually is.',
      ],
    },
    {
      type: 'quote',
      text: 'Critique practice belongs in [Debug Lab](/features/debug-lab). When you need to **restructure** on a canvas and validate against a clean target, use [Debug & Fix](/features/debug-and-fix).',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Avoid These Remediation Traps' },
    {
      type: 'bullets',
      items: [
        '**Rename-only fixes** — `OrderManagerGod` renamed to three still-coupled types.',
        '**Interface theater** — one implementation forever, no call sites depending on the abstraction.',
        '**Behavior drift** — “fixing” SRP by dropping a required use case.',
        '**Big-bang rewrite** — deleting the entry API mid-interview with no facade.',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Practice Exercise' },
    {
      type: 'paragraph',
      text: '`ReportGenerator` loads DB rows, formats CSV and PDF, emails stakeholders, and caches results. Sketch a repaired design in ten minutes. Then compare: did you separate loading, formatting, delivery, and caching?',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Key Takeaways' },
    {
      type: 'bullets',
      items: [
        'Fixing needs a loop: stabilize → diagnose → seam → extract → validate.',
        'Split types by reason-to-change, not by “feels big.”',
        'Use patterns to complete a remediation, not to decorate a resume.',
        'Preserve behavior while changing structure.',
      ],
    },
    {
      type: 'quote',
      text: 'Practice active remediation in [Debug & Fix](/features/debug-and-fix) — detect, restructure, and check your design against the expected clean model.',
    },
  ],
}
