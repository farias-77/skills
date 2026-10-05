#!/usr/bin/env node
// Runs claude/workflows/exec-entry-workflow.js with mocked agents (no model is called) and checks each scenario.
// Usage: node scripts/exec-entry-dry-run.mjs [-v]

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'claude/workflows/exec-entry-workflow.js'), 'utf8').replace(/^export const meta/m, 'const meta')
const AsyncFunction = (async () => {}).constructor
const run = new AsyncFunction('args', 'agent', 'parallel', 'pipeline', 'log', 'phase', src)
const verbose = process.argv.includes('-v')

const API = { api: true, screen: false, runtime: false, sensitive: false }
const SCREEN = { api: false, screen: true, runtime: false, sensitive: false }
const BOTH = { api: true, screen: true, runtime: false, sensitive: false }
const CODE = { command: 'make test-affected', where: 'backend/internal/orders/app/place_order_test.go:40', output: 'want 422, got 201', cause: 'code', side: 'back' }
const MACHINE = { command: 'make test-affected', where: 'e2e/orders.spec.ts:12', output: 'TimeoutError: 5000ms exceeded', cause: 'machine', side: 'front' }

const gate = (kind, surface, n, o = {}) => ({
  green: kind === 'green', head: `h${n}`, summary: kind,
  failures: kind === 'code' ? [CODE] : kind === 'machine' ? [MACHINE] : [],
  flaky: [], load: '3.1 · nproc 8', surface, changed: [], stack: kind === 'green' ? 'http://127.0.0.1:41234 · admin, leader' : 'down', ...o,
})
const build = (n, o = {}) => ({
  startHead: `s${n}`, head: `b${n}`, commits: [{ sha: `c${n}`, message: 'feat(orders): place an order' }],
  fastCheck: { green: true, lastLine: 'ok' }, proofs: [{ ac: 'S1.1', proof: 'place_order_test.go:TestPlaceOrder' }],
  tried: 'POST /orders as leader → 201', screenChange: 'behaviour', files: [], outsideOwns: [], decided: [], questions: [], blocked: '', applied: [], ...o,
})
const review = (findings = [], closed = []) => ({ verified: ['S1.1 at place_order.go:30'], findings, closed })
const BUG = { severity: 'blocks', basis: 'bug', title: 'a double submit writes two orders', where: 'place_order.go:41', says: 'no key', fix: 'idempotency key', proof: 'two POSTs → two rows', side: 'back' }
const HOLE = { ...BUG, basis: 'security', title: 'another unit reads the order by id', proof: 'GET /orders/ord_2 as another unit → 200' }
const NOTE = { severity: 'note', basis: 'other', title: 'the empty list could name the next step', where: 'List.tsx:12', says: 'No orders', fix: 'name the action', proof: '', side: 'front' }
const NO_PROOF = { ...BUG, title: 'might race', proof: '' }
const seq = (...kinds) => (n) => kinds[Math.min(n, kinds.length) - 1]
const ARGS = {
  mode: 'build', entry: 'E-01', sides: ['back', 'front'], base: 'feat/orders', branch: 'story/orders/E-01', worktree: '/wt/E-01',
  gateCommands: ['make check', 'make test-affected base=feat/orders'], fastCheck: 'make check', gatePaths: ['Makefile', 'tooling/'],
}

const scenarios = [
  { title: 'build, both sides: builders ∥ → gate → reviewer ∥ qa-frontend ∥ qa-backend → ready', surface: BOTH,
    expect: { status: 'ready', calls: 'builder-backend builder-frontend exec-gate reviewer qa-frontend qa-backend' } },
  { title: 'back only: one builder, no qa-frontend', surface: API, args: { sides: ['back'] },
    expect: { status: 'ready', calls: 'builder-backend exec-gate reviewer qa-backend' } },
  { title: 'gate red on code → a gate-fix by the side that failed → green → ready', surface: API, args: { sides: ['back'] }, gate: seq('code', 'green'),
    expect: { status: 'ready', gateFixes: 1, calls: 'builder-backend exec-gate builder-backend exec-gate reviewer qa-backend' } },
  { title: 'red on code after two gate-fixes → parked gate-red, no check', surface: API, args: { sides: ['back'] }, gate: seq('code', 'code', 'code'),
    expect: { status: 'parked', reason: 'gate-red', gateFixes: 2 } },
  { title: 'red only for the machine → load wait and run again, no builder → ready', surface: API, args: { sides: ['back'], loadThreshold: 8 }, gate: seq('machine', 'green'),
    expect: { status: 'ready', gateFixes: 0, calls: 'builder-backend exec-gate exec-gate reviewer qa-backend' } },
  { title: 'machine red three times → parked machine', surface: API, args: { sides: ['back'] }, gate: seq('machine', 'machine', 'machine'),
    expect: { status: 'parked', reason: 'machine' } },
  { title: 'the reviewer blocks a back bug → only builder-backend fixes → delta by the reviewer → ready', surface: BOTH,
    reviewer: (n) => (n === 1 ? review([BUG]) : review([], ['reviewer#whole.1'])),
    expect: { status: 'ready', reviewFixes: 1, calls: 'builder-backend builder-frontend exec-gate reviewer qa-frontend qa-backend builder-backend exec-gate reviewer' } },
  { title: 'still blocking after the fix → parked round-cap with the items', surface: API, args: { sides: ['back'] }, reviewer: () => review([BUG]),
    expect: { status: 'parked', reason: 'round-cap', blocking: 1 } },
  { title: 'a QA blocks; the fix touches a test file → the delta goes to the QA and the reviewer', surface: API, args: { sides: ['back'] },
    qaBack: (n) => (n === 1 ? review([HOLE]) : review([], ['qa-backend#whole.1'])),
    gate: (n) => (n === 2 ? 'green-changed' : 'green'),
    expect: { status: 'ready', calls: 'builder-backend exec-gate reviewer qa-backend builder-backend exec-gate qa-backend reviewer' } },
  { title: 'a "blocks" without proof is a note; seven notes keep five', surface: SCREEN, args: { sides: ['front'] },
    reviewer: () => review([NO_PROOF, NOTE, NOTE, NOTE, NOTE, NOTE, NOTE]),
    expect: { status: 'ready', notes: 5 } },
  { title: 'the contract commit: reviewer only; a bug is a note, a hole blocks and is fixed', surface: API, args: { kind: 'contract', entry: 'C', sides: ['back'] },
    reviewer: (n) => (n === 1 ? review([BUG, HOLE]) : review([], ['reviewer#whole.2'])),
    expect: { status: 'ready', notes: 1, reviewFixes: 1, calls: 'builder-backend exec-gate reviewer builder-backend exec-gate reviewer' } },
  { title: 'the builder is blocked (a missing secret) → blocked, no gate', surface: API, args: { sides: ['back'] },
    build: (n) => build(n, { blocked: 'the payment sandbox key is not in the env' }), expect: { status: 'blocked', calls: 'builder-backend' } },
  { title: 'a question only the user can answer → parked user', surface: API, args: { sides: ['back'] },
    build: (n) => build(n, { questions: [{ question: 'which provider account?', why: 'a contract only he signs' }] }), expect: { status: 'parked', reason: 'user' } },
  { title: 'a visual-only change: qa-frontend skipped', surface: SCREEN, args: { sides: ['front'] },
    build: (n) => build(n, { screenChange: 'visual' }), expect: { status: 'ready', calls: 'builder-frontend exec-gate reviewer', qa: 'skipped/skipped' } },
  { title: 'fix (an A.n round), qa none: builder → gate → reviewer → ready', surface: SCREEN, args: { mode: 'fix', entry: 'A.1', sides: ['front'] },
    expect: { status: 'ready', calls: 'builder-frontend exec-gate reviewer' } },
  { title: 'fix touching auth, qa backend: reviewer ∥ qa-backend', surface: API, args: { mode: 'fix', entry: 'A.2', sides: ['back'], qa: 'backend' },
    expect: { status: 'ready', calls: 'builder-backend exec-gate reviewer qa-backend' } },
  { title: 'update: the builder merges and resolves → gate → the reviewer reads the resolution', surface: API, args: { mode: 'update', sides: ['back'] },
    expect: { status: 'ready', calls: 'builder-backend exec-gate reviewer', prompt: ['reviewer', 'git show --cc b1'] } },
  { title: 'resume with a fixes file and a delta on qa-backend items', surface: API,
    args: { mode: 'resume', sides: ['back'], resume: { head: 'h7', check: 'delta', fixesFile: '/e/fixes-2.json', items: [{ ...HOLE, id: 'qa-backend#whole.1', agent: 'qa-backend' }] } },
    expect: { status: 'ready', calls: 'builder-backend exec-gate qa-backend' } },
  { title: 'resume after a red queue (no items): the reviewer reads the delta', surface: API, args: { mode: 'resume', sides: ['back'], resume: { head: 'h7', check: 'delta' } },
    gate: seq('code', 'green'), expect: { status: 'ready', gateFixes: 1, calls: 'exec-gate builder-backend exec-gate reviewer' } },
  { title: 'cloud heartbeat: every prompt carries start and end beats with the ceiling', surface: API, args: { sides: ['back'], heartbeat: 'bash /e/hb.sh' },
    expect: { status: 'ready', prompt: ['builder-backend', 'start builder-backend·E-01·build 120'] } },
  { title: 'a flaky test outside the diff: recorded, the entry goes on', surface: API, args: { sides: ['back'] },
    gate: () => 'green-flaky', expect: { status: 'ready', flaky: 1 } },
  { title: 'inline agents: the definition path and the model from the map', surface: API, args: { sides: ['back'], inlineAgents: true, agentsDir: '/p/agents' },
    expect: { status: 'ready', inline: 'reviewer:opus/high' } },
]

let bad = 0
for (const sc of scenarios) {
  const counts = {}, names = [], logs = [], prompts = {}, models = new Set()
  const agent = async (prompt, o) => {
    const name = o.agentType ?? prompt.match(/agents\/([a-z-]+)\.md/)?.[1]
    if (!o.agentType) models.add(`${name}:${o.model}/${o.effort}`)
    const n = counts[name] = (counts[name] ?? 0) + 1
    names.push(name)
    ;(prompts[name] ??= []).push(prompt)
    if (name.startsWith('builder-')) return sc.build ? sc.build(n) : build(n)
    if (name === 'exec-gate') {
      const kind = sc.gate ? sc.gate(n) : 'green'
      if (kind === 'green-changed') return gate('green', sc.surface, n, { changed: ['backend/internal/orders/app/place_order_test.go'] })
      if (kind === 'green-flaky') return gate('green', sc.surface, n, { flaky: [{ test: 'team-states.spec.ts', where: 'e2e/team-states.spec.ts:8', output: 'timeout, green on the re-run' }] })
      return gate(kind, sc.surface, n)
    }
    if (name === 'reviewer') return (sc.reviewer ?? (() => review()))(n)
    if (name === 'qa-frontend') return (sc.qaFront ?? (() => review()))(n)
    if (name === 'qa-backend') return (sc.qaBack ?? (() => review()))(n)
    throw new Error(`unknown agent ${name}`)
  }
  const parallel = (thunks) => Promise.all(thunks.map(t => t().catch(() => null)))
  const r = await run({ ...ARGS, ...(sc.args ?? {}) }, agent, parallel, null, (m) => logs.push(m), () => {})
  const e = sc.expect, got = []
  if (r.status !== e.status) got.push(`status ${r.status}`)
  if ('reason' in e && r.reason !== e.reason) got.push(`reason ${r.reason}`)
  if ('calls' in e && names.join(' ') !== e.calls) got.push(`calls ${names.join(' ')}`)
  if ('gateFixes' in e && r.passes.gateFixes !== e.gateFixes) got.push(`gateFixes ${r.passes.gateFixes}`)
  if ('reviewFixes' in e && r.passes.reviewFixes !== e.reviewFixes) got.push(`reviewFixes ${r.passes.reviewFixes}`)
  if ('blocking' in e && r.blocking.length !== e.blocking) got.push(`blocking ${r.blocking.length}`)
  if ('notes' in e && r.notes.length !== e.notes) got.push(`notes ${r.notes.length}`)
  if ('flaky' in e && r.flaky.length !== e.flaky) got.push(`flaky ${r.flaky.length}`)
  if ('qa' in e && `${r.qa?.frontend}/${r.qa?.backend}` !== e.qa) got.push(`qa ${r.qa?.frontend}/${r.qa?.backend}`)
  if ('prompt' in e && !(prompts[e.prompt[0]] ?? []).some(p => p.includes(e.prompt[1]))) got.push(`no "${e.prompt[1]}" in ${e.prompt[0]}'s prompt`)
  if ('inline' in e && !models.has(e.inline)) got.push(`models ${[...models]}`)
  console.log(`${got.length ? 'FAIL' : 'ok  '}  ${sc.title}${got.length ? `\n        (${got.join(' · ')})` : ''}`)
  if (verbose || got.length) logs.forEach(l => console.log(`        log: ${l}`))
  if (got.length) bad++
}
console.log(bad ? `exec-entry dry run: ${bad} of ${scenarios.length} failed` : `exec-entry dry run: ok, ${scenarios.length} scenarios`)
process.exit(bad ? 1 : 0)
