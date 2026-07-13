import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { Diagram } from '../models/diagram.model'
import { getMongoClient } from '../config/auth'
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

      const client = await getMongoClient()
      const db = client.db()

      await db.collection('user').updateOne(
        { id: userId },
        { $set: { name: name.trim(), updatedAt: new Date() } },
      )

      res.json({ ok: true, name: name.trim() })
    } catch (err) {
      next(err)
    }
  },

  // DELETE /account — delete all diagrams + user record + sessions + accounts
  deleteAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id

      // 1. Delete all diagrams owned by the user (non-templates)
      await Diagram.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
        isTemplate: false,
      })

      // 2. Delete the user's Better Auth records
      //    Better Auth uses native MongoDB collections: user, session, account, verification
      const client = await getMongoClient()
      const db = client.db()

      await Promise.all([
        db.collection('session').deleteMany({ userId }),
        db.collection('account').deleteMany({ userId }),
        db.collection('user').deleteOne({ id: userId }),
      ])

      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },
}
