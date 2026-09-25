import { ChallengePack, type ChallengePackType } from '../../models/studio/challenge-pack.model'
import { ChallengeAttempt } from '../../models/studio/challenge-attempt.model'
import { createError } from '../../middleware/error'
import { structuralDiff } from '../graph/structuralDiff'
import { scoreDiagram } from '../graph/scoreEngine'
import {
  gradeDebuggerMarks,
  nextHint,
  parseDebuggerPayload,
  type UserMark,
} from './debuggerGrade'
import { verifyDebuggerRepair } from './debuggerVerify'
import { gradeRefactor } from './refactorGrade'
import { gradeChange, type ChangePrediction } from './changeGrade'
import {
  findStage,
  getEvolutionStages,
  gradeEvolutionStage,
  type EvolutionStageSubmission,
} from './evolutionGrade'

async function resolvePublishedPack(idOrSlug: string, type?: ChallengePackType) {
  let pack = null
  if (/^[a-f\d]{24}$/i.test(idOrSlug)) {
    pack = await ChallengePack.findOne({
      _id: idOrSlug,
      status: 'published',
      ...(type ? { type } : {}),
    })
  }
  if (!pack) {
    pack = await ChallengePack.findOne({
      slug: idOrSlug,
      status: 'published',
      ...(type ? { type } : {}),
    })
  }
  if (!pack) throw createError('Challenge not found', 404)
  return pack
}

function pushLog(
  attempt: { consoleLog?: unknown[] },
  level: string,
  message: string,
) {
  attempt.consoleLog = [
    ...((attempt.consoleLog as { t: number; level: string; message: string }[]) ?? []),
    { t: Date.now(), level, message },
  ].slice(-80)
}

export async function startSession(
  userId: string,
  packIdOrSlug: string,
  type?: ChallengePackType,
) {
  // Prefer resuming an in-progress attempt for this pack (slug URLs / refresh-safe).
  return openSession(userId, packIdOrSlug, type)
}

/** Open by pack slug/id: resume in-progress attempt or create a new one. */
export async function openSession(
  userId: string,
  packIdOrSlug: string,
  type?: ChallengePackType,
) {
  const pack = await resolvePublishedPack(packIdOrSlug, type)

  const existing = await ChallengeAttempt.findOne({
    userId,
    packId: pack._id,
    status: 'in_progress',
  }).sort({ startedAt: -1 })

  if (existing) {
    return {
      attemptId: existing.id,
      pack: serializePack(pack),
      resumed: true,
    }
  }

  const attempt = await ChallengeAttempt.create({
    packId: pack._id,
    userId,
    type: pack.type,
    status: 'in_progress',
    stage: 'detect',
    diagramData: pack.diagramSnapshot,
    marks: [],
    hintsUsed: 0,
    consoleLog: [
      {
        t: Date.now(),
        level: 'info',
        message:
          pack.type === 'evolution'
            ? 'Evolution track started — understand the baseline, then respond to each pressure.'
            : 'Session started — investigate the design.',
      },
    ],
    startedAt: new Date(),
    result: {
      stage: 'detect',
      revealCount: parseDebuggerPayload(pack.payload).revealCount,
    },
    progress:
      pack.type === 'evolution'
        ? {
            stageIndex: 0,
            versions: [
              {
                stageId: 'v0',
                dayLabel: 'Day 0',
                title: 'Baseline',
                decision: 'noop',
                diagram: pack.diagramSnapshot,
                pressures: [],
                classify: { keep: [], change: [], introduce: [], remove: [] },
              },
            ],
            debt: { open: [], resolved: [], score: 0 },
            decisionLog: [],
            draft: null,
          }
        : {},
  })
  return {
    attemptId: attempt.id,
    pack: serializePack(pack),
    resumed: false,
  }
}

function serializePack(pack: {
  id?: string
  _id?: { toString(): string }
  type: string
  slug: string
  title: string
  description: string
  difficulty: string
  payload: unknown
  diagramSnapshot: unknown
}) {
  return {
    id: String(pack.id ?? pack._id ?? pack.slug),
    type: pack.type,
    slug: pack.slug,
    title: pack.title,
    description: pack.description,
    difficulty: pack.difficulty,
    payload: pack.payload,
    diagramSnapshot: pack.diagramSnapshot,
  }
}

export async function getSession(attemptId: string, userId: string) {
  const attempt = await ChallengeAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) throw createError('Session not found', 404)
  const pack = await ChallengePack.findById(attempt.packId)
  return { attempt, pack }
}

export async function markDebuggerIssue(
  attemptId: string,
  userId: string,
  mark: { elementId: string; category: string; why?: string },
) {
  const attempt = await ChallengeAttempt.findOne({
    _id: attemptId,
    userId,
    type: 'debugger',
  })
  if (!attempt) throw createError('Session not found', 404)
  if (!['detect', 'diagnose'].includes(attempt.stage)) {
    throw createError('Cannot mark issues after diagnosis is locked', 400)
  }

  const marks = (attempt.marks as UserMark[]) ?? []
  const idx = marks.findIndex(m => m.elementId === mark.elementId)
  const next: UserMark = {
    elementId: mark.elementId,
    category: mark.category,
    why: mark.why ?? '',
  }
  if (idx >= 0) marks[idx] = next
  else marks.push(next)

  attempt.marks = marks
  attempt.stage = 'diagnose'
  pushLog(attempt, 'ok', `Issue marked on ${mark.elementId}: ${mark.category}`)
  attempt.result = {
    ...(attempt.result ?? {}),
    stage: 'diagnose',
    markCount: marks.length,
  }
  await attempt.save()
  return { marks, stage: attempt.stage, consoleLog: attempt.consoleLog }
}

export async function diagnoseDebugger(attemptId: string, userId: string) {
  const attempt = await ChallengeAttempt.findOne({
    _id: attemptId,
    userId,
    type: 'debugger',
  })
  if (!attempt) throw createError('Session not found', 404)
  const pack = await ChallengePack.findById(attempt.packId)
  if (!pack) throw createError('Pack missing', 404)

  const payload = parseDebuggerPayload(pack.payload)
  const grade = gradeDebuggerMarks(
    (attempt.marks as UserMark[]) ?? [],
    payload.expectedIssues ?? [],
  )

  attempt.marks = grade.gradedMarks
  attempt.stage = 'repair'
  attempt.status = 'submitted'
  pushLog(attempt, 'ok', grade.feedbackSummary)

  const beforeScore = scoreDiagram(
    ((pack.diagramSnapshot as { nodes?: unknown[] })?.nodes ?? []) as Parameters<typeof scoreDiagram>[0],
    ((pack.diagramSnapshot as { edges?: unknown[] })?.edges ?? []) as Parameters<typeof scoreDiagram>[1],
  )

  attempt.result = {
    ...(attempt.result ?? {}),
    stage: 'repair',
    found: grade.found,
    total: grade.total,
    revealCount: payload.revealCount,
    investigationPct: grade.investigationPct,
    diagnosisPct: grade.diagnosisPct,
    feedbackSummary: grade.feedbackSummary,
    reveal: grade.reveal,
    gradedMarks: grade.gradedMarks,
    scores: { before: beforeScore },
    requirement: payload.requirement,
    briefing: payload.briefing,
  }
  await attempt.save()
  return {
    stage: attempt.stage,
    result: attempt.result,
    marks: attempt.marks,
    consoleLog: attempt.consoleLog,
  }
}

/** Legacy submit = diagnose with provided marks */
export async function submitDebugger(
  attemptId: string,
  userId: string,
  marks: { elementId?: string; category?: string; why?: string }[],
) {
  const attempt = await ChallengeAttempt.findOne({
    _id: attemptId,
    userId,
    type: 'debugger',
  })
  if (!attempt) throw createError('Session not found', 404)
  attempt.marks = marks.map(m => ({
    elementId: String(m.elementId ?? ''),
    category: String(m.category ?? 'Other'),
    why: m.why ?? '',
  }))
  await attempt.save()
  return diagnoseDebugger(attemptId, userId)
}

export async function hintDebugger(
  attemptId: string,
  userId: string,
  focusElementId?: string,
) {
  const attempt = await ChallengeAttempt.findOne({
    _id: attemptId,
    userId,
    type: 'debugger',
  })
  if (!attempt) throw createError('Session not found', 404)
  const pack = await ChallengePack.findById(attempt.packId)
  if (!pack) throw createError('Pack missing', 404)
  const payload = parseDebuggerPayload(pack.payload)
  const hint = nextHint(payload.expectedIssues ?? [], attempt.hintsUsed, focusElementId)
  if (!hint) throw createError('No hints available', 404)

  attempt.hintsUsed = (attempt.hintsUsed ?? 0) + 1
  pushLog(attempt, 'warn', `Hint ${hint.hintIndex + 1}: ${hint.hint}`)
  await attempt.save()
  return {
    hint: hint.hint,
    hintIndex: hint.hintIndex,
    issueId: hint.issueId,
    hintsUsed: attempt.hintsUsed,
    consoleLog: attempt.consoleLog,
  }
}

export async function repairDebugger(
  attemptId: string,
  userId: string,
  diagramData: Record<string, unknown>,
) {
  const attempt = await ChallengeAttempt.findOne({
    _id: attemptId,
    userId,
    type: 'debugger',
  })
  if (!attempt) throw createError('Session not found', 404)
  if (!['repair', 'verify'].includes(attempt.stage)) {
    throw createError('Complete diagnosis before repair', 400)
  }
  const pack = await ChallengePack.findById(attempt.packId)
  if (!pack) throw createError('Pack missing', 404)

  const payload = parseDebuggerPayload(pack.payload)
  const before = (pack.diagramSnapshot ?? {}) as Record<string, unknown>
  const verify = verifyDebuggerRepair(before, diagramData, payload)

  attempt.diagramData = diagramData
  attempt.stage = 'complete'
  attempt.status = 'revealed'
  pushLog(
    attempt,
    verify.passed === verify.total ? 'ok' : 'warn',
    `Architecture verification: ${verify.passed}/${verify.total} checks passed.`,
  )

  const elapsedSec = Math.round(
    (Date.now() - new Date(attempt.startedAt ?? attempt.createdAt).getTime()) / 1000,
  )

  attempt.result = {
    ...(attempt.result ?? {}),
    stage: 'complete',
    verificationReport: {
      checks: verify.checks,
      passed: verify.passed,
      total: verify.total,
    },
    scores: verify.scores,
    refactoringPct: verify.refactoringPct,
    hintsUsed: attempt.hintsUsed,
    elapsedSec,
    investigationPct: (attempt.result as { investigationPct?: number })?.investigationPct ?? 0,
    diagnosisPct: (attempt.result as { diagnosisPct?: number })?.diagnosisPct ?? 0,
  }
  await attempt.save()
  return {
    stage: attempt.stage,
    result: attempt.result,
    consoleLog: attempt.consoleLog,
  }
}

export async function revealDebugger(attemptId: string, userId: string) {
  const { attempt, pack } = await getSession(attemptId, userId)
  if (attempt.type !== 'debugger') throw createError('Not a debugger session', 400)
  return {
    result: attempt.result,
    expectedIssues: parseDebuggerPayload(pack?.payload).expectedIssues,
  }
}

export async function submitStructuralChallenge(
  attemptId: string,
  userId: string,
  diagramData: Record<string, unknown>,
  allowedTypes: ChallengePackType[] = ['refactor', 'change_one'],
) {
  const attempt = await ChallengeAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) throw createError('Session not found', 404)
  if (!allowedTypes.includes(attempt.type as ChallengePackType)) {
    throw createError('Wrong challenge type', 400)
  }

  // Dedicated graders
  if (attempt.type === 'refactor') {
    return submitRefactor(attemptId, userId, diagramData)
  }
  if (attempt.type === 'change_one') {
    return submitChange(attemptId, userId, diagramData)
  }

  const pack = await ChallengePack.findById(attempt.packId)
  if (!pack) throw createError('Pack missing', 404)

  const before = pack.diagramSnapshot
  const after = diagramData
  const entries = structuralDiff(
    before as { nodes?: unknown[]; edges?: unknown[] },
    after as { nodes?: unknown[]; edges?: unknown[] },
  )
  const score = scoreDiagram(
    (after.nodes ?? []) as Parameters<typeof scoreDiagram>[0],
    (after.edges ?? []) as Parameters<typeof scoreDiagram>[1],
  )

  const narrative = `You made ${entries.length} structural change(s). Prefer the smallest change that satisfies the requirement.`

  attempt.diagramData = after
  attempt.status = 'submitted'
  attempt.result = { diff: entries, score, narrative }
  await attempt.save()
  return { result: attempt.result }
}

export async function saveRefactor(
  attemptId: string,
  userId: string,
  diagramData: Record<string, unknown>,
) {
  const attempt = await ChallengeAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) throw createError('Session not found', 404)
  if (attempt.type !== 'refactor') throw createError('Not a refactor session', 400)
  if (attempt.status === 'submitted') throw createError('Already submitted', 400)

  attempt.diagramData = diagramData
  pushLog(attempt, 'info', 'Working diagram saved')
  await attempt.save()
  return { ok: true, diagramData: attempt.diagramData }
}

export async function submitRefactor(
  attemptId: string,
  userId: string,
  diagramData: Record<string, unknown>,
) {
  const attempt = await ChallengeAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) throw createError('Session not found', 404)
  if (attempt.type !== 'refactor') throw createError('Not a refactor session', 400)

  const pack = await ChallengePack.findById(attempt.packId)
  if (!pack) throw createError('Pack missing', 404)

  const before = (pack.diagramSnapshot ?? {}) as Record<string, unknown>
  const after = diagramData
  const grade = gradeRefactor(before, after, pack.payload)

  attempt.diagramData = after
  attempt.status = 'submitted'
  attempt.stage = 'complete'
  attempt.result = grade as unknown as Record<string, unknown>
  pushLog(
    attempt,
    grade.accepted ? 'ok' : 'warn',
    grade.narrative,
  )
  await attempt.save()
  return { result: attempt.result, consoleLog: attempt.consoleLog }
}

export async function saveChange(
  attemptId: string,
  userId: string,
  diagramData: Record<string, unknown>,
  prediction?: ChangePrediction | null,
) {
  const attempt = await ChallengeAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) throw createError('Session not found', 404)
  if (attempt.type !== 'change_one') throw createError('Not a change session', 400)
  if (attempt.status === 'submitted') throw createError('Already submitted', 400)

  attempt.diagramData = diagramData
  if (prediction) {
    attempt.result = {
      ...(attempt.result && typeof attempt.result === 'object' ? attempt.result : {}),
      draftPrediction: prediction,
    }
  }
  pushLog(attempt, 'info', 'Working diagram saved')
  await attempt.save()
  return { ok: true, diagramData: attempt.diagramData }
}

export async function submitChange(
  attemptId: string,
  userId: string,
  diagramData: Record<string, unknown>,
  prediction?: ChangePrediction | null,
) {
  const attempt = await ChallengeAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) throw createError('Session not found', 404)
  if (attempt.type !== 'change_one') throw createError('Not a change session', 400)

  const pack = await ChallengePack.findById(attempt.packId)
  if (!pack) throw createError('Pack missing', 404)

  const before = (pack.diagramSnapshot ?? {}) as Record<string, unknown>
  const after = diagramData
  const draftPred =
    prediction ??
    ((attempt.result as { draftPrediction?: ChangePrediction } | undefined)?.draftPrediction ??
      null)
  const grade = gradeChange(before, after, pack.payload, draftPred)

  attempt.diagramData = after
  attempt.status = 'submitted'
  attempt.stage = 'complete'
  attempt.result = grade as unknown as Record<string, unknown>
  pushLog(attempt, grade.accepted ? 'ok' : 'warn', grade.narrative)
  await attempt.save()
  return { result: attempt.result, consoleLog: attempt.consoleLog }
}

// ─── Architecture Evolution ───────────────────────────────────────────────

type EvolutionProgress = {
  stageIndex: number
  versions: Record<string, unknown>[]
  debt: { open: string[]; resolved: string[]; score: number }
  decisionLog: Record<string, unknown>[]
  draft?: Record<string, unknown> | null
  lastStageGrade?: Record<string, unknown>
}

function readEvolutionProgress(attempt: {
  progress?: Record<string, unknown>
  diagramData?: Record<string, unknown>
}): EvolutionProgress {
  const p = (attempt.progress ?? {}) as Partial<EvolutionProgress>
  return {
    stageIndex: typeof p.stageIndex === 'number' ? p.stageIndex : 0,
    versions: Array.isArray(p.versions) ? p.versions : [],
    debt: p.debt ?? { open: [], resolved: [], score: 0 },
    decisionLog: Array.isArray(p.decisionLog) ? p.decisionLog : [],
    draft: p.draft ?? null,
    lastStageGrade: p.lastStageGrade,
  }
}

export async function saveEvolution(
  attemptId: string,
  userId: string,
  diagramData: Record<string, unknown>,
  draft?: Record<string, unknown> | null,
) {
  const attempt = await ChallengeAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) throw createError('Session not found', 404)
  if (attempt.type !== 'evolution') throw createError('Not an evolution session', 400)
  if (attempt.status === 'submitted') throw createError('Already submitted', 400)

  attempt.diagramData = diagramData
  const progress = readEvolutionProgress(attempt)
  if (draft) progress.draft = draft
  attempt.progress = progress as unknown as Record<string, unknown>
  attempt.markModified('progress')
  pushLog(attempt, 'info', 'Evolution progress saved')
  await attempt.save()
  return { ok: true, diagramData: attempt.diagramData, progress: attempt.progress }
}

export async function submitEvolutionStage(
  attemptId: string,
  userId: string,
  submission: EvolutionStageSubmission,
) {
  const attempt = await ChallengeAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) throw createError('Session not found', 404)
  if (attempt.type !== 'evolution') throw createError('Not an evolution session', 400)
  if (attempt.status === 'submitted') throw createError('Track already complete', 400)

  const pack = await ChallengePack.findById(attempt.packId)
  if (!pack) throw createError('Pack missing', 404)

  const stages = getEvolutionStages(pack.payload)
  const progress = readEvolutionProgress(attempt)
  const stageIndex = progress.stageIndex
  const stage = findStage(pack.payload, stageIndex)
  if (!stage) throw createError('No more stages', 400)

  const before =
    (progress.versions.length
      ? (progress.versions[progress.versions.length - 1]?.diagram as Record<string, unknown>)
      : null) ??
    (pack.diagramSnapshot as Record<string, unknown>) ??
    {}

  const after =
    submission.decision === 'noop'
      ? before
      : ((submission.diagram ?? attempt.diagramData ?? before) as Record<string, unknown>)

  // Surface deferred debt coming due
  const dueDebt = progress.debt.open.filter(id => {
    const earlier = stages.find(s => s.debtOpportunity?.id === id)
    return earlier?.debtOpportunity?.laterStageId === stage.id
  })

  const grade = gradeEvolutionStage(
    before,
    after,
    stage,
    submission,
    progress.debt.open.length,
  )

  if (dueDebt.length) {
    grade.narrative =
      `Deferred debt is due (${dueDebt.join(', ')}). ${grade.narrative}`
    grade.dimensions = [
      ...grade.dimensions,
      {
        key: 'debt_due',
        label: 'Deferred debt due',
        ok: false,
        detail: dueDebt
          .map(id => {
            const s = stages.find(x => x.debtOpportunity?.id === id)
            return s?.debtOpportunity?.costIfDeferred ?? id
          })
          .join('; '),
        score: 30,
      },
    ]
  }

  // Update debt ledger
  for (const act of submission.debtActions ?? []) {
    if (act.action === 'defer' && !progress.debt.open.includes(act.id)) {
      progress.debt.open.push(act.id)
      progress.debt.score += 1
    }
    if (act.action === 'fix') {
      progress.debt.open = progress.debt.open.filter(id => id !== act.id)
      if (!progress.debt.resolved.includes(act.id)) progress.debt.resolved.push(act.id)
    }
  }
  // Auto-resolve due debt ids that were fixed this stage (touched expected hints)
  for (const id of dueDebt) {
    if (submission.decision === 'change' && grade.accepted) {
      progress.debt.open = progress.debt.open.filter(x => x !== id)
      if (!progress.debt.resolved.includes(id)) progress.debt.resolved.push(id)
    }
  }

  const versionEntry = {
    stageId: stage.id,
    dayLabel: stage.dayLabel,
    title: stage.title,
    decision: grade.decision,
    diagram: after,
    pressures: submission.pressures ?? [],
    classify: submission.classify ?? {},
    why: submission.why ?? [],
    whyNote: submission.whyNote,
    tradeoffsAck: submission.tradeoffsAck ?? [],
    debtActions: submission.debtActions ?? [],
    score: grade,
    accepted: grade.accepted,
  }
  progress.versions.push(versionEntry)

  if (submission.why?.length || submission.whyNote) {
    progress.decisionLog.push({
      stageId: stage.id,
      at: Date.now(),
      why: submission.why ?? [],
      whyNote: submission.whyNote,
      components: submission.classify?.introduce ?? [],
      decision: grade.decision,
    })
  }

  progress.lastStageGrade = grade as unknown as Record<string, unknown>
  progress.draft = null

  const nextIndex = stageIndex + 1
  const complete = nextIndex >= stages.length
  if (grade.accepted) {
    progress.stageIndex = nextIndex
  }

  attempt.diagramData = after
  attempt.progress = progress as unknown as Record<string, unknown>
  attempt.markModified('progress')
  attempt.result = {
    ...(attempt.result && typeof attempt.result === 'object' ? attempt.result : {}),
    lastStageGrade: grade,
    stageIndex: progress.stageIndex,
    complete,
  }

  if (complete && grade.accepted) {
    attempt.status = 'submitted'
    attempt.stage = 'complete'
  }

  pushLog(attempt, grade.accepted ? 'ok' : 'warn', grade.narrative)
  await attempt.save()

  return {
    grade,
    progress: attempt.progress,
    complete: complete && grade.accepted,
    nextStageIndex: progress.stageIndex,
    consoleLog: attempt.consoleLog,
  }
}

export async function getEvolutionJourney(attemptId: string, userId: string) {
  const attempt = await ChallengeAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) throw createError('Session not found', 404)
  if (attempt.type !== 'evolution') throw createError('Not an evolution session', 400)
  const pack = await ChallengePack.findById(attempt.packId)
  const progress = readEvolutionProgress(attempt)
  const stages = getEvolutionStages(pack?.payload)

  return {
    pack: pack ? serializePack(pack) : null,
    progress,
    stages: stages.map(s => ({
      id: s.id,
      dayLabel: s.dayLabel,
      title: s.title,
      category: s.category,
      mustChange: s.mustChange,
    })),
    complete: attempt.status === 'submitted',
  }
}

export async function listPublishedPacks(type?: ChallengePackType) {
  const filter: Record<string, unknown> = { status: 'published' }
  if (type) filter.type = type
  return ChallengePack.find(filter)
    .select('type slug title difficulty description tags planMin order')
    .sort({ order: 1, createdAt: -1 })
    .lean()
}
