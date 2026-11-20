#!/usr/bin/env node
// Runs claude/skills/stage-discovery/scripts/discovery.mjs on a copy of the worked example
// (tests/fixtures/discovery/workspace-invites) and on broken variants of it. No browser, no model.
// Exits 1 when a case ends other than expected.
//
// Usage: node tests/discovery-kit-dry-run.mjs [-v]

import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const script = join(root, 'claude/skills/stage-discovery/scripts/discovery.mjs');
const fixture = join(root, 'tests/fixtures/discovery/workspace-invites');
const verbose = process.argv.includes('-v');
const scratch = mkdtempSync(join(tmpdir(), 'discovery-kit-'));

function workstream(change) {
  const ws = join(mkdtempSync(join(scratch, 'ws-')), 'workspace-invites');
  cpSync(fixture, ws, { recursive: true });
  const edit = (file, from, to) => {
    const before = readFileSync(join(ws, file), 'utf8');
    if (!before.includes(from)) throw new Error(`fixture changed: "${from}" not in ${file}`);
    writeFileSync(join(ws, file), before.replace(from, to));
  };
  if (change) change(edit, ws);
  return ws;
}

function cli(...argv) {
  const r = spawnSync('node', [script, ...argv], { encoding: 'utf8' });
  let json = null;
  try { json = JSON.parse(r.stdout); } catch { /* a plain line */ }
  return { code: r.status, out: r.stdout.trim(), err: r.stderr.trim(), json };
}

const broken = (title, change, expected) => ({ title, run() {
  const r = cli('check', workstream(change));
  const hit = (r.json?.problems ?? []).filter((p) => expected.test(p));
  return r.code === 1 && hit.length ? null : `exit ${r.code}, problems: ${JSON.stringify(r.json?.problems ?? r.err)}`;
} });

const cases = [
  { title: 'the worked example passes check, with its counts', run() {
    const r = cli('check', workstream());
    const c = r.json?.counts ?? {};
    return r.code === 0 && c.stories === 2 && c.criteria === 6 && c.rules === 3 && c.notBuilding === 4 && c.tourStops === 6 ? null : `exit ${r.code} ${r.out.slice(0, 300)}`;
  } },
  broken('a rule with no criterion', (edit) => edit('stories.md', '[INV-2]', '[S-002]'), /rule INV-2 has no criterion/),
  broken('a rule in two criteria', (edit) => edit('stories.md', '**`J3.s2.1`** [S-001]', '**`J3.s2.1`** [INV-1]'), /rule INV-1 is in 2 criteria/),
  broken('an outcome with no (seen: …)', (edit) => edit('stories.md', 'AND no e-mail reaches joao.lima@example.com (seen: inbox)', 'AND no e-mail reaches joao.lima@example.com'), /has no \(seen/),
  broken('two events in one criterion', (edit) => edit('stories.md', '  THEN the Members list shows', '  WHEN she presses Enter\n  THEN the Members list shows'), /exactly one WHEN/),
  broken('a criterion on a step the story does not have', (edit) => edit('stories.md', '**`J4.s1.1`**', '**`J4.s9.1`**'), /step s9 is not a step/),
  broken('a criterion id used twice', (edit) => edit('stories.md', '**`J6.s1.1`**', '**`J5.s2.1`**'), /criterion J5\.s2\.1 appears in/),
  broken('a tag that is no rule and not its story', (edit) => edit('stories.md', '**`J1.s2.1`** [S-001]', '**`J1.s2.1`** [INV-9]'), /\[INV-9\] is neither/),
  broken('an error-path row removed', (edit) => edit('stories.md', '| Repeat | the same e-mail invited twice while pending | NB-2 | — |\n', ''), /S-001: the error-path table has no "repeat" row/),
  broken('a story citing another story\'s criterion', (edit) => edit('stories.md', '- A join page reached from the e-mail link', '- A join page reached from the e-mail link (see J1.s2.1)'), /S-002 cites J1\.s2\.1/),
  broken('a not-building id that does not exist', (edit) => edit('stories.md', '- NB-3 (see `not-building.md`)', '- NB-9 (see `not-building.md`)'), /cites NB-9/),
  broken('a not-building line without its reason', (edit) => edit('not-building.md', ' — later: he wants to see how often invites expire first', ''), /not-building\.md line not in the format/),
  broken('a tour stop proving an id nobody has', (edit) => edit('mock/mock.html', '"proves": ["INV-3", "J4.s1.1"]', '"proves": ["INV-7"]'), /proves INV-7/),
  broken('a tour stop on a part the screen does not draw', (edit) => edit('mock/mock.html', '"focus": "counter"', '"focus": "badge"'), /no element has data-part="badge"/),
  broken('a tour stop on a state that does not exist', (edit) => edit('mock/mock.html', '"state": "sent", "why"', '"state": "done", "why"'), /state "done" is not in states/),
  broken('mock CSS that styles the page', (edit) => edit('mock/mock.html', '.app { display: grid;', 'body { margin: 0; }\n.app { display: grid;'), /styles :root, html or body/),
  broken('a rule he did not decide (in the stories, not in the notes)', (edit) => edit('notes.md', '| INV-3 |', '| INV-30 |'), /rule INV-3 is in stories\.md and not in notes\.md/),
  { title: 'the gate refuses an open question and an unlocked screen', run() {
    const ws = workstream((edit) => edit('stories.md', '## Open\n\n- (none)', '## Open\n\n- What happens to a pending invite when the workspace is deleted?'));
    const p = cli('check', ws, '--gate').json?.problems ?? [];
    return p.some((x) => /Open has 1 item/.test(x)) && p.some((x) => /not locked/.test(x)) ? null : JSON.stringify(p);
  } },
  { title: 'lock refuses without his words and without green shots', run() {
    const ws = workstream();
    const a = cli('lock', ws), b = cli('lock', ws, '--words', 'that is it');
    return a.code === 1 && /needs --words/.test(a.err) && b.code === 1 && /no green shots/.test(b.err) && !existsSync(join(ws, 'mock/LOCK.json')) ? null : `${a.err} | ${b.err}`;
  } },
  { title: 'lock, freeze, then a removed id fails check', run() {
    const ws = workstream();
    seedShots(ws);
    const locked = cli('lock', ws, '--words', 'that is it, the counter is right');
    if (locked.code !== 0 || locked.json?.version !== 1) return `lock: ${locked.err || locked.out}`;
    const frozen = cli('freeze', ws);
    if (frozen.code !== 0 || frozen.json?.frozen !== 15) return `freeze: ${frozen.err || frozen.out}`;
    const kept = readFileSync(join(ws, 'not-building.md'), 'utf8').split('\n').filter((l) => !l.includes('NB-4')).join('\n');
    writeFileSync(join(ws, 'not-building.md'), kept);
    const after = cli('check', ws);
    return after.code === 1 && after.json.problems.some((p) => /frozen id NB-4 is gone/.test(p)) ? null : JSON.stringify(after.json?.problems);
  } },
  { title: 'a mock changed after the lock fails the gate', run() {
    const ws = workstream();
    seedShots(ws);
    if (cli('lock', ws, '--words', 'ok like this').code !== 0) return 'lock failed';
    writeFileSync(join(ws, 'mock/mock.html'), readFileSync(join(ws, 'mock/mock.html'), 'utf8').replace('Send invite', 'Invite'));
    const p = cli('check', ws, '--gate').json?.problems ?? [];
    return p.some((x) => /changed after the lock/.test(x)) ? null : JSON.stringify(p);
  } },
  { title: 'split writes one self-contained file per story, with only its own rules', run() {
    const ws = workstream();
    const r = cli('split', ws);
    const s2 = readFileSync(r.json.stories[1].file, 'utf8');
    return r.json.stories.length === 2 && r.json.stories[0].criteria.length === 4 && /INV-2/.test(s2) && !/INV-1:/.test(s2) && /NB-3/.test(s2) && !/## S-001/.test(s2) ? null : r.out.slice(0, 200);
  } },
  { title: 'page builds one self-contained file with the title, the data and the screen', run() {
    const ws = workstream();
    const r = cli('page', ws);
    const html = readFileSync(r.json.file, 'utf8');
    const ok = r.json.firstBuild && r.json.changed.length === 0 && html.startsWith('<title>Report - workspace-invites</title>') && !/\{\{[A-Z_]+\}\}/.test(html)
      && /function MOCK_SCREEN/.test(html) && /"demand":"Managers invite people/.test(html) && !/<!doctype|<html|<body/i.test(html);
    return ok ? null : `kb ${r.json?.kb} changed ${r.json?.changed}`;
  } },
  { title: 'page highlights exactly what differs from the version he last read, and resets after --read', run() {
    const ws = workstream();
    cli('page', ws); cli('page', ws, '--read');
    const stories = readFileSync(join(ws, 'stories.md'), 'utf8').replace('"6 of 10 invites left today"', '"6 invites left today"');
    writeFileSync(join(ws, 'stories.md'), stories);
    const changed = cli('page', ws).json.changed;
    cli('page', ws, '--read');
    const after = cli('page', ws).json.changed;
    return JSON.stringify(changed) === '["criterion:J1.s2.1"]' && after.length === 0 ? null : `${JSON.stringify(changed)} then ${JSON.stringify(after)}`;
  } },
  { title: 'state prints the status line and writes the same line to .state.md', run() {
    const ws = workstream();
    const a = cli('state', ws, '--stop', '5', '--state', 'needs-you', '--about', 'the mock is ready, walk the tour', '--set', 'size=feature');
    const b = cli('state', ws, '--state', 'running', '--about', 'review running');
    const file = readFileSync(join(ws, '.state.md'), 'utf8');
    const c = cli('state', ws, '--stop', '7', '--state', 'done', '--about', 'delivered, environment clean', '--lang', 'pt-BR');
    return a.out === '🔴 NEEDS YOU · the mock is ready, walk the tour · ●●●●●○○ 5/7' && b.out === '🟢 RUNNING ON ITS OWN · review running · ●●●●●○○ 5/7'
      && file.includes(`line: ${b.out}`) && /size: feature/.test(file) && /stop: 5\/7 mock/.test(file) && c.out.startsWith('✅ TERMINEI · PODE FECHAR') && cli('state', ws, '--state', 'paused').code === 1 ? null : `${a.out} | ${b.out} | ${c.out}`;
  } },
];

// Stands in for `shots`, which needs a browser: a green report for this exact mock.
function seedShots(ws) {
  const mockSha = createHash('sha256').update(readFileSync(join(ws, 'mock/mock.html'), 'utf8')).digest('hex');
  mkdirSync(join(ws, 'mock/shots'), { recursive: true });
  writeFileSync(join(ws, 'mock/shots/report.json'), JSON.stringify({ ok: true, mockSha, files: [], problems: [] }));
}

let bad = 0;
for (const c of cases) {
  let problem;
  try { problem = c.run(); } catch (e) { problem = e.message; }
  console.log(`${problem ? 'FAIL' : 'ok  '}  ${c.title}${problem ? `\n        ${String(problem).slice(0, verbose ? 2000 : 400)}` : ''}`);
  if (problem) bad++;
}
rmSync(scratch, { recursive: true, force: true });
console.log(bad ? `discovery-kit dry run: ${bad} of ${cases.length} failed` : `discovery-kit dry run: ok, ${cases.length} cases`);
process.exit(bad ? 1 : 0);
