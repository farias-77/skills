#!/usr/bin/env node
/*
 * review-prep.mjs — prepares a design-review round so its args stay small.
 *
 *   node review-prep.mjs <workstream> --round 1
 *   node review-prep.mjs <workstream> --round 2 --fixes <fixes.json>
 *        [--workflow <path to design-review.js>]   (default: the pipeline's claude/workflows/design-review.js)
 *        [--doc-budget-kb <n>] [--total-budget-kb <n>]   (defaults: 40 and 320)
 *
 * A workflow script cannot read files, and the round needs text: every
 * flow of architecture.md, and in round 2 the fixes, the documents and
 * flows that changed, and the lenses to seat. Passed as args, that is
 * tens of kilobytes the conductor types out. This script reads them
 * from disk and writes <workstream>/_run/design-review.js: a copy of
 * the workflow with them embedded (the line `const EMBEDDED = null`).
 * The conductor then runs the copy by scriptPath with the small args
 * (paths, round, language, glossary). The copy also sidesteps a
 * Workflow tool that refuses a scriptPath resolving outside the
 * session's working directories.
 *
 * round 1  splits `## Flows` of 01-design/architecture.md at every `### `
 *          heading (id: the heading, without "(covers …)", as a slug);
 *          writes _run/review-r1-snapshot.json (a sha256 per document
 *          and per flow) for round 2 to diff against.
 * round 2  the same split; `changed` = the documents (01-design/*.md
 *          but reviews.md and telemetry.md) and flows whose sha256
 *          differs from the round-1 snapshot;
 *          `fixes` from --fixes (a JSON list the conductor writes from
 *          his rulings: { id, doc, fix, severity? }, a merged group's id
 *          joined with "+"); a fix without severity takes the highest
 *          severity of its ids in 01-design/reviews/round-1.json;
 *          `lenses` = the lenses of the fixes whose severity is blocker
 *          or fix, plus design-reviewer-consistency.
 *
 * size     every round weighs the documents the round reviews (notes.md
 *          aside: it is the conductor's record): one document over
 *          --doc-budget-kb (default 40 KB) or the set over
 *          --total-budget-kb (default 320 KB) is a warning on stderr and
 *          in `sizeWarnings`, never a failure. The defaults fit a build
 *          of about a working week; a bigger pick passes bigger numbers.
 *          A document over budget usually copies what another source
 *          holds (an AC's text, a table of another document).
 *
 * Prints one JSON line: the copy's path, the source's sha256, the flow
 * ids, the size warnings, and in round 2 changed, lenses and the fix
 * count. Exit 1 on a missing input.
 */

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const opt = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined }
const die = (msg) => { console.error(`review-prep: ${msg}`); process.exit(1) }

const ws = argv[0] && !argv[0].startsWith('--') ? resolve(argv[0]) : die('usage: review-prep.mjs <workstream> --round 1|2 [--fixes fixes.json] [--workflow design-review.js]')
const round = Number(opt('round') ?? die('--round 1|2 is required'))
if (![1, 2].includes(round)) die(`round ${round}: 1 or 2 (there is no round 3)`)
const here = dirname(fileURLToPath(import.meta.url))
const source = resolve(opt('workflow') ?? join(here, '../../../workflows/design-review.js'))
const designDir = join(ws, '01-design')
const runDir = join(ws, '_run')
const sha = (text) => createHash('sha256').update(text).digest('hex')

// ---------- the flows ----------

const archPath = join(designDir, 'architecture.md')
if (!existsSync(archPath)) die(`${archPath} not found`)
const lines = readFileSync(archPath, 'utf8').split('\n')
const start = lines.findIndex(l => /^## Flows\b/.test(l))
if (start < 0) die('architecture.md has no "## Flows" section')
let end = lines.findIndex((l, i) => i > start && /^## /.test(l))
if (end < 0) end = lines.length
const slug = (s) => s.replace(/\(covers[^)]*\)/i, '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'flow'
const flows = []
const seen = new Map()
lines.slice(start + 1, end).forEach(line => {
  if (/^### /.test(line)) {
    const base = slug(line.slice(4))
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    flows.push({ id: n > 1 ? `${base}-${n}` : base, text: line })
  } else if (flows.length) flows[flows.length - 1].text += `\n${line}`
})
flows.forEach(f => { f.text = f.text.trimEnd() })
if (!flows.length) die('the Flows section has no "### " flow')

// ---------- the snapshot, and the delta ----------

// the ten documents, sizing.md and notes.md; the round audit and the telemetry are records, not reviewed
const RECORDS = ['reviews.md', 'telemetry.md']
const DOCS = readdirSync(designDir).filter(n => n.endsWith('.md') && !RECORDS.includes(n)).sort()
const snapshot = {
  docs: Object.fromEntries(DOCS.map(n => [basename(n, '.md'), sha(readFileSync(join(designDir, n), 'utf8'))])),
  flows: Object.fromEntries(flows.map(f => [f.id, sha(f.text)])),
}
// ---------- the size budget (a warning, never a failure) ----------

const KB = 1024
const budgetOf = (name, fallback) => {
  const v = opt(name)
  if (v === undefined) return fallback
  const n = Number(v)
  if (!(n > 0)) die(`--${name} ${v}: a positive number of KB`)
  return n
}
const docBudget = budgetOf('doc-budget-kb', 40)
const totalBudget = budgetOf('total-budget-kb', 320)
const sizes = DOCS.filter(n => n !== 'notes.md').map(n => [n, readFileSync(join(designDir, n)).length])
const sizeWarnings = sizes.filter(([, b]) => b > docBudget * KB)
  .map(([n, b]) => `${n}: ${Math.round(b / KB)} KB, over the ${docBudget} KB budget of one document`)
const total = sizes.reduce((sum, [, b]) => sum + b, 0)
if (total > totalBudget * KB) sizeWarnings.push(`the design set: ${Math.round(total / KB)} KB, over the ${totalBudget} KB budget of the whole set`)
sizeWarnings.forEach(w => console.error(`review-prep: warning: ${w}`))

mkdirSync(runDir, { recursive: true })
writeFileSync(join(runDir, `review-r${round}-snapshot.json`), JSON.stringify(snapshot, null, 2))

const embedded = { flows }
if (round === 2) {
  const prevPath = join(runDir, 'review-r1-snapshot.json')
  if (!existsSync(prevPath)) die(`${prevPath} not found: run round 1 through review-prep.mjs, or pass changed by hand`)
  const prev = JSON.parse(readFileSync(prevPath, 'utf8'))
  embedded.changed = {
    docs: Object.keys(snapshot.docs).filter(d => snapshot.docs[d] !== prev.docs?.[d]),
    flows: Object.keys(snapshot.flows).filter(f => snapshot.flows[f] !== prev.flows?.[f]),
  }
  const fixesPath = opt('fixes') ?? die('round 2 needs --fixes <fixes.json> (the fixes applied, from your rulings)')
  const fixes = JSON.parse(readFileSync(resolve(fixesPath), 'utf8'))
  if (!Array.isArray(fixes)) die('--fixes must hold a JSON list')
  const r1Path = join(designDir, 'reviews', 'round-1.json')
  const r1 = existsSync(r1Path) ? JSON.parse(readFileSync(r1Path, 'utf8')) : null
  const severityOf = new Map(((r1?.result ?? r1)?.findings ?? []).map(f => [f.id, f.severity]))
  const RANK = { blocker: 3, fix: 2, detail: 1 }
  fixes.forEach(f => {
    if (f.severity) return
    const ids = String(f.id).split('+').map(s => s.trim())
    const best = ids.map(i => severityOf.get(i)).filter(Boolean).sort((a, b) => RANK[b] - RANK[a])[0]
    if (best) f.severity = best
  })
  const lensesOf = (id) => String(id).match(/design-reviewer-[a-z]+/g) ?? []
  const seat = new Set(fixes.filter(f => !f.severity || f.severity !== 'detail').flatMap(f => lensesOf(f.id)))
  seat.delete('design-reviewer-ambiguity')
  seat.add('design-reviewer-consistency')
  embedded.fixes = fixes
  embedded.lenses = [...seat].sort()
}

// ---------- the copy ----------

if (!existsSync(source)) die(`${source} not found`)
const src = readFileSync(source, 'utf8')
const PLACEHOLDER = 'const EMBEDDED = null'
if (src.split(PLACEHOLDER).length !== 2) die(`${source}: the line "${PLACEHOLDER}" must appear exactly once`)
const out = join(runDir, 'design-review.js')
writeFileSync(out, src.replace(PLACEHOLDER, `const EMBEDDED = ${JSON.stringify(embedded)}`))

console.log(JSON.stringify({
  script: out,
  source,
  sourceSha256: sha(src),
  round,
  flows: flows.map(f => f.id),
  sizeWarnings,
  ...(round === 2 ? { changed: embedded.changed, lenses: embedded.lenses, fixes: embedded.fixes.length } : {}),
}))
