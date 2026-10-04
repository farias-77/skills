#!/usr/bin/env node
// exec-entry-dry-run.mjs — runs claude/workflows/exec-entry.js with mocked agents: no model is called,
// each agent returns a canned answer per scenario. Exits 1 when a scenario ends other than expected.
//
// Usage: node scripts/exec-entry-dry-run.mjs [-v]

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'claude/workflows/exec-entry.js'), 'utf8').replace(/^export const meta/m, 'const meta');
const AsyncFunction = (async () => {}).constructor;
const run = new AsyncFunction('args', 'agent', 'parallel', 'log', 'phase', src);
const verbose = process.argv.includes('-v');

const nameOf = (prompt, o) => o.agentType ?? (prompt.match(/agents\/([a-z-]+)\.md/) || [])[1];
const T = (n) => ({ started: `2026-10-04T10:${String(n).padStart(2, '0')}:00Z`, ended: `2026-10-04T10:${String(n + 4).padStart(2, '0')}:00Z` });

const API = { api: true, screen: false, runtime: false, paths: ['server/orders/create.go'] };
const SCREEN = { api: false, screen: true, runtime: false, paths: ['web/src/orders/OrderList.tsx'] };
const BOTH = { api: true, screen: true, runtime: false, paths: ['server/orders/create.go', 'web/src/orders/OrderList.tsx'] };
const STYLE = { api: false, screen: true, runtime: false, paths: ['web/src/orders/OrderList.css'] };
const AUTH = { api: true, screen: false, runtime: false, sensitive: true, paths: ['server/auth/session.go'] };
const CODE = { check: 'journey', where: 'e2e/orders.spec.ts:40', output: 'Expected "Order received", received "Error"', cause: 'code', side: 'front', load: '' };
const MACHINE = { check: 'journey', where: 'e2e/orders.spec.ts:12', output: 'TimeoutError: locator.waitFor: Timeout 5000ms exceeded', cause: 'machine', side: 'front', load: '34.2 · nproc 8' };

const gate = (kind, surface, n) => {
  const green = kind === 'green';
  const failures = green || kind === 'conflict' ? [] : kind === 'machine' ? [MACHINE] : [CODE];
  return { green, head: `h${n}`, summary: green ? 'ok' : 'red', checks: [], failures, load: 'start 3.0 · end 3.2 · nproc 8', stack: green ? 'http://localhost:8080 · actors: customer, staff' : 'down', conflicts: kind === 'conflict' ? ['server/orders/create.go'] : [], surface, ...T(n) };
};
const build = (n, o = {}) => ({ branch: 'b', head: `b${n}`, commits: [{ sha: `c${n}`, message: 'feat: orders' }], checks: [{ command: 'make check', lastLine: 'ok', green: true }], tests: [{ ac: 'J01.s2.1', test: 'e2e/orders.spec.ts' }], tried: 'POST /orders as customer → 201, listed as pending', screenChange: 'behaviour', files: [], outsideOwns: [], reused: [], choices: [], decided: [], questions: [], blocked: '', applied: [], ...T(n), ...o });
const review = (findings = [], closed = []) => ({ verified: ['J01.s2.1'], findings, closed, ...T(20) });
const BUG = { severity: 'blocking', basis: 'bug', title: 'a double submit writes two orders', where: 'server/orders/create.go:41', says: 'no idempotency key', fix: 'use the request id as the key', proof: 'two POST /orders with the same body → two rows', side: 'back' };
const AC = { severity: 'blocking', basis: 'ac', title: 'J01.s2.2 not met', where: 'web/src/orders/New.tsx:30', says: 'a past day is accepted', fix: 'reject a past day with day_in_past', proof: 'J01.s2.2: the form submits 2020-01-01 and shows "Order received"', side: 'front' };
const NOTE = { severity: 'note', basis: 'other', title: 'the empty list could say more', where: 'web/src/orders/OrderList.tsx:12', says: 'a bare "No orders"', fix: 'name the next action', proof: '', side: 'front' };
const NO_PROOF = { ...BUG, title: 'might race under load', proof: '' };
const seq = (...kinds) => (n) => kinds[Math.min(n, kinds.length) - 1];

const scenarios = [
  { title: 'green first pass (API): build → gate → reviewer ∥ qa-backend → ready', surface: API, expect: ['ready', 1] },
  { title: 'gate red on code → one gate fix → green → check clean → ready', surface: API, gate: seq('code', 'green'), expect: ['ready', 2] },
  { title: 'a blocking reviewer finding fixed in one pass → delta by the reviewer only → ready', surface: API,
    reviewer: (n) => n === 1 ? review([BUG]) : review([], ['reviewer#r1.1']), expect: ['ready', 2] },
  { title: 'still blocking after the fix → parked round-cap', surface: API,
    reviewer: () => review([BUG]), expect: ['parked', 2, 'round-cap'] },
  { title: 'gate red on code → a gate fix (not the review budget) → a blocking finding → the review fix → delta → ready', surface: API,
    gate: seq('code', 'green'), reviewer: (n) => n === 1 ? review([BUG]) : review([], ['reviewer#r1.1']), expect: ['ready', 3] },
  { title: 'gate still red on code after 2 gate fixes → parked gate-red, no check', surface: API,
    gate: seq('code', 'code', 'code'), expect: ['parked', 3, 'gate-red'] },
  { title: 'the gate after the review fix red on code → one gate fix there → green → delta → ready', surface: API,
    gate: seq('green', 'code', 'green'), reviewer: (n) => n === 1 ? review([BUG]) : review([], ['reviewer#r1.1']), expect: ['ready', 3] },
  { title: 'a machine red → load wait and re-run (no builder) → green → ready', surface: API, gate: seq('machine', 'green'), args: { loadThreshold: 12 }, expect: ['ready', 1] },
  { title: 'machine red three times → parked machine', surface: API, gate: seq('machine', 'machine', 'machine'), expect: ['parked', 1, 'machine'] },
  { title: 'two builders with a contract: back ∥ front; the fix splits by side', surface: BOTH, args: { contract: true },
    reviewer: (n) => n === 1 ? review([BUG]) : review([], ['reviewer#r1.1']), qaFront: (n) => n === 1 ? review([AC]) : review([], ['qa-frontend#r1.1']), expect: ['ready', 2] },
  { title: 'a QA finding as a note only, and a "blocking" without proof downgraded → ready, notes for the PR', surface: SCREEN,
    qaFront: () => review([NOTE]), reviewer: () => review([NO_PROOF]), expect: ['ready', 1] },
  { title: 'the builder is blocked (a missing secret) → blocked, no gate', surface: API,
    build: (n) => build(n, { blocked: 'the payment provider test key is not in the env' }), expect: ['blocked', 1] },
  { title: 'update: a clean merge, the gate green → ready, no builder', surface: API, args: { mode: 'update' }, expect: ['ready', 0] },
  { title: 'update: a conflict → the builder resolves → gate → the reviewer reads the resolution → ready', surface: API, args: { mode: 'update' },
    gate: seq('conflict', 'green'), expect: ['ready', 1] },
  { title: 'resume after a machine park before the check → gate → whole check → ready', surface: API,
    args: { mode: 'resume', resume: { head: 'h3', passesUsed: 1, check: 'whole' } }, expect: ['ready', 1] },
  { title: 'a style-only change: the builder says visual → both QAs skipped, the reviewer only → ready', surface: STYLE,
    build: (n) => build(n, { screenChange: 'visual', tried: 'the order list opened: the new spacing shows' }),
    expect: ['ready', 1], calls: ['builder', 'exec-gate', 'reviewer'], qa: ['skipped', 'skipped'] },
  { title: 'a logic change on screen: the builder says behaviour → qa-frontend runs, qa-backend skipped → ready', surface: SCREEN,
    expect: ['ready', 1], calls: ['builder', 'exec-gate', 'reviewer', 'qa-frontend'], qa: ['run', 'skipped'] },
  { title: 'a style-only change, the session calls qa-frontend anyway → it runs', surface: STYLE, args: { qa: { frontend: 'run', why: 'the layout hides an action at phone width' } },
    build: (n) => build(n, { screenChange: 'visual' }),
    expect: ['ready', 1], calls: ['builder', 'exec-gate', 'reviewer', 'qa-frontend'], qa: ['run', 'skipped'] },
  { title: 'adjust: his request on screen → builder → gate → ready, no reviewer, no QA', surface: SCREEN, args: { mode: 'adjust', entry: 'A.1' },
    expect: ['ready', 1], calls: ['builder', 'exec-gate'] },
  { title: 'adjust: a code red → one gate fix → green → ready, still no review', surface: SCREEN, args: { mode: 'adjust', entry: 'A.2' },
    gate: seq('code', 'green'), expect: ['ready', 2], calls: ['builder', 'exec-gate', 'builder', 'exec-gate'] },
  { title: 'adjust: the gate sees auth touched → the reviewer reads it → ready', surface: AUTH, args: { mode: 'adjust', entry: 'A.3' },
    expect: ['ready', 1], calls: ['builder', 'exec-gate', 'reviewer'] },
  { title: 'adjust: marked security by the session, a blocking hole → one fix → delta by the reviewer → ready', surface: SCREEN, args: { mode: 'adjust', entry: 'A.4', security: true },
    reviewer: (n) => n === 1 ? review([{ ...BUG, basis: 'security', title: 'another user\'s order readable by id' }]) : review([], ['reviewer#r1.1']), expect: ['ready', 2],
    calls: ['builder', 'exec-gate', 'reviewer', 'builder', 'exec-gate', 'reviewer'] },
];

let bad = 0;
for (const sc of scenarios) {
  const counts = {}, calls = [], names = [], logs = [];
  const agent = async (prompt, o) => {
    const name = nameOf(prompt, o);
    const n = counts[name] = (counts[name] ?? 0) + 1;
    calls.push(o.label);
    names.push(name);
    if (name === 'builder') return sc.build ? sc.build(n) : build(n);
    if (name === 'exec-gate') return gate(sc.gate ? sc.gate(n) : 'green', sc.surface, n);
    if (name === 'reviewer') return (sc.reviewer ?? (() => review()))(n);
    if (name === 'qa-frontend') return (sc.qaFront ?? (() => review()))(n);
    if (name === 'qa-backend') return (sc.qaBack ?? (() => review()))(n);
    throw new Error(`unknown agent ${name}`);
  };
  const r = await run({ mode: 'build', entry: 'E-01', base: 'feat/x', branch: 'story/x/E-01', worktree: '/w', agentsDir: '/repo/claude/agents',
    gateCommands: ['make check', 'make test-affected base=feat/x'], fastChecks: ['make check'], inlineAgents: true, ...(sc.args ?? {}) },
  agent, async (th) => Promise.all(th.map(t => t())), (m) => logs.push(m), () => {});
  const [status, passes, reason] = sc.expect;
  const ok = r.status === status && r.passes === passes && (reason === undefined || r.reason === reason)
    && (!sc.calls || sc.calls.join() === names.join())
    && (!sc.qa || (r.qa?.frontend === sc.qa[0] && r.qa?.backend === sc.qa[1]));
  if (!ok) bad++;
  const mins = r.steps.reduce((a, s) => a + (s.minutes ?? 0), 0);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${sc.title}\n     status=${r.status}${r.reason ? ` (${r.reason})` : ''} passes=${r.passes} rounds=${r.rounds.length} notes=${r.notes.length} steps=${r.steps.length} (${mins} min)${ok ? '' : ` — expected ${status} passes=${passes}${reason ? ` (${reason})` : ''}${sc.calls ? ` calls ${sc.calls.join(' → ')}` : ''}`}`);
  console.log(`     calls: ${calls.join(' → ') || '(none)'}${r.qa ? ` · qa front ${r.qa.frontend}, back ${r.qa.backend}` : ''}`);
  if (verbose) console.log(logs.map(l => `       ${l}`).join('\n'));
}
console.log(bad ? `exec-entry dry run: ${bad} scenario(s) failed` : `exec-entry dry run: all ${scenarios.length} scenarios as expected`);
process.exit(bad ? 1 : 0);
