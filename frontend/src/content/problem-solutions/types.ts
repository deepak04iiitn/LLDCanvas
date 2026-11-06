import type { DebuggerDiagram } from '@/components/studio/debugger/DebuggerCanvas'

/** Languages we ship for official practice solutions (major platform set). */
export const SOLUTION_LANGUAGES = [
  { id: 'python',     label: 'Python',     hljs: 'python' },
  { id: 'java',       label: 'Java',       hljs: 'java' },
  { id: 'typescript', label: 'TypeScript', hljs: 'typescript' },
  { id: 'cpp',        label: 'C++',        hljs: 'cpp' },
  { id: 'go',         label: 'Go',         hljs: 'go' },
  { id: 'csharp',     label: 'C#',         hljs: 'csharp' },
] as const

export type SolutionLangId = (typeof SOLUTION_LANGUAGES)[number]['id']

export interface EntitySpec {
  name: string
  responsibility: string
  /** Optional attribute/method hints shown in a small table. */
  keyMembers?: string[]
}

export interface DesignDecision {
  decision: string
  rationale: string
  tradeoff?: string
  alternativeRejected?: string
}

export interface FlowExample {
  title: string
  input: string
  output: string
  explanation: string
}

export interface FollowUpQA {
  question: string
  /** Full paragraph answer - interview-ready, not one-liners. */
  answer: string
}

/**
 * Blog-style subsection: prefer paragraphs over bullet-only notes.
 * Use bullets only for lists that are naturally list-shaped (requirements, Qs).
 */
export interface ProseSection {
  heading?: string
  /** One or more teaching paragraphs. */
  paragraphs: string[]
  bullets?: string[]
  numbered?: string[]
  /** Optional comparison / member table. */
  table?: { headers: string[]; rows: string[][] }
  /** Optional callout / tip box. */
  callout?: { title?: string; body: string }
}

export interface ProblemSolution {
  slug: string
  title: string

  /**
   * Problem Overview - FR/NFR still come from the Problem API.
   * Write a real introduction, not a one-sentence blurb.
   */
  overview: {
    /** 2-4 paragraphs introducing the problem in interview context. */
    introduction: string[]
    constraints: string[]
    assumptions: string[]
    /** Questions to ask the interviewer, with a short note on why each matters. */
    clarificationQuestions: { question: string; why: string }[]
  }

  /**
   * Interview approach - the heart of the tutorial.
   * Walk from blank whiteboard → entities → relationships → patterns.
   */
  interviewApproach: {
    sections: ProseSection[]
    entities: EntitySpec[]
  }

  /** Diagram data compatible with DebuggerCanvas. Prefer wide spacing (see uml.ts GRID). */
  uml: DebuggerDiagram
  /** Short intro shown above the diagram. */
  umlCaption?: string

  /**
   * Beginner walkthrough of the UML class diagram.
   * Cover every class, attribute, method, enum, interface, and relationship.
   * Optional on authored modules; getProblemSolution / adaptSolution always fill it.
   */
  umlGuide?: {
    introduction: string[]
    sections: ProseSection[]
  }

  /**
   * Design explanation - class-by-class teaching prose + structured summaries.
   */
  designExplanation: {
    sections: ProseSection[]
    classResponsibilities: EntitySpec[]
    patterns: { name: string; why: string; howApplied: string }[]
    decisions: DesignDecision[]
    solid: ProseSection
    extensibility: string[]
  }

  /** Full working implementations - medium difficulty, complete, with a demo/main. */
  implementations: Record<SolutionLangId, string>
  /** Intro above the code tabs. */
  implementationIntro?: string[]

  executionFlow: {
    /** Narrative walkthrough paragraphs. */
    narrative: string[]
    steps: string[]
    examples: FlowExample[]
  }

  followUps: FollowUpQA[]

  extras?: {
    edgeCases?: ProseSection
    commonMistakes?: ProseSection
    complexity?: string[]
    testing?: ProseSection
    extensions?: string[]
    takeaways?: string[]
  }
}
