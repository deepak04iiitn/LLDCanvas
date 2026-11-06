/**
 * Rebuild problem-solutions/index.ts:
 * - Modules with `export const X: ProblemSolution` register natively
 * - Others stay in registerAdapted(...)
 */
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve('src/content/problem-solutions')
const INDEX = path.join(ROOT, 'index.ts')

function camelExport(slug) {
  const parts = slug.split('-')
  return (
    parts.map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1))).join('').replace(/[^a-zA-Z0-9_]/g, '') +
    'Solution'
  )
}

function scan() {
  const batches = ['batch1', 'batch2', 'batch3', 'batch4', 'batch5', 'batch6']
  const items = []
  for (const batch of batches) {
    const dir = path.join(ROOT, batch)
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.ts') && !x.startsWith('_'))) {
      const slug = f.replace(/\.ts$/, '')
      const src = fs.readFileSync(path.join(dir, f), 'utf8')
      const exportName = camelExport(slug)
      const isGold =
        src.includes(`export const ${exportName}: ProblemSolution`) ||
        (src.includes('introduction: [') &&
          src.includes('interviewApproach: {') &&
          src.includes('sections:') &&
          !src.includes('howToThink:'))
      const stub = /:\s*ok["']/.test(src) || src.includes('Service: ok')
      items.push({ batch, slug, exportName, file: f, isGold, stub, bytes: src.length })
    }
  }
  return items
}

const items = scan()
const gold = items.filter(i => i.isGold && !i.stub)
const adapted = items.filter(i => !i.isGold || i.stub)

const importLines = items
  .map(i => `import { ${i.exportName} } from './${i.batch}/${i.slug}'`)
  .join('\n')

const nativeLines = gold.map(i => `  [${i.exportName}.slug]: ${i.exportName},`).join('\n')
const adaptedLines = adapted.map(i => `    ${i.exportName},`).join('\n')

const out = `import type { ProblemSolution } from './types'
import { adaptSolution } from './adaptSolution'

${importLines}

/**
 * Official practice-problem solutions keyed by problem slug.
 * Native gold-schema modules register directly; legacy/scaffold modules go through adaptSolution.
 */
function registerAdapted(...raws: unknown[]): Record<string, ProblemSolution> {
  return Object.fromEntries(
    raws.map(raw => {
      const adapted = adaptSolution(raw as Record<string, unknown>)
      return [adapted.slug, adapted] as const
    }),
  )
}

const REGISTRY: Record<string, ProblemSolution> = {
  // Native gold-schema modules
${nativeLines}

${
  adapted.length
    ? `  ...registerAdapted(
${adaptedLines}
  ),`
    : ''
}
}

export function getProblemSolution(slug: string): ProblemSolution | undefined {
  return REGISTRY[slug]
}

export function listSolutionSlugs(): string[] {
  return Object.keys(REGISTRY)
}

export function registerSolutions(solutions: ProblemSolution[]) {
  for (const s of solutions) REGISTRY[s.slug] = s
}

export type { ProblemSolution }
`

fs.writeFileSync(INDEX, out)
console.log(
  JSON.stringify(
    {
      total: items.length,
      gold: gold.length,
      adapted: adapted.length,
      stubs: items.filter(i => i.stub).length,
    },
    null,
    2,
  ),
)
