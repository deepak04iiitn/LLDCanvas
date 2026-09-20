import { Request, Response, NextFunction } from 'express'
import { RoguelikeRun } from '../../models/learn/roguelike-run.model'
import { createError } from '../../middleware/error'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

const LEVEL_PROMPTS = [
  'Design a Parking Lot with vehicle types and fee strategies.',
  'Add surge pricing and payment provider abstraction to a Ride-sharing core.',
  'Support notifications without coupling domain services to channels.',
  'Introduce a plugin point for new pricing rules without editing callers.',
  'Design a Cart checkout with ports for payment and inventory reservation.',
  'Model an Elevator system with replaceable dispatch strategies.',
  'Build a Library borrow/return flow with late-fee policies.',
  'Design a Rate Limiter (token bucket vs sliding window) behind a strategy.',
  'Create a Chat room with message fan-out and presence as separate concerns.',
  'Design movie ticket booking with seat holds and a payment port.',
  'Model ATM session states with a BankPort adapter.',
  'Design a social feed publish path using domain events (no vendor push in domain).',
  'Build expense splitting (Splitwise-lite) with an optional simplify-debt strategy.',
  'Design document sharing with ACL checks (proxy/policy) and share links.',
  'Model subscription billing with plan changes and a PaymentGateway port.',
  'Design warehouse fulfillment routing across multiple warehouses.',
  'Create a quiz engine with pluggable scoring strategies.',
  'Design a vending machine with State for coin/selection flows.',
  'Build a media player with Decoder plugins and a playlist.',
  'Design leave approval as a chain of responsibility with notifications.',
]

const MODIFIER_POOL = [
  'No inheritance — composition only',
  'Max 6 classes',
  'Max 8 classes',
  'Must use Strategy',
  'Must use Observer or domain events',
  'No Singleton',
  'Prefer interfaces over concrete deps',
  'No god services — SRP enforced',
  'Must introduce at least one port/adapter',
  'No if/else on type codes for behaviour',
  'Must support undoing the last action (Command)',
  'Add a decorator for logging without editing cores',
  'Fail closed on authz decisions',
  'Make payment calls idempotent',
  'Separate read model from write model (light CQRS)',
]

export async function startRoguelike(req: Request, res: Response, next: NextFunction) {
  try {
    const modifiers = [...MODIFIER_POOL].sort(() => Math.random() - 0.5).slice(0, 2)
    const prompt =
      LEVEL_PROMPTS[Math.floor(Math.random() * LEVEL_PROMPTS.length)] ?? LEVEL_PROMPTS[0]
    const run = await RoguelikeRun.create({
      userId: req.user!.id,
      level: 1,
      modifiers,
      status: 'active',
      score: 0,
      currentPrompt: prompt,
    })
    res.status(201).json({
      runId: run.id,
      run: {
        id: run.id,
        level: run.level,
        modifiers: run.modifiers,
        status: run.status,
        score: run.score,
        currentPrompt: run.currentPrompt,
      },
    })
  } catch (e) {
    next(e)
  }
}

export async function getRoguelike(req: Request, res: Response, next: NextFunction) {
  try {
    const run = await RoguelikeRun.findOne({
      _id: paramId(req.params.runId),
      userId: req.user!.id,
    }).lean()
    if (!run) throw createError('Run not found', 404)
    res.json({
      run: {
        id: String(run._id),
        level: run.level,
        modifiers: run.modifiers,
        status: run.status,
        score: run.score,
        currentPrompt: run.currentPrompt,
        createdAt: run.createdAt,
      },
    })
  } catch (e) {
    next(e)
  }
}
