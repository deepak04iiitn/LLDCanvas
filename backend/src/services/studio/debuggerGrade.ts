/** Design Debugger grading — category + keyword matching, partial credit. */

export const DEBUGGER_CATEGORIES = [
  'Tight Coupling',
  'SRP Violation',
  'DIP Violation',
  'Incorrect Inheritance',
  'Circular Dependency',
  'God Object',
  'Unnecessary Abstraction',
  'Pattern Misuse',
  'Poor Encapsulation',
  'OCP Violation',
  'Other',
] as const

export type DebuggerCategory = (typeof DEBUGGER_CATEGORIES)[number]

export type MarkVerdict = 'exact' | 'partial' | 'miss'

export interface ExpectedIssue {
  id: string
  elementIds: string[]
  category: string
  aliases?: string[]
  explanationKeywords: string[]
  modelAnswer: string
  hints: string[]
  /** Legacy single-element packs */
  elementId?: string
  explanation?: string
}

export interface DebuggerPayload {
  briefing?: string
  requirement?: string
  revealCount?: 'exact' | 'hidden'
  timeLimitSec?: number
  expectedIssues?: ExpectedIssue[]
  verification?: {
    mustIntroduceElementNames?: string[]
    forbidDirectEdges?: { from: string; to: string }[]
    requireNoEditTo?: string[]
  }
}

export interface UserMark {
  elementId: string
  category: string
  why?: string
  issueIdMatched?: string
  verdict?: MarkVerdict
  feedback?: string
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function categoryMatches(expected: ExpectedIssue, category: string): boolean {
  const c = normalize(category)
  if (normalize(expected.category) === c) return true
  return (expected.aliases ?? []).some(a => normalize(a) === c)
}

function elementMatches(expected: ExpectedIssue, elementId: string): boolean {
  const ids = [
    ...(expected.elementIds ?? []),
    ...(expected.elementId ? [expected.elementId] : []),
  ]
  return ids.includes(elementId)
}

function keywordScore(why: string, keywords: string[]): number {
  if (!why.trim() || keywords.length === 0) return 0
  const text = normalize(why)
  let hits = 0
  for (const k of keywords) {
    const nk = normalize(k)
    if (nk && text.includes(nk)) hits++
  }
  return hits / keywords.length
}

function normalizeExpected(raw: ExpectedIssue): ExpectedIssue {
  const elementIds = [
    ...(raw.elementIds ?? []),
    ...(raw.elementId ? [raw.elementId] : []),
  ]
  return {
    ...raw,
    id: raw.id || elementIds[0] || 'issue',
    elementIds,
    explanationKeywords:
      raw.explanationKeywords?.length
        ? raw.explanationKeywords
        : (raw.explanation ?? '')
            .split(/\W+/)
            .filter(w => w.length > 4)
            .slice(0, 8),
    modelAnswer: raw.modelAnswer || raw.explanation || '',
    hints: raw.hints?.length ? raw.hints : [],
  }
}

export function parseDebuggerPayload(payload: unknown): DebuggerPayload {
  const p = (payload ?? {}) as DebuggerPayload
  return {
    briefing: p.briefing,
    requirement: p.requirement,
    revealCount: p.revealCount === 'hidden' ? 'hidden' : 'exact',
    timeLimitSec: p.timeLimitSec,
    expectedIssues: (p.expectedIssues ?? []).map(normalizeExpected),
    verification: p.verification,
  }
}

export interface GradeResult {
  gradedMarks: UserMark[]
  matchedIssueIds: string[]
  found: number
  total: number
  investigationPct: number
  diagnosisPct: number
  feedbackSummary: string
  reveal: {
    id: string
    category: string
    modelAnswer: string
    found: boolean
    verdict?: MarkVerdict
  }[]
}

/** Grade marks against expected issues. Always unlocks repair after diagnose. */
export function gradeDebuggerMarks(
  marks: UserMark[],
  expectedRaw: ExpectedIssue[],
): GradeResult {
  const expected = expectedRaw.map(normalizeExpected)
  const usedIssues = new Set<string>()
  const gradedMarks: UserMark[] = []

  for (const m of marks) {
    const elemHits = expected.filter(e => elementMatches(e, m.elementId))
    const catHits = expected.filter(e => categoryMatches(e, m.category))

    let best: ExpectedIssue | undefined
    let verdict: MarkVerdict = 'miss'
    let feedback = ''

    const both = expected.find(
      e => elementMatches(e, m.elementId) && categoryMatches(e, m.category) && !usedIssues.has(e.id),
    )
    if (both) {
      best = both
      const ks = keywordScore(m.why ?? '', both.explanationKeywords)
      if (ks >= 0.25 || (m.why ?? '').trim().length >= 40) {
        verdict = 'exact'
        feedback = `You correctly identified: ${both.category}. ${both.modelAnswer}`
      } else {
        verdict = 'partial'
        feedback = `Category and location match (${both.category}), but strengthen your explanation. Model answer: ${both.modelAnswer}`
      }
    } else if (elemHits.length && !catHits.some(c => elemHits.includes(c))) {
      const e = elemHits.find(x => !usedIssues.has(x.id)) ?? elemHits[0]
      best = e
      verdict = 'partial'
      feedback = `You flagged the right area, but the primary issue here is ${e.category}, not ${m.category}. ${e.modelAnswer}`
    } else if (catHits.length) {
      const e = catHits.find(x => !usedIssues.has(x.id)) ?? catHits[0]
      best = e
      verdict = 'partial'
      feedback = `You named ${m.category}, which is related, but look at element(s): ${e.elementIds.join(', ')}. ${e.modelAnswer}`
    } else {
      feedback = 'This mark did not match an expected architectural issue for this challenge.'
    }

    if (best && verdict !== 'miss') usedIssues.add(best.id)

    gradedMarks.push({
      ...m,
      issueIdMatched: best?.id,
      verdict,
      feedback,
    })
  }

  const reveal = expected.map(e => {
    const mark = gradedMarks.find(g => g.issueIdMatched === e.id)
    return {
      id: e.id,
      category: e.category,
      modelAnswer: e.modelAnswer,
      found: Boolean(mark && mark.verdict !== 'miss'),
      verdict: mark?.verdict,
    }
  })

  const found = reveal.filter(r => r.found).length
  const total = expected.length || 1
  const exactCount = gradedMarks.filter(g => g.verdict === 'exact').length
  const partialCount = gradedMarks.filter(g => g.verdict === 'partial').length
  const investigationPct = Math.round(
    Math.min(100, ((found + partialCount * 0.3) / total) * 100),
  )
  const diagnosisPct = Math.round(
    Math.min(100, ((exactCount + partialCount * 0.5) / Math.max(marks.length, 1)) * 100),
  )

  const feedbackSummary =
    found === total
      ? 'All expected issues identified. Proceed to repair the architecture.'
      : found > 0
        ? `You identified ${found}/${total} issue(s). Review feedback, then repair what you can.`
        : 'No expected issues matched yet — use feedback and hints, then still attempt a repair.'

  return {
    gradedMarks,
    matchedIssueIds: [...usedIssues],
    found,
    total: expected.length,
    investigationPct,
    diagnosisPct,
    feedbackSummary,
    reveal,
  }
}

export function nextHint(
  expectedRaw: ExpectedIssue[],
  hintsUsed: number,
  focusElementId?: string,
): { hint: string; hintIndex: number; issueId?: string } | null {
  const expected = expectedRaw.map(normalizeExpected)
  let issue = focusElementId
    ? expected.find(e => elementMatches(e, focusElementId))
    : undefined
  if (!issue) issue = expected.find(e => e.hints?.length) ?? expected[0]
  if (!issue?.hints?.length) return null
  const idx = Math.min(hintsUsed, issue.hints.length - 1)
  // Progressive: hintsUsed 0→hint0, 1→hint1, 2→hint2 (reveal)
  const hintIndex = Math.min(hintsUsed, issue.hints.length - 1)
  return { hint: issue.hints[hintIndex], hintIndex, issueId: issue.id }
}
