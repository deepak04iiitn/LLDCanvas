import type { DebuggerDiagram } from '@/components/studio/debugger/DebuggerCanvas'
import type { ProblemSolution, ProseSection } from './types'

function plain(text: string): string {
  return text
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u2212/g, '-')
    .replace(/\u2192/g, '->')
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
}

function umlTypeNames(uml: DebuggerDiagram | undefined): string[] {
  if (!uml?.nodes?.length) return []
  const names: string[] = []
  for (const raw of uml.nodes) {
    const n = asRecord(raw)
    const data = asRecord(n.data)
    const kind = String(data.nodeType ?? n.type ?? '')
    if (kind === 'note') continue
    const name = String(data.name ?? '').trim()
    if (name) names.push(name)
  }
  return names
}

function facadeName(names: string[], title: string): string {
  const hit =
    names.find(n => /Service$|System$|Manager$|Controller$|Lot$|Engine$|Gateway$|Facade$/i.test(n)) ||
    names.find(n => /ParkingLot|Scheduler|Cache|Queue|Store/i.test(n)) ||
    names[0]
  return hit || title.split(/\s+/).slice(0, 2).join('') || 'the facade'
}

/** True when extras are the generator stub (one-liner create/close boilerplate). */
export function isStubExtras(extras: ProblemSolution['extras'] | undefined): boolean {
  if (!extras) return true
  const testing = (extras.testing?.paragraphs ?? []).join(' ')
  const edges = (extras.edgeCases?.paragraphs ?? []).join(' ')
  const mistakes = (extras.commonMistakes?.paragraphs ?? []).join(' ')
  if (/Happy create\/close/i.test(testing)) return true
  if (/Empty names, double-close, and unknown ids/i.test(edges)) return true
  if (/Inventing a Record class not on the UML/i.test(mistakes)) return true
  // Very short single paragraph with no bullets counts as stub
  const short =
    (extras.testing?.paragraphs?.length ?? 0) <= 1 &&
    (extras.testing?.paragraphs?.[0]?.length ?? 0) < 90 &&
    !(extras.testing?.bullets?.length) &&
    (extras.edgeCases?.paragraphs?.length ?? 0) <= 1 &&
    (extras.edgeCases?.paragraphs?.[0]?.length ?? 0) < 90
  return short
}

function prose(heading: string, paragraphs: string[], bullets?: string[]): ProseSection {
  return {
    heading,
    paragraphs: paragraphs.map(plain),
    bullets: bullets?.map(plain),
  }
}

/**
 * Rich extras for practice solutions: edge cases, mistakes, complexity, testing,
 * extensions, takeaways - written as beginner-friendly teaching prose.
 */
export function buildExtras(solution: {
  title: string
  slug?: string
  uml?: DebuggerDiagram
  designExplanation?: { classResponsibilities?: { name: string }[]; extensibility?: string[] }
}): NonNullable<ProblemSolution['extras']> {
  const title = plain(solution.title || solution.slug || 'this problem')
    .replace(/\s*-\s*Complete LLD Guide\s*$/i, '')
    .replace(/\s*:\s*Complete LLD Guide\s*$/i, '')
    .trim() || 'this problem'
  const names = umlTypeNames(solution.uml)
  const facade = facadeName(names, title)
  const typeList = names.length ? names.slice(0, 8).join(', ') : 'the UML types'
  const moreTypes = names.length > 8 ? `, and ${names.length - 8} more` : ''

  return {
    edgeCases: prose(
      'Edge cases & error handling',
      [
        `For ${title}, interviewers care less about a perfect happy path and more about what you reject without corrupting state. Walk these cases out loud and point to where ${facade} (or the owning class) fails fast.`,
        `Invalid input: blank or whitespace-only names/ids, null-like values where your language allows them, and ids that are not in any map. Each should throw (or return a clear error) and leave collections unchanged.`,
        `Lifecycle mistakes: closing or completing an object that is already closed, operating on a missing id, and repeating a one-shot action (second close, second settle, reused ticket). The second call must not partially mutate fields.`,
        `Consistency: if a method updates two maps or a parent plus a child, either both updates succeed or neither does. Say that out loud - it shows you think about invariants, not only method signatures.`,
      ],
      [
        'Reject empty name/id before allocating a new object.',
        `Unknown id on get/close: clear error, no side effects on ${facade}.`,
        'Double-close / double-complete: second call fails; status stays CLOSED (or equivalent).',
        'List/active queries never return closed or deleted objects after a successful close.',
      ],
    ),
    commonMistakes: prose(
      'Common mistakes',
      [
        `A frequent miss on ${title} is inventing types that are not on the UML, or dumping all validation into ${facade} while domain objects stay as empty bags of fields. Prefer the class boxes you already drew.`,
        `Another miss is logging only in main and nowhere in the domain. Method-level logs (create, validate, close) make the demo teach the design. Skipping them makes the walkthrough hard to follow.`,
        `Finally, avoid silent success on bad input. Returning null without explaining it, or mutating state before a failed check, is worse than a loud exception in an LLD interview.`,
      ],
      [
        `Do not invent helper classes that never appear next to ${typeList}${moreTypes}.`,
        `Keep create/get/close (or park/exit equivalents) on ${facade}; keep field rules on the owning type.`,
        'Validate before mutate; never leave half-updated maps.',
        'Match UML names in code so the diagram and Code tab stay aligned.',
      ],
    ),
    complexity: [
      plain(
        `Typical cost model for ${title}: lookups and updates through hash maps on ${facade} are O(1) average per create/get/close. Listing active objects is O(n) in the number of stored entities because you scan the map (or a filtered view).`,
      ),
      plain(
        'If a method walks nested collections (floors then slots, rooms then seats, and so on), say the nested bound out loud - for example O(F * S) for F parents and S children - so the interviewer hears that you measured the hot path.',
      ),
      plain(
        'Space is dominated by the maps and owned child lists on the facade. Unless the prompt asks for persistence or sharding, keep the in-memory model and mention disk/DB as an extension.',
      ),
    ],
    testing: prose(
      'Testing strategy',
      [
        `Test ${title} in three layers so you are not only demoing the happy path from main.`,
        `Unit level: construct each domain type from the UML, call validate(), and assert bad construction fails. Then exercise close/complete once (success) and again (failure).`,
        `Facade level: drive ${facade} the way the Code tab demo does - create two objects, fetch by id, list actives, close one, confirm it disappears from the active list, and confirm get/close on a missing id fails cleanly.`,
        `Regression level: re-run the logged main and check Expected vs Observed lines. If a log disappears after a refactor, you likely broke an invariant the diagram depended on.`,
      ],
      [
        'Happy path: create -> get -> list active -> close -> list again.',
        'Empty name/id rejected with no map growth.',
        'Unknown id on get/close rejected.',
        'Double-close rejected; object remains closed.',
        'Active list excludes closed objects.',
      ],
    ),
    extensions: [
      plain(
        `Persistence: store entities behind a repository interface so ${facade} does not hard-code in-memory maps.`,
      ),
      plain(
        'Domain events: emit created/closed events for analytics or notifications without bloating core methods.',
      ),
      plain(
        'Richer UML associations: add the next relationship from the follow-up questions (ownership, history, or strategy swap) as a new class rather than a mega-method.',
      ),
      plain(
        `Concurrency: if the prompt grows to multi-threaded access, put one lock on ${facade} public methods the same way larger LLD solutions do.`,
      ),
      ...(solution.designExplanation?.extensibility ?? []).slice(0, 3).map(plain),
    ],
    takeaways: [
      plain(
        `Start from the UML: every box in ${typeList}${moreTypes} should appear in code under the same name.`,
      ),
      plain(`${facade} owns composition and is the only entry most callers need.`),
      plain('Validate early, mutate once, fail without partial updates.'),
      plain(
        'A logged main is part of the design explanation - Expected/Observed lines prove the flow.',
      ),
      plain(
        'Keep pricing, policies, and IO behind small interfaces when those rules are likely to change.',
      ),
    ],
  }
}

export function ensureExtras<T extends {
  title: string
  slug?: string
  uml?: DebuggerDiagram
  extras?: ProblemSolution['extras']
  designExplanation?: { classResponsibilities?: { name: string }[]; extensibility?: string[] }
}>(solution: T): T {
  if (!isStubExtras(solution.extras)) {
    // Still normalize dashes in authored extras
    return {
      ...solution,
      extras: solution.extras
        ? {
            ...solution.extras,
            complexity: solution.extras.complexity?.map(plain),
            extensions: solution.extras.extensions?.map(plain),
            takeaways: solution.extras.takeaways?.map(plain),
            edgeCases: solution.extras.edgeCases
              ? {
                  ...solution.extras.edgeCases,
                  paragraphs: solution.extras.edgeCases.paragraphs.map(plain),
                  bullets: solution.extras.edgeCases.bullets?.map(plain),
                }
              : undefined,
            commonMistakes: solution.extras.commonMistakes
              ? {
                  ...solution.extras.commonMistakes,
                  paragraphs: solution.extras.commonMistakes.paragraphs.map(plain),
                  bullets: solution.extras.commonMistakes.bullets?.map(plain),
                }
              : undefined,
            testing: solution.extras.testing
              ? {
                  ...solution.extras.testing,
                  paragraphs: solution.extras.testing.paragraphs.map(plain),
                  bullets: solution.extras.testing.bullets?.map(plain),
                }
              : undefined,
          }
        : solution.extras,
    }
  }
  return { ...solution, extras: buildExtras(solution) }
}
