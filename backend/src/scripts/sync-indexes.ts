/**
 * Creates any missing indexes for every Mongoose model.
 *
 * Production runs with autoIndex disabled (see config/db.ts) so cold starts
 * don't re-issue createIndex for ~60 collections. Run this once after
 * deploying, and again whenever a model gains an index:
 *
 *   npm run sync-indexes
 *
 * It only CREATES missing indexes (createIndexes); it never drops anything.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import { connectDB } from '../config/db'

function collectModelFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return collectModelFiles(full)
    return /\.model\.(ts|js)$/.test(entry.name) ? [full] : []
  })
}

async function main() {
  // Register every model.
  for (const file of collectModelFiles(path.join(__dirname, '..', 'models'))) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(file)
  }

  await connectDB()

  for (const name of mongoose.modelNames()) {
    const model = mongoose.model(name)
    await model.createIndexes()
    console.log(`✓ ${name}`)
  }

  console.log(`Done: ${mongoose.modelNames().length} models`)
  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
