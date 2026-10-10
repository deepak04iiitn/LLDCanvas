import { Schema, model, Document } from 'mongoose'

export interface IQuizQuestion extends Document {
  slug: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
  skillTag: string
  status: 'draft' | 'published' | 'archived'
  createdAt: Date
  updatedAt: Date
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    slug: { type: String, required: true, unique: true },
    topic: { type: String, default: 'SOLID' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    prompt: { type: String, required: true },
    choices: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: '' },
    skillTag: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  },
  { timestamps: true },
)

export const QuizQuestion = model<IQuizQuestion>('QuizQuestion', quizQuestionSchema)
