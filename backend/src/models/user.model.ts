import { Schema, model, Document } from 'mongoose'
import type { PlanName } from '../config/plans'

export interface IUser extends Document {
  name: string
  email: string
  image?: string
  authProvider: 'google' | 'email'
  plan: PlanName
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    image:        { type: String },
    authProvider: { type: String, enum: ['google', 'email'], default: 'google' },
    plan:         { type: String, enum: ['free', 'pro', 'ultimate'], default: 'free', index: true },
  },
  { timestamps: true }
)

export const User = model<IUser>('User', userSchema)
