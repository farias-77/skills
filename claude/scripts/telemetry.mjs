#!/usr/bin/env node
// telemetry.mjs: the numbers of one front, read from what already exists.
// No stage records telemetry by hand; the report and the close call this.
//
//   node telemetry.mjs <slug> [--stage <name>] [--ws <dir>] [--projects <dir>] [--out <file>]
//
//   --ws        the front's folder (default ./designs/<slug>); its entries'
//               run-*.json are read, and metrics.json is written there
//   --projects  the Claude Code transcripts (default ~/.claude/projects)
//   --stage     only that stage (discovery, design, plan, execute, release,
//               close, lets-cook, weekly-retro)
//   --out       where to write (default <ws>/metrics.json; "-" for stdout)
//
// Sources: each transcript is cut into segments at the commands that open a
// stage (/stage-<x>, /lets-cook, /weekly-retro, a /goal naming one of those
// skills, /clear). A segment belongs to the front when its command or /goal
// names the slug, or when it writes a file under <slug>/. Its subagents
// (subagents/**/*.jsonl, workflows included) are the ones that started
// inside it. Entries run in the cloud bring their run-*.json.
//
// What is not measured stays null with a line in `gaps`; a gap never drops
// the rest of the sum. Cost is an estimate (tokens × the list price below),
// marked as one.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// USD per million tokens, first-party list prices (2026-10). Cache writes
// cost 1.25× input (5 min) or 2× input (1 h). A model with `longAbove`
// costs `longFactor`× on every request whose prompt (input + cache read +
// cache write) passes that many tokens; those requests are summed under
// `<model> >Nk`.
const PRICES = {
  'claude-fable-5-1': { in: 10, out: 50, read: 0.25 },
  'claude-fable-5': { in: 10, out: 50, read: 1 },
  'claude-opus-5-5': { in: 4, out: 20, read: 0.2 },
  'claude-opus-5': { in: 5, out: 25, read: 0.5 },
  'claude-opus-4-8': { in: 5, out: 25, read: 0.5 },
  'claude-sonnet-5-5': { in: 2, out: 10, read: 0.2 },
  'claude-sonnet-5': { in: 2, out: 10, read: 0.2 },
  'claude-sonnet-4-6': { in: 3, out: 15, read: 0.3 },
  'claude-haiku-5-5': { in: 0.1, out: 0.5, read: 0.01, longAbove: 100_000, longFactor: 5 },
  'claude-haiku-4-5': { in: 1, out: 5, read: 0.1 },
}
const STAGE_SKILLS = ['stage-discovery', 'stage-design', 'stage-plan', 'stage-execute', 'stage-release', 'stage-close', 'lets-cook', 'weekly-retro']
const stageName = (skill) => skill.replace(/^stage-/, '')

const argv = process.argv.slice(2)
const opt = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined }
const slug = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')))
if (!slug) {
  console.error('usage: node telemetry.mjs <slug> [--stage <name>] [--ws <dir>] [--projects <dir>] [--out <file>]')
  process.exit(2)
}
const onlyStage = opt('--stage')
const ws = opt('--ws') ?? path.join(process.cwd(), 'designs', slug)
const projects = opt('--projects') ?? path.join(os.homedir(), '.claude', 'projects')
const out = opt('--out') ?? path.join(ws, 'metrics.json')
const gaps = []

const minutes = (a, b) => (a && b ? Math.round((Date.parse(b) - Date.parse(a)) / 600) / 100 : null)
const round2 = (v) => (v === null ? null : Math.round(v * 100) / 100)

function walk(dir, test, acc = []) {
  let entries
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return acc }
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, test, acc)
    else if (test(e.name)) acc.push(p)
  }
  return acc
}

function readJsonl(file) {
  const rows = []
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try { rows.push(JSON.parse(line)) } catch { /* a torn last line */ }
  }
  return rows
}

function text(content) {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) return content.filter((b) => b?.type === 'text').map((b) => b.text).join('\n')
  return ''
}

// A command message: "<command-name>/stage-plan</command-name> ... <command-args>slug</command-args>"
function command(row) {
  if (row.type !== 'user') return null
  const t = text(row.message?.content)
  const name = t.match(/<command-name>\/?([^<]+)<\/command-name>/)?.[1]?.trim()
  if (!name) return null
  const args = t.match(/<command-args>([\s\S]*?)<\/command-args>/)?.[1] ?? ''
  if (name === 'clear') return { kind: 'clear' }
  if (STAGE_SKILLS.includes(name)) return { kind: 'stage', stage: stageName(name), args }
  if (name === 'goal') {
    const skill = STAGE_SKILLS.find((s) => args.includes(s))
    return { kind: 'goal', stage: skill ? stageName(skill) : null, args }
  }
  return null
}

const isHuman = (row) => row.type === 'user' && (row.origin ? row.origin.kind === 'human' : typeof row.message?.content === 'string' && !row.isMeta && !row.message.content.startsWith('<'))

function addUsage(acc, row, seen) {
  const m = row.message
  if (row.type !== 'assistant' || !m?.usage || !m.model || m.model.startsWith('<')) return
  const id = m.id ?? row.requestId ?? row.uuid
  const u = m.usage
  // One message is written as several rows; the input is the same on each, the output grows to the last.
  const prev = seen.get(id)
  if (prev) {
    const more = (u.output_tokens ?? 0) - prev.counted
    if (more > 0) { prev.t.output += more; prev.counted += more }
    return
  }
  const base = m.model.replace(/\[.*\]$/, '').replace(/-\d{8}$/, '')
  const p = PRICES[base]
  const prompt = (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0)
  const model = p?.longAbove && prompt > p.longAbove ? `${base} >${p.longAbove / 1000}k` : base
  const t = (acc[model] ??= { input: 0, output: 0, cacheWrite5m: 0, cacheWrite1h: 0, cacheRead: 0 })
  seen.set(id, { t, counted: u.output_tokens ?? 0 })
  t.input += u.input_tokens ?? 0
  t.output += u.output_tokens ?? 0
  t.cacheRead += u.cache_read_input_tokens ?? 0
  const w1h = u.cache_creation?.ephemeral_1h_input_tokens ?? 0
  t.cacheWrite1h += w1h
  t.cacheWrite5m += (u.cache_creation_input_tokens ?? 0) - w1h
}

function cost(tokens) {
  let usd = 0
  for (const [model, t] of Object.entries(tokens)) {
    const [base, long] = model.split(' ')
    const p = PRICES[base]
    if (!p) { gaps.push(`no price for ${model}; its tokens are left out of the cost`); continue }
    const x = long ? p.longFactor : 1
    usd += x * (t.input * p.in + t.output * p.out + t.cacheRead * p.read + t.cacheWrite5m * p.in * 1.25 + t.cacheWrite1h * p.in * 2) / 1e6
  }
  return round2(usd)
}

const sumTokens = (list) => {
  const acc = {}
  for (const tokens of list) for (const [m, t] of Object.entries(tokens)) {
    const a = (acc[m] ??= { input: 0, output: 0, cacheWrite5m: 0, cacheWrite1h: 0, cacheRead: 0 })
    for (const k of Object.keys(a)) a[k] += t[k]
  }
  return acc
}

// ---------- the transcripts ----------

// A transcript last written a day before the slug's date cannot hold it.
const dated = slug.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
const since = dated ? Date.parse(dated) - 86400000 : 0
const segments = []
const mainFiles = walk(projects, (n) => n.endsWith('.jsonl'))
  .filter((f) => !f.includes(`${path.sep}subagents${path.sep}`) && fs.statSync(f).mtimeMs >= since)
if (!mainFiles.length) gaps.push(`no transcripts under ${projects}`)

for (const file of mainFiles) {
  const raw = fs.readFileSync(file, 'utf8')
  if (!raw.includes(slug)) continue
  const rows = readJsonl(file)
  let seg = null
  const close = () => { if (seg) segments.push(seg); seg = null }
  for (const row of rows) {
    const c = command(row)
    if (c?.kind === 'clear') { close(); continue }
    if (c && c.stage && (!seg || c.kind === 'stage' || c.stage !== seg.stage)) {
      close()
      seg = { file, stage: c.stage, rows: [], ours: c.args.includes(slug) }
    } else if (c?.kind === 'goal' && seg && c.args.includes(slug)) seg.ours = true
    if (!seg) continue
    seg.rows.push(row)
    if (!seg.ours && row.type === 'assistant' && Array.isArray(row.message?.content)) {
      for (const b of row.message.content) {
        const p = b?.type === 'tool_use' ? b.input?.file_path ?? '' : ''
        if (p.includes(`/${slug}/`) && ['Write', 'Edit', 'MultiEdit'].includes(b.name)) seg.ours = true
      }
    }
  }
  close()
}

function measure(seg) {
  const stamped = seg.rows.filter((r) => r.timestamp)
  const start = stamped[0]?.timestamp ?? null
  const end = stamped.at(-1)?.timestamp ?? null
  const seen = new Map()
  const tokens = {}
  const askIds = new Set()
  let touches = 0
  let waitMin = 0
  let lastOther = null
  for (const r of seg.rows) {
    addUsage(tokens, r, seen)
    if (r.type === 'assistant' && Array.isArray(r.message?.content)) {
      for (const b of r.message.content) if (b?.type === 'tool_use' && b.name === 'AskUserQuestion') askIds.add(b.id)
    }
    const answered = r.type === 'user' && Array.isArray(r.message?.content) && r.message.content.some((b) => b?.type === 'tool_result' && askIds.has(b.tool_use_id))
    if (isHuman(r) || answered) {
      touches++
      if (lastOther && r.timestamp) waitMin += minutes(lastOther, r.timestamp) ?? 0
      lastOther = null
    } else if (r.timestamp && r.type === 'assistant') lastOther = r.timestamp
  }

  const sessionDir = seg.file.replace(/\.jsonl$/, '')
  const agents = {}
  let activeAgentMin = 0
  for (const f of walk(path.join(sessionDir, 'subagents'), (n) => n.endsWith('.jsonl'))) {
    const rows = readJsonl(f)
    const first = rows.find((r) => r.timestamp)?.timestamp
    if (!first || !start || first < start || (end && first > end)) continue
    let type = path.basename(f, '.jsonl')
    try { type = JSON.parse(fs.readFileSync(f.replace(/\.jsonl$/, '.meta.json'), 'utf8')).agentType ?? type } catch { /* no meta */ }
    const a = (agents[type] ??= { runs: 0, minutes: 0, tokens: {} })
    a.runs++
    const last = rows.filter((r) => r.timestamp).at(-1).timestamp
    a.minutes = round2(a.minutes + (minutes(first, last) ?? 0))
    activeAgentMin += minutes(first, last) ?? 0
    const s = new Map()
    for (const r of rows) addUsage(a.tokens, r, s)
  }
  return {
    startedAt: start, endedAt: end, wallClockMin: minutes(start, end), activeAgentMin: round2(activeAgentMin),
    touches, waitOnHimMin: round2(waitMin), tokens: sumTokens([tokens, ...Object.values(agents).map((a) => a.tokens)]), agents,
  }
}

const ours = segments.filter((s) => s.ours && (!onlyStage || s.stage === onlyStage))
if (!ours.length) gaps.push(`no session segment names ${slug}${onlyStage ? ` at ${onlyStage}` : ''}`)

const byStage = {}
for (const seg of ours) {
  const m = measure(seg)
  const st = (byStage[seg.stage] ??= { stage: seg.stage, sessions: 0, startedAt: null, endedAt: null, wallClockMin: 0, activeAgentMin: 0, touches: 0, waitOnHimMin: 0, parts: [], agents: {} })
  st.sessions++
  if (m.startedAt && (!st.startedAt || m.startedAt < st.startedAt)) st.startedAt = m.startedAt
  if (m.endedAt && (!st.endedAt || m.endedAt > st.endedAt)) st.endedAt = m.endedAt
  st.wallClockMin = round2(st.wallClockMin + (m.wallClockMin ?? 0))
  st.activeAgentMin = round2(st.activeAgentMin + m.activeAgentMin)
  st.touches += m.touches
  st.waitOnHimMin = round2(st.waitOnHimMin + m.waitOnHimMin)
  st.parts.push(m.tokens)
  for (const [k, a] of Object.entries(m.agents)) {
    const b = (st.agents[k] ??= { runs: 0, minutes: 0 })
    b.runs += a.runs
    b.minutes = round2(b.minutes + a.minutes)
  }
}

// ---------- the entries' runs (cloud and local) ----------

const runs = walk(ws, (n) => /^run-\d+\.json$/.test(n))
const entries = { runs: runs.length, rounds: 0, findings: {}, tokens: {} }
let runTokensSeen = false
for (const f of runs) {
  let j
  try { j = JSON.parse(fs.readFileSync(f, 'utf8')) } catch { gaps.push(`${path.relative(ws, f)} is not JSON`); continue }
  entries.rounds += (j.passes?.gateFixes ?? 0) + (j.passes?.reviewFixes ?? 0)
  const visit = (v) => {
    if (Array.isArray(v)) return v.forEach(visit)
    if (!v || typeof v !== 'object') return
    if (typeof v.severity === 'string' && typeof v.basis === 'string') {
      const k = `${v.basis}·${v.severity}`
      entries.findings[k] = (entries.findings[k] ?? 0) + 1
    }
    if (v.usage && typeof v.usage === 'object' && typeof v.model === 'string') {
      runTokensSeen = true
      addUsage(entries.tokens, { type: 'assistant', message: { id: `${f}:${Math.random()}`, model: v.model, usage: v.usage } }, new Map())
    }
    Object.values(v).forEach(visit)
  }
  visit(j)
}
if (runs.length && !runTokensSeen) gaps.push('the entries\' run-*.json carry no token usage; cloud entries\' tokens are not counted')

// ---------- the sum ----------

const order = STAGE_SKILLS.map(stageName)
const stages = Object.values(byStage).sort((a, b) => order.indexOf(a.stage) - order.indexOf(b.stage)).map(({ parts, ...st }) => {
  const tokens = sumTokens(parts)
  return { ...st, tokens, costUsd: cost(tokens) }
})
const allTokens = sumTokens([...stages.map((s) => s.tokens), entries.tokens])
const starts = stages.map((s) => s.startedAt).filter(Boolean).sort()
const ends = stages.map((s) => s.endedAt).filter(Boolean).sort()

let pipelineSha = null
try {
  pipelineSha = execFileSync('git', ['-C', path.dirname(fileURLToPath(import.meta.url)), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
} catch { gaps.push('the pipeline repo sha could not be read') }

const result = {
  workstream: slug,
  stage: onlyStage ?? null,
  generatedAt: new Date().toISOString(),
  pipelineSha,
  stages,
  entries: { ...entries, costUsd: cost(entries.tokens) },
  totals: {
    startedAt: starts[0] ?? null,
    endedAt: ends.at(-1) ?? null,
    calendarMin: minutes(starts[0], ends.at(-1)),
    wallClockMin: round2(stages.reduce((n, s) => n + (s.wallClockMin ?? 0), 0)),
    activeAgentMin: round2(stages.reduce((n, s) => n + s.activeAgentMin, 0)),
    touches: stages.reduce((n, s) => n + s.touches, 0),
    waitOnHimMin: round2(stages.reduce((n, s) => n + s.waitOnHimMin, 0)),
    tokens: allTokens,
    costUsd: cost(allTokens),
  },
  cost: { estimate: true, basis: 'tokens × first-party list price per model; cache writes 1.25× (5 min) or 2× (1 h) input; a model with a long-prompt tier (Haiku 5.5 over 100k) at its factor' },
  gaps: [...new Set(gaps)],
}

const json = `${JSON.stringify(result, null, 2)}\n`
if (out === '-') process.stdout.write(json)
else {
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, json)
  console.log(`${out}: ${stages.length} stage(s), ${result.totals.touches} touches, ~US$ ${result.totals.costUsd} (estimate)${result.gaps.length ? `, ${result.gaps.length} gap(s)` : ''}`)
}
