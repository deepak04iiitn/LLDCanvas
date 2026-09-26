import { Schema, model, Document } from 'mongoose'

export interface IDesignBug extends Document {
  slug: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  /** The UML diagram data as JSON (nodes + edges) */
  diagramData: {
    nodes: any[]
    edges: any[]
  }
  /** Expected issues the user should find */
  expectedIssues: Array<{
    id: string
    type: string // 'srp_violation' | 'wrong_relationship' | 'missing_abstraction' | 'god_class' | 'tight_coupling'
    targetClass: string // class name the issue is on
    description: string // explanation
    interviewContext: string // why this matters in an interview
  }>
  explanation: string // overall explanation shown after completion
  status: 'draft' | 'published'
  order: number
}

const schema = new Schema<IDesignBug>(
  {
    slug:        { type: String, unique: true, required: true },
    title:       { type: String, required: true },
    description: String,
    difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    diagramData: {
      nodes: [Schema.Types.Mixed],
      edges: [Schema.Types.Mixed],
    },
    expectedIssues: [
      {
        id:               String,
        type:             String,
        targetClass:      String,
        description:      String,
        interviewContext: String,
      },
    ],
    explanation: String,
    status:      { type: String, enum: ['draft', 'published'], default: 'draft' },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const DesignBug = model<IDesignBug>('DesignBug', schema)
