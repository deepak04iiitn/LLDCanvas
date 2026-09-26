import { Schema, model, Document, Types } from 'mongoose'

export type ChallengePackType =
  | 'debugger'
  | 'refactor'
  | 'change_one'
  | 'evolution'
  | 'budget'
  | 'microscope'
  | 'depweb'
export type ChallengePackStatus = 'draft' | 'published' | 'archived'
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard'
export type PlanMin = 'free' | 'pro' | 'ultimate'

export interface IChallengePack extends Document {
  type: ChallengePackType
  slug: string
  title: string
  difficulty: ChallengeDifficulty
  description: string
  diagramSnapshot: Record<string, unknown>
  payload: Record<string, unknown>
  status: ChallengePackStatus
  planMin: PlanMin
  problemId?: Types.ObjectId
  tags: string[]
  order: number
  createdAt: Date
  updatedAt: Date
}

const challengePackSchema = new Schema<IChallengePack>(
  {
    type: {
      type: String,
      enum: [
        'debugger',
        'refactor',
        'change_one',
        'evolution',
        'budget',
        'microscope',
        'depweb',
      ],
      required: true,
      index: true,
    },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    description: { type: String, default: '' },
    diagramSnapshot: { type: Schema.Types.Mixed, default: {} },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    planMin: { type: String, enum: ['free', 'pro', 'ultimate'], default: 'free' },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

challengePackSchema.index({ type: 1, status: 1, order: 1 })

export const ChallengePack = model<IChallengePack>('ChallengePack', challengePackSchema)
