const fs = require('fs')
const base = 'c:/PERSONAL PROJECTS/LLDCanvas/frontend/src/content/problem-solutions/batch1/'
const names = ['cron-job-scheduler', 'quiz-trivia-engine', 'digital-wallet', 'meeting-room-booking']
const langs = ['py', 'java', 'ts', 'cpp', 'goCode', 'csharp']
for (const n of names) {
  const legacy = fs.readFileSync(base + '_legacy_short/' + n + '.ts', 'utf8').replace(/\r\n/g, '\n')
  let out = fs.readFileSync(base + n + '.ts', 'utf8').replace(/\r\n/g, '\n')
  for (const l of langs) {
    const re = new RegExp('^const ' + l + ' = `[\\s\\S]*?\\n`$', 'm')
    const m = legacy.match(re)
    if (!m) { console.log('MISSING', n, l); continue }
    const marker = '//@@' + l + '\n'
    if (!out.includes(marker)) { console.log('NOMARKER', n, l); continue }
    const block = m[0]
    out = out.replace(marker, () => block + '\n')
  }
  fs.writeFileSync(base + n + '.ts', out)
  console.log(n, out.split('\n').length, 'lines', (out.match(/\/\/@@/g) || []).length, 'markers left')
}
