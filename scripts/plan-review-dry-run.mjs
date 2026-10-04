#!/usr/bin/env node
// plan-review-dry-run.mjs — runs claude/workflows/plan-review.js with mocked agents: no model is
// called, each agent returns a canned answer per scenario. Exits 1 when a scenario ends other than expected.
//
// Usage: node scripts/plan-review-dry-run.mjs [-v]

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'claude/workflows/plan-review.js'), 'utf8').replace(/^export const meta/m, 'const meta');
const AsyncFunction = (async () => {}).constructor;
const run = new AsyncFunction('args', 'agent', 'parallel', 'log', 'phase', src);
const verbose = process.argv.includes('-v');

const B = '/w/02-plan/briefs';
const BRIEFS = [
  { id: 'F', path: `${B}/F.md`, keys: ['provides', 'proof'] },
  { id: 'E-01', path: `${B}/E-01.md`, keys: ['J1.s1.1', 'J1.s2.1', 'contract'] },
  { id: 'E-02', path: `${B}/E-02.md`, keys: ['J2.s1.1'] },
];
const QUOTE = '`POST /orders` returns 201 with the order id and status `placed`';
const review = (findings = []) => ({ verdict: findings.length ? 'pass with fixes' : 'pass', verified: ['E-01 → none: no edge, the store is a fake in F'], quote: QUOTE, findings });
const FALSE_EDGE = { severity: 'fix', title: 'E-02 waits for E-01 for data', says: 'after: E-01 (side-effect)', gap: 'factory.Order seeds the order', fix: 'drop the edge' };
const read = (brief, judged, findings = []) => ({ brief, judged, findings });
const C = (key, o = {}) => ({ key, kind: 'contradicts', quote: QUOTE, missing: '', other: 'data-and-contracts.md §Orders: 201 { "id", "status", "day" }', ...o });
const U = (key, o = {}) => ({ key, kind: 'undecidable', quote: QUOTE, missing: 'which error code a past day returns', other: '', ...o });

const scenarios = [
  { title: 'clean: the reviewer verifies, every reader judges every key and reports nothing → valid, 0 findings',
    expect: { valid: true, findings: 0, dropped: 0, unread: 0, readers: 3 } },
  { title: 'the filter: one contradicts and one undecidable pass; no kind, no quote, no missing, no other text, a foreign key and a repeat are dropped',
    reader: (brief) => brief === 'E-01'
      ? read('E-01', ['J1.s1.1', 'J1.s2.1', 'contract'], [C('contract'), U('J1.s2.1'), { ...U('J1.s1.1'), kind: 'style' }, U('J1.s1.1', { quote: 'J1.s1.1' }),
          U('J1.s1.1', { missing: '' }), C('J1.s1.1', { other: ' ' }), C('J9.s9.9'), C('contract')])
      : null,
    expect: { valid: true, findings: 2, dropped: 6, unread: 0, blocker: 1 } },
  { title: 'the reviewer reports a false edge → kept as plan-reviewer#1',
    reviewer: () => review([FALSE_EDGE]), expect: { valid: true, findings: 1, ids: ['plan-reviewer#1'] } },
  { title: 'one reader skips a key twice → that brief unread, the round still valid',
    reader: (brief) => brief === 'E-02' ? read('E-02', ['J0.s0.0']) : null,
    expect: { valid: true, findings: 0, unread: 1, unreadIds: ['E-02'] } },
  { title: 'every reader skips its keys → every brief unread → invalid round',
    reader: (brief) => read(brief, ['nothing']), expect: { valid: false, unread: 3 } },
  { title: 'a lazy reviewer (no findings, nothing verified) twice → invalid round',
    reviewer: () => ({ verdict: 'pass', verified: [], quote: '', findings: [] }), expect: { valid: false } },
  { title: 'old delta args are ignored: still one whole round over every brief',
    args: { round: 2, changed: { briefs: ['E-01'] }, lenses: ['plan-reviewer-order'] }, expect: { valid: true, readers: 3, round: 1 } },
];

let bad = 0;
for (const sc of scenarios) {
  const counts = {}, logs = [];
  const agent = async (prompt, o) => {
    const name = o.agentType;
    counts[name] = (counts[name] ?? 0) + 1;
    if (name === 'plan-reviewer') return (sc.reviewer ?? (() => review()))();
    if (name === 'plan-blind-reader') {
      const brief = prompt.match(/^Brief (\S+)\./)[1];
      const keys = prompt.match(/The keys to judge: (.*)/)[1].split(', ');
      return (sc.reader && sc.reader(brief)) || read(brief, keys);
    }
    throw new Error(`unknown agent ${name}`);
  };
  const r = await run({ planDir: '/w/02-plan', designDir: '/w/01-design', discoveryDir: '/w/00-discovery', root: '/code', language: 'en', briefs: BRIEFS, ...(sc.args || {}) },
    agent, async (th) => Promise.all(th.map(t => t())), (m) => logs.push(m), () => {});
  const e = sc.expect, got = [];
  if ('valid' in e && r.valid !== e.valid) got.push(`valid ${r.valid}`);
  if ('round' in e && r.round !== e.round) got.push(`round ${r.round}`);
  if ('findings' in e && r.findings.length !== e.findings) got.push(`findings ${r.findings.length}`);
  if ('dropped' in e && r.dropped.length !== e.dropped) got.push(`dropped ${r.dropped.length}`);
  if ('unread' in e && r.unread.length !== e.unread) got.push(`unread ${r.unread.length}`);
  if ('unreadIds' in e && JSON.stringify(r.unread) !== JSON.stringify(e.unreadIds)) got.push(`unread ${r.unread}`);
  if ('blocker' in e && r.findings.filter(f => f.severity === 'blocker').length !== e.blocker) got.push('blocker count');
  if ('ids' in e && JSON.stringify(r.findings.map(f => f.id)) !== JSON.stringify(e.ids)) got.push(`ids ${r.findings.map(f => f.id)}`);
  if ('readers' in e && (counts['plan-blind-reader'] ?? 0) !== e.readers) got.push(`readers ${counts['plan-blind-reader']}`);
  if (r.findings.some(f => f.lens === 'plan-blind-reader' && (!f.kind || !f.says || !f.brief))) got.push('a blind finding without kind, quote or brief');
  console.log(`${got.length ? 'FAIL' : 'ok  '}  ${sc.title}${got.length ? `  (${got.join(', ')})` : ''}`);
  if (verbose || got.length) { for (const l of logs) console.log(`        log: ${l}`); for (const d of r.dropped) console.log(`        dropped: ${d.brief} ${d.why}`); }
  if (got.length) bad++;
}
console.log(bad ? `plan-review dry run: ${bad} of ${scenarios.length} failed` : `plan-review dry run: ok, ${scenarios.length} scenarios`);
process.exit(bad ? 1 : 0);
