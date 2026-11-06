/**
 * Repair only the broken nested-paren if/while patterns left by the bad formatter.
 * Pattern examples:
 *
 *   if (!status.equals("ACTIVE") {
 *     && !status.equals("CLOSED"))
 *   }
 *
 *     throw new IllegalStateException(...);
 *
 *   if (id_.empty() {
 *     || name_.empty()) throw invalid_argument("...");
 *   }
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'src', 'content', 'problem-solutions')
const BATCHES = ['batch1', 'batch2', 'batch3', 'batch4', 'batch5', 'batch6']
const CODE_CONST_RE =
  /\bconst\s+(py|python|java|ts|typescript|cpp|go|goCode|csharp|cs)\s*=\s*`/g

function listSolutionFiles() {
  const files = []
  for (const batch of BATCHES) {
    const dir = path.join(ROOT, batch)
    if (!fs.existsSync(dir)) continue
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('.ts') || name.startsWith('_')) continue
      files.push(path.join(dir, name))
    }
  }
  return files
}

function findCodeLiterals(src) {
  const out = []
  CODE_CONST_RE.lastIndex = 0
  let m
  while ((m = CODE_CONST_RE.exec(src))) {
    const contentStart = m.index + m[0].length
    let i = contentStart
    let code = ''
    while (i < src.length) {
      const ch = src[i]
      if (ch === '\\' && i + 1 < src.length) {
        code += ch + src[i + 1]
        i += 2
        continue
      }
      if (ch === '`') break
      code += ch
      i++
    }
    if (i >= src.length || src[i] !== '`') continue
    out.push({ name: m[1], contentStart, code })
  }
  return out
}

function unitFor(ind) {
  return ind.includes('\t') ? '\t' : '  '
}

/**
 * Returns true if `if (text` has unbalanced ( more than ).
 * Used to detect the broken opener `if (foo() {`
 */
function conditionUnbalanced(openText) {
  // openText is inside the outer if(, not including the if( itself
  let depth = 1 // already inside if(
  for (const ch of openText) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
  }
  return depth > 0
}

function repairCode(code) {
  const lines = code.split('\n')
  const out = []
  let repairs = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const m = line.match(/^([ \t]*)(if|while|else if)\s*\((.*)\{[ \t]*$/)
    if (!m || !conditionUnbalanced(m[3])) {
      out.push(line)
      continue
    }

    const ind = m[1]
    const kw = m[2]
    const left = m[3] // e.g. `!status.equals("ACTIVE") ` or `id_.empty() `
    const n1 = lines[i + 1]
    if (!n1 || !/^\s*(&&|\|\|)/.test(n1)) {
      out.push(line)
      continue
    }

    let j = i + 1
    let opChunk = ''
    let inlineStmt = null
    let ifCloserConsumed = false

    // Consume && / || continuation lines
    while (j < lines.length && /^\s*(&&|\|\|)/.test(lines[j])) {
      const t = lines[j].trim()
      // `|| name_.empty()) throw ...;` — split at the ) that closes the if, before the statement
      const throwAt = t.search(/\)[ \t]+(throw|return|break|continue)\b/)
      if (throwAt >= 0) {
        opChunk += (opChunk ? ' ' : '') + t.slice(0, throwAt)
        inlineStmt = t.slice(throwAt).replace(/^\)\s*/, '').trim()
        ifCloserConsumed = true
        j++
        break
      }
      opChunk += (opChunk ? ' ' : '') + t
      j++
    }

    // Optional lone `)` line
    if (j < lines.length && /^\s*\)\s*$/.test(lines[j])) {
      ifCloserConsumed = true
      j++
    }

    // Closing brace of the wrongly opened block
    if (j < lines.length && /^\s*\}\s*$/.test(lines[j])) {
      j++
    }

    // Skip blank lines
    while (j < lines.length && lines[j].trim() === '') j++

    let stmt = inlineStmt
    if (!stmt && j < lines.length) {
      stmt = lines[j].trim()
      j++
    }

    // When the continuation line was `&& foo())` with no inline stmt, strip the if-closer )
    let right = opChunk.trim()
    if (!ifCloserConsumed && right.endsWith(')')) {
      right = right.replace(/\)\s*$/, '')
      ifCloserConsumed = true
    }

    const cond = `${left}${right}`.replace(/[ \t]+/g, ' ').trim()
    const unit = unitFor(ind)

    if (!stmt) {
      out.push(`${ind}${kw} (${cond}) {`)
      out.push(`${ind}}`)
    } else {
      out.push(`${ind}${kw} (${cond}) {`)
      out.push(`${ind}${unit}${stmt}`)
      out.push(`${ind}}`)
    }
    repairs++
    i = j - 1
  }

  return { code: out.join('\n'), repairs }
}

function countBrokenOpeners(code) {
  const lines = code.split('\n')
  let n = 0
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^[ \t]*(if|while|else if)\s*\((.*)\{[ \t]*$/)
    if (!m) continue
    if (conditionUnbalanced(m[2]) && lines[i + 1] && /^\s*(&&|\|\|)/.test(lines[i + 1])) n++
  }
  return n
}

function processFile(file) {
  const src = fs.readFileSync(file, 'utf8')
  const lits = findCodeLiterals(src)
  let next = src
  let totalRepairs = 0
  let remaining = 0
  for (let i = lits.length - 1; i >= 0; i--) {
    const lit = lits[i]
    const before = countBrokenOpeners(lit.code)
    const { code, repairs } = repairCode(lit.code)
    const after = countBrokenOpeners(code)
    remaining += after
    totalRepairs += repairs
    if (code !== lit.code) {
      next = next.slice(0, lit.contentStart) + code + next.slice(lit.contentStart + lit.code.length)
    }
    if (before && repairs === 0) {
      // no-op
    }
  }
  if (next !== src) fs.writeFileSync(file, next, 'utf8')
  return { repairs: totalRepairs, remaining, changed: next !== src }
}

function main() {
  const files = listSolutionFiles()
  let repairs = 0
  let changed = 0
  const still = []
  for (const f of files) {
    const r = processFile(f)
    repairs += r.repairs
    if (r.changed) changed++
    if (r.remaining) still.push(path.relative(ROOT, f) + ':' + r.remaining)
  }

  // Spot-check traffic-light java validate
  const tl = fs.readFileSync(path.join(ROOT, 'batch1', 'traffic-light-system.ts'), 'utf8')
  const javaStart = tl.indexOf('const java = `')
  const validateAt = tl.indexOf('void validate()', javaStart)
  console.log('--- java validate after repair ---')
  console.log(tl.slice(validateAt, validateAt + 320))
  const cppStart = tl.indexOf('const cpp = `')
  const yel = tl.indexOf('YELLOW(string', cppStart)
  console.log('--- cpp YELLOW ctor ---')
  console.log(tl.slice(yel, yel + 280))

  console.log(JSON.stringify({ files: files.length, changed, repairs, stillBroken: still.slice(0, 15), stillCount: still.length }, null, 2))
}

main()
