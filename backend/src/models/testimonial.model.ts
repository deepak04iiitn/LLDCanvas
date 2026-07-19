import { Schema, model, Document } from 'mongoose'

export type TestimonialStatus = 'pending' | 'approved' | 'rejected'

export interface ITestimonial extends Document {
  userId:    string
  name:      string
  email:     string
  role:      string       // e.g. "SDE-2 @ Google", "Final-year CS student"
  content:   string       // the testimonial text
  rating:    number       // 1-5
  avatar:    string       // URL or initials fallback
  status:    TestimonialStatus
  featured:  boolean      // pinned to top of display
  adminNote: string
  createdAt: Date
  updatedAt: Date
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    userId:    { type: String, required: true, index: true },
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true },
    role:      { type: String, default: '', trim: true, maxlength: 100 },
    content:   { type: String, required: true, trim: true, maxlength: 1000 },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    avatar:    { type: String, default: '' },
    status:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    featured:  { type: Boolean, default: false, index: true },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true },
)

export const Testimonial = model<ITestimonial>('Testimonial', testimonialSchema)
