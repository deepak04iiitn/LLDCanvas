import type { FeatureBlogSeed } from './types'

/** Feature: Debug Lab — annotate / identify design violations on UML. */
export const debugLabBlog: FeatureBlogSeed = {
  featurePath: '/features/debug-lab',
  featureName: 'Debug Lab',
  seoPlan: {
    primaryKeyword: 'common LLD design mistakes',
    secondaryKeywords: [
      'UML design smells',
      'god class example',
      'tight coupling LLD',
      'SOLID violations examples',
    ],
    searchIntent: 'Informational — learn to spot structural flaws in class diagrams',
    suggestedCoverAlt: 'UML class diagram with callouts marking God Class and tight coupling smells',
  },
  slug: 'common-lld-design-mistakes',
  title: 'Common LLD Design Mistakes (And How to Spot Them on a Class Diagram)',
  subtitle: 'Train your eye for God classes, wrong inheritance, and coupling problems before the interviewer does',
  excerpt:
    'A field guide to the design mistakes that show up most often in LLD interviews and code reviews — with diagram-level cues you can practice recognizing quickly.',
  category: 'Object-Oriented Design',
  tags: ['LLD', 'Design Smells', 'UML', 'SOLID', 'God Class', 'Interview Prep'],
  isFeatured: false,
  relatedSlugs: [
    'how-to-fix-broken-ood-design',
    'solid-principles-explained',
    'refactoring-monolithic-design-lld',
    'oop-concepts-for-interviews',
  ],
  seo: {
    metaTitle: 'Common LLD Design Mistakes on Class Diagrams | LLDCanvas',
    metaDescription:
      'Learn the most common LLD design mistakes — God Class, SRP breaches, wrong inheritance, tight coupling — and how to spot them quickly on a UML class diagram.',
    keywords: [
      'common LLD design mistakes',
      'UML design smells',
      'god class example',
      'tight coupling LLD',
      'SOLID violations examples',
    ],
  },
  faq: [
    {
      q: 'What is a God Class in LLD?',
      a: 'A God Class concentrates too many responsibilities — persistence, business rules, notifications, formatting — into one type. On a diagram it often shows a huge method list and many outgoing dependencies.',
    },
    {
      q: 'How do I spot tight coupling on a UML diagram?',
      a: 'Look for concrete-to-concrete dependencies where an abstraction should exist, or a hub class that every other type knows about. Many arrows into one box is a warning sign.',
    },
    {
      q: 'Is inheritance always a design mistake?',
      a: 'No — but inheritance used for code reuse between unrelated concepts, or deep fragile hierarchies, is a frequent LLD smell. Prefer composition when the relationship is “has-a” or behavior varies independently.',
    },
  ],
  content: [
    {
      type: 'paragraph',
      text: 'In LLD rounds, interviewers often care as much about what you **refuse** to put in a class as what you include. Candidates who can name smells on a diagram — before writing a line of implementation — look senior. Candidates who only notice problems after the code is a mess look junior, even if they eventually fix it.',
    },
    {
      type: 'paragraph',
      text: 'This guide catalogs the **common LLD design mistakes** you should recognize from structure alone, plus the visual cues that give them away on a class diagram.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: '1. God Class / Blob' },
    {
      type: 'paragraph',
      text: 'One type owns the universe: validation, storage, email, pricing, and UI mapping.',
    },
    {
      type: 'bullets',
      items: [
        '**Diagram cue:** long method list; many associations leaving a single box.',
        '**Interview cue:** you struggle to name the class in one phrase.',
        '**First question:** “What are the reasons this class would change?” If you list three unrelated reasons, SRP is already on fire.',
      ],
    },
    {
      type: 'code',
      lang: 'text',
      code: 'OrderManager\n  + createOrder()\n  + validatePayment()\n  + chargeCard()\n  + sendEmail()\n  + updateInventory()\n  + renderInvoicePdf()\n  + writeMetrics()',
    },
    { type: 'heading', level: 2, text: '2. Wrong Inheritance' },
    {
      type: 'paragraph',
      text: 'Inheritance models **is-a** that preserves behavior expectations (Liskov). Using it as a cheap share-methods tool creates fragile hierarchies.',
    },
    {
      type: 'bullets',
      items: [
        '**Classic smell:** `Stack extends ArrayList` — stacks are not array lists.',
        '**Classic smell:** `Square extends Rectangle` when setters break invariants.',
        '**Diagram cue:** inheritance arrow between types that need different lifecycles or contracts.',
      ],
    },
    { type: 'heading', level: 2, text: '3. Missing Abstraction at a Volatility Point' },
    {
      type: 'paragraph',
      text: 'If the prompt mentions multiple providers, channels, or strategies, and your diagram only shows concrete classes calling each other, OCP pain is coming.',
    },
    {
      type: 'bullets',
      items: [
        '**Diagram cue:** no interfaces near payment, notification, or pricing.',
        '**Fix direction:** introduce a port (interface) and keep the domain service depending on it.',
      ],
    },
    { type: 'heading', level: 2, text: '4. Tight Coupling Hubs' },
    {
      type: 'paragraph',
      text: 'A hub knows everyone and everyone knows the hub. Changes radiate.',
    },
    {
      type: 'table',
      headers: ['Smell', 'What you see', 'Typical fix direction'],
      rows: [
        ['God Class', 'One huge classifier', 'Extract collaborators by responsibility'],
        ['Feature envy', 'Methods mostly use another type’s data', 'Move behavior closer to the data'],
        ['Concrete dependency', 'Service → StripeClient directly', 'Depend on PaymentGateway'],
        ['Anemic domain', 'Data bags + procedural service', 'Push behavior onto domain types or accept DTO stereotype'],
      ],
    },
    { type: 'heading', level: 2, text: '5. Relationship Lies' },
    {
      type: 'bullets',
      items: [
        'Using inheritance where association belongs.',
        'Composition (filled diamond) for a shared, independently lifecycle’d object.',
        'Omitting multiplicity when cardinality is the whole point (seats, inventory).',
      ],
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'A 90-Second Diagram Scan Checklist' },
    {
      type: 'numbered',
      items: [
        'Can I name each type’s job in under six words?',
        'Which types change when product adds a new vendor/channel/rule?',
        'Are there interfaces at those change points?',
        'Is any box a dependency magnet?',
        'Do inheritance arrows survive a Liskov sniff test?',
      ],
    },
    {
      type: 'quote',
      text: 'Spotting is a skill of its own. [Debug Lab](/features/debug-lab) puts real violations on UML diagrams and asks you to annotate them before revealing the authoritative breakdown — critique practice without rewriting yet.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Practice: Annotate This Mental Diagram' },
    {
      type: 'paragraph',
      text: '`UserController` validates input, hashes passwords, writes to MySQL, sends welcome email, and updates a Redis session. Without drawing tools, list three smells and the diagram cue for each.',
    },
    {
      type: 'bullets',
      items: [
        '**God / SRP** — one type with unrelated change reasons (auth, persistence, mail, cache).',
        '**Concrete coupling** — MySQL and Redis named inside a controller-shaped type.',
        '**Missing ports** — no `UserRepository`, `PasswordHasher`, or `Mailer` abstractions.',
      ],
    },
    {
      type: 'paragraph',
      text: 'If you only wrote “bad design,” push yourself to the cue level. Interviewers buy specificity.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'From Spotting to Fixing' },
    {
      type: 'paragraph',
      text: 'Recognition is step one. Interviews also ask you to restructure. When you are ready to remediate God Classes and SRP breaches on the canvas, continue with [how to fix a broken object-oriented design](/blog/how-to-fix-broken-ood-design) and the hands-on [Debug & Fix](/features/debug-and-fix) mode.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Key Takeaways' },
    {
      type: 'bullets',
      items: [
        'Learn diagram-level cues for God Class, wrong inheritance, and coupling hubs.',
        'Ask what would force each type to change — SRP becomes concrete.',
        'Put abstractions where requirements historically churn.',
        'Practice spotting on purpose; do not wait for production pain.',
      ],
    },
    {
      type: 'quote',
      text: 'Train your eye on authored broken diagrams in [Debug Lab](/features/debug-lab), then graduate to repairing them when you are ready.',
    },
  ],
}
