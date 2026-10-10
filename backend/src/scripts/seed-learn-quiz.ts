/**
 * Seed ~10 Daily LLD Quiz questions (idempotent by slug).
 * Run: npx ts-node -r dotenv/config src/scripts/seed-learn-quiz.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { QuizQuestion } from '../models/learn/quiz-question.model'
import { ScoreHeuristicConfig } from '../models/learn/score-heuristic-config.model'

const QUESTIONS = [
  {
    slug: 'dip-payment',
    topic: 'SOLID',
    difficulty: 'easy' as const,
    prompt: 'Depending on Razorpay directly from Payment violates which principle most clearly?',
    choices: ['SRP', 'OCP', 'LSP', 'DIP'],
    correctIndex: 3,
    explanation: 'DIP: depend on abstractions, not concrete providers.',
    status: 'published' as const,
  },
  {
    slug: 'srp-auth-god',
    topic: 'SOLID',
    difficulty: 'easy' as const,
    prompt: 'A class that logs in users, hashes passwords, sends OTP, and writes audit logs most clearly violates…',
    choices: ['LSP', 'ISP', 'SRP', 'DIP'],
    correctIndex: 2,
    explanation: 'Too many reasons to change → SRP.',
    status: 'published' as const,
  },
  {
    slug: 'ocp-ride-pricing',
    topic: 'SOLID',
    difficulty: 'easy' as const,
    prompt: 'Adding a new pricing rule requires editing Ride. Which principle is strained?',
    choices: ['OCP', 'LSP', 'ISP', 'Law of Demeter'],
    correctIndex: 0,
    explanation: 'Open for extension, closed for modification.',
    status: 'published' as const,
  },
  {
    slug: 'lsp-square-rectangle',
    topic: 'SOLID',
    difficulty: 'medium' as const,
    prompt: 'Square inheriting Rectangle and breaking callers that set width/height independently is classic…',
    choices: ['SRP failure', 'LSP failure', 'DIP failure', 'ISP failure'],
    correctIndex: 1,
    explanation: 'Subtype must honor the parent contract.',
    status: 'published' as const,
  },
  {
    slug: 'isp-fat-reader',
    topic: 'SOLID',
    difficulty: 'medium' as const,
    prompt: 'Forcing every client to depend on a huge interface with unused methods violates…',
    choices: ['ISP', 'OCP', 'SRP', 'CRP'],
    correctIndex: 0,
    explanation: 'Interface Segregation — prefer focused interfaces.',
    status: 'published' as const,
  },
  {
    slug: 'strategy-vs-if',
    topic: 'Design Patterns',
    difficulty: 'easy' as const,
    prompt: 'Which approach best allows pricing behaviour to change independently from Ride?',
    choices: [
      'Long if/else on ride type inside Ride',
      'Strategy with interchangeable pricing strategies',
      'Make Ride inherit from Price',
      'Hard-code surge in the UI',
    ],
    correctIndex: 1,
    explanation: 'Strategy keeps algorithms swappable.',
    status: 'published' as const,
  },
  {
    slug: 'no-pattern-needed',
    topic: 'Design Patterns',
    difficulty: 'medium' as const,
    prompt: 'A DTO with three fields and no behaviour — which pattern should you add?',
    choices: ['Factory', 'Singleton', 'Decorator', 'None — a simple data holder is fine'],
    correctIndex: 3,
    explanation: 'Not every structure needs a GoF pattern.',
    status: 'published' as const,
  },
  {
    slug: 'observer-when',
    topic: 'Design Patterns',
    difficulty: 'easy' as const,
    prompt: 'Notify many subscribers when an order status changes — best fit?',
    choices: ['Observer / pub-sub', 'Singleton', 'Flyweight', 'Bridge'],
    correctIndex: 0,
    explanation: 'One-to-many dependency notification.',
    status: 'published' as const,
  },
  {
    slug: 'factory-when',
    topic: 'Design Patterns',
    difficulty: 'easy' as const,
    prompt: 'Create different PaymentGateway implementations based on config without callers knowing classes — use…',
    choices: ['Factory / Factory Method', 'Memento', 'Iterator', 'Visitor'],
    correctIndex: 0,
    explanation: 'Encapsulate creation.',
    status: 'published' as const,
  },
  {
    slug: 'coupling-hub',
    topic: 'Architecture',
    difficulty: 'medium' as const,
    prompt: 'A single class depended on by nearly every other class is usually a…',
    choices: ['Healthy facade always', 'Hub / high fan-in coupling smell', 'Proof of SRP', 'Required Singleton'],
    correctIndex: 1,
    explanation: 'High fan-in hubs concentrate change risk — review boundaries.',
    status: 'published' as const,
  },
]

async function main() {
  await connectDB()
  for (const q of QUESTIONS) {
    await QuizQuestion.findOneAndUpdate({ slug: q.slug }, { $set: q }, { upsert: true })
    console.log(`✓ ${q.slug}`)
  }

  await ScoreHeuristicConfig.findOneAndUpdate(
    { version: 'v1' },
    {
      $set: {
        version: 'v1',
        active: true,
        weights: { coupling: 1, cohesion: 1, complexity: 1, extensibility: 1, solid: 1 },
        copy: {
          disclaimer: 'Design Score is structured feedback, not an absolute measure of design quality.',
        },
      },
    },
    { upsert: true },
  )
  console.log('✓ score-heuristic-config v1')

  console.log(`Done — ${QUESTIONS.length} quiz questions upserted`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
