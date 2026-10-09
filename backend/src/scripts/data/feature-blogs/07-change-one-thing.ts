import type { FeatureBlogSeed } from './types'

/** Feature: Change One Thing — OCP / minimal blast radius. */
export const changeOneThingBlog: FeatureBlogSeed = {
  featurePath: '/features/change-one-thing',
  featureName: 'Change One Thing',
  seoPlan: {
    primaryKeyword: 'open closed principle interview',
    secondaryKeywords: [
      'open closed principle examples',
      'requirement change LLD',
      'blast radius software design',
      'extend without modification',
    ],
    searchIntent: 'Informational / how-to — handle mid-design requirement changes with OCP',
    suggestedCoverAlt: 'Class diagram where a new requirement only adds a new implementation behind an interface',
  },
  slug: 'open-closed-principle-requirement-changes',
  title: 'Open-Closed Principle in Interviews: Handling a Mid-Design Requirement Change',
  subtitle: 'How to absorb “one more requirement” with minimal blast radius',
  excerpt:
    'Learn how interviewers use sudden requirement changes to test the Open-Closed Principle — and how to design so a small change does not force a rewrite of your class diagram.',
  category: 'Object-Oriented Design',
  tags: ['OCP', 'SOLID', 'LLD', 'Requirement Change', 'Extensibility', 'Interview Prep'],
  isFeatured: false,
  relatedSlugs: [
    'solid-principles-explained',
    'evolving-software-design-requirements',
    'refactoring-monolithic-design-lld',
    'practice-lld-under-pressure',
  ],
  seo: {
    metaTitle: 'Open-Closed Principle in LLD Interviews (Requirement Changes) | LLDCanvas',
    metaDescription:
      'How to apply the Open-Closed Principle when interviewers add a requirement mid-design. Minimize blast radius with interfaces, Strategy, and careful seams.',
    keywords: [
      'open closed principle interview',
      'open closed principle examples',
      'requirement change LLD',
      'blast radius software design',
      'extend without modification',
    ],
  },
  faq: [
    {
      q: 'What is blast radius in software design?',
      a: 'Blast radius is how many types you must edit to satisfy a new requirement. Small blast radius usually means better OCP alignment.',
    },
    {
      q: 'Does OCP mean I should create an interface for every class?',
      a: 'No. Introduce abstractions where change is likely — providers, policies, channels — not around stable value objects.',
    },
    {
      q: 'What patterns support the Open-Closed Principle?',
      a: 'Strategy, Decorator, Template Method, and simple plugin-style interfaces are common. The pattern follows the volatility; it is not mandatory decoration.',
    },
  ],
  content: [
    {
      type: 'paragraph',
      text: 'Twenty minutes into your LLD design, the interviewer smiles: “Also support coupon codes.” Or WhatsApp notifications. Or surge pricing. They are not being cruel — they are testing whether your structure **bends** or **breaks**.',
    },
    {
      type: 'paragraph',
      text: 'That test is the **Open-Closed Principle** in interview clothing: open for extension, closed for modification. This article shows how to place seams so “one more requirement” stays small.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'What Interviewers Measure with a Twist' },
    {
      type: 'bullets',
      items: [
        'Did you hard-code the volatile decision?',
        'How many boxes turn red when the twist arrives?',
        'Can you extend with a new type instead of editing five methods?',
        'Do you explain the trade-off of the seam you chose?',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Find Volatility Before You Draw' },
    {
      type: 'paragraph',
      text: 'During clarification, ask what is likely to change. Classic volatilities in LLD prompts:',
    },
    {
      type: 'table',
      headers: ['Domain signal', 'Likely volatility', 'Seam to consider'],
      rows: [
        ['Multiple providers', 'Payment / auth / maps', 'Interface + implementations'],
        ['Multiple channels', 'Email / SMS / push', 'Notifier strategy'],
        ['Rules differ by plan/region', 'Pricing / eligibility', 'Policy / Strategy'],
        ['Optional extras', 'Logging, metrics, retry', 'Decorator'],
      ],
    },
    {
      type: 'paragraph',
      text: 'You cannot abstract everything. Abstract the **axes the story emphasizes**.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Worked Mini-Example: Pricing Twist' },
    {
      type: 'paragraph',
      text: 'Initial ask: flat fare for rides. Twist: support surge multipliers at peak hours.',
    },
    {
      type: 'code',
      lang: 'text',
      code: '// Fragile\nFareService.calculate(distance) {\n  return distance * RATE;\n  // later: sprinkle if (peak) everywhere\n}\n\n// OCP-friendlier\nFareService depends on PricingStrategy\nFlatPricing implements PricingStrategy\nSurgePricing implements PricingStrategy',
    },
    {
      type: 'paragraph',
      text: 'The twist adds `SurgePricing` (and maybe a factory/selector). `FareService` stays mostly closed.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Blast Radius Checklist After a Change' },
    {
      type: 'numbered',
      items: [
        'List every type you edited.',
        'If the list includes stable domain entities for a peripheral rule, your seam was wrong.',
        'Prefer adding a type over editing a switch.',
        'Re-run the original use case mentally — OCP is not an excuse to break old paths.',
      ],
    },
    {
      type: 'quote',
      text: '[Change One Thing](/features/change-one-thing) on LLDCanvas drops a new requirement mid-design and scores how small your blast radius stays against an OCP-compliant ideal.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Five Interview Twists and Low-Blast Responses' },
    {
      type: 'table',
      headers: ['Twist', 'Bad reaction', 'Low blast-radius move'],
      rows: [
        [
          'Add a second payment provider',
          'Edit CheckoutService if-else',
          'New PaymentGateway implementation',
        ],
        [
          'Add retry once on soft failure',
          'Copy retry into every provider',
          'Decorator around PaymentGateway',
        ],
        [
          'Add student discount',
          'Sprinkle if (student) in fare math',
          'PricingStrategy / discount policy object',
        ],
        [
          'Audit every state change',
          'Log calls in every mutator',
          'Domain event or auditing interceptor at the seam',
        ],
        [
          'Support read-only guest mode',
          'Boolean flags across services',
          'Authorization policy consulted at use-case entry',
        ],
      ],
    },
    {
      type: 'paragraph',
      text: 'When you practice, time how long the twist takes. Under five minutes with a clear narration is a strong signal. Fifteen minutes of redrawing usually means the first design hid the volatility inside concrete types.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'What to say when you did not leave a seam',
    },
    {
      type: 'paragraph',
      text: 'Be honest: “I hardcoded email sends inside OrderService, so this change forces an edit there. I would extract a Notifier interface now, migrate the email impl, then add SMS.” Interviewers respect a clean recovery more than a pretend-perfect first draft.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'OCP vs Long-Term Evolution' },
    {
      type: 'paragraph',
      text: 'OCP drills are **local**: one change, minimal edits. Multi-stage product growth — new markets, debt, scale — needs a longer lens. Continue with [evolving software design as requirements grow](/blog/evolving-software-design-requirements) when you are ready for multi-stage thinking.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Key Takeaways' },
    {
      type: 'bullets',
      items: [
        'Requirement twists test OCP and calm under pressure.',
        'Identify volatility early; place interfaces there.',
        'Measure success by blast radius, not by pattern count.',
        'Extend with new types when the variation is behavioral.',
      ],
    },
    {
      type: 'quote',
      text: 'Practice absorbing one surgical change at a time in [Change One Thing](/features/change-one-thing).',
    },
  ],
}
