/**
 * Creates any missing indexes for every Mongoose model.
 *
 * Production runs with autoIndex disabled (see config/db.ts) so cold starts
 * don't re-issue createIndex for ~60 collections. Run this once after
 * deploying, and again whenever a model gains an index:
 *
 *   npm run sync-indexes
 *
 * It only CREATES missing indexes (createIndexes). It never drops anything unless
 * you pass --replace-conflicting, which drops an existing TEXT index whose
 * fields differ from the schema's, then recreates it (search is briefly
 * unavailable while it rebuilds).
 *
 *   npm run sync-indexes -- --replace-conflicting
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

  // The flag can be lost when passed through npm/PowerShell, so an env var works too.
  const replaceConflicting =
    process.argv.includes('--replace-conflicting') || process.env.REPLACE_CONFLICTING === 'true'
  console.log(`replace-conflicting: ${replaceConflicting ? 'ON' : 'off'}`)
  const failed: string[] = []

  for (const name of mongoose.modelNames()) {
    const model = mongoose.model(name)
    try {
      await model.createIndexes()
      console.log(`✓ ${name}`)
    } catch (err) {
      const e = err as { code?: number; codeName?: string; message?: string }
      // 85/86 = an index on the same keys already exists with different options
      // (e.g. an old text index covering different fields).
      const isIndexConflict =
        e.code === 85 || e.code === 86 ||
        e.codeName === 'IndexOptionsConflict' || e.codeName === 'IndexKeySpecsConflict'
      if (replaceConflicting && isIndexConflict) {
        try {
          const existing = await model.collection.indexes()
          const textIdx = existing.find(i =>
            (i.key && (i.key as Record<string, unknown>)._fts === 'text') || (i as { weights?: unknown }).weights !== undefined,
          )
          if (!textIdx?.name) throw new Error(`conflict is not a text index; found: ${existing.map(i => i.name).join(', ')}`)
          console.log(`… ${name}: dropping conflicting text index "${textIdx.name}" and recreating`)
          await model.collection.dropIndex(textIdx.name)
          await model.createIndexes()
          console.log(`✓ ${name} (replaced)`)
          continue
        } catch (retryErr) {
          console.error(`✗ ${name}: ${(retryErr as Error).message}`)
          failed.push(name)
          continue
        }
      }
      console.error(`✗ ${name}: ${e.codeName ?? ''} ${e.message ?? err}`)
      failed.push(name)
    }
  }

  console.log(`Done: ${mongoose.modelNames().length - failed.length}/${mongoose.modelNames().length} models OK`)
  if (failed.length) {
    console.log(`Failed: ${failed.join(', ')}`)
    console.log('Re-run with --replace-conflicting to drop+recreate a conflicting TEXT index.')
    process.exitCode = 1
  }
  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
