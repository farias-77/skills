#!/usr/bin/env node
/*
 * plan-graph.mjs — the mechanical check of a stage-3 build graph.
 *
 *   node plan-graph.mjs <02-plan/plan.graph.json> [--briefs <02-plan/briefs>]
 *                       [--json <out.json>] [--mermaid <out.mmd>] [--quiet]
 *
 * Reads the machine-readable graph the conductor writes at P2
 * (templates/plan.graph.json) and answers, with no judgement:
 *
 *   FAIL  a cycle · an edge to nothing · an edge whose need is not real
 *         behaviour (class other than `ui` or `side-effect`) · depth after
 *         the foundation over the target · an acceptance criterion no node
 *         carries (orphan), carried twice, or unknown · a file with two
 *         owners · a shared (frozen) file owned or extended outside the
 *         foundation · a shared file with no foundation owner · an extended
 *         file whose owner builds it in parallel · a used name nothing
 *         provides, or provided by a node with no path to the user · a size
 *         over the cap · a node name over 8 words (the blueprint's cap) ·
 *         a slice or integration node that carries no AC · an HTML comment
 *         in a plan file (plan.md, preflight.md, reviews.md, a brief) ·
 *         with --briefs, a brief whose Owns, Extends, Uses, Provides or
 *         Acceptance disagree with the graph, or whose Uses table names a
 *         producer other than the graph's.
 *   WARN  a file extended by two or more nodes (a hot file: make it cold,
 *         or declare it in `appendSafe` with why the additions never meet) ·
 *         a slice over the AC guide (target.maxAcs, or 8 scaled by the
 *         discovery's grain: ACs per journey step or frame state) ·
 *         a lane that is not a leaf · an integration node that is not last.
 *
 *   REPORT the waves (levels after the foundation), the width (widest wave),
 *         the depth, the critical path with its weight, the total weight,
 *         the parallelism (total / critical), and the start order (bottom
 *         level, descending: what stage 4 starts first).
 *
 * Exit 0 when nothing fails, 1 when something fails, 2 on a bad call.
 * No dependencies; Node 18+.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

// ---------- arguments ----------

const argv = process.argv.slice(2)
const opt = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null }
const graphPath = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && argv[i - 1] !== '--quiet'))
if (!graphPath) { console.error('usage: plan-graph.mjs <plan.graph.json> [--briefs <dir>] [--json <out>] [--mermaid <out>] [--quiet]'); process.exit(2) }
const briefsDir = opt('--briefs'), jsonOut = opt('--json'), mermaidOut = opt('--mermaid'), quiet = argv.includes('--quiet')

let G
try { G = JSON.parse(readFileSync(graphPath, 'utf8')) } catch (e) { console.error(`cannot read ${graphPath}: ${e.message}`); process.exit(2) }

const fails = [], warns = []
const fail = (code, msg) => fails.push({ code, msg })
const warn = (code, msg) => warns.push({ code, msg })

const target = { depth: 2, sizeCap: 'L', ...(G.target || {}) }
const weights = { S: 1, M: 2, L: 3, ...(G.weights || {}) }
const SIZES = Object.keys(weights)
const capRank = SIZES.indexOf(target.sizeCap)
const universe = new Set(G.acs || [])
// The pack's 8 ACs per slice assume one AC per journey step. A discovery
// that writes several per step, or one per frame state, scales the guide
// by its grain: ACs ÷ distinct stems (the id without its trailing .<n>).
const stems = new Set([...universe].map(a => String(a).replace(/\.\d+$/, '')))
const grain = stems.size ? universe.size / stems.size : 1
if (target.maxAcs == null) target.maxAcs = Math.ceil(8 * grain)
const appendSafe = G.appendSafe || {}
const shared = G.shared || []
const nodes = Array.isArray(G.nodes) ? G.nodes : []
const KINDS = ['foundation', 'lane', 'slice', 'integration']
const EDGE_CLASSES = ['ui', 'side-effect']
const list = (x) => Array.isArray(x) ? x : []

// ---------- shape ----------

const byId = new Map()
for (const n of nodes) {
  if (!n.id) { fail('shape', 'a node has no id'); continue }
  if (byId.has(n.id)) fail('shape', `${n.id}: duplicate id`)
  byId.set(n.id, n)
  if (!KINDS.includes(n.kind)) fail('shape', `${n.id}: kind "${n.kind}" is not one of ${KINDS.join(', ')}`)
  n.after = list(n.after).map(e => typeof e === 'string' ? { id: e } : e)
  for (const k of ['acs', 'owns', 'extends', 'provides', 'uses']) n[k] = list(n[k])
  const words = String(n.name || '').trim().split(/\s+/).filter(Boolean).length
  if (!words) fail('shape', `${n.id}: no name`)
  else if (words > 8) fail('shape', `${n.id}: name "${n.name}" has ${words} words; the blueprint caps entries[].name at 8 — one short name, the same in plan.md, the brief and the blueprint`)
}
const isF = (n) => n && n.kind === 'foundation'
const foundation = nodes.filter(isF)
const rest = nodes.filter(n => !isF(n))
if (!foundation.length) fail('shape', 'no foundation node (kind "foundation")')

// ---------- edges ----------

for (const n of nodes) for (const e of n.after) {
  const to = byId.get(e.id)
  if (!to) { fail('edge', `${n.id}: after names ${e.id}, which is not a node`); continue }
  if (isF(n)) {
    if (!isF(to)) fail('edge', `${n.id}: a foundation node waits for ${e.id}, which is not foundation`)
    continue
  }
  if (isF(to)) { fail('edge', `${n.id}: after names the foundation ${e.id}; the foundation precedes every node and is never listed`); continue }
  if (!EDGE_CLASSES.includes(e.class)) {
    const why = { data: 'a factory seeds data', interface: 'an interface plus a fake and its contract suite stand in', shared: 'a shared file belongs to the foundation' }[e.class]
    fail('edge', `${n.id} → ${e.id}: class "${e.class ?? 'none'}" is not real behaviour (${EDGE_CLASSES.join(' | ')})${why ? `: ${why}, so no edge` : ''}`)
  }
  if (!e.need || !String(e.need).trim()) fail('edge', `${n.id} → ${e.id}: the edge does not name the behaviour it consumes`)
}

// ---------- cycles ----------

const state = new Map(), cycles = []
const visit = (id, stack) => {
  if (state.get(id) === 2) return
  if (state.get(id) === 1) { cycles.push([...stack.slice(stack.indexOf(id)), id].join(' → ')); return }
  state.set(id, 1)
  for (const e of byId.get(id)?.after || []) if (byId.has(e.id)) visit(e.id, [...stack, id])
  state.set(id, 2)
}
nodes.forEach(n => n.id && visit(n.id, []))
cycles.forEach(c => fail('cycle', `cycle: ${c}`))
const acyclic = cycles.length === 0

// ---------- levels, depth, waves ----------

// The foundation is a chain (F, then F-b when split), ordered by its own edges.
const fOrder = []
if (acyclic) {
  const seen = new Set()
  const walk = (n) => { if (seen.has(n.id)) return; seen.add(n.id); n.after.forEach(e => byId.has(e.id) && walk(byId.get(e.id))); fOrder.push(n) }
  foundation.forEach(walk)
}
const level = new Map()
const levelOf = (n) => {
  if (level.has(n.id)) return level.get(n.id)
  const ups = n.after.map(e => byId.get(e.id)).filter(x => x && !isF(x))
  const l = ups.length ? 1 + Math.max(...ups.map(levelOf)) : 1
  level.set(n.id, l); return l
}
const waves = []
let depth = 0
if (acyclic) {
  rest.forEach(n => { const l = levelOf(n); (waves[l - 1] ||= []).push(n.id); depth = Math.max(depth, l) })
  if (depth > target.depth) {
    const deep = rest.filter(n => level.get(n.id) > target.depth).map(n => n.id)
    fail('depth', `depth after the foundation is ${depth}, target ${target.depth}: ${deep.join(', ')} sit past it — fake the edge behind an interface or stack it`)
  }
}
const width = Math.max(0, ...waves.map(w => w.length))

// ---------- critical path ----------

const w = (n) => weights[n.size] ?? 0
const succ = new Map(nodes.map(n => [n.id, []]))
rest.forEach(n => n.after.forEach(e => byId.has(e.id) && succ.get(e.id)?.push(n.id)))
const bottom = new Map()
const bottomOf = (id) => {
  if (bottom.has(id)) return bottom.get(id)
  const n = byId.get(id), s = succ.get(id) || []
  const b = w(n) + (s.length ? Math.max(...s.map(bottomOf)) : 0)
  bottom.set(id, b); return b
}
let critical = [], criticalWeight = 0
if (acyclic && nodes.length) {
  const fWeight = fOrder.reduce((a, n) => a + w(n), 0)
  const roots = rest.filter(n => !n.after.some(e => byId.has(e.id) && !isF(byId.get(e.id))))
  let cur = roots.sort((a, b) => bottomOf(b.id) - bottomOf(a.id))[0]
  const tail = []
  while (cur) {
    tail.push(cur.id)
    const s = (succ.get(cur.id) || []).map(id => byId.get(id)).sort((a, b) => bottomOf(b.id) - bottomOf(a.id))
    cur = s[0]
  }
  critical = [...fOrder.map(n => n.id), ...tail]
  criticalWeight = fWeight + (tail.length ? bottomOf(tail[0]) : 0)
}
const totalWeight = nodes.reduce((a, n) => a + w(n), 0)
const startOrder = acyclic ? rest.map(n => n.id).sort((a, b) => bottomOf(b) - bottomOf(a) || a.localeCompare(b)) : []

// ---------- size ----------

for (const n of nodes) {
  const r = SIZES.indexOf(n.size)
  if (r < 0) fail('size', `${n.id}: size "${n.size}" is not one of ${SIZES.join(', ')}`)
  else if (r > capRank) fail('size', `${n.id}: size ${n.size} is over the cap ${target.sizeCap} — split it into thinner vertical slices`)
  if (n.kind === 'slice' && n.acs.length > target.maxAcs) warn('acs', `${n.id}: carries ${n.acs.length} ACs, over the guide ${target.maxAcs}: check its size by screens, server flows and lines, and split it if it is over ${target.sizeCap}`)
  if ((n.kind === 'slice' || n.kind === 'integration') && !n.acs.length) fail('ac', `${n.id}: a ${n.kind} that carries no acceptance criterion builds what nothing forces`)
}

// ---------- acceptance criteria: each carried exactly once ----------

const carriers = new Map()
for (const n of nodes) for (const ac of n.acs) {
  if (!universe.has(ac)) fail('ac', `${n.id}: carries ${ac}, which is not in the graph's acs (the discovery's AC ids)`)
  carriers.set(ac, [...(carriers.get(ac) || []), n.id])
}
for (const ac of universe) {
  const c = carriers.get(ac) || []
  if (!c.length) fail('orphan-ac', `${ac}: no node carries it`)
  else if (c.length > 1) fail('ac', `${ac}: carried by ${c.join(' and ')} — one owner only`)
}

// ---------- ownership ----------

const esc = (s) => s.replace(/[.+^${}()|[\]\\]/g, '\\$&')
const toRe = (p) => new RegExp('^' + esc(p).replace(/\*\*\/?/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]').replace(/\u0000/g, '.*') + '$')
const isGlob = (p) => /[*?]/.test(p)
const staticPrefix = (p) => p.split(/[*?]/)[0]
const staticSuffix = (p) => { const parts = p.split(/[*?]/); return parts[parts.length - 1] }
const norm = (p) => String(p).replace(/^\.\//, '').replace(/\/$/, '/**')
const overlap = (a, b) => {
  a = norm(a); b = norm(b)
  if (a === b) return true
  if (!isGlob(a) && !isGlob(b)) return false
  if (!isGlob(a)) return toRe(b).test(a)
  if (!isGlob(b)) return toRe(a).test(b)
  const pa = staticPrefix(a), pb = staticPrefix(b)
  if (!(pa.startsWith(pb) || pb.startsWith(pa))) return false
  const sa = staticSuffix(a), sb = staticSuffix(b)
  return sa.endsWith(sb) || sb.endsWith(sa)
}

const ancestors = new Map()
const ancestorsOf = (id) => {
  if (ancestors.has(id)) return ancestors.get(id)
  const set = new Set()
  ancestors.set(id, set)
  for (const e of byId.get(id)?.after || []) if (byId.has(e.id)) { set.add(e.id); ancestorsOf(e.id).forEach(x => set.add(x)) }
  return set
}
const before = (producer, user) => isF(producer) || (acyclic && ancestorsOf(user.id).has(producer.id))

const owners = []
nodes.forEach(n => n.owns.forEach(p => owners.push({ node: n, path: p })))
for (let i = 0; i < owners.length; i++) for (let j = i + 1; j < owners.length; j++) {
  const a = owners[i], b = owners[j]
  if (a.node.id !== b.node.id && overlap(a.path, b.path)) fail('owner', `two owners: ${a.node.id} owns \`${a.path}\` and ${b.node.id} owns \`${b.path}\``)
}
for (const n of rest) {
  for (const p of n.owns) for (const s of shared) if (overlap(p, s)) fail('shared', `${n.id} owns \`${p}\`, a shared file (\`${s}\`): shared files belong only to the foundation`)
  for (const p of n.extends) for (const s of shared) if (overlap(p, s)) fail('shared', `${n.id} extends \`${p}\`, a shared file (\`${s}\`): frozen after the foundation — a change there is a foundation amendment`)
}
for (const s of shared) if (!foundation.some(f => f.owns.some(p => overlap(p, s)))) fail('shared', `shared \`${s}\` has no foundation owner`)

const extenders = new Map()
for (const n of nodes) for (const p of n.extends) {
  const own = owners.find(o => overlap(o.path, p))
  if (own && own.node.id !== n.id && !before(own.node, n)) fail('extends', `${n.id} extends \`${p}\`, which ${own.node.id} creates in parallel (no edge): the file does not exist when ${n.id} starts`)
  if (own && own.node.id === n.id) fail('extends', `${n.id} both owns and extends \`${p}\``)
  extenders.set(norm(p), [...(extenders.get(norm(p)) || []), n.id])
}
const declaredSafe = (p) => Object.keys(appendSafe).some(s => overlap(s, p))
for (const [p, ids] of extenders) if (ids.length > 1 && !declaredSafe(p)) warn('hot', `\`${p}\` is extended by ${ids.join(', ')}: a hot file — split it into one file per thing plus a generated aggregate, or keep the additions append-only`)

// ---------- uses → provides ----------

const providers = new Map()
nodes.forEach(n => n.provides.forEach(name => providers.set(name, [...(providers.get(name) || []), n])))
for (const [name, ps] of providers) if (ps.length > 1) fail('provides', `\`${name}\` is provided by ${ps.map(p => p.id).join(' and ')} — one producer only`)
for (const n of nodes) for (const name of n.uses) {
  const ps = providers.get(name)
  if (!ps) { fail('uses', `${n.id} uses \`${name}\`, which nothing provides`); continue }
  if (!ps.some(p => p.id !== n.id && before(p, n))) fail('uses', `${n.id} uses \`${name}\`, provided by ${ps.map(p => p.id).join(', ')} with no path to ${n.id}: put it in the foundation, or the edge is missing`)
}

// ---------- shape warnings ----------

for (const n of rest) {
  const s = succ.get(n.id) || []
  if (n.kind === 'lane' && s.some(id => byId.get(id)?.kind !== 'integration')) warn('lane', `${n.id} is a foundation lane that ${s.join(', ')} wait for: what an entry waits for belongs in the foundation`)
  if (n.kind === 'integration' && s.length) warn('integration', `${n.id} is an integration node with successors (${s.join(', ')}): it should merge last`)
}

// ---------- briefs agree with the graph ----------

const section = (md, title) => {
  const lines = md.split('\n'), out = []
  let on = false
  for (const l of lines) {
    if (/^## /.test(l)) { on = l.replace(/^## /, '').trim().toLowerCase() === title.toLowerCase(); continue }
    if (on) out.push(l)
  }
  return out.join('\n').replace(/<!--[\s\S]*?-->/g, '')
}
// The first column of a table row, or the first `code` of a bullet: the item's key.
const firstColumn = (text) => text.split('\n').map(l => l.trim()).flatMap(l => {
  if (l.startsWith('|')) {
    const cell = l.split('|')[1]?.trim() ?? ''
    if (!cell || /^:?-+:?$/.test(cell)) return []
    const ticks = [...cell.matchAll(/`([^`]+)`/g)].map(m => m[1])
    return ticks.length ? ticks : [cell]
  }
  if (/^[-*] /.test(l)) { const m = l.match(/`([^`]+)`/); return m ? [m[1]] : [] }
  return []
})
// The Uses table's Producer column names the graph's producer: a stale
// owner after a graph change shows here before any lens reads it.
const NODE_ID = /\b(F(?:-b|-x\d+)?|E-(?:\d+|int))\b/
const producers = (n, text) => {
  const rows = text.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'))
  if (!rows.length) return
  const cells = (l) => l.split('|').slice(1, -1).map(c => c.trim())
  const col = cells(rows[0]).findIndex(c => /^(produc|produt)/i.test(c))
  if (col < 0) return
  for (const l of rows.slice(1)) {
    const c = cells(l)
    if (!c[0] || /^:?-+:?$/.test(c[0])) continue
    const said = (c[col] || '').match(NODE_ID)?.[1]
    for (const name of [...c[0].matchAll(/`([^`]+)`/g)].map(m => m[1])) {
      const real = (providers.get(name) || []).find(p => p.id !== n.id && before(p, n))?.id
      if (real && said && said !== real) fail('brief', `${n.id}.md §Uses: \`${name}\` names producer ${said}; the graph's producer is ${real}`)
    }
  }
}
const same = (id, what, graphList, briefList, filter = () => true) => {
  const g = new Set(graphList), b = new Set(briefList.filter(filter))
  const missing = [...g].filter(x => !b.has(x)), extra = [...b].filter(x => !g.has(x))
  if (missing.length) fail('brief', `${id}.md ${what}: missing ${missing.map(x => `\`${x}\``).join(', ')} (in the graph)`)
  if (extra.length) fail('brief', `${id}.md ${what}: ${extra.map(x => `\`${x}\``).join(', ')} not in the graph`)
}
if (briefsDir) for (const n of nodes) {
  const file = join(briefsDir, `${n.id}.md`)
  if (!existsSync(file)) { fail('brief', `${n.id}: no brief at ${file}`); continue }
  const md = readFileSync(file, 'utf8')
  same(n.id, '§Owns', n.owns, firstColumn(section(md, 'Owns')))
  same(n.id, '§Extends', n.extends, firstColumn(section(md, 'Extends')))
  if (isF(n) || n.kind === 'lane') same(n.id, '§Provides', n.provides, firstColumn(section(md, 'Provides')).filter(x => !/^name$/i.test(x)))
  if (!isF(n)) {
    const uses = section(md, 'Uses from the foundation')
    same(n.id, '§Uses', n.uses, firstColumn(uses).filter(x => !/^name/i.test(x)))
    producers(n, uses)
  }
  same(n.id, '§Acceptance', n.acs, firstColumn(section(md, 'Acceptance')), x => universe.has(x))
}

// ---------- no HTML comment in an output ----------

// A template's comments are instructions to its author; none reaches a plan file.
const planDir = dirname(graphPath)
const mdIn = (d) => existsSync(d) ? readdirSync(d).filter(f => f.endsWith('.md')).map(f => join(d, f)) : []
for (const file of [...mdIn(planDir), ...(briefsDir ? mdIn(briefsDir) : [])]) {
  let fence = false
  const at = readFileSync(file, 'utf8').split('\n').findIndex(l => {
    if (/^\s*(```|~~~)/.test(l)) { fence = !fence; return false }
    return !fence && l.replace(/`[^`]*`/g, '').includes('<!--')
  })
  if (at >= 0) fail('comment', `${file}:${at + 1}: an HTML comment — a template's comments are instructions, never output; delete it`)
}

// ---------- mermaid ----------

const mid = (id) => id.replace(/[^A-Za-z0-9]/g, '_')
const mermaid = () => {
  const onPath = new Set(critical)
  const out = ['flowchart LR']
  for (const n of nodes) out.push(`  ${mid(n.id)}["${n.id} · ${String(n.name || '').replace(/"/g, "'")} · ${n.size}"]`)
  const fIds = fOrder.map(n => n.id)
  const lastF = fIds[fIds.length - 1]
  const roots = rest.filter(n => !n.after.some(e => byId.has(e.id) && !isF(byId.get(e.id))))
  const edges = []
  for (let i = 1; i < fIds.length; i++) edges.push([fIds[i - 1], fIds[i], ''])
  if (lastF) roots.forEach(n => edges.push([lastF, n.id, '']))
  rest.forEach(n => n.after.forEach(e => byId.has(e.id) && edges.push([e.id, n.id, [e.class, e.stacked && 'stacked'].filter(Boolean).join(' · ')])))
  edges.forEach(([a, b, l]) => out.push(`  ${mid(a)} ${l ? `-- ${l} -->` : '-->'} ${mid(b)}`))
  out.push('  classDef crit stroke-width:3px')
  if (onPath.size) out.push(`  class ${[...onPath].map(mid).join(',')} crit`)
  return out.join('\n')
}

// ---------- report ----------

const summary = {
  graph: graphPath,
  ok: fails.length === 0,
  nodes: { total: nodes.length, ...Object.fromEntries(KINDS.map(k => [k, nodes.filter(n => n.kind === k).length])) },
  foundation: fOrder.map(n => n.id),
  waves, width, depth, target,
  criticalPath: critical, criticalWeight, totalWeight,
  parallelism: criticalWeight ? Math.round((totalWeight / criticalWeight) * 100) / 100 : 0,
  startOrder,
  acs: { total: universe.size, carried: [...carriers.keys()].filter(a => universe.has(a)).length },
  fails, warns,
}
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(summary, null, 2) + '\n')
if (mermaidOut && acyclic) writeFileSync(mermaidOut, mermaid() + '\n')

if (!quiet) {
  const p = (s = '') => console.log(s)
  p(`plan-graph · ${graphPath}`)
  p(`  nodes      ${nodes.length} (${KINDS.map(k => `${summary.nodes[k]} ${k}`).join(', ')})`)
  if (acyclic) {
    p(`  foundation ${summary.foundation.join(' → ') || '—'}`)
    waves.forEach((wv, i) => p(`  wave ${i + 1}     ${wv.join(' · ')}`))
    p(`  width ${width} · depth ${depth} (target ≤ ${target.depth}) · ACs ${summary.acs.carried}/${summary.acs.total} · AC guide per slice ${target.maxAcs}${G.target?.maxAcs == null ? ` (8 × grain ${Math.round(grain * 100) / 100})` : ''}`)
    p(`  critical   ${critical.join(' → ')}  (weight ${criticalWeight} of ${totalWeight}; parallelism ×${summary.parallelism})`)
    p(`  start      ${startOrder.join(', ')}`)
  }
  warns.forEach(x => p(`  WARN ${x.code.padEnd(9)} ${x.msg}`))
  fails.forEach(x => p(`  FAIL ${x.code.padEnd(9)} ${x.msg}`))
  p(fails.length ? `✕ ${fails.length} failure(s), ${warns.length} warning(s)` : `✓ graph holds · ${warns.length} warning(s)`)
}
process.exit(fails.length ? 1 : 0)
