#!/usr/bin/env node
// check-models.mjs — every agent's frontmatter against docs/models.md.
//
// Fails (exit 1) on:
//   - a model outside Opus 5.5 / Sonnet 5.5 / Haiku 5.5;
//   - an agent in claude/agents/ with no row in docs/models.md;
//   - a model or effort that differs from the agent's row;
//   - a description whose "(Model 5.5, effort)" mention differs from the frontmatter;
//   - a workflow's AGENTS or OVERRIDES entry that differs from the row, or from
//     that workflow's row under "Per-call overrides";
//   - a per-call override row that its workflow does not carry;
//   - a file in claude/workflows/ not named <name>-workflow.js;
//   - an agent with Bash in its tools that does not carry the commands sentence
//     of claude/references/commands.md verbatim.
// Warns on a row with no agent file (an agent planned or removed).
//
// Usage: node scripts/check-models.mjs [repo-root]

import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..'));
const agentsDir = join(root, 'claude/agents');
const MODELS = { 'claude-opus-5-5': 'Opus 5.5', 'claude-sonnet-5-5': 'Sonnet 5.5', 'claude-haiku-5-5': 'Haiku 5.5' };
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'];

// "The agents": | `name` | stage | Model | effort ... | evidence |
// "Per-call overrides": | `file` | `agent` | Model | effort | evidence |
const rows = new Map(), overrides = new Map();
let section = '';
for (const line of readFileSync(join(root, 'docs/models.md'), 'utf8').split('\n')) {
  if (line.startsWith('## ')) { section = line.slice(3).trim(); continue; }
  const m = line.match(/^\|\s*`([a-z0-9.-]+)`\s*\|\s*([^|]*?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
  if (!m) continue;
  const pick = { model: m[3], effort: m[4].split(/[\s;(]/)[0] };
  if (section === 'The agents') rows.set(m[1], pick);
  if (section === 'Per-call overrides') overrides.set(`${m[1]} ${m[2].replace(/`/g, '')}`, { ...pick, used: false });
}

const frontmatter = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const out = {};
  if (!m) return out;
  for (const l of m[1].split('\n')) {
    const kv = l.match(/^([a-zA-Z-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
};

const commandsLine = readFileSync(join(root, 'claude/references/commands.md'), 'utf8').split('\n').find((l) => l.startsWith('**Commands:**'));
const errors = [], warnings = [], seen = new Set();
for (const file of readdirSync(agentsDir).filter((f) => f.endsWith('.md')).sort()) {
  const text = readFileSync(join(agentsDir, file), 'utf8');
  const fm = frontmatter(text);
  if (/\bBash\b/.test(fm.tools ?? '') && !text.includes(commandsLine))
    errors.push(`${file}: runs Bash without the commands sentence of claude/references/commands.md`);
  const name = fm.name || file.replace(/\.md$/, '');
  seen.add(name);
  const model = MODELS[fm.model];
  if (!model) { errors.push(`${file}: model "${fm.model ?? '(none)'}" is not Opus 5.5, Sonnet 5.5 or Haiku 5.5`); continue; }
  if (!EFFORTS.includes(fm.effort)) errors.push(`${file}: effort "${fm.effort ?? '(none)'}" is not one of ${EFFORTS.join(', ')}`);
  if (model === 'Sonnet 5.5' && ['xhigh', 'max'].includes(fm.effort)) errors.push(`${file}: Sonnet 5.5 never above high`);
  const row = rows.get(name);
  if (!row) { errors.push(`${file}: "${name}" has no row in docs/models.md`); continue; }
  if (row.model !== model || row.effort !== fm.effort)
    errors.push(`${file}: frontmatter ${model}, ${fm.effort} ≠ docs/models.md ${row.model}, ${row.effort}`);
  const said = (fm.description || '').match(/\b(Opus|Sonnet|Haiku|Fable) (\d[\d.]*),? (low|medium|high|xhigh|max)\b/);
  if (said && (`${said[1]} ${said[2]}` !== model || said[3] !== fm.effort))
    errors.push(`${file}: description says ${said[1]} ${said[2]}, ${said[3]} ≠ frontmatter ${model}, ${fm.effort}`);
}
// The workflows' AGENTS maps (used when agents run inline) and OVERRIDES maps
// (per call, in both modes) must agree too: an entry matches its agent row, or
// this workflow's per-call override row.
const wfDir = join(root, 'claude/workflows');
const SHORT = { opus: 'Opus 5.5', sonnet: 'Sonnet 5.5', haiku: 'Haiku 5.5' };
for (const file of readdirSync(wfDir).filter((f) => !/^[a-z0-9-]+-workflow\.js$/.test(f)))
  errors.push(`workflows/${file}: a workflow file is named <name>-workflow.js`);
for (const file of readdirSync(wfDir).filter((f) => f.endsWith('.js')).sort()) {
  const text = readFileSync(join(wfDir, file), 'utf8');
  for (const m of text.matchAll(/^\s*'?([a-z][a-z0-9-]*)'?:\s*\{\s*model:\s*'(\w+)',\s*effort:\s*'(\w+)'/gm)) {
    const [, name, short, effort] = m;
    const row = rows.get(name), over = overrides.get(`${file} ${name}`);
    if (!SHORT[short]) { errors.push(`workflows/${file}: ${name} model "${short}" is not opus, sonnet or haiku`); continue; }
    if (!row) { errors.push(`workflows/${file}: "${name}" has no row in docs/models.md`); continue; }
    const same = (r) => r && r.model === SHORT[short] && r.effort === effort;
    if (same(over)) { over.used = true; continue; }
    if (!same(row))
      errors.push(`workflows/${file}: ${name} ${SHORT[short]}, ${effort} ≠ docs/models.md ${row.model}, ${row.effort}${over ? ` (or its override ${over.model}, ${over.effort})` : ''}`);
  }
}
for (const [key, o] of overrides) if (!o.used) errors.push(`docs/models.md: the override ${key} (${o.model}, ${o.effort}) is not in that workflow`);
for (const name of rows.keys()) if (!seen.has(name)) warnings.push(`docs/models.md: "${name}" has no file in claude/agents/`);

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`FAIL  ${e}`);
console.log(errors.length ? `check-models: ${errors.length} failure(s), ${seen.size} agents` : `check-models: ok, ${seen.size} agents, ${rows.size} rows`);
process.exit(errors.length ? 1 : 0);
