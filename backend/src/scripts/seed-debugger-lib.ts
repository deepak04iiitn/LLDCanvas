export const LANG = {
  py: 'python-3.14',
  java: 'openjdk-25',
  cpp: 'g++-15',
  cs: 'dotnet-csharp-9',
  go: 'go-1.26',
  rust: 'rust-1.93',
  ts: 'typescript-deno',
  php: 'php-8.5',
  rb: 'ruby-4.0',
} as const

export type LangKey = keyof typeof LANG

export function variants(code: Record<LangKey, string>) {
  return (Object.keys(LANG) as LangKey[]).map(k => ({
    language: LANG[k],
    buggyCode: code[k],
  }))
}

export type DebuggerSeed = {
  slug: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  bugType:
    | 'logic'
    | 'off-by-one'
    | 'null-check'
    | 'wrong-algorithm'
    | 'edge-case'
    | 'type-error'
    | 'infinite-loop'
    | 'boundary'
    | 'operator'
    | 'missing-return'
  testInput: string
  expectedOutput: string
  hint: string
  explanation: string
  tags: string[]
  order: number
  status: 'published'
  variants: { language: string; buggyCode: string }[]
}

export function challenge(
  p: Omit<DebuggerSeed, 'status' | 'variants' | 'testInput'> & {
    testInput?: string
    code: Record<LangKey, string>
  },
): DebuggerSeed {
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    difficulty: p.difficulty,
    bugType: p.bugType,
    testInput: p.testInput ?? '',
    expectedOutput: p.expectedOutput,
    hint: p.hint,
    explanation: p.explanation,
    tags: p.tags,
    order: p.order,
    status: 'published',
    variants: variants(p.code),
  }
}
