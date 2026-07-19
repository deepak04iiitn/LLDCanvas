import { Schema, model, Document } from 'mongoose'
import type { PlanName } from '../config/plans'

export interface IUser extends Document {
  name: string
  email: string
  image?: string
  authProvider: 'google' | 'email'
  passwordHash?: string   // set only for authProvider: 'email'
  firebaseUid?: string    // set only for authProvider: 'google'
  isAdmin: boolean
  blocked: boolean
  plan: PlanName
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    image:        { type: String },
    authProvider: { type: String, enum: ['google', 'email'], default: 'google' },
    passwordHash: { type: String, select: false },
    firebaseUid:  { type: String, index: true, sparse: true },
    isAdmin:      { type: Boolean, default: false },
    blocked:      { type: Boolean, default: false },
    plan:         { type: String, enum: ['free', 'pro', 'ultimate'], default: 'free', index: true },
    lastLoginAt:  { type: Date },
  },
  { timestamps: true }
)

export const User = model<IUser>('User', userSchema)
