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

function paramId(id: string | string[]): string {
  return Array.isArray(id) ? id[0] : id
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
    if (!scenarioSlug) throw createError('scenarioSlug is required', 400)

    const scenario = await RoguelikeScenario.findOne({
      slug: scenarioSlug,
      status: 'published',
    })
    if (!scenario) throw createError('Scenario not found', 404)

    const validModes = ['beginner', 'interview', 'survival', 'hardcore', 'endless']
    if (!validModes.includes(mode)) throw createError('Invalid run mode', 400)

    const health: ArchitectureHealth = { ...INITIAL_HEALTH }

    const resources: RunResources = {
      engineeringHoursRemaining: scenario.initialConstraints.engineeringHours,
      complexityBudgetRemaining: scenario.initialConstraints.complexityBudget,
      teamSize: scenario.initialConstraints.teamSize,
      infraBudgetRemaining: scenario.initialConstraints.infraBudget,
      changesRemaining: scenario.initialConstraints.maxStructuralChanges,
    }

    const run = await RoguelikeRun.create({
      userId: new Types.ObjectId(req.user!.id),
      scenarioId: scenario._id,
      scenarioSlug: scenario.slug,
      scenarioTitle: scenario.title,
      mode,
      status: 'active',
      currentStageOrder: 1,
      stages: [],
      health,
      resources,
      checkpoints: [],
      totalDecisions: 0,
      totalRefactors: 0,
      majorFailures: 0,
      stagesTotal: scenario.stages.length,
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
    await run.save()

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
      },
    })
  } catch (e) {
    next(e)
  }
}

// ── Legacy exports (backward-compat) ─────────────────────────────────────────

/** @deprecated Use startRun */
export const startRoguelike = startRun

/** @deprecated Use getRun */
export const getRoguelike = getRun
