#!/usr/bin/env node
/*
 * plan-graph.mjs — the mechanical check of a stage-3 build graph.
 *
 *   node plan-graph.mjs <02-plan/plan.graph.json> [--briefs <02-plan/briefs>]
 *                       [--stories <00-discovery/stories.md>]
 *                       [--json <out.json>] [--mermaid <out.mmd>] [--quiet]
 *
 * FAIL  an AC carried by no node, by two, or unknown · an entry over the AC
 *       cap · a file owned by two nodes · a shared file owned or extended
 *       outside the contract commit · an extended file its owner builds in
 *       parallel · a used name nothing provides before the user · a cycle ·
 *       an edge to nothing, without a class (ui | side-effect) or without a
 *       need · not exactly one contract commit · an entry with no AC · an
 *       HTML comment in a plan file · with --briefs, a brief that disagrees
 *       with its node or a two-sided node with no Contract · with --stories,
 *       an AC id of stories.md missing from the graph's acs, or the reverse.
 * WARN  an entry over the AC warning line · a file extended by two nodes ·
 *       a node owning a file another front changes · an integration entry
 *       that is not last.
 * REPORT the waves (a child starts when its parents merged), the width, the
 *       depth, the critical path, the start order and, with --briefs, the
 *       briefs the plan-review workflow reads (path and keys).
 *
 * Exit 0 green, 1 on a FAIL, 2 on a bad call. Node 18+, no dependencies.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'

const KINDS = ['contract', 'entry', 'integration']
const EDGE_CLASSES = ['ui', 'side-effect']
const SIDES = ['back', 'front']
const AC_WARN = 10
const AC_CAP = 12

const list = (x) => (Array.isArray(x) ? x : [])

function parseArgs(argv) {
  const value = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null }
  const flagged = new Set(['--briefs', '--stories', '--json', '--mermaid'].map(f => argv.indexOf(f) + 1).filter(i => i > 0))
  const graphPath = argv.find((a, i) => !a.startsWith('--') && !flagged.has(i))
  return { graphPath, briefsDir: value('--briefs'), storiesPath: value('--stories'), jsonOut: value('--json'), mermaidOut: value('--mermaid'), quiet: argv.includes('--quiet') }
}

const opts = parseArgs(process.argv.slice(2))
if (!opts.graphPath) {
  console.error('usage: plan-graph.mjs <plan.graph.json> [--briefs <dir>] [--stories <stories.md>] [--json <out>] [--mermaid <out>] [--quiet]')
  process.exit(2)
}
let G
try { G = JSON.parse(readFileSync(opts.graphPath, 'utf8')) } catch (e) { console.error(`cannot read ${opts.graphPath}: ${e.message}`); process.exit(2) }

const fails = [], warns = []
const fail = (code, msg) => fails.push({ code, msg })
const warn = (code, msg) => warns.push({ code, msg })

// ---------- paths ----------

const esc = (s) => s.replace(/[.+^${}()|[\]\\]/g, '\\$&')
const norm = (p) => String(p).replace(/^\.\//, '').replace(/\/$/, '/**')
const isGlob = (p) => /[*?]/.test(p)
const toRe = (p) => new RegExp('^' + esc(p).replace(/\*\*\/?/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]').replace(/\u0000/g, '.*') + '$')
function overlap(a, b) {
  a = norm(a); b = norm(b)
  if (a === b) return true
  if (!isGlob(a) && !isGlob(b)) return false
  if (!isGlob(a)) return toRe(b).test(a)
  if (!isGlob(b)) return toRe(a).test(b)
  const pa = a.split(/[*?]/)[0], pb = b.split(/[*?]/)[0]
  if (!(pa.startsWith(pb) || pb.startsWith(pa))) return false
  const sa = a.split(/[*?]/).at(-1), sb = b.split(/[*?]/).at(-1)
  return sa.endsWith(sb) || sb.endsWith(sa)
}

// ---------- shape ----------

const nodes = list(G.nodes)
const byId = new Map()
for (const n of nodes) {
  if (!n.id) { fail('shape', 'a node has no id'); continue }
  if (byId.has(n.id)) fail('shape', `${n.id}: duplicate id`)
  byId.set(n.id, n)
  if (!KINDS.includes(n.kind)) fail('shape', `${n.id}: kind "${n.kind}" is not one of ${KINDS.join(', ')}`)
  n.after = list(n.after).map(e => (typeof e === 'string' ? { id: e } : e))
  for (const k of ['acs', 'owns', 'extends', 'provides', 'uses', 'sides']) n[k] = list(n[k])
  for (const s of n.sides) if (!SIDES.includes(s)) fail('shape', `${n.id}: side "${s}" is not back or front`)
  if (!String(n.name ?? '').trim()) fail('shape', `${n.id}: no name`)
}
const isC = (n) => n?.kind === 'contract'
const contracts = nodes.filter(isC)
if (contracts.length !== 1) fail('shape', `${contracts.length} contract commits: the plan has exactly one (C)`)
const C = contracts[0]
const rest = nodes.filter(n => !isC(n))

// ---------- edges and cycles ----------

for (const n of nodes) for (const e of n.after) {
  const to = byId.get(e.id)
  if (!to) { fail('edge', `${n.id}: after names ${e.id}, which is not a node`); continue }
  if (isC(n)) { fail('edge', `${n.id}: the contract commit waits for nothing`); continue }
  if (isC(to)) { fail('edge', `${n.id}: after names the contract commit; it precedes every node and is never listed`); continue }
  if (!EDGE_CLASSES.includes(e.class)) fail('edge', `${n.id} → ${e.id}: class "${e.class ?? 'none'}" is not real behaviour (ui | side-effect); data is a factory, an interface is a fake`)
  if (!String(e.need ?? '').trim()) fail('edge', `${n.id} → ${e.id}: the edge does not name the behaviour it consumes`)
}

const parentsOf = (n) => n.after.map(e => byId.get(e.id)).filter(p => p && !isC(p))
const cycles = []
{
  const state = new Map()
  const visit = (n, stack) => {
    if (state.get(n.id) === 2) return
    if (state.get(n.id) === 1) { cycles.push([...stack.slice(stack.indexOf(n.id)), n.id].join(' → ')); return }
    state.set(n.id, 1)
    parentsOf(n).forEach(p => visit(p, [...stack, n.id]))
    state.set(n.id, 2)
  }
  rest.forEach(n => visit(n, []))
}
cycles.forEach(c => fail('cycle', `cycle: ${c}`))
const acyclic = cycles.length === 0

// ---------- waves, critical path, start order ----------

const memo = (fn) => { const m = new Map(); return (n) => (m.has(n.id) ? m.get(n.id) : (m.set(n.id, fn(n)), m.get(n.id))) }
const childrenOf = (n) => rest.filter(c => c.after.some(e => e.id === n.id))
const level = memo(n => { const ps = parentsOf(n); return ps.length ? 1 + Math.max(...ps.map(level)) : 1 })
const tail = memo(n => { const cs = childrenOf(n); return 1 + (cs.length ? Math.max(...cs.map(tail)) : 0) })

const waves = []
let depth = 0, width = 0
const critical = []
let startOrder = []
if (acyclic) {
  rest.forEach(n => { (waves[level(n) - 1] ||= []).push(n.id) })
  depth = waves.length
  width = Math.max(0, ...waves.map(w => w.length))
  let cur = rest.filter(n => !parentsOf(n).length).sort((a, b) => tail(b) - tail(a))[0]
  while (cur) { critical.push(cur.id); cur = childrenOf(cur).sort((a, b) => tail(b) - tail(a))[0] }
  if (C) critical.unshift(C.id)
  startOrder = [...rest].sort((a, b) => tail(b) - tail(a) || b.acs.length - a.acs.length || a.id.localeCompare(b.id)).map(n => n.id)
}

// ---------- acceptance criteria ----------

const universe = new Set(list(G.acs))
const carriers = new Map()
for (const n of nodes) for (const ac of n.acs) {
  if (!universe.has(ac)) fail('ac', `${n.id}: carries ${ac}, which is not in the graph's acs`)
  carriers.set(ac, [...(carriers.get(ac) ?? []), n.id])
}
for (const ac of universe) {
  const c = carriers.get(ac) ?? []
  if (!c.length) fail('orphan-ac', `${ac}: no node carries it`)
  else if (c.length > 1) fail('ac', `${ac}: carried by ${c.join(' and ')}; one carrier only`)
}
for (const n of rest) {
  if (!n.acs.length) fail('ac', `${n.id}: an ${n.kind} with no AC builds what nothing asks for`)
  else if (n.acs.length > AC_CAP) fail('cap', `${n.id}: ${n.acs.length} ACs, over the cap of ${AC_CAP}; split it into two whole behaviours`)
  else if (n.acs.length > AC_WARN) warn('cap', `${n.id}: ${n.acs.length} ACs, over ${AC_WARN}; check it fits ~45 min of builder`)
}
if (C?.acs.length) fail('ac', `${C.id}: the contract commit carries no AC`)

if (opts.storiesPath) {
  let text
  try { text = readFileSync(opts.storiesPath, 'utf8') } catch (e) { console.error(`cannot read ${opts.storiesPath}: ${e.message}`); process.exit(2) }
  const told = new Set([...text.matchAll(/^\s*- \*\*`([^`\s]+)`\*\*/gm)].map(m => m[1]))
  for (const ac of told) if (!universe.has(ac)) fail('stories', `${ac}: in stories.md, missing from the graph's acs`)
  for (const ac of universe) if (!told.has(ac)) fail('stories', `${ac}: in the graph's acs, not in stories.md`)
}

// ---------- ownership ----------

const ancestorsOf = memo(n => { const s = new Set(); parentsOf(n).forEach(p => { s.add(p.id); ancestorsOf(p).forEach(x => s.add(x)) }); return s })
const before = (producer, user) => isC(producer) || (acyclic && ancestorsOf(user).has(producer.id))

const owners = nodes.flatMap(n => n.owns.map(path => ({ node: n, path })))
for (let i = 0; i < owners.length; i++) for (let j = i + 1; j < owners.length; j++) {
  const a = owners[i], b = owners[j]
  if (a.node !== b.node && overlap(a.path, b.path)) fail('owner', `two owners: ${a.node.id} owns \`${a.path}\` and ${b.node.id} owns \`${b.path}\``)
}
const shared = list(G.shared)
for (const n of rest) for (const [what, paths] of [['owns', n.owns], ['extends', n.extends]]) for (const p of paths) for (const s of shared) {
  if (overlap(p, s)) fail('shared', `${n.id} ${what} \`${p}\`, a shared file (\`${s}\`): only the contract commit writes it`)
}
for (const s of shared) if (!C?.owns.some(p => overlap(p, s))) fail('shared', `shared \`${s}\` is not owned by the contract commit`)

const extenders = new Map()
for (const n of nodes) for (const p of n.extends) {
  const own = owners.find(o => overlap(o.path, p))
  if (own?.node === n) fail('extends', `${n.id} both owns and extends \`${p}\``)
  else if (own && !before(own.node, n)) fail('extends', `${n.id} extends \`${p}\`, which ${own.node.id} creates in parallel: the file does not exist when ${n.id} starts`)
  extenders.set(norm(p), [...(extenders.get(norm(p)) ?? []), n.id])
}
for (const [p, ids] of extenders) if (ids.length > 1) warn('hot', `\`${p}\` is extended by ${ids.join(', ')}: keep each addition additive and apart, or split the file`)

for (const f of list(G.fronts)) for (const p of list(f.files)) for (const n of rest) for (const o of n.owns) {
  if (overlap(o, p)) warn('front', `${n.id} owns \`${o}\`, which the front ${f.front ?? '?'} changes (\`${p}\`): additive only, or wait for its merge; the agreement goes in plan.md`)
}
for (const n of rest) if (n.kind === 'integration' && childrenOf(n).length) warn('integration', `${n.id} is an integration entry with children: it merges last`)

// ---------- names that cross a boundary ----------

const providers = new Map()
nodes.forEach(n => n.provides.forEach(name => providers.set(name, [...(providers.get(name) ?? []), n])))
for (const [name, ps] of providers) if (ps.length > 1) fail('provides', `\`${name}\` is provided by ${ps.map(p => p.id).join(' and ')}; one producer only`)
for (const n of nodes) for (const name of n.uses) {
  const ps = providers.get(name)
  if (!ps) fail('uses', `${n.id} uses \`${name}\`, which nothing provides`)
  else if (!ps.some(p => p !== n && before(p, n))) fail('uses', `${n.id} uses \`${name}\`, provided by ${ps.map(p => p.id).join(', ')} with no path to ${n.id}: put it in the contract commit, or the edge is missing`)
}

// ---------- briefs ----------

function section(md, title) {
  const out = []
  let on = false
  for (const l of md.split('\n')) {
    if (/^## /.test(l)) { on = l.slice(3).trim().toLowerCase() === title.toLowerCase(); continue }
    if (on) out.push(l)
  }
  return out.join('\n')
}

// A table row's first cell (its backticked items) or a bullet's first `code`.
const firstColumn = (text) => text.split('\n').map(l => l.trim()).flatMap(l => {
  if (l.startsWith('|')) {
    const cell = l.split('|')[1]?.trim() ?? ''
    if (!cell || /^:?-+:?$/.test(cell)) return []
    const ticks = [...cell.matchAll(/`([^`]+)`/g)].map(m => m[1])
    return ticks.length ? ticks : [cell]
  }
  const m = /^[-*] /.test(l) && l.match(/`([^`]+)`/)
  return m ? [m[1]] : []
})

function sameItems(id, what, graphList, briefList) {
  const g = new Set(graphList), b = new Set(briefList)
  const missing = [...g].filter(x => !b.has(x)), extra = [...b].filter(x => !g.has(x))
  if (missing.length) fail('brief', `${id}.md §${what}: missing ${missing.map(x => `\`${x}\``).join(', ')}`)
  if (extra.length) fail('brief', `${id}.md §${what}: ${extra.map(x => `\`${x}\``).join(', ')} not in the graph`)
}

const reviewBriefs = []
function checkBrief(n) {
  const file = join(opts.briefsDir, `${n.id}.md`)
  if (!existsSync(file)) { fail('brief', `${n.id}: no brief at ${file}`); return }
  const md = readFileSync(file, 'utf8')
  const header = (x) => /^(name|path|ac|route)$/i.test(x)
  sameItems(n.id, 'Owns', n.owns, firstColumn(section(md, 'Owns')))
  sameItems(n.id, 'Extends', n.extends, firstColumn(section(md, 'Extends')))
  if (isC(n)) sameItems(n.id, 'Provides', n.provides, firstColumn(section(md, 'Provides')).filter(x => !header(x)))
  else {
    sameItems(n.id, 'Uses', n.uses, firstColumn(section(md, 'Uses')).filter(x => !header(x)))
    sameItems(n.id, 'Acceptance', n.acs, firstColumn(section(md, 'Acceptance')).filter(x => universe.has(x)))
  }
  const contract = firstColumn(section(md, 'Contract')).filter(x => !header(x)).length > 0
  if (SIDES.every(s => n.sides.includes(s)) && !contract) fail('contract', `${n.id}.md: back and front sides and no Contract section; both builders build against it`)
  reviewBriefs.push({ id: n.id, path: resolve(file), keys: isC(n) ? ['provides', 'proof'] : [...n.acs, ...(contract ? ['contract'] : [])] })
}
if (opts.briefsDir) nodes.forEach(checkBrief)

// ---------- no HTML comment in an output ----------

const planDir = dirname(opts.graphPath)
const mdIn = (d) => (d && existsSync(d) ? readdirSync(d).filter(f => f.endsWith('.md')).map(f => join(d, f)) : [])
for (const file of [...mdIn(planDir), ...mdIn(opts.briefsDir)]) {
  let fence = false
  const at = readFileSync(file, 'utf8').split('\n').findIndex(l => {
    if (/^\s*(```|~~~)/.test(l)) { fence = !fence; return false }
    return !fence && l.replace(/`[^`]*`/g, '').includes('<!--')
  })
  if (at >= 0) fail('comment', `${file}:${at + 1}: an HTML comment; a template's comments are instructions, never output`)
}

// ---------- output ----------

function mermaid() {
  const mid = (id) => id.replace(/[^A-Za-z0-9]/g, '_')
  const out = ['flowchart LR']
  nodes.forEach(n => out.push(`  ${mid(n.id)}["${n.id} · ${String(n.name).replace(/"/g, "'")} · ${n.acs.length} AC"]`))
  rest.forEach(n => {
    if (!parentsOf(n).length && C) out.push(`  ${mid(C.id)} --> ${mid(n.id)}`)
    n.after.filter(e => byId.has(e.id)).forEach(e => out.push(`  ${mid(e.id)} -- ${e.class} --> ${mid(n.id)}`))
  })
  out.push('  classDef crit stroke-width:3px')
  if (critical.length) out.push(`  class ${critical.map(mid).join(',')} crit`)
  return out.join('\n')
}

const summary = {
  graph: opts.graphPath, ok: fails.length === 0,
  nodes: nodes.length, waves, width, depth, criticalPath: critical,
  parallelism: critical.length ? Math.round((nodes.length / critical.length) * 100) / 100 : 0,
  startOrder,
  acs: { total: universe.size, carried: [...carriers.keys()].filter(a => universe.has(a)).length },
  ...(opts.briefsDir ? { reviewBriefs } : {}),
  fails, warns,
}
if (opts.jsonOut) writeFileSync(opts.jsonOut, JSON.stringify(summary, null, 2) + '\n')
if (opts.mermaidOut && acyclic) writeFileSync(opts.mermaidOut, mermaid() + '\n')

if (!opts.quiet) {
  const p = (s) => console.log(s)
  p(`plan-graph · ${opts.graphPath}`)
  if (acyclic) {
    p(`  contract   ${C?.id ?? '—'}`)
    waves.forEach((w, i) => p(`  wave ${i + 1}     ${w.join(' · ')}`))
    p(`  width ${width} · depth ${depth} · ACs ${summary.acs.carried}/${summary.acs.total}`)
    p(`  critical   ${critical.join(' → ')}  (parallelism ×${summary.parallelism})`)
    p(`  start      ${startOrder.join(', ')}`)
  }
  warns.forEach(x => p(`  WARN ${x.code.padEnd(11)} ${x.msg}`))
  fails.forEach(x => p(`  FAIL ${x.code.padEnd(11)} ${x.msg}`))
  p(fails.length ? `✕ ${fails.length} failure(s), ${warns.length} warning(s)` : `✓ graph holds · ${warns.length} warning(s)`)
}
process.exit(fails.length ? 1 : 0)
