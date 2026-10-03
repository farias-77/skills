#!/usr/bin/env node
/*
 * propagation-check.mjs — where an old term still lives in the design.
 *
 *   node propagation-check.mjs <workstream> <term> [<term> …] [-i]
 *   node propagation-check.mjs <workstream> --from <terms.txt> [-i]     (one term per line)
 *
 * The conductor runs it before an apply batch (who must get the fix)
 * and after it (what survived), with every OLD term, value, key, count
 * or claim a fix renames, revalues, removes or recounts. It searches,
 * as fixed strings, the design documents and the conductor's files
 * (01-design/*.md: the ten documents, sizing.md, notes.md) and the
 * writers' JSON (blueprint/design/*.json). The tier files and the
 * review audit are records, not searched.
 *
 * Prints, per term, its hits as <file>:<line>: <the line>. A hit may
 * stay only as a negation ("no longer …"); every other hit goes to its
 * writer. Exit 0 when no term has a hit, 1 otherwise.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const argv = process.argv.slice(2)
const insensitive = argv.includes('-i')
const fromAt = argv.indexOf('--from')
const ws = argv[0] && !argv[0].startsWith('-') ? resolve(argv[0]) : null
if (!ws) { console.error('usage: propagation-check.mjs <workstream> <term> … [-i] | --from terms.txt'); process.exit(2) }
const terms = (fromAt >= 0
  ? readFileSync(resolve(argv[fromAt + 1]), 'utf8').split('\n')
  : argv.slice(1).filter((a, i, all) => a !== '-i' && all[i - 1] !== '--from' && a !== '--from')
).map(t => t.trim()).filter(Boolean)
if (!terms.length) { console.error('propagation-check: no term given'); process.exit(2) }

const dirs = [join(ws, '01-design'), join(ws, 'blueprint', 'design')]
const files = dirs.filter(existsSync).flatMap(d => readdirSync(d)
  .filter(n => n.endsWith('.md') || n.endsWith('.json'))
  .filter(n => !(d.endsWith('01-design') && n === 'reviews.md'))
  .map(n => join(d, n)))
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
