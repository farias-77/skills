#!/usr/bin/env node
// Sums the six stages' telemetry.json (claude/docs/telemetry.md) into the
// parts of 05-close/metrics.json that come from telemetry: stages[],
// totals, findingsByClass, the ten slowest steps, plus the stages that
// did not measure themselves and every gap they declared. Never
// estimates: a missing value stays null, and a total is null when any
// stage's value is.
//
//   node telemetry-sum.mjs <workstream-dir> [--out <file>]
//
// Exit 0 with the JSON on stdout (or in --out); exit 1 names the file and
// the field when a telemetry.json is not in the shared shape.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
const ws = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
if (!ws) {
  console.error('usage: node telemetry-sum.mjs <workstream-dir> [--out <file>]');
  process.exit(2);
}

const STAGES = [
  ['discovery', '00-discovery'],
  ['design', '01-design'],
  ['plan', '02-plan'],
  ['execute', '03-execution'],
  ['release', '04-release'],
  ['close', '05-close'],
];
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const r1 = (v) => (v === null ? null : Math.round(v * 10) / 10);
const r2 = (v) => (v === null ? null : Math.round(v * 100) / 100);
const problems = [];

const stages = [];
const steps = [];
const findingsByClass = [];
const missing = [];
const gaps = [];
for (const [stage, dir] of STAGES) {
  const rel = `${dir}/telemetry.json`;
  const file = path.join(ws, rel);
  if (!fs.existsSync(file)) {
    missing.push(stage);
    continue;
  }
  let t;
  try {
    t = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    problems.push(`${rel}: not JSON (${e.message})`);
    continue;
  }
  for (const k of ['stage', 'openedAt', 'steps', 'agents', 'tokens', 'findingsByClass']) {
    if (!(k in t)) problems.push(`${rel}: ${k} is missing`);
  }
  if (t.stage !== undefined && t.stage !== stage) problems.push(`${rel}: stage is "${t.stage}", the folder says "${stage}"`);
  if (!Array.isArray(t.steps)) problems.push(`${rel}: steps must be a list`);
  if (!Array.isArray(t.agents)) problems.push(`${rel}: agents must be a list`);
  if (t.findingsByClass !== undefined && !Array.isArray(t.findingsByClass)) problems.push(`${rel}: findingsByClass must be a list`);
  const stageSteps = Array.isArray(t.steps) ? t.steps : [];
  for (const x of stageSteps) if (num(x.wallClockMin) !== null) steps.push({stage, step: String(x.step), minutes: Math.round(x.wallClockMin)});
  const agents = Array.isArray(t.agents) ? t.agents : [];
  // wall-clock: the stage's total, else open → close, else null
  let wall = num(t.wallClockMin);
  if (wall === null && t.openedAt && t.closedAt) {
    const d = (Date.parse(t.closedAt) - Date.parse(t.openedAt)) / 60000;
    wall = Number.isFinite(d) ? d : null;
  }
  // his minutes: the total, else the steps' sum when every step carries it
  let his = num(t.hisMin);
  if (his === null && stageSteps.length && stageSteps.every((s) => num(s.hisMin) !== null)) his = stageSteps.reduce((a, s) => a + s.hisMin, 0);
  const agentH = agents.length && agents.every((a) => num(a.hours) !== null) ? agents.reduce((a, x) => a + x.hours, 0) : null;
  let tokens = num(t.tokens?.total);
  if (tokens === null && num(t.tokens?.session) !== null && num(t.tokens?.agents) !== null) tokens = t.tokens.session + t.tokens.agents;
  stages.push({
    stage,
    wallClockH: r1(wall === null ? null : wall / 60),
    hisH: r2(his === null ? null : his / 60),
    agentH: r1(agentH),
    tokensM: r1(tokens === null ? null : tokens / 1e6),
    rounds: Number.isInteger(t.rounds) ? t.rounds : null,
    costUSD: r2(num(t.cost?.usd)),
    source: rel,
  });
  for (const f of Array.isArray(t.findingsByClass) ? t.findingsByClass : []) {
    findingsByClass.push({stage, class: String(f.class), found: Number.isInteger(f.found) ? f.found : null, sustained: Number.isInteger(f.sustained) ? f.sustained : null});
  }
  for (const g of Array.isArray(t.gaps) ? t.gaps : []) gaps.push({stage, gap: String(g), source: rel});
}

if (problems.length) {
  console.error('telemetry-sum: not in the shared shape (claude/docs/telemetry.md):');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

const total = (k, round) => (stages.length && stages.every((s) => s[k] !== null) ? round(stages.reduce((a, s) => a + s[k], 0)) : null);
const result = {
  stages,
  totals: {hisH: total('hisH', r2), agentH: total('agentH', r1), tokensM: total('tokensM', r1), costUSD: total('costUSD', r2)},
  findingsByClass,
  slowest: steps.sort((a, b) => b.minutes - a.minutes).slice(0, 10),
  missing,
  gaps,
};
const text = JSON.stringify(result, null, 1) + '\n';
if (out) fs.writeFileSync(out, text);
else process.stdout.write(text);
