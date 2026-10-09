import { Schema, model, Document } from 'mongoose'

/** Reuse Design Studio–style diagram snapshots for in-topic visuals. */
export interface IDiagramSnapshot {
  version?: number
  meta?: { theme?: string; zoom?: number; panX?: number; panY?: number }
  nodes: unknown[]
  edges: unknown[]
}

export type ModuleBlockKind =
  | 'concept'
  | 'example'
  | 'real_world'
  | 'diagram'
  | 'knowledge_check'
  | 'tips'
  | 'mistakes'
  | 'summary'
  | 'explain'

export interface ITextVariant {
  role: string
  body: string
}

export interface IKnowledgeOption {
  id: string
  label: string
  correct?: boolean
}

export interface IKnowledgeCheck {
  id: string
  prompt: string
  type: 'mcq' | 'multi' | 'short'
  options?: IKnowledgeOption[]
  explanation?: string
  modelAnswer?: string
}

export interface IModuleBlock {
  id: string
  kind: ModuleBlockKind
  title: string
  durationMin?: number
  /** Primary body (paragraphs separated by blank lines, bullets with •) */
  body?: string
  /** Role-flavored vignettes — API picks by profile.targetRole */
  variants?: ITextVariant[]
  bullets?: string[]
  steps?: { title: string; body: string }[]
  diagramSnapshot?: IDiagramSnapshot
  diagramCaption?: string
  checks?: IKnowledgeCheck[]
}

export interface IPracticeSolution {
  explanation: string
  diagramSnapshot?: IDiagramSnapshot
  codeSnippet?: string
  codeLanguage?: string
}

export interface IPracticeCheck {
  type: 'mcq' | 'multi' | 'short' | 'diagram_mark'
  options?: IKnowledgeOption[]
  expectedElementIds?: string[]
  modelAnswer?: string
  explanation?: string
}

export interface IPracticeItem {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  prompt: string
  hints: string[]
  solution: IPracticeSolution
  commonMistakes: string[]
  checks?: IPracticeCheck
  buildsSkills?: string[]
}

export interface ICheatSheetCard {
  title: string
  bullets: string[]
  diagramSnapshot?: IDiagramSnapshot
}

export interface IInterviewQA {
  question: string
  answer: string
  tags?: string[]
}

export interface IExternalPractice {
  blurb?: string
  studioPacks?: string[]
  learnSlugs?: string[]
}

/** Legacy flat content — kept optional for migration / admin compatibility. */
export interface ITopicContent {
  learn: string
  whyItMatters: string
  interviewTip: string
  realExperience?: string
  spotItPrompt?: string
  spotItDesign?: string
  spotItAnswer?: string
  fixItPrompt?: string
  fixItAnswer?: string
  interviewQuestion?: string
  interviewAnswer?: string
  followUp?: string
  followUpAnswer?: string
}

export interface IDifficultyDimensions {
  oop: 'easy' | 'medium' | 'hard'
  solid: 'easy' | 'medium' | 'hard'
  patterns: 'easy' | 'medium' | 'hard'
  extensibility: 'easy' | 'medium' | 'hard'
  requirementAmbiguity: 'easy' | 'medium' | 'hard'
}

export interface IJourneyTopic extends Document {
  slug: string
  title: string
  subtitle: string
  stage: 1 | 2 | 3 | 4 | 5
  order: number
  type: 'concept' | 'practice' | 'interview'
  description: string
  estimatedMinutes: number
  icon: string
  /** @deprecated prefer modules */
  content?: ITopicContent
  modules: IModuleBlock[]
  practiceSet: IPracticeItem[]
  cheatSheet: ICheatSheetCard[]
  interviewBank: IInterviewQA[]
  takeaways: string[]
  externalPractice?: IExternalPractice
  recommendedRoles: string[]
  minLevel: 'scratch' | 'oop' | 'basic-lld' | 'solving'
  emphasisWeightByRole: Record<string, number>
  gatePracticeUntilChecksPass: boolean
  masteryThreshold: number
  difficultyDimensions: IDifficultyDimensions
  buildsSkills: string[]
  prerequisites: string[]
  interviewerProbes: string[]
  commonMistakes: string[]
  patternMapSteps: { label: string; description: string }[]
  tags: string[]
  status: 'published' | 'draft'
  linkedStudioPack?: string
  linkedLearnExercise?: string
  createdAt: Date
  updatedAt: Date
}

const diagramSnapshotSchema = new Schema(
  {
    version: Number,
    meta: Schema.Types.Mixed,
    nodes: { type: [Schema.Types.Mixed], default: [] },
    edges: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false },
)

const knowledgeCheckSchema = new Schema(
  {
    id: { type: String, required: true },
    prompt: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'multi', 'short'], default: 'mcq' },
    options: [
      {
        id: String,
        label: String,
        correct: Boolean,
      },
    ],
    explanation: String,
    modelAnswer: String,
  },
  { _id: false },
)

const moduleBlockSchema = new Schema(
  {
    id: { type: String, required: true },
    kind: {
      type: String,
      enum: [
        'concept',
        'example',
        'real_world',
        'diagram',
        'knowledge_check',
        'tips',
        'mistakes',
        'summary',
        'explain',
      ],
      required: true,
    },
    title: { type: String, required: true },
    durationMin: Number,
    body: String,
    variants: [{ role: String, body: String }],
    bullets: [String],
    steps: [{ title: String, body: String }],
    diagramSnapshot: diagramSnapshotSchema,
    diagramCaption: String,
    checks: [knowledgeCheckSchema],
  },
  { _id: false },
)

const practiceItemSchema = new Schema(
  {
    id: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    prompt: { type: String, required: true },
    hints: { type: [String], default: [] },
    solution: {
      explanation: { type: String, required: true },
      diagramSnapshot: diagramSnapshotSchema,
      codeSnippet: String,
      codeLanguage: String,
    },
    commonMistakes: { type: [String], default: [] },
    checks: {
      type: {
        type: String,
        enum: ['mcq', 'multi', 'short', 'diagram_mark'],
      },
      options: [{ id: String, label: String, correct: Boolean }],
      expectedElementIds: [String],
      modelAnswer: String,
      explanation: String,
    },
    buildsSkills: [String],
  },
  { _id: false },
)

const topicContentSchema = new Schema<ITopicContent>(
  {
    learn: { type: String },
    whyItMatters: { type: String },
    interviewTip: { type: String },
    realExperience: { type: String },
    spotItPrompt: { type: String },
    spotItDesign: { type: String },
    spotItAnswer: { type: String },
    fixItPrompt: { type: String },
    fixItAnswer: { type: String },
    interviewQuestion: { type: String },
    interviewAnswer: { type: String },
    followUp: { type: String },
    followUpAnswer: { type: String },
  },
  { _id: false },
)

const difficultyDimensionsSchema = new Schema<IDifficultyDimensions>(
  {
    oop: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    solid: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    patterns: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    extensibility: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    requirementAmbiguity: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  },
  { _id: false },
)

const journeyTopicSchema = new Schema<IJourneyTopic>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    stage: { type: Number, enum: [1, 2, 3, 4, 5], required: true, index: true },
    order: { type: Number, required: true },
    type: { type: String, enum: ['concept', 'practice', 'interview'], default: 'concept' },
    description: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 20 },
    icon: { type: String, default: '📖' },
    content: { type: topicContentSchema },
    modules: { type: [moduleBlockSchema], default: [] },
    practiceSet: { type: [practiceItemSchema], default: [] },
    cheatSheet: {
      type: [
        {
          title: String,
          bullets: [String],
          diagramSnapshot: diagramSnapshotSchema,
        },
      ],
      default: [],
    },
    interviewBank: {
      type: [{ question: String, answer: String, tags: [String] }],
      default: [],
    },
    takeaways: { type: [String], default: [] },
    externalPractice: {
      blurb: String,
      studioPacks: [String],
      learnSlugs: [String],
    },
    recommendedRoles: {
      type: [String],
      default: ['sde1', 'sde2', 'backend', 'fullstack', 'general'],
    },
    minLevel: {
      type: String,
      enum: ['scratch', 'oop', 'basic-lld', 'solving'],
      default: 'scratch',
    },
    emphasisWeightByRole: { type: Map, of: Number, default: {} },
    gatePracticeUntilChecksPass: { type: Boolean, default: true },
    masteryThreshold: { type: Number, default: 70 },
    difficultyDimensions: { type: difficultyDimensionsSchema, default: () => ({}) },
    buildsSkills: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },
    interviewerProbes: { type: [String], default: [] },
    commonMistakes: { type: [String], default: [] },
    patternMapSteps: {
      type: [{ label: String, description: String }],
      default: [],
    },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
    linkedStudioPack: { type: String },
    linkedLearnExercise: { type: String },
  },
  { timestamps: true },
)

export const JourneyTopic = model<IJourneyTopic>('JourneyTopic', journeyTopicSchema)
