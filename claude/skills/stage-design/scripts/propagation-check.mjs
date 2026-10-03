#!/usr/bin/env node
/*
 * propagation-check.mjs — where an old term still lives in a stage's files.
 *
 *   node propagation-check.mjs <workstream> <term> [<term> …] [-i] [--stage design|plan]
 *   node propagation-check.mjs <workstream> --from <terms.txt> [-i] [--stage …]   (one term per line)
 *
 * The conductor runs it before an apply batch (who must get the fix)
 * and after it (what survived), with every OLD term, value, key, count
 * or claim a fix renames, revalues, removes or recounts — at plan also
 * every name, path, AC id or case a ruling moved to another node. It
 * searches, as fixed strings:
 *
 *   design (default)  the design documents and the conductor's files
 *                     (01-design/*.md: the ten documents, sizing.md,
 *                     notes.md) and the writers' JSON (blueprint/design/*.json)
 *   plan              plan.md, plan.graph.json, preflight.md, the briefs
 *                     (02-plan/briefs/*.md) and their JSON
 *                     (blueprint/plan/*.json, blueprint/plan/briefs/*.json)
 *
 * The review audit (reviews.md) and the checker's output (graph.json)
 * are records, not searched.
 *
 * Prints, per term, its hits as <file>:<line>: <the line>. A hit may
 * stay only as a negation ("no longer …"), or at plan where it names the
 * new owner; every other hit goes to its writer. Exit 0 when no term has
 * a hit, 1 otherwise.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const argv = process.argv.slice(2)
const valueOf = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null }
const insensitive = argv.includes('-i')
const stage = valueOf('--stage') ?? 'design'
const SETS = {
  design: { dirs: ['01-design', 'blueprint/design'], records: ['01-design/reviews.md'] },
  plan: { dirs: ['02-plan', '02-plan/briefs', 'blueprint/plan', 'blueprint/plan/briefs'], records: ['02-plan/reviews.md', '02-plan/graph.json'] },
}
const ws = argv[0] && !argv[0].startsWith('-') ? resolve(argv[0]) : null
if (!ws || !SETS[stage]) { console.error('usage: propagation-check.mjs <workstream> <term> … [-i] [--stage design|plan] | --from terms.txt'); process.exit(2) }
const from = valueOf('--from')
const terms = (from
  ? readFileSync(resolve(from), 'utf8').split('\n')
  : argv.slice(1).filter((a, i, all) => !['-i', '--from', '--stage'].includes(a) && !['--from', '--stage'].includes(all[i - 1]))
).map(t => t.trim()).filter(Boolean)
if (!terms.length) { console.error('propagation-check: no term given'); process.exit(2) }

const { dirs, records } = SETS[stage]
const files = dirs.map(d => join(ws, d)).filter(existsSync).flatMap(d => readdirSync(d)
  .filter(n => n.endsWith('.md') || n.endsWith('.json'))
  .map(n => join(d, n))
  .filter(f => !records.includes(relative(ws, f))))
const texts = files.map(f => ({ file: relative(ws, f), lines: readFileSync(f, 'utf8').split('\n') }))
const norm = (s) => insensitive ? s.toLowerCase() : s

let total = 0
for (const term of terms) {
  const t = norm(term)
  const hits = texts.flatMap(({ file, lines }) => lines.flatMap((line, i) => norm(line).includes(t)
    ? [`  ${file}:${i + 1}: ${line.trim().slice(0, 200)}`] : []))
  total += hits.length
  console.log(`${hits.length ? '✗' : '✓'} "${term}" — ${hits.length} hit(s)`)
  hits.forEach(h => console.log(h))
}
console.log(`${terms.length} term(s) · ${total} hit(s) in ${files.length} file(s)`)
process.exit(total ? 1 : 0)
