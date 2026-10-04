#!/usr/bin/env node
/*
 * review-prep.mjs — the mechanical checks before the design review.
 *
 *   node review-prep.mjs <workstream> [--doc-budget-kb <n>] [--total-budget-kb <n>]
 *   node review-prep.mjs --self-test
 *
 * The conductor runs it at D5, after the four writers return and
 * before the design-reviewer reads. It checks what a script checks
 * better than an agent:
 *
 * documents  the four documents exist under 01-design/ (solution.md,
 *            data-and-contracts.md, tests.md, operations.md), and each
 *            has its "## The implementer decides" section.
 * coverage   every AC id of 00-discovery/stories.md (`J1.s2.1`,
 *            `frame:<token>.<n>`, written as **`<id>`**) is cited in
 *            tests.md. Without stories.md, the ids come from
 *            blueprint/stories.json. A missing id goes back to the
 *            tests writer.
 * size       one document over --doc-budget-kb (default 40) or the four
 *            over --total-budget-kb (default 160) is a warning on stderr
 *            and in `sizeWarnings`, never a failure. A document over
 *            budget usually copies what another source holds.
 *
 * Prints one JSON line: { documents, sizesKB, sizeWarnings, acs,
 * missingAcs, missingSections, ok }. Exit 0 when every document exists,
 * every section is there and every AC is cited (size warnings
 * allowed); 1 otherwise; 2 on a usage error.
 */

import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const DOCS = ['solution.md', 'data-and-contracts.md', 'tests.md', 'operations.md']
const LATITUDE = /^## The implementer decides\b/m
const KB = 1024
const argv = process.argv.slice(2)
const opt = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined }
const usage = (msg) => { console.error(`review-prep: ${msg}`); process.exit(2) }

if (argv.includes('--self-test')) selfTest()
else check()

function check() {
  const ws = argv[0] && !argv[0].startsWith('--') ? resolve(argv[0]) : usage('usage: review-prep.mjs <workstream> [--doc-budget-kb n] [--total-budget-kb n] | --self-test')
  const budget = (name, fallback) => {
    const v = opt(name)
    if (v === undefined) return fallback
    const n = Number(v)
    if (!(n > 0)) usage(`--${name} ${v}: a positive number of KB`)
    return n
  }
  const docBudget = budget('doc-budget-kb', 40)
  const totalBudget = budget('total-budget-kb', 160)
  const designDir = join(ws, '01-design')

  const present = DOCS.filter(d => existsSync(join(designDir, d)))
  const missingDocs = DOCS.filter(d => !present.includes(d))
  const text = Object.fromEntries(present.map(d => [d, readFileSync(join(designDir, d), 'utf8')]))
  const missingSections = present.filter(d => !LATITUDE.test(text[d])).map(d => `${d}: no "## The implementer decides"`)

  // the AC ids: stories.md first, the blueprint's stories.json when the markdown is absent
  const storiesMd = join(ws, '00-discovery', 'stories.md')
  const storiesJson = join(ws, 'blueprint', 'stories.json')
  let acs = []
  if (existsSync(storiesMd)) {
    const re = /\*\*`((?:J\d+\.s\d+\.\d+)|(?:frame:[A-Za-z0-9_.-]+?\.\d+))`\*\*/g
    acs = [...new Set([...readFileSync(storiesMd, 'utf8').matchAll(re)].map(m => m[1]))]
  } else if (existsSync(storiesJson)) {
    acs = [...new Set(JSON.parse(readFileSync(storiesJson, 'utf8')).stories.flatMap(s => (s.acs || []).map(a => a.id)))]
  } else usage(`${ws}: neither 00-discovery/stories.md nor blueprint/stories.json`)
  const cited = (id) => new RegExp(`(^|[^A-Za-z0-9_.:-])${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![0-9])`).test(text['tests.md'] ?? '')
  const missingAcs = acs.filter(id => !cited(id))

  const sizes = present.map(d => [d, Buffer.byteLength(text[d])])
  const sizeWarnings = sizes.filter(([, b]) => b > docBudget * KB)
    .map(([d, b]) => `${d}: ${Math.round(b / KB)} KB, over the ${docBudget} KB budget of one document`)
  const total = sizes.reduce((sum, [, b]) => sum + b, 0)
  if (total > totalBudget * KB) sizeWarnings.push(`the four documents: ${Math.round(total / KB)} KB, over the ${totalBudget} KB budget of the set`)
  sizeWarnings.forEach(w => console.error(`review-prep: warning: ${w}`))
  missingDocs.forEach(d => console.error(`review-prep: missing: 01-design/${d}`))
  missingSections.forEach(s => console.error(`review-prep: missing: ${s}`))
  missingAcs.forEach(id => console.error(`review-prep: tests.md does not cite ${id}`))

  const ok = !missingDocs.length && !missingSections.length && !missingAcs.length
  console.log(JSON.stringify({
    documents: present, missingDocs,
    sizesKB: Object.fromEntries(sizes.map(([d, b]) => [d, Math.round(b / KB * 10) / 10])),
    sizeWarnings, acs: acs.length, missingAcs, missingSections, ok,
  }))
  process.exit(ok ? 0 : 1)
}

function selfTest() {
  const self = fileURLToPath(import.meta.url)
  const dir = mkdtempSync(join(tmpdir(), 'review-prep-'))
  const ws = join(dir, 'ws')
  mkdirSync(join(ws, '00-discovery'), { recursive: true })
  mkdirSync(join(ws, '01-design'), { recursive: true })
  writeFileSync(join(ws, '00-discovery', 'stories.md'),
    '- **`J1.s2.1`** [INV-1] GIVEN a\n- **`J1.s2.10`** [S-001] GIVEN b\n- **`frame:invites.error.1`** [INV-2] GIVEN c\n')
  const doc = (body) => `# Doc\n\n${body}\n\n## The implementer decides\n\n- x\n`
  const write = (name, body) => writeFileSync(join(ws, '01-design', name), body)
  const run = (...extra) => {
    const r = spawnSync(process.execPath, [self, ws, ...extra], { encoding: 'utf8' })
    return { code: r.status, out: JSON.parse(r.stdout.trim() || '{}') }
  }
  const cases = []
  const expect = (name, cond) => cases.push([name, !!cond])

  write('solution.md', doc('parts'))
  write('data-and-contracts.md', doc('contracts'))
  write('operations.md', doc('ops'))
  let r = run()
  expect('a missing document fails', r.code === 1 && r.out.missingDocs?.includes('tests.md'))

  write('tests.md', doc('| `J1.s2.1` | api |\n| `frame:invites.error.1` | journey |'))
  r = run()
  expect('J1.s2.10 is not covered by J1.s2.1', r.code === 1 && r.out.missingAcs?.join() === 'J1.s2.10')

  write('tests.md', doc('| `J1.s2.1` | api |\n| `J1.s2.10` | unit |\n| `frame:invites.error.1` | journey |'))
  r = run()
  expect('every AC cited passes', r.code === 0 && r.out.ok && r.out.acs === 3)

  write('operations.md', '# Ops\n\nno latitude section\n')
  r = run()
  expect('a missing latitude section fails', r.code === 1 && r.out.missingSections?.length === 1)

  write('operations.md', doc('x'.repeat(41 * KB)))
  r = run()
  expect('over 40 KB warns and still passes', r.code === 0 && r.out.sizeWarnings?.length === 1)
  r = run('--doc-budget-kb', '50')
  expect('a bigger budget clears the warning', r.code === 0 && r.out.sizeWarnings?.length === 0)

  rmSync(dir, { recursive: true, force: true })
  cases.forEach(([name, pass]) => console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}`))
  const failed = cases.filter(([, pass]) => !pass).length
  console.log(`${cases.length - failed}/${cases.length} passed`)
  process.exit(failed ? 1 : 0)
}
