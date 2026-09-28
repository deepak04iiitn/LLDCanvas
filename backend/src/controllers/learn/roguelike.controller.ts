import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { RoguelikeScenario } from '../../models/learn/roguelike-scenario.model'
import {
  RoguelikeRun,
  ArchitectureHealth,
  RunResources,
  RunEnding,
} from '../../models/learn/roguelike-run.model'
import { createError } from '../../middleware/error'
import { applySkillDeltas } from '../../utils/skill-updater'

function paramId(id: string | string[]): string {
  return Array.isArray(id) ? id[0] : id
}

// ── Design evaluator ──────────────────────────────────────────────────────────

const DEFAULT_NAMES = new Set(['ClassName', 'InterfaceName', 'AbstractClass', 'EnumName'])

export interface DesignCriterion {
  id: string
  label: string
  passed: boolean
  points: number
  maxPoints: number
  hint: string
}

export interface DesignEval {
  score: number
  criteria: DesignCriterion[]
}

type DiagramNode = {
  id: string
  type?: string
  data?: { name?: string; nodeType?: string; attributes?: unknown[]; methods?: unknown[] }
}

function evaluateDiagram(
  snapshot: { nodes: unknown[]; edges: unknown[] } | undefined,
): DesignEval | undefined {
  if (!snapshot) return undefined
  const nodes = snapshot.nodes as DiagramNode[]
  const edges = snapshot.edges as { source: string; target: string; type?: string }[]

  // Zero-node canvas — all criteria fail, score 0
  if (nodes.length === 0) {
    return {
      score: 0,
      criteria: [
        { id: 'nodes',       label: 'Components defined',   passed: false, points: 0, maxPoints: 20, hint: 'Add at least 2–3 components to your diagram' },
        { id: 'connections', label: 'Relationships defined', passed: false, points: 0, maxPoints: 20, hint: 'Draw connections between every component' },
        { id: 'naming',      label: 'Meaningful names',     passed: false, points: 0, maxPoints: 20, hint: 'Name every node to reflect your actual design (e.g. "HotelService")' },
        { id: 'diversity',   label: 'Node type variety',    passed: false, points: 0, maxPoints: 20, hint: 'Mix classes with interfaces or abstract classes' },
        { id: 'structure',   label: 'Attributes & methods', passed: false, points: 0, maxPoints: 20, hint: 'Add attributes and methods to at least half your nodes' },
      ],
    }
  }

  const criteria: DesignCriterion[] = []

  // ── 1. Sufficient nodes (max 20 pts) ─────────────────────────────────────
  // ≥4 nodes: full credit  |  3: good  |  2: minimal  |  1: almost nothing
  const nodeCount = nodes.length
  criteria.push({
    id: 'nodes',
    label: 'Components defined',
    passed: nodeCount >= 3,
    points: nodeCount >= 4 ? 20 : nodeCount === 3 ? 16 : nodeCount === 2 ? 8 : 2,
    maxPoints: 20,
    hint: 'Add at least 3–4 components — a single class is not a design',
  })

  // ── 2. Connections drawn (max 20 pts) ────────────────────────────────────
  // Full credit: every node connected AND at least one relationship type is specified.
  // Partial credit: connected but all plain/untyped edges.
  // Zero: no edges, or orphan nodes remain.
  const connectedNodes = new Set<string>()
  for (const e of edges) { connectedNodes.add(e.source); connectedNodes.add(e.target) }
  const isolated = nodes.filter(n => !connectedNodes.has(n.id)).length
  const allConnected = edges.length > 0 && isolated === 0
  const TYPED_RELS = new Set(['association', 'aggregation', 'composition', 'inheritance', 'realization', 'dependency'])
  const typedEdgeCount = edges.filter(
    e => TYPED_RELS.has((e as any).data?.relationshipType ?? ''),
  ).length
  const hasTypedRels = typedEdgeCount > 0
  criteria.push({
    id: 'connections',
    label: 'Relationships defined',
    passed: allConnected && hasTypedRels,
    points: !allConnected ? 0
      : hasTypedRels ? (typedEdgeCount >= edges.length * 0.75 ? 20 : 14)
      : 7,  // connected but all untyped lines
    maxPoints: 20,
    hint: 'Connect every node and set each relationship type (inheritance, composition, etc.)',
  })

  // ── 3. Meaningful names (max 20 pts) ─────────────────────────────────────
  // Zero tolerance: any bad name → no full credit; ALL bad → 0.
  const isBadName = (raw: string | undefined) => {
    const name = (raw ?? '').trim()
    return name === '' || DEFAULT_NAMES.has(name)
  }
  const badCount = nodes.filter(n => isBadName(n.data?.name)).length
  const allRenamed = badCount === 0
  criteria.push({
    id: 'naming',
    label: 'Meaningful names',
    passed: allRenamed,
    // Even one bad name reduces score; all bad → 0
    points: badCount === 0 ? 20 : badCount === 1 ? 10 : 0,
    maxPoints: 20,
    hint: 'Give every component a real domain name (e.g. "OrderService", "PaymentGateway")',
  })

  // ── 4. Node type variety (max 20 pts) ────────────────────────────────────
  const types = new Set(nodes.map(n => n.data?.nodeType ?? n.type).filter(Boolean))
  const hasDiversity = types.size >= 2
  criteria.push({
    id: 'diversity',
    label: 'Node type variety',
    passed: hasDiversity,
    points: types.size >= 3 ? 20 : hasDiversity ? 12 : 0,
    maxPoints: 20,
    hint: 'Use a mix of classes, interfaces, and abstract classes to model your design properly',
  })

  // ── 5. Structural detail (max 20 pts) ────────────────────────────────────
  // Require at least half the nodes to have both attributes AND methods
  // (just attributes or just methods is partial)
  const withBoth = nodes.filter(
    n => (n.data?.attributes?.length ?? 0) > 0 && (n.data?.methods?.length ?? 0) > 0,
  ).length
  const withEither = nodes.filter(
    n => (n.data?.attributes?.length ?? 0) + (n.data?.methods?.length ?? 0) > 0,
  ).length
  const halfHaveBoth   = withBoth   >= Math.max(1, Math.ceil(nodes.length / 2))
  const halfHaveEither = withEither >= Math.max(1, Math.ceil(nodes.length / 2))
  criteria.push({
    id: 'structure',
    label: 'Attributes & methods',
    passed: halfHaveBoth,
    points: halfHaveBoth ? 20 : halfHaveEither ? 10 : withEither > 0 ? 4 : 0,
    maxPoints: 20,
    hint: 'Add both attributes and methods to at least half your classes — show real responsibility',
  })

  const score = Math.min(100, criteria.reduce((s, c) => s + c.points, 0))
  return { score, criteria }
}

// ── Minimum design score by mode ─────────────────────────────────────────────
const MIN_DESIGN_SCORE: Record<string, number> = {
  beginner:  45,   // need nodes + names + at least some connections
  interview: 60,   // additionally need type variety or structure
  survival:  65,
  hardcore:  75,
  endless:   55,
}

// ── Health helpers ────────────────────────────────────────────────────────────

const INITIAL_HEALTH: ArchitectureHealth = {
  coupling: 30,
  cohesion: 70,
  extensibility: 60,
  complexity: 20,
  reliability: 65,
  debt: 0,
}

function clampHealth(h: ArchitectureHealth): ArchitectureHealth {
  return {
    coupling: Math.max(0, Math.min(100, h.coupling)),
    cohesion: Math.max(0, Math.min(100, h.cohesion)),
    extensibility: Math.max(0, Math.min(100, h.extensibility)),
    complexity: Math.max(0, Math.min(100, h.complexity)),
    reliability: Math.max(0, Math.min(100, h.reliability)),
    debt: Math.max(0, h.debt), // debt unclamped above 0
  }
}

function applyDelta(
  health: ArchitectureHealth,
  delta: Partial<Record<keyof ArchitectureHealth, number>>,
): ArchitectureHealth {
  return clampHealth({
    coupling: health.coupling + (delta.coupling ?? 0),
    cohesion: health.cohesion + (delta.cohesion ?? 0),
    extensibility: health.extensibility + (delta.extensibility ?? 0),
    complexity: health.complexity + (delta.complexity ?? 0),
    reliability: health.reliability + (delta.reliability ?? 0),
    debt: health.debt + (delta.debt ?? 0),
  })
}

function computeEnding(debt: number, isStrategicExit = false): RunEnding {
  if (isStrategicExit) return 'strategic_exit'
  if (debt < 20) return 'survived'
  if (debt < 50) return 'survived_with_debt'
  if (debt < 80) return 'refactor_required'
  return 'collapse'
}

// ── Scenario endpoints ────────────────────────────────────────────────────────

export async function listScenarios(req: Request, res: Response, next: NextFunction) {
  try {
    const scenarios = await RoguelikeScenario.find({ status: 'published' })
      .select('slug title icon description difficulty modes tags order estimatedMinutes initialConstraints')
      .sort({ order: 1 })
      .lean()
    res.json({ scenarios })
  } catch (e) {
    next(e)
  }
}

export async function getScenario(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = paramId(req.params.slug)
    const scenario = await RoguelikeScenario.findOne({ slug, status: 'published' }).lean()
    if (!scenario) throw createError('Scenario not found', 404)
    res.json({ scenario })
  } catch (e) {
    next(e)
  }
}

// ── Run endpoints ─────────────────────────────────────────────────────────────

export async function startRun(req: Request, res: Response, next: NextFunction) {
  try {
    const { scenarioSlug, mode = 'beginner' } = req.body as {
      scenarioSlug?: string
      mode?: string
    }

    // ── Quick Run mode ──────────────────────────────────────────────────────
    let isQuickRun = false
    let maxStages: number | undefined
    let resolvedMode = mode

    if (mode === 'quick') {
      isQuickRun = true
      maxStages = 3
      resolvedMode = 'beginner'
    } else {
      if (!scenarioSlug) throw createError('scenarioSlug is required', 400)
      const validModes = ['beginner', 'interview', 'survival', 'hardcore', 'endless']
      if (!validModes.includes(mode)) throw createError('Invalid run mode', 400)
    }

    // ── Scenario resolution ─────────────────────────────────────────────────
    let scenario = await RoguelikeScenario.findOne({ status: 'published' }).limit(0) // typed placeholder

    if (isQuickRun) {
      // Find first published scenario with at least 3 stages, ordered by display order
      const candidates = await RoguelikeScenario.find({ status: 'published' }).sort({ order: 1 })
      const suitable = candidates.find(s => s.stages.length >= 3) ?? null
      if (!suitable) throw createError('No scenarios available for Quick Run', 404)
      scenario = suitable
    } else {
      scenario = await RoguelikeScenario.findOne({
        slug: scenarioSlug,
        status: 'published',
      })
      if (!scenario) throw createError('Scenario not found', 404)
    }

    const health: ArchitectureHealth = { ...INITIAL_HEALTH }

    const resources: RunResources = {
      engineeringHoursRemaining: scenario!.initialConstraints.engineeringHours,
      complexityBudgetRemaining: scenario!.initialConstraints.complexityBudget,
      teamSize: scenario!.initialConstraints.teamSize,
      infraBudgetRemaining: scenario!.initialConstraints.infraBudget,
      changesRemaining: scenario!.initialConstraints.maxStructuralChanges,
    }

    const effectiveStagesTotal = isQuickRun
      ? Math.min(maxStages!, scenario!.stages.length)
      : scenario!.stages.length

    const run = await RoguelikeRun.create({
      userId: new Types.ObjectId(req.user!.id),
      scenarioId: scenario!._id,
      scenarioSlug: scenario!.slug,
      scenarioTitle: scenario!.title,
      mode: resolvedMode,
      status: 'active',
      currentStageOrder: 1,
      stages: [],
      health,
      resources,
      checkpoints: [],
      totalDecisions: 0,
      totalRefactors: 0,
      majorFailures: 0,
      stagesTotal: effectiveStagesTotal,
      ...(isQuickRun ? { maxStages } : {}),
      startedAt: new Date(),
    })

    res.status(201).json({
      runId: run.id,
      run: {
        id: run.id,
        scenarioSlug: run.scenarioSlug,
        scenarioTitle: run.scenarioTitle,
        mode: run.mode,
        status: run.status,
        currentStageOrder: run.currentStageOrder,
        health: run.health,
        resources: run.resources,
        stagesTotal: run.stagesTotal,
        startedAt: run.startedAt,
      },
    })
  } catch (e) {
    next(e)
  }
}

export async function listRuns(req: Request, res: Response, next: NextFunction) {
  try {
    const runs = await RoguelikeRun.find({ userId: new Types.ObjectId(req.user!.id) })
      .select('scenarioSlug scenarioTitle mode status currentStageOrder health resources stagesTotal ending startedAt endedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
    res.json({ runs })
  } catch (e) {
    next(e)
  }
}

export async function getRun(req: Request, res: Response, next: NextFunction) {
  try {
    const run = await RoguelikeRun.findById(paramId(req.params.runId)).lean()
    if (!run) throw createError('Run not found', 404)
    if (run.userId.toString() !== req.user!.id) throw createError('Forbidden', 403)
    res.json({ run })
  } catch (e) {
    next(e)
  }
}

export async function submitStage(req: Request, res: Response, next: NextFunction) {
  try {
    const runId = paramId(req.params.runId)
    const {
      stageId,
      decisionMade,
      decisionLabel,
      diagramSnapshot,
      architectureNotes,
      isSkip,
      isRefactor,
    } = req.body as {
      stageId?: string
      decisionMade?: string
      decisionLabel?: string
      diagramSnapshot?: { nodes: unknown[]; edges: unknown[] }
      architectureNotes?: string
      isSkip?: boolean
      isRefactor?: boolean
    }

    const run = await RoguelikeRun.findById(runId)
    if (!run) throw createError('Run not found', 404)
    if (run.userId.toString() !== req.user!.id) throw createError('Forbidden', 403)
    if (run.status !== 'active') throw createError('Run is not active', 400)

    const scenario = await RoguelikeScenario.findById(run.scenarioId)
    if (!scenario) throw createError('Scenario not found', 404)

    // Find current stage
    const currentStage =
      scenario.stages.find(
        (s) =>
          (stageId && s.id === stageId) ||
          s.order === run.currentStageOrder,
      )
    if (!currentStage) throw createError('Stage not found', 404)

    const healthBefore: ArchitectureHealth = {
      coupling: run.health.coupling,
      cohesion: run.health.cohesion,
      extensibility: run.health.extensibility,
      complexity: run.health.complexity,
      reliability: run.health.reliability,
      debt: run.health.debt,
    }
    let healthAfter: ArchitectureHealth = { ...healthBefore }
    let resourcesAfter: RunResources = {
      engineeringHoursRemaining: run.resources.engineeringHoursRemaining,
      complexityBudgetRemaining: run.resources.complexityBudgetRemaining,
      teamSize: run.resources.teamSize,
      infraBudgetRemaining: run.resources.infraBudgetRemaining,
      changesRemaining: run.resources.changesRemaining,
    }

    // Apply decision delta
    if (isRefactor) {
      healthAfter = applyDelta(healthAfter, { complexity: -10, debt: -5 })
      resourcesAfter = {
        ...resourcesAfter,
        engineeringHoursRemaining: resourcesAfter.engineeringHoursRemaining - 4,
      }
      run.totalRefactors += 1
    } else if (isSkip) {
      healthAfter = applyDelta(healthAfter, { debt: 3 })
    } else if (decisionMade && currentStage.event.decisions && currentStage.event.decisions.length > 0) {
      const option = currentStage.event.decisions.find((d) => d.id === decisionMade)
      if (option) {
        healthAfter = applyDelta(healthAfter, option.healthDelta as Partial<Record<keyof ArchitectureHealth, number>>)
        run.totalDecisions += 1
      }
    }

    // Deduct fixed stage resources
    resourcesAfter = {
      ...resourcesAfter,
      engineeringHoursRemaining: resourcesAfter.engineeringHoursRemaining - 2,
      complexityBudgetRemaining: resourcesAfter.complexityBudgetRemaining - 1,
    }

    // Evaluate submitted diagram (heuristic scoring)
    const designEval = evaluateDiagram(diagramSnapshot)

    // Gate: canvas-stage submissions must meet the mode's minimum design score.
    // Also catches missing/empty diagrams — evaluateDiagram returns score=0 for empty canvas.
    const isCanvasSubmission = !isSkip && !isRefactor
    if (isCanvasSubmission) {
      // If no snapshot was sent at all, treat it as an empty diagram (score 0)
      const evalTarget = designEval ?? evaluateDiagram({ nodes: [], edges: [] })
      const minScore = MIN_DESIGN_SCORE[run.mode] ?? 40
      if (evalTarget && evalTarget.score < minScore) {
        return res.json({
          designRejected: true,
          designEval: evalTarget,
          minScore,
          run: {
            id: run.id,
            status: run.status,
            currentStageOrder: run.currentStageOrder, // unchanged
            health: run.health,
            resources: run.resources,
            stagesTotal: run.stagesTotal,
            totalDecisions: run.totalDecisions,
            totalRefactors: run.totalRefactors,
            majorFailures: run.majorFailures,
          },
        })
      }
    }

    if (designEval) {
      const s = designEval.score
      if (s >= 80) {
        // Excellent design — rewards in cohesion, coupling, and reduced debt
        healthAfter = applyDelta(healthAfter, { cohesion: 6, coupling: -5, reliability: 4, debt: -3 })
      } else if (s >= 60) {
        // Good design — modest reward
        healthAfter = applyDelta(healthAfter, { cohesion: 3, coupling: -2 })
      } else if (s >= 40) {
        // Mediocre — slight debt accumulation
        healthAfter = applyDelta(healthAfter, { debt: 5 })
      } else if (s >= 20) {
        // Poor design — meaningful penalty across multiple axes
        healthAfter = applyDelta(healthAfter, { complexity: 10, reliability: -8, debt: 12 })
      } else {
        // Critically bad (< 20) — heavy penalty; nearly guarantees debt accumulation
        healthAfter = applyDelta(healthAfter, { complexity: 18, reliability: -12, coupling: 12, debt: 22 })
      }
    }

    // Determine pass/fail
    const passed = healthAfter.debt < 80 && resourcesAfter.engineeringHoursRemaining >= 0

    if (!passed) run.majorFailures += 1

    // Push stage result
    run.stages.push({
      stageId: currentStage.id,
      stageOrder: currentStage.order,
      stageTitle: currentStage.title,
      eventType: currentStage.event.type,
      decisionMade: isRefactor ? 'refactor' : isSkip ? 'skip' : decisionMade,
      decisionLabel: isRefactor ? 'Refactor' : isSkip ? 'Skip' : decisionLabel,
      diagramSnapshot,
      architectureNotes,
      healthBefore,
      healthAfter,
      resourcesAfter,
      passed,
      completedAt: new Date(),
    })

    // Save checkpoint if applicable
    if (currentStage.isCheckpoint) {
      run.checkpoints.push({
        stageOrder: currentStage.order,
        health: healthAfter,
        resources: resourcesAfter,
        diagramSnapshot,
        savedAt: new Date(),
      })
    }

    // Update run state
    run.health = healthAfter as typeof run.health
    run.resources = resourcesAfter as typeof run.resources
    run.currentStageOrder = currentStage.order + 1

    // Check if boss failed
    const isFinished = run.currentStageOrder > scenario.stages.length
    const isStrategicExit = Boolean(currentStage.isBoss && isSkip)

    if (currentStage.isBoss && !passed) {
      run.status = 'failed'
      run.ending = computeEnding(healthAfter.debt, isStrategicExit)
      run.endingReason = `Architecture collapsed at boss stage: ${currentStage.title}`
      run.endedAt = new Date()
    } else if (isFinished) {
      run.status = 'completed'
      run.ending = computeEnding(healthAfter.debt, isStrategicExit)
      run.endedAt = new Date()
    }

    await run.save()

    // Find next stage info
    const nextStage = isFinished
      ? undefined
      : scenario.stages.find((s) => s.order === run.currentStageOrder)

    res.json({
      run: {
        id: run.id,
        status: run.status,
        currentStageOrder: run.currentStageOrder,
        health: run.health,
        resources: run.resources,
        stagesTotal: run.stagesTotal,
        totalDecisions: run.totalDecisions,
        totalRefactors: run.totalRefactors,
        majorFailures: run.majorFailures,
        ending: run.ending,
        endingReason: run.endingReason,
        endedAt: run.endedAt,
      },
      stageResult: {
        passed,
        stageTitle: currentStage.title,
        healthBefore,
        healthAfter,
        resourcesAfter,
        designEval: designEval ?? null,
      },
      currentStage: currentStage,
      nextStage: nextStage ?? null,
    })
  } catch (e) {
    next(e)
  }
}

export async function restoreCheckpoint(req: Request, res: Response, next: NextFunction) {
  try {
    const runId = paramId(req.params.runId)
    const { checkpointStageOrder } = req.body as { checkpointStageOrder?: number }

    if (checkpointStageOrder === undefined) {
      throw createError('checkpointStageOrder is required', 400)
    }

    const run = await RoguelikeRun.findById(runId)
    if (!run) throw createError('Run not found', 404)
    if (run.userId.toString() !== req.user!.id) throw createError('Forbidden', 403)
    if (run.status !== 'active') throw createError('Run is not active', 400)

    const checkpoint = run.checkpoints.find((c) => c.stageOrder === checkpointStageOrder)
    if (!checkpoint) throw createError('Checkpoint not found', 404)

    // Restore health and resources
    run.health = checkpoint.health as typeof run.health
    run.resources = checkpoint.resources as typeof run.resources

    // Remove stage results after checkpoint
    run.stages = run.stages.filter((s) => s.stageOrder <= checkpointStageOrder) as typeof run.stages

    // Reset currentStageOrder to the stage after the checkpoint
    run.currentStageOrder = checkpointStageOrder + 1

    await run.save()

    res.json({
      run: {
        id: run.id,
        status: run.status,
        currentStageOrder: run.currentStageOrder,
        health: run.health,
        resources: run.resources,
        stagesTotal: run.stagesTotal,
        checkpoints: run.checkpoints,
      },
      restoredFrom: checkpointStageOrder,
    })
  } catch (e) {
    next(e)
  }
}

export async function endRun(req: Request, res: Response, next: NextFunction) {
  try {
    const runId = paramId(req.params.runId)
    const { ending } = req.body as { ending?: string }

    const run = await RoguelikeRun.findById(runId)
    if (!run) throw createError('Run not found', 404)
    if (run.userId.toString() !== req.user!.id) throw createError('Forbidden', 403)

    const validEndings: RunEnding[] = [
      'survived',
      'survived_with_debt',
      'refactor_required',
      'collapse',
      'strategic_exit',
    ]

    if (run.stages.length === 0) {
      run.status = 'abandoned'
      run.ending = undefined
      run.endingReason = 'Run abandoned before any stage was completed'
    } else {
      run.status = run.status === 'active' ? 'abandoned' : run.status
      if (ending && validEndings.includes(ending as RunEnding)) {
        run.ending = ending as RunEnding
      } else if (!run.ending) {
        run.ending = computeEnding(run.health.debt)
      }
      if (!run.endingReason) {
        run.endingReason = 'Run ended by user'
      }
    }

    run.endedAt = new Date()

    // ── Skill delta computation ──────────────────────────────────────────────
    const skillDeltas: Record<string, number> = {}
    const stagesPassed = run.stages.filter(s => s.passed).length
    const stagesTotal = run.stages.length > 0 ? run.stages.length : 1
    const passRate = stagesPassed / stagesTotal

    skillDeltas.tradeoffReasoning = Math.ceil(passRate * 8)
    skillDeltas.extensibility = Math.ceil(passRate * 5)

    if (run.ending === 'survived') {
      skillDeltas.coupling = 4
      skillDeltas.cohesion = 3
    } else if (run.ending === 'survived_with_debt') {
      skillDeltas.coupling = 2
      skillDeltas.cohesion = 1
    } else {
      skillDeltas.coupling = 1
    }

    // Persist skill deltas on the run document
    run.skillDeltas = skillDeltas

    await run.save()

    // Apply to user profile
    const { interviewReadiness } = await applySkillDeltas(
      run.userId.toString(),
      'roguelike',
      skillDeltas,
    )

    if (interviewReadiness !== undefined) {
      run.interviewReadiness = interviewReadiness
      await run.save()
    }

    res.json({
      run: {
        id: run.id,
        status: run.status,
        ending: run.ending,
        endingReason: run.endingReason,
        totalDecisions: run.totalDecisions,
        totalRefactors: run.totalRefactors,
        majorFailures: run.majorFailures,
        stages: run.stages.length,
        health: run.health,
        endedAt: run.endedAt,
        skillDeltas,
        interviewReadiness,
      },
    })
  } catch (e) {
    next(e)
  }
}

// ── Featured scenario ─────────────────────────────────────────────────────────

export async function getFeaturedScenario(req: Request, res: Response, next: NextFunction) {
  try {
    // Rotate daily: use today's date as seed
    const dateStr = new Date().toISOString().slice(0, 10)
    const dateNum = parseInt(dateStr.replace(/-/g, ''), 10)
    const scenarios = await RoguelikeScenario.find({ status: 'published' }).lean()
    if (!scenarios.length) { res.json({ scenario: null }); return }
    const idx = dateNum % scenarios.length
    res.json({ scenario: scenarios[idx], date: dateStr })
  } catch (e) { next(e) }
}

// ── Legacy exports (backward-compat) ─────────────────────────────────────────

/** @deprecated Use startRun */
export const startRoguelike = startRun

/** @deprecated Use getRun */
export const getRoguelike = getRun
