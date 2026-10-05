#!/usr/bin/env node
/*
 * review-prep.mjs — the mechanical checks before the design review.
 *
 *   node review-prep.mjs <workstream> [--doc-budget-kb <n>]
 *   node review-prep.mjs --self-test
 *
 * documents  the six documents exist under 01-design/. A document whose
 *            body is one line starting "None:" is a deliberate empty one
 *            (written by the conductor) and needs nothing else. Every
 *            other one ends with "## The implementer decides".
 * coverage   every AC id of 00-discovery/stories.md (**`J1.s2.1`**,
 *            **`frame:<token>.<n>`**) is cited in tests.md.
 * open       no "(open: Q-n)" mark is left in any document.
 * size       a document over --doc-budget-kb (default 25) is a warning,
 *            never a failure: it is usually copying another source.
 *
 * Prints one JSON line { documents, none, sizesKB, sizeWarnings, acs,
 * missingAcs, missingSections, openMarks, missingDocs, ok }. Exit 0 when
 * ok, 1 when a check fails, 2 on a usage error.
 */

import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const DOCS = ['solution.md', 'data-and-contracts.md', 'tests.md', 'operations.md', 'security-and-access.md', 'screens.md']
const LATITUDE = /^## The implementer decides\b/m
const OPEN_MARK = /\(open:\s*Q-\d+\)/g
const AC_IN_STORIES = /\*\*`((?:J\d+\.s\d+\.\d+)|(?:frame:[A-Za-z0-9_.-]+?\.\d+))`\*\*/g
const KB = 1024
const argv = process.argv.slice(2)

const usage = (msg) => { console.error(`review-prep: ${msg}`); process.exit(2) }
const option = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined }
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function isNone(text) {
  const body = text.replace(/<!--[\s\S]*?-->/g, '').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  return body.length === 1 && /^None:\s*\S/.test(body[0])
}

function budgetKB() {
  const v = option('doc-budget-kb')
  if (v === undefined) return 25
  const n = Number(v)
  if (!(n > 0)) usage(`--doc-budget-kb ${v}: a positive number of KB`)
  return n
}

function check() {
  const ws = argv[0] && !argv[0].startsWith('--') ? resolve(argv[0]) : usage('usage: review-prep.mjs <workstream> [--doc-budget-kb n] | --self-test')
  const budget = budgetKB()
  const designDir = join(ws, '01-design')
  const storiesPath = join(ws, '00-discovery', 'stories.md')
  if (!existsSync(storiesPath)) usage(`${storiesPath} not found`)

  const present = DOCS.filter((d) => existsSync(join(designDir, d)))
  const missingDocs = DOCS.filter((d) => !present.includes(d))
  const text = Object.fromEntries(present.map((d) => [d, readFileSync(join(designDir, d), 'utf8')]))
  const none = present.filter((d) => isNone(text[d]))
  const written = present.filter((d) => !none.includes(d))

  const missingSections = written.filter((d) => !LATITUDE.test(text[d])).map((d) => `${d}: no "## The implementer decides"`)
  const openMarks = present.flatMap((d) => [...text[d].matchAll(OPEN_MARK)].map((m) => `${d}: ${m[0]}`))

  const acs = [...new Set([...readFileSync(storiesPath, 'utf8').matchAll(AC_IN_STORIES)].map((m) => m[1]))]
  const tests = written.includes('tests.md') ? text['tests.md'] : ''
  const cited = (id) => new RegExp(`(^|[^A-Za-z0-9_.:-])${escape(id)}(?![0-9])`).test(tests)
  const missingAcs = acs.filter((id) => !cited(id))

  const sizes = present.map((d) => [d, Buffer.byteLength(text[d])])
  const sizeWarnings = sizes.filter(([, b]) => b > budget * KB).map(([d, b]) => `${d}: ${Math.round(b / KB)} KB, over ${budget} KB`)

  sizeWarnings.forEach((w) => console.error(`review-prep: warning: ${w}`))
  missingDocs.forEach((d) => console.error(`review-prep: missing 01-design/${d} (write it, or one line "None: <why>")`))
  missingSections.forEach((s) => console.error(`review-prep: ${s}`))
  openMarks.forEach((m) => console.error(`review-prep: open question left: ${m}`))
  missingAcs.forEach((id) => console.error(`review-prep: tests.md does not cite ${id}`))

  const ok = !missingDocs.length && !missingSections.length && !openMarks.length && !missingAcs.length
  console.log(JSON.stringify({
    documents: written, none, missingDocs,
    sizesKB: Object.fromEntries(sizes.map(([d, b]) => [d, Math.round((b / KB) * 10) / 10])),
    sizeWarnings, acs: acs.length, missingAcs, missingSections, openMarks, ok,
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

  for (const d of ['solution.md', 'data-and-contracts.md', 'operations.md', 'screens.md']) write(d, doc('body'))
  write('security-and-access.md', '# Security and access\n\nNone: no route, no stored field, no secret.\n')
  let r = run()
  expect('a missing document fails', r.code === 1 && r.out.missingDocs?.includes('tests.md'))

  write('tests.md', doc('| `J1.s2.1` | api |\n| `frame:invites.error.1` | journey |'))
  r = run()
  expect('J1.s2.10 is not covered by J1.s2.1', r.code === 1 && r.out.missingAcs?.join() === 'J1.s2.10')

  write('tests.md', doc('| `J1.s2.1` | api |\n| `J1.s2.10` | unit |\n| `frame:invites.error.1` | journey |'))
  r = run()
  expect('every AC cited, a "None:" document accepted', r.code === 0 && r.out.ok && r.out.acs === 3 && r.out.none?.join() === 'security-and-access.md')

  write('operations.md', doc('the timeout (open: Q-2) lands here'))
  r = run()
  expect('an open mark fails', r.code === 1 && r.out.openMarks?.length === 1)

  write('operations.md', '# Ops\n\nno latitude section\n')
  r = run()
  expect('a written document without its latitude section fails', r.code === 1 && r.out.missingSections?.length === 1)

  write('operations.md', doc('x'.repeat(26 * KB)))
  r = run()
  expect('over 25 KB warns and still passes', r.code === 0 && r.out.sizeWarnings?.length === 1)
  r = run('--doc-budget-kb', '40')
  expect('a bigger budget clears the warning', r.code === 0 && r.out.sizeWarnings?.length === 0)

  rmSync(dir, { recursive: true, force: true })
  cases.forEach(([name, pass]) => console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}`))
  const failed = cases.filter(([, pass]) => !pass).length
  console.log(`${cases.length - failed}/${cases.length} passed`)
  process.exit(failed ? 1 : 0)
}

if (argv.includes('--self-test')) selfTest()
else check()
