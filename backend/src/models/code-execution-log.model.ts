import { Schema, model, Document } from 'mongoose'

export interface ICodeExecutionLog extends Document {
  userId:       string
  language:     string
  status:       'success' | 'error'
  exitCode:     number
  executionMs:  number
  memoryKb:     number
  codeLength:   number
  code?:        string   // source code at time of run (max 8 KB stored)
  problemSlug?: string   // set when code is run from a practice problem editor
  createdAt:    Date
}

const schema = new Schema<ICodeExecutionLog>(
  {
    userId:      { type: String, required: true, index: true },
    language:    { type: String, required: true },
    status:      { type: String, enum: ['success', 'error'], required: true },
    exitCode:    { type: Number, default: 0 },
    executionMs: { type: Number, default: 0 },
    memoryKb:    { type: Number, default: 0 },
    codeLength:  { type: Number, default: 0 },
    code:        { type: String, default: null },
    problemSlug: { type: String, default: null, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

schema.index({ createdAt: -1 })
schema.index({ userId: 1, createdAt: -1 })
schema.index({ language: 1, createdAt: -1 })
// For counting unique solvers per problem efficiently
schema.index({ problemSlug: 1, status: 1, userId: 1 })

export const CodeExecutionLog = model<ICodeExecutionLog>('CodeExecutionLog', schema)
