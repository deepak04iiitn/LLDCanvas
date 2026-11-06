'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronDown, Copy } from 'lucide-react'
import hljs from 'highlight.js'
import { toast } from 'sonner'
import { DebuggerCanvas } from '@/components/studio/debugger/DebuggerCanvas'
import { cn } from '@/lib/utils'
import {
  SOLUTION_LANGUAGES,
  type ProblemSolution,
  type SolutionLangId,
} from '@/content/problem-solutions/types'
import { ensureExtras } from '@/content/problem-solutions/buildExtras'
import { ensureUmlGuide } from '@/content/problem-solutions/buildUmlGuide'
import {
  EntityTable,
  Paragraphs,
  SolutionProse,
  SolutionProseList,
} from '@/components/problems/SolutionProse'
import './solution-page.css'

type ProblemMeta = {
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  description: string
  functionalRequirements: string[]
  nonFunctionalRequirements: string[]
}

const DIFF = {
  easy: { label: 'Easy', color: 'text-emerald-800' },
  medium: { label: 'Medium', color: 'text-amber-800' },
  hard: { label: 'Hard', color: 'text-red-800' },
} as const

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'approach', label: 'Approach' },
  { id: 'uml', label: 'UML' },
  { id: 'uml-guide', label: 'UML guide' },
  { id: 'design', label: 'Design' },
  { id: 'implementation', label: 'Code' },
  { id: 'walkthrough', label: 'Walkthrough' },
  { id: 'followups', label: 'Follow-ups' },
  { id: 'extras', label: 'Extras' },
] as const

function SectionHeading({
  id,
  index,
  title,
  first,
}: {
  id: string
  index: number
  title: string
  first?: boolean
}) {
  return (
    <header
      id={id}
      className={cn('mb-10 scroll-mt-28', first ? 'mt-0' : 'mt-28 pt-6')}
    >
      <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
        Section {String(index).padStart(2, '0')}
      </p>
      <h2 className="pb-4 font-serif text-[1.65rem] font-semibold leading-snug tracking-tight text-ink sm:text-[1.85rem]">
        {title}
      </h2>
      <div className="h-px w-full bg-hairline" />
    </header>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 mt-12 max-w-2xl font-serif text-[1.15rem] font-semibold leading-normal tracking-tight text-ink first:mt-0">
      {children}
    </h3>
  )
}

function BulletList({ items, numbered }: { items: string[]; numbered?: boolean }) {
  if (!items.length) return null
  return (
    <ul className="max-w-2xl space-y-3.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3.5 text-[15px] leading-[1.8] text-ink/80">
          <span
            className={cn(
              'mt-[0.35em] shrink-0 font-mono text-[11px] tabular-nums',
              numbered ? 'w-5 text-brand/70' : 'w-3 text-brand/50',
            )}
          >
            {numbered ? String(i + 1).padStart(2, '0') : '-'}
          </span>
          <span className="min-w-0 border-l border-brand/20 pl-3.5">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function CodeTabs({ implementations }: { implementations: ProblemSolution['implementations'] }) {
  const available = SOLUTION_LANGUAGES.filter(l => implementations[l.id]?.trim())
  const [lang, setLang] = useState<SolutionLangId>(available[0]?.id ?? 'python')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!available.find(l => l.id === lang) && available[0]) setLang(available[0].id)
  }, [available, lang])

  const meta = SOLUTION_LANGUAGES.find(l => l.id === lang) ?? SOLUTION_LANGUAGES[0]
  const code = implementations[lang] ?? ''

  const html = useMemo(() => {
    try {
      return hljs.getLanguage(meta.hljs)
        ? hljs.highlight(code, { language: meta.hljs }).value
        : hljs.highlightAuto(code).value
    } catch {
      return code
    }
  }, [code, meta.hljs])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy')
    }
  }

  if (!available.length) {
    return <p className="text-sm text-ink-faint">Implementations coming soon.</p>
  }

  return (
    <div className="solution-code overflow-hidden border">
      <div className="flex items-center gap-3 border-b border-(--sol-code-border) px-3 py-2.5 sm:px-4">
        <label className="relative inline-flex min-w-[9.5rem] items-center">
          <span className="sr-only">Language</span>
          <select
            value={lang}
            onChange={e => setLang(e.target.value as SolutionLangId)}
            className="w-full appearance-none rounded-md border border-(--sol-code-border) bg-[#1c1e1b] py-2 pl-3 pr-9 font-mono text-[12px] text-(--sol-code-fg) outline-none transition-colors hover:border-[#3f433c] focus:border-[#8fbfa8]"
          >
            {available.map(l => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-(--sol-code-muted)" />
        </label>
        <div className="flex-1" />
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-2 font-mono text-[11px] text-(--sol-code-muted) transition-colors hover:text-(--sol-code-fg)"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="m-0 max-h-[min(92vh,1400px)] min-h-[28rem] overflow-auto p-5 text-[13px] leading-[1.7] sm:min-h-[32rem] lg:min-h-[36rem]">
        <code className="hljs font-mono" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}

function UmlPanel({ uml }: { uml: ProblemSolution['uml'] }) {
  return (
    <div className="overflow-hidden border border-hairline bg-paper-elevated">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Class diagram · pan & zoom
        </span>
      </div>
      <div className="h-[min(72vh,680px)] w-full">
        <DebuggerCanvas
          diagram={uml}
          readOnly
          selectedId={null}
          onSelect={() => {}}
          hideEditChrome
          className="h-full"
        />
      </div>
    </div>
  )
}

export function ProblemSolutionView({
  problem,
  solution,
  backHref,
}: {
  problem: ProblemMeta
  solution: ProblemSolution
  backHref: string
}) {
  const dm = DIFF[problem.difficulty]
  const finalized = useMemo(
    () => ensureExtras(ensureUmlGuide(solution)),
    [solution],
  )
  const umlGuide = finalized.umlGuide
  const extras = finalized.extras
  const [active, setActive] = useState<string>('overview')
  const hasExtras = Boolean(
    extras &&
      (extras.edgeCases ||
        extras.commonMistakes ||
        extras.complexity?.length ||
        extras.testing ||
        extras.extensions?.length ||
        extras.takeaways?.length),
  )

  const toc = SECTIONS.filter(s => s.id !== 'extras' || hasExtras)

  useEffect(() => {
    const els = toc.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target?.id) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.25, 0.5] },
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [toc])

  let sectionIndex = 0
  const next = () => ++sectionIndex

  return (
    <div className="solution-page flex min-h-screen flex-col bg-paper text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-hairline/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-[13px] text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Problem</span>
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Official solution
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="solution-hero border-b border-hairline">
        <div className="solution-hero-content mx-auto max-w-6xl px-5 pb-14 pt-12 sm:px-8 sm:pb-16 sm:pt-16">
          <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em]">
            <span className={cn('font-medium', dm.color)}>{dm.label}</span>
            <span className="text-ink-faint/50">/</span>
            <span className="text-ink-faint">{problem.category}</span>
            <span className="text-ink-faint/50">/</span>
            <span className="text-brand">Solution</span>
          </div>
          <h1 className="max-w-3xl font-serif text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[3rem]">
            {solution.title}
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.75] text-ink-muted">
            {problem.description}
          </p>
        </div>
      </div>

      <div className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-28 pt-10 sm:px-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-16 lg:pt-14">
          {/* TOC - desktop */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24">
              <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                Contents
              </p>
              <ul className="relative space-y-0 border-l border-hairline">
                {toc.map(s => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={cn(
                        'relative -ml-px block border-l py-1.5 pl-4 text-[13px] transition-all duration-200',
                        active === s.id
                          ? 'border-brand font-medium text-ink'
                          : 'border-transparent text-ink-muted hover:border-hairline-strong hover:text-ink',
                      )}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="min-w-0">
            {/* TOC - mobile underline tabs */}
            <div className="no-scrollbar mb-10 flex gap-5 overflow-x-auto border-b border-hairline lg:hidden">
              {toc.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={cn(
                    'relative shrink-0 pb-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors',
                    active === s.id ? 'text-ink' : 'text-ink-faint',
                  )}
                >
                  {s.label}
                  <span
                    className={cn(
                      'absolute inset-x-0 bottom-0 h-px bg-brand transition-opacity duration-200',
                      active === s.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </a>
              ))}
            </div>

            {/* A. Overview */}
            <section>
              <SectionHeading id="overview" index={next()} title="Understand the problem" first />
              <Paragraphs items={solution.overview.introduction} />

              <SubHeading>Functional requirements</SubHeading>
              <p className="mb-5 max-w-2xl text-[15px] leading-[1.8] text-ink-muted">
                These come from the practice problem brief - your design must cover them, not invent extras that contradict them.
              </p>
              <BulletList items={problem.functionalRequirements} numbered />

              <SubHeading>Non-functional requirements</SubHeading>
              <BulletList items={problem.nonFunctionalRequirements} numbered />

              {solution.overview.constraints.length > 0 && (
                <>
                  <SubHeading>Constraints we design around</SubHeading>
                  <BulletList items={solution.overview.constraints} />
                </>
              )}
              {solution.overview.assumptions.length > 0 && (
                <>
                  <SubHeading>Assumptions (state these out loud)</SubHeading>
                  <BulletList items={solution.overview.assumptions} />
                </>
              )}
              {solution.overview.clarificationQuestions.length > 0 && (
                <>
                  <SubHeading>Clarification questions</SubHeading>
                  <p className="mb-6 max-w-2xl text-[15px] leading-[1.8] text-ink-muted">
                    Good interviews start with questions. Each one below includes why it matters for the design.
                  </p>
                  <div className="max-w-2xl divide-y divide-hairline border-y border-hairline">
                    {solution.overview.clarificationQuestions.map((q, i) => (
                      <div key={i} className="py-5">
                        <p className="text-[15px] font-medium leading-snug text-ink">
                          <span className="mr-2.5 font-mono text-[11px] text-brand/60">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {q.question}
                        </p>
                        <p className="mt-2 pl-7 text-[14px] leading-relaxed text-ink-muted">{q.why}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* B. Approach */}
            <section>
              <SectionHeading id="approach" index={next()} title="Interview approach" />
              <SolutionProseList sections={solution.interviewApproach.sections} />
              <SubHeading>Entity checklist</SubHeading>
              <p className="mb-3 max-w-2xl text-[14px] text-ink-faint">
                Keep this table on the whiteboard while you draw relationships.
              </p>
              <EntityTable entities={solution.interviewApproach.entities} />
            </section>

            {/* C. UML */}
            <section>
              <SectionHeading id="uml" index={next()} title="UML class diagram" />
              {solution.umlCaption ? (
                <p className="mb-6 max-w-2xl text-[15.5px] leading-[1.8] text-ink/85">{solution.umlCaption}</p>
              ) : null}
              <UmlPanel uml={solution.uml} />
            </section>

            {/* C2. UML guide */}
            <section>
              <SectionHeading
                id="uml-guide"
                index={next()}
                title="Understanding the UML class diagram"
              />
              <Paragraphs items={umlGuide.introduction} className="mb-10" />
              <SolutionProseList sections={umlGuide.sections} />
            </section>

            {/* D. Design */}
            <section>
              <SectionHeading id="design" index={next()} title="Low-level design deep-dive" />
              <SolutionProseList sections={solution.designExplanation.sections} />

              <SubHeading>Class responsibilities</SubHeading>
              <EntityTable entities={solution.designExplanation.classResponsibilities} />

              <SubHeading>Design patterns in this solution</SubHeading>
              <div className="max-w-2xl space-y-0 divide-y divide-hairline border-y border-hairline">
                {solution.designExplanation.patterns.map(p => (
                  <div key={p.name} className="py-5">
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-ink/75">
                      <span className="font-medium text-ink">Why. </span>
                      {p.why}
                    </p>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink/75">
                      <span className="font-medium text-ink">How. </span>
                      {p.howApplied}
                    </p>
                  </div>
                ))}
              </div>

              <SubHeading>SOLID - applied, not recited</SubHeading>
              <SolutionProse section={solution.designExplanation.solid} />

              <SubHeading>Decisions & alternatives</SubHeading>
              <div className="max-w-2xl space-y-7">
                {solution.designExplanation.decisions.map((d, i) => (
                  <div key={i} className="border-l-2 border-brand/35 pl-4">
                    <p className="text-[15px] font-medium text-ink">{d.decision}</p>
                    <p className="mt-2 text-[15px] leading-[1.75] text-ink/80">{d.rationale}</p>
                    {d.alternativeRejected && (
                      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-faint">
                        Rejected: {d.alternativeRejected}
                      </p>
                    )}
                    {d.tradeoff && (
                      <p className="mt-1 text-[13.5px] leading-relaxed text-ink-faint">
                        Trade-off: {d.tradeoff}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <SubHeading>Extensibility</SubHeading>
              <Paragraphs items={solution.designExplanation.extensibility} />
            </section>

            {/* E. Implementation */}
            <section>
              <SectionHeading id="implementation" index={next()} title="Complete implementation" />
              <Paragraphs
                items={
                  solution.implementationIntro ?? [
                    'The code below is interview-medium: clear names, complete classes, and a small demo at the bottom. Switch languages - the design stays the same.',
                  ]
                }
                className="mb-6"
              />
              <CodeTabs implementations={solution.implementations} />
            </section>

            {/* F. Walkthrough */}
            <section>
              <SectionHeading id="walkthrough" index={next()} title="Execution flow & examples" />
              <Paragraphs items={solution.executionFlow.narrative} className="mb-6" />
              <SubHeading>Step-by-step</SubHeading>
              <BulletList items={solution.executionFlow.steps} numbered />
              <div className="mt-8 space-y-0 divide-y divide-hairline border-y border-hairline">
                {solution.executionFlow.examples.map((ex, i) => (
                  <div key={i} className="py-6">
                    <h4 className="font-serif text-base font-semibold text-ink">{ex.title}</h4>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                          Input / action
                        </p>
                        <pre className="overflow-x-auto border border-hairline bg-paper-elevated/80 p-3.5 font-mono text-[12px] leading-relaxed text-ink/75 whitespace-pre-wrap">
                          {ex.input}
                        </pre>
                      </div>
                      <div>
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                          Result
                        </p>
                        <pre className="overflow-x-auto border border-hairline bg-paper-elevated/80 p-3.5 font-mono text-[12px] leading-relaxed text-ink/75 whitespace-pre-wrap">
                          {ex.output}
                        </pre>
                      </div>
                    </div>
                    <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">
                      {ex.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* G. Follow-ups */}
            <section>
              <SectionHeading id="followups" index={next()} title="Interview follow-up Q&A" />
              <p className="mb-8 max-w-2xl text-[15px] leading-[1.8] text-ink-muted">
                Practice answering these out loud. Aim for a structured answer: decision, reason, trade-off.
              </p>
              <div className="max-w-2xl space-y-0 divide-y divide-hairline border-y border-hairline">
                {solution.followUps.map((qa, i) => (
                  <div key={i} className="py-7">
                    <p className="text-[15px] font-medium leading-snug text-ink">
                      <span className="mr-2.5 font-mono text-[11px] text-brand/60">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {qa.question}
                    </p>
                    <p className="mt-3 pl-7 text-[15px] leading-[1.8] text-ink/80">{qa.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* H. Extras */}
            {hasExtras && extras && (
              <section>
                <SectionHeading id="extras" index={next()} title="Edge cases, testing & takeaways" />
                <div className="mt-12 flex flex-col gap-20">
                  {extras.edgeCases && (
                    <SolutionProse
                      section={{
                        ...extras.edgeCases,
                        heading: extras.edgeCases.heading ?? 'Edge cases & error handling',
                      }}
                    />
                  )}
                  {extras.commonMistakes && (
                    <SolutionProse
                      section={{
                        ...extras.commonMistakes,
                        heading: extras.commonMistakes.heading ?? 'Common mistakes',
                      }}
                    />
                  )}
                  {extras.complexity?.length ? (
                    <SolutionProse
                      section={{
                        heading: 'Complexity notes',
                        paragraphs: extras.complexity,
                      }}
                    />
                  ) : null}
                  {extras.testing && (
                    <SolutionProse
                      section={{
                        ...extras.testing,
                        heading: extras.testing.heading ?? 'Testing strategy',
                      }}
                    />
                  )}
                  {extras.extensions?.length ? (
                    <div className="pt-2">
                      <h3 className="mb-5 max-w-2xl font-serif text-[1.15rem] font-semibold leading-normal tracking-tight text-ink">
                        Possible extensions
                      </h3>
                      <BulletList items={extras.extensions} />
                    </div>
                  ) : null}
                  {extras.takeaways?.length ? (
                    <div className="pt-2">
                      <h3 className="mb-5 max-w-2xl font-serif text-[1.15rem] font-semibold leading-normal tracking-tight text-ink">
                        Key takeaways
                      </h3>
                      <BulletList items={extras.takeaways} numbered />
                    </div>
                  ) : null}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}
