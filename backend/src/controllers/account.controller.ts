import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { Diagram } from '../models/diagram.model'
import { User } from '../models/user.model'
import { createError } from '../middleware/error'

export const accountController = {

  // PATCH /account/name — update display name
  updateName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const { name } = req.body as { name?: string }

      if (!name || !name.trim()) {
        return next(createError('Name cannot be empty', 400))
      }

      await User.findByIdAndUpdate(userId, { name: name.trim() })

      res.json({ ok: true, name: name.trim() })
    } catch (err) {
      next(err)
    }
  },

  // DELETE /account — delete all diagrams + user record
  deleteAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id

      await Promise.all([
        Diagram.deleteMany({
          userId: new mongoose.Types.ObjectId(userId),
          isTemplate: false,
        }),
        User.findByIdAndDelete(userId),
      ])

      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },
}
