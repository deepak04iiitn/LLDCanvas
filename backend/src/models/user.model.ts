import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  image?: string
  authProvider: 'google' | 'email'
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String },
    authProvider: { type: String, enum: ['google', 'email'], default: 'google' },
  },
  { timestamps: true }
)

export const User = model<IUser>('User', userSchema)
