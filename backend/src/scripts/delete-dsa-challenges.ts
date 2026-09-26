import 'dotenv/config'
import { connectDB } from '../config/db'
import { DebuggerChallenge } from '../models/learn/debugger-challenge.model'

const OLD_SLUGS = [
  'sum-list-off-by-one','palindrome-check','factorial-missing-base',
  'find-max-wrong-init','binary-search-off-by-one','count-vowels-case',
  'fibonacci-wrong-init','power-function','check-prime','bubble-sort-bounds',
  'count-words-split','stack-empty-check','gcd-euclidean','matrix-transpose',
  'two-sum-self-pair','run-length-encoding','count-negatives','sum-of-digits',
  'reverse-string-index','missing-number',
]

async function main() {
  await connectDB()
  const res = await DebuggerChallenge.deleteMany({ slug: { $in: OLD_SLUGS } })
  console.log('Deleted', res.deletedCount, 'old DSA challenges')
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
