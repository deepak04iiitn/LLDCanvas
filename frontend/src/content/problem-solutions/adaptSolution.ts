import type {
  EntitySpec,
  FollowUpQA,
  ProblemSolution,
  ProseSection,
} from './types'
import { buildUmlGuide } from './buildUmlGuide'

/** Accept legacy/draft shapes and normalize to the current ProblemSolution schema. */
export function adaptSolution(raw: Record<string, unknown>): ProblemSolution {
  const overviewIn = (raw.overview ?? {}) as Record<string, unknown>
  const approachIn = (raw.interviewApproach ?? {}) as Record<string, unknown>
  const designIn = (raw.designExplanation ?? {}) as Record<string, unknown>
  const flowIn = (raw.executionFlow ?? {}) as Record<string, unknown>
  const extrasIn = (raw.extras ?? {}) as Record<string, unknown>

  const introduction = toStringArray(overviewIn.introduction)
  const constraints = toStringArray(overviewIn.constraints)
  const assumptions = toStringArray(overviewIn.assumptions)
  const clarificationQuestions = toClarifying(overviewIn.clarificationQuestions)

  const approachSections =
    Array.isArray(approachIn.sections) && approachIn.sections.length
      ? (approachIn.sections as ProseSection[]).map(normalizeProse)
      : buildApproachSections(approachIn)

  const entities = toEntities(approachIn.entities)

  const designSections =
    Array.isArray(designIn.sections) && designIn.sections.length
      ? (designIn.sections as ProseSection[]).map(normalizeProse)
      : buildDesignSections(designIn)

  const classResponsibilities = toEntities(
    designIn.classResponsibilities ?? approachIn.entities,
  )

  const patterns = toPatterns(designIn.patterns)
  const decisions = toDecisions(designIn.decisions)
  const solid = normalizeProse(
    typeof designIn.solid === 'object' && designIn.solid && !Array.isArray(designIn.solid)
      ? (designIn.solid as ProseSection)
      : {
          paragraphs: [],
          bullets: toStringArray(designIn.solid),
        },
  )
  if (!solid.paragraphs.length && !solid.bullets?.length) {
    solid.paragraphs = [
      'Keep each class focused on one job. Depend on small interfaces where behavior may change. Prefer adding a new type over editing a switch in a core class.',
    ]
  }

  const extensibility = toStringArray(designIn.extensibility)

  const implementations = (raw.implementations ?? {}) as ProblemSolution['implementations']
  const implementationIntro = toStringArray(raw.implementationIntro)
  if (!implementationIntro.length) {
    implementationIntro.push(
      'The tabs below show the same design in six languages. Skim Python first, then switch languages - the structure stays the same.',
    )
  }

  const narrative = toStringArray(flowIn.narrative)
  const steps = toStringArray(flowIn.steps)
  if (!narrative.length && steps.length) {
    narrative.push(
      'Walk the main happy path using the steps below, then try one failure case from the examples.',
    )
  }

  const examples = toExamples(flowIn.examples)
  const followUps = toFollowUps(raw.followUps)

  const adapted: ProblemSolution = {
    slug: String(raw.slug ?? ''),
    title: String(raw.title ?? ''),
    overview: {
      introduction: introduction.length
        ? introduction
        : ['This guide walks through a clean low-level design for the problem, from clarifying questions to working code.'],
      constraints,
      assumptions,
      clarificationQuestions,
    },
    interviewApproach: {
      sections: approachSections.length
        ? approachSections
        : [
            {
              paragraphs: [
                'Restate the problem, ask a few clarifying questions, list nouns and verbs, then assign one clear job to each class before you draw relationships.',
              ],
            },
          ],
      entities,
    },
    uml: (raw.uml as ProblemSolution['uml']) ?? { nodes: [], edges: [] },
    umlCaption:
      typeof raw.umlCaption === 'string'
        ? raw.umlCaption
        : 'Read the class diagram from the main facade outward. Boxes are classes; lines show how they connect.',
    designExplanation: {
      sections: designSections.length
        ? designSections
        : [
            {
              paragraphs: [
                toString(designIn.summary) ||
                  'The design keeps rules next to the data they protect, and routes changeable behavior behind small interfaces.',
              ],
            },
          ],
      classResponsibilities,
      patterns,
      decisions,
      solid,
      extensibility,
    },
    implementations,
    implementationIntro,
    executionFlow: {
      narrative,
      steps,
      examples,
    },
    followUps,
    extras: adaptExtras(extrasIn),
  }

  const rawGuide = raw.umlGuide as ProblemSolution['umlGuide'] | undefined
  adapted.umlGuide =
    rawGuide?.introduction?.length && rawGuide.sections?.length
      ? rawGuide
      : buildUmlGuide(adapted)

  return adapted
}

function toString(v: unknown): string {
  if (typeof v !== 'string') return ''
  return v
    .replace(/\u2014/g, '-') // em dash
    .replace(/\u2013/g, '-') // en dash
    .trim()
}

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean)
  if (typeof v === 'string' && v.trim()) return [v.trim()]
  return []
}

function toClarifying(v: unknown): { question: string; why: string }[] {
  if (!Array.isArray(v)) return []
  return v
    .map(item => {
      if (typeof item === 'string') {
        return {
          question: item,
          why: 'Asking this early locks a design choice before you draw classes.',
        }
      }
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>
        const question = toString(o.question)
        if (!question) return null
        return {
          question,
          why: toString(o.why) || 'This answer changes how you model the system.',
        }
      }
      return null
    })
    .filter(Boolean) as { question: string; why: string }[]
}

function toEntities(v: unknown): EntitySpec[] {
  if (!Array.isArray(v)) return []
  return v
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const name = toString(o.name)
      if (!name) return null
      return {
        name,
        responsibility: toString(o.responsibility) || 'Owns a focused part of the design.',
        keyMembers: toStringArray(o.keyMembers),
      }
    })
    .filter(Boolean) as EntitySpec[]
}

function toPatterns(v: unknown): { name: string; why: string; howApplied: string }[] {
  if (!Array.isArray(v)) return []
  return v
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const name = toString(o.name)
      if (!name) return null
      const why = toString(o.why) || 'Keeps a changing rule isolated.'
      return {
        name,
        why,
        howApplied: toString(o.howApplied) || why,
      }
    })
    .filter(Boolean) as { name: string; why: string; howApplied: string }[]
}

function toDecisions(v: unknown): ProblemSolution['designExplanation']['decisions'] {
  if (!Array.isArray(v)) return []
  return v
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const decision = toString(o.decision)
      if (!decision) return null
      return {
        decision,
        rationale: toString(o.rationale) || 'Keeps the design simple and correct for the stated constraints.',
        tradeoff: toString(o.tradeoff) || undefined,
        alternativeRejected: toString(o.alternativeRejected) || undefined,
      }
    })
    .filter(Boolean) as ProblemSolution['designExplanation']['decisions']
}

function toExamples(v: unknown): ProblemSolution['executionFlow']['examples'] {
  if (!Array.isArray(v)) return []
  return v
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      return {
        title: toString(o.title) || 'Example',
        input: toString(o.input) || '-',
        output: toString(o.output) || '-',
        explanation: toString(o.explanation) || 'See how the main classes collaborate on this input.',
      }
    })
    .filter(Boolean) as ProblemSolution['executionFlow']['examples']
}

function toFollowUps(v: unknown): FollowUpQA[] {
  if (!Array.isArray(v)) return []
  return v
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const question = toString(o.question)
      if (!question) return null
      return {
        question,
        answer: toString(o.answer) || 'State the decision, the reason, and one trade-off.',
      }
    })
    .filter(Boolean) as FollowUpQA[]
}

function normalizeProse(section: ProseSection): ProseSection {
  return {
    heading: section.heading,
    paragraphs: toStringArray(section.paragraphs),
    bullets: section.bullets?.length ? toStringArray(section.bullets) : undefined,
    numbered: section.numbered?.length ? toStringArray(section.numbered) : undefined,
    callout: section.callout
      ? { title: section.callout.title, body: toString(section.callout.body) }
      : undefined,
  }
}

function buildApproachSections(approach: Record<string, unknown>): ProseSection[] {
  const sections: ProseSection[] = []
  const how = toString(approach.howToThink)
  if (how) {
    sections.push({
      heading: 'How to think about it',
      paragraphs: [how],
    })
  }
  const breakdown = toStringArray(approach.breakdown)
  if (breakdown.length) {
    sections.push({
      heading: 'Break the problem down',
      paragraphs: ['Split the work into clear pieces before you draw the diagram.'],
      numbered: breakdown,
    })
  }
  const relationships = toStringArray(approach.relationships)
  if (relationships.length) {
    sections.push({
      heading: 'Relationships',
      paragraphs: ['Connect the classes with simple, honest relationships.'],
      bullets: relationships,
    })
  }
  const patterns = toStringArray(approach.patternsAndOop)
  if (patterns.length) {
    sections.push({
      heading: 'Patterns and OOP choices',
      paragraphs: ['Name the patterns you use and why they fit.'],
      bullets: patterns,
    })
  }
  const steps = toStringArray(approach.stepByStep)
  if (steps.length) {
    sections.push({
      heading: 'Step-by-step path',
      paragraphs: ['Use this order on the whiteboard so you stay calm and complete.'],
      numbered: steps,
    })
  }
  return sections
}

function buildDesignSections(design: Record<string, unknown>): ProseSection[] {
  const sections: ProseSection[] = []
  const summary = toString(design.summary)
  if (summary) {
    sections.push({
      heading: 'Design overview',
      paragraphs: [summary],
    })
  }
  const interfaces = toStringArray(design.interfacesAndAbstractions)
  if (interfaces.length) {
    sections.push({
      heading: 'Interfaces and abstractions',
      paragraphs: ['These seams keep changeable behavior out of the core classes.'],
      bullets: interfaces,
    })
  }
  const relationships = toStringArray(design.relationships)
  if (relationships.length) {
    sections.push({
      heading: 'How the classes connect',
      paragraphs: ['Keep relationships as simple as the requirements allow.'],
      bullets: relationships,
    })
  }
  return sections
}

function adaptExtras(extras: Record<string, unknown>): ProblemSolution['extras'] | undefined {
  if (!extras || !Object.keys(extras).length) return undefined

  const asProse = (v: unknown, fallbackHeading: string): ProseSection | undefined => {
    if (!v) return undefined
    if (typeof v === 'object' && !Array.isArray(v) && 'paragraphs' in (v as object)) {
      return normalizeProse(v as ProseSection)
    }
    const items = toStringArray(v)
    if (!items.length) return undefined
    return {
      heading: fallbackHeading,
      paragraphs: ['Keep these in mind while you implement and test.'],
      bullets: items,
    }
  }

  return {
    edgeCases: asProse(extras.edgeCases, 'Edge cases'),
    commonMistakes: asProse(extras.commonMistakes, 'Common mistakes'),
    complexity: toStringArray(extras.complexity),
    testing: asProse(extras.testing, 'Testing'),
    extensions: toStringArray(extras.extensions),
    takeaways: toStringArray(extras.takeaways),
  }
}
