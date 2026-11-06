/**
 * Final pass:
 * 1) Fix over-escaped ` and ${ in TypeScript solution blocks (\\\` → \`)
 * 2) Expand remaining single-line `{ body }` safely
 * 3) Brace dangling if/while/for using BALANCED parentheses
 * 4) Ensure blank lines between methods
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

function normalizeLang(name) {
  const n = name.toLowerCase()
  if (n === 'py' || n === 'python') return 'python'
  if (n === 'ts' || n === 'typescript') return 'typescript'
  if (n === 'gocode' || n === 'go') return 'go'
  if (n === 'cs' || n === 'csharp') return 'csharp'
  return n
}

function indentUnit(line) {
  const ws = (line.match(/^(\s*)/) || ['', ''])[1]
  return ws.includes('\t') ? '\t' : '  '
}

function fixTsOverEscapes(code) {
  // Collapse 2+ backslashes before ` or ${ down to a single escape
  return code.replace(/\\{2,}`/g, '\\`').replace(/\\{2,}\$\{/g, '\\${')
}

function shouldExpandBraceBlock(head, body) {
  const h = head.trim()
  const b = body.trim()
  if (!h || !b) return false
  if (/^import\b/.test(h) || /^export\s*\{/.test(h) || /^using\s*\{/.test(h)) return false
  if (/^#/.test(h)) return false
  if (/[=:]\s*$/.test(h)) return false
  if (/:=\s*[\w.<>,\s\[\]\*]+$/.test(h)) return false
  if (/\bnew\s+[\w.<>,\s]+$/.test(h)) return false
  if (/[{}]/.test(b)) return false
  if (/^(if|else\s+if|else|for|while|do|catch|try|switch|foreach|lock|using)\b/.test(h)) return true
  if (/\)\s*([\w.<>,\s\[\]\*]|const|override|final|noexcept|async|mut|throws\b|where\b)*$/.test(h)) {
    return true
  }
  if (/\w+\s*\([^;\n]*\)\s*(throws\s+[\w\s,.]+)?\s*$/.test(h) && !/^\s*return\b/.test(h)) return true
  return false
}

function expandTryCatchLine(line) {
  const m = line.match(
    /^(\s*)try\s*\{\s*([^{}]+?)\s*\}\s*catch\s*(\([^)]*\))\s*\{\s*([^{}]+?)\s*\}\s*;?\s*$/,
  )
  if (!m) return null
  const ind = m[1]
  const unit = indentUnit(line)
  return [
    `${ind}try {`,
    `${ind}${unit}${m[2].trim().replace(/;?\s*$/, ';')}`,
    `${ind}} catch ${m[3]} {`,
    `${ind}${unit}${m[4].trim().replace(/;?\s*$/, ';')}`,
    `${ind}}`,
  ]
}

function expandSingleBraceLine(line) {
  const tryCatch = expandTryCatchLine(line)
  if (tryCatch) return tryCatch
  const m = line.match(/^(\s*)([^{}\n]+)\{([^{}\n]*)\}\s*;?\s*$/)
  if (!m) return [line]
  if (!shouldExpandBraceBlock(m[2], m[3])) return [line]
  const ind = m[1]
  const unit = indentUnit(line)
  const body = m[3].trim()
  return [`${ind}${m[2].trimEnd()} {`, `${ind}${unit}${body}`, `${ind}}`]
}

/** Match keyword + balanced (...) then rest of line. */
function matchControlWithBalancedParens(line) {
  const m = line.match(/^(\s*)(if|else\s+if|while|for)\s*\(/)
  if (!m) return null
  const ind = m[1]
  const kw = m[2]
  let i = m[0].length // after opening (
  let depth = 1
  const condChars = []
  while (i < line.length && depth > 0) {
    const ch = line[i]
    // skip strings roughly
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch
      condChars.push(ch)
      i++
      while (i < line.length) {
        const c = line[i]
        condChars.push(c)
        if (c === '\\' && i + 1 < line.length) {
          condChars.push(line[i + 1])
          i += 2
          continue
        }
        if (c === quote) {
          i++
          break
        }
        i++
      }
      continue
    }
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (depth > 0) condChars.push(ch)
    i++
  }
  if (depth !== 0) return null
  const rest = line.slice(i).trim()
  if (!rest || rest.startsWith('{') || rest.startsWith('//')) return null
  // else if handled as kw
  return { ind, kw, cond: condChars.join(''), body: rest }
}

function braceDanglingControl(line) {
  // else STATEMENT (no if)
  const elseM = line.match(/^(\s*)else\s+(?!if\b)(?!\{)(.+)$/)
  if (elseM) {
    const ind = elseM[1]
    const unit = indentUnit(line)
    return [`${ind}else {`, `${ind}${unit}${elseM[2].trim()}`, `${ind}}`]
  }

  const hit = matchControlWithBalancedParens(line)
  if (!hit) return [line]
  const { ind, kw, cond, body } = hit
  const unit = indentUnit(line)
  return [`${ind}${kw} (${cond}) {`, `${ind}${unit}${body}`, `${ind}}`]
}

function expandExpressionBodied(line, lang) {
  if (lang !== 'csharp') return [line]
  const m = line.match(/^(\s*)(.+?\)\s*)=>\s*([^;]+);\s*$/)
  if (!m) return [line]
  const ind = m[1]
  const head = m[2].trimEnd()
  if (!/\w+\s*\(/.test(head)) return [line]
  const unit = indentUnit(line)
  const expr = m[3].trim()
  const body = /^(return|throw)\b/.test(expr) ? `${expr};` : `return ${expr};`
  return [`${ind}${head} {`, `${ind}${unit}${body}`, `${ind}}`]
}

function expandOneLiners(code, langName) {
  const lang = normalizeLang(langName)
  if (lang === 'python') return code
  const out = []
  for (const line of code.split('\n')) {
    if (/^\s*\/\//.test(line)) {
      out.push(line)
      continue
    }
    let expanded = expandSingleBraceLine(line)
    if (expanded.length === 1) expanded = expandExpressionBodied(line, lang)
    if (expanded.length === 1) expanded = braceDanglingControl(expanded[0])
    out.push(...expanded)
  }
  return out.join('\n')
}

function looksLikeMethodOrTypeStart(line, lang) {
  const t = line.trim()
  if (!t || t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) return false
  if (t === '{' || t === '}' || t === '};' || /^(public|private|protected):$/.test(t)) return false
  if (lang === 'python') return /^(async\s+)?def\s+|@\w+|class\s+/.test(t)
  if (lang === 'go') return /^func\s+/.test(t) || /^type\s+\w+\s+(struct|interface)\b/.test(t)
  if (/^@\w+/.test(t)) return true
  if (
    /^(public|private|protected|internal|static|virtual|override|async|export|abstract|sealed|partial|friend)\b/.test(
      t,
    )
  ) {
    return true
  }
  if (/^(const\s+)?[\w:<>,\s\*\&\[\]]+\s+\w+\s*\(/.test(t)) return true
  if (/^(class|struct|interface|enum|record|namespace)\s+/.test(t)) return true
  if (lang === 'typescript' && /^(async\s+)?(get\s+|set\s+)?[\w$]+\s*\(/.test(t)) return true
  if (/^void\s+\w+\s*\(/.test(t)) return true
  if (/^(bool|int|long|double|float|string|auto|size_t|uint\w*|int\w*)\b.+\(/.test(t)) return true
  return false
}

function addSpacing(code, langName) {
  const lang = normalizeLang(langName)
  const lines = code.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    out.push(line)
    const next = lines[i + 1]
    if (!next || next.trim() === '') continue
    const curTrim = line.trim()

    if (lang === 'python') {
      if (/^(async\s+)?def\s+|^class\s+/.test(next.trim())) {
        if (curTrim && !curTrim.startsWith('@') && !/^(async\s+)?def\s+|^class\s+/.test(curTrim)) {
          out.push('')
        }
      }
      continue
    }

    if ((/^\s*\}\s*;?\s*$/.test(line) || /^\s*\};\s*$/.test(line)) && looksLikeMethodOrTypeStart(next, lang)) {
      out.push('')
    }
  }
  const collapsed = []
  let blankRun = 0
  for (const l of out) {
    if (l.trim() === '') {
      blankRun++
      if (blankRun <= 2) collapsed.push('')
    } else {
      blankRun = 0
      collapsed.push(l)
    }
  }
  return collapsed.join('\n')
}

function countBroken(code) {
  const lines = code.split('\n')
  let n = 0
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^[ \t]*(if|while|else if)\s*\((.*)\{[ \t]*$/)
    if (!m) continue
    let depth = 1
    for (const ch of m[2]) {
      if (ch === '(') depth++
      else if (ch === ')') depth--
    }
    if (depth > 0 && lines[i + 1] && /^\s*(&&|\|\|)/.test(lines[i + 1])) n++
  }
  return n
}

function reformat(code, langName) {
  const lang = normalizeLang(langName)
  let next = code
  if (lang === 'typescript') next = fixTsOverEscapes(next)
  next = expandOneLiners(next, langName)
  next = addSpacing(next, langName)
  next = expandOneLiners(next, langName)
  next = addSpacing(next, langName)
  return next
}

function processFile(file) {
  const src = fs.readFileSync(file, 'utf8')
  const lits = findCodeLiterals(src)
  let next = src
  let broken = 0
  let changed = false
  for (let i = lits.length - 1; i >= 0; i--) {
    const lit = lits[i]
    const formatted = reformat(lit.code, lit.name)
    broken += countBroken(formatted)
    if (formatted !== lit.code) {
      changed = true
      next =
        next.slice(0, lit.contentStart) +
        formatted +
        next.slice(lit.contentStart + lit.code.length)
    }
  }
  if (changed) fs.writeFileSync(file, next, 'utf8')
  return { changed, broken }
}

function main() {
  const files = listSolutionFiles()
  let changed = 0
  let brokenTotal = 0
  for (const f of files) {
    const r = processFile(f)
    if (r.changed) changed++
    brokenTotal += r.broken
  }

  const tl = fs.readFileSync(path.join(ROOT, 'batch1', 'traffic-light-system.ts'), 'utf8')
  const javaAt = tl.indexOf('void close()', tl.indexOf('const java = `'))
  console.log('--- java close ---')
  console.log(tl.slice(javaAt, javaAt + 280))
  const cppAt = tl.indexOf('const string& id()', tl.indexOf('const cpp = `'))
  console.log('--- cpp getters ---')
  console.log(tl.slice(cppAt, cppAt + 260))
  const tsLit = findCodeLiterals(tl).find(x => x.name === 'ts')
  const u = tsLit.code.indexOf('unknown TrafficLight')
  console.log('--- ts escape sample ---')
  console.log(JSON.stringify(tsLit.code.slice(u - 25, u + 45)))

  console.log(JSON.stringify({ files: files.length, changed, brokenTotal }, null, 2))
}

main()
