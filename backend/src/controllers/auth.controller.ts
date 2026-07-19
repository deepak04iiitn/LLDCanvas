import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { User } from '../models/user.model'
import { signAuthToken } from '../utils/jwt'
import { verifyFirebaseIdToken } from '../config/firebase-admin'
import { createError } from '../middleware/error'

const BCRYPT_ROUNDS = 12

const signUpSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
})

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

const googleSchema = z.object({
  idToken: z.string().min(1),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    authProvider: user.authProvider,
    isAdmin: user.isAdmin,
    blocked: user.blocked,
    plan: user.plan,
  }
}

export const authController = {
  signUp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = signUpSchema.parse(req.body)

      const existing = await User.findOne({ email })
      if (existing) throw createError('An account with this email already exists', 409)

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
      const user = await User.create({ name, email, authProvider: 'email', passwordHash, lastLoginAt: new Date() })

      const token = signAuthToken({ id: user.id, email: user.email })
      res.json({ token, user: serializeUser(user) })
    } catch (err) {
      next(err)
    }
  },

  signIn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = signInSchema.parse(req.body)

      const user = await User.findOne({ email }).select('+passwordHash')
      if (!user || !user.passwordHash) throw createError('Invalid email or password', 401)

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) throw createError('Invalid email or password', 401)

      if (user.blocked) throw createError('Account has been blocked. Contact support.', 403)

      user.lastLoginAt = new Date()
      await user.save()

      const token = signAuthToken({ id: user.id, email: user.email })
      res.json({ token, user: serializeUser(user) })
    } catch (err) {
      next(err)
    }
  },

  google: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = googleSchema.parse(req.body)
      const firebaseUser = await verifyFirebaseIdToken(idToken)

      let user = await User.findOne({ email: firebaseUser.email })
      if (!user) {
        user = await User.create({
          name: firebaseUser.name,
          email: firebaseUser.email,
          image: firebaseUser.picture,
          authProvider: 'google',
          firebaseUid: firebaseUser.uid,
          lastLoginAt: new Date(),
        })
      } else {
        if (!user.firebaseUid) user.firebaseUid = firebaseUser.uid
        user.lastLoginAt = new Date()
        await user.save()
      }

      if (user.blocked) throw createError('Account has been blocked. Contact support.', 403)

      const token = signAuthToken({ id: user.id, email: user.email })
      res.json({ token, user: serializeUser(user) })
    } catch (err) {
      next(err)
    }
  },

  me: async (req: Request, res: Response) => {
    res.json({ user: req.user })
  },
}
