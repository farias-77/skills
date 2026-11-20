export const meta = {
  name: 'discovery-review',
  description: 'Stage-1 review of the stories: hole hunters and, per story, two blind readers in different seats, in parallel; each hunter claim checked by a verifier and each story\'s two readings compared against what was decided, before the conductor sees anything; delta mode checks only the diff of each fix',
  whenToUse: 'Stage 1 (discovery), stop 6, after discovery.mjs check passes and split has cut the stories; again with mode "delta" after the fixes',
  phases: [
    { title: 'Find', detail: 'discovery-hole-hunter per hunt; per story, two story-readers (builder, tester)' },
    { title: 'Verify', detail: 'discovery-finding-verifier per hunter claim; discovery-reading-comparer per story' },
  ],
}

const AGENTS = {
  'discovery-story-reader': { model: 'haiku', effort: 'high' },
  'discovery-hole-hunter': { model: 'sonnet', effort: 'medium' },
  'discovery-finding-verifier': { model: 'sonnet', effort: 'medium' },
  'discovery-reading-comparer': { model: 'sonnet', effort: 'medium' },
}
const HUNTS = { small: ['whole'], feature: ['errors', 'access', 'limits', 'code'] }
const MIN_QUOTE = 12

const text = { type: 'string' }
const HUNT = {
  type: 'object', additionalProperties: false,
  required: ['verified', 'findings'],
  properties: {
    verified: { type: 'array', items: { type: 'string', description: 'one story: what this hunt checked in it, and where' } },
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['severity', 'title', 'story', 'anchor', 'quote', 'where', 'gap', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['blocks', 'note'] },
          title: text, story: text,
          anchor: { type: 'string', description: 'the one criterion id or rule id the finding is about; the story id when it is about no single one' },
          quote: { type: 'string', description: 'the line it rests on, verbatim; "nothing" when the hole is an absence' },
          where: { type: 'string', description: 'file:line' },
          gap: text, fix: text,
        },
      },
    },
  },
}
const READING = {
  type: 'object', additionalProperties: false,
  required: ['story', 'seat', 'readings', 'questions'],
  properties: {
    story: text, seat: text,
    readings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['criterion', 'reading', 'passes', 'fails', 'guesses'],
        properties: {
          criterion: text, reading: text,
          passes: { type: 'string', description: 'one concrete case with values that meets the criterion' },
          fails: { type: 'string', description: 'the nearest concrete case with values that does not' },
          guesses: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['about', 'picked'], properties: { about: text, picked: text } } },
        },
      },
    },
    questions: { type: 'array', items: text },
  },
}
const VERDICT = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'kind', 'severity', 'evidence', 'where', 'conservative', 'touches', 'fix'],
  properties: {
    verdict: { type: 'string', enum: ['confirmed', 'refuted'] },
    kind: { type: 'string', enum: ['writing', 'gap', 'mechanism', 'none'] },
    severity: { type: 'string', enum: ['blocks', 'note'] },
    evidence: { type: 'string', description: 'the quote that settles it, verbatim' },
    where: text,
    conservative: { type: 'string', description: 'for a gap: the conservative answer, or ""' },
    touches: { type: 'string', description: 'personal data, money, or a legal or stated constraint; otherwise ""' },
    fix: text,
  },
}
const kinds = ['writing', 'gap', 'mechanism']
const COMPARISON = {
  type: 'object', additionalProperties: false,
  required: ['agreed', 'findings'],
  properties: {
    agreed: { type: 'array', items: text },
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['criteria', 'title', 'kind', 'severity', 'differs', 'evidence', 'where', 'conservative', 'touches', 'fix'],
        properties: {
          criteria: { type: 'array', items: text },
          title: text,
          kind: { type: 'string', enum: kinds },
          severity: { type: 'string', enum: ['blocks', 'note'] },
          differs: { type: 'string', description: 'what the builder would build and what the tester would accept, or the guess' },
          evidence: { type: 'string', description: 'the quote that settles it or shows the silence, verbatim' },
          where: text,
          conservative: { type: 'string', description: 'for a gap: the conservative answer, or ""' },
          touches: { type: 'string', description: 'personal data, money, or a legal or stated constraint; otherwise ""' },
          fix: text,
        },
      },
    },
  },
}
const FIX_VERDICT = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'evidence', 'where', 'what'],
  properties: {
    verdict: { type: 'string', enum: ['landed', 'not-landed', 'new-hole'] },
    evidence: text, where: text, what: text,
  },
}

const dropped = []
const drop = (source, why) => { dropped.push({ source, why }); return null }
const filled = (value, min = 1) => String(value ?? '').trim().length >= min
const clean = (id) => String(id ?? '').replace(/[`*\s]/g, '')

const W = args?.workstream
const size = args?.size === 'small' ? 'small' : 'feature'
const repo = [].concat(args?.code ?? []).join(' · ') || 'none given'
const files = `The stories: ${W}/stories.md
Not building: ${W}/not-building.md
What he decided (the oracle): ${W}/notes.md
The recon: ${W}/discovery/recon/
The code: ${repo}
The rules for stories: ${args?.rules}${args?.mock ? `\nThe locked mock: ${W}/mock/mock.html` : ''}`

function call(name, prompt, opts) {
  if (args?.inlineAgents !== true) return agent(prompt, { ...opts, agentType: name })
  const { model, effort } = AGENTS[name]
  return agent(`Your instructions are ${args.agentsDir}/${name}.md: read it first and follow it.\n\n${prompt}`, { ...opts, model, effort })
}

async function once(dispatch, isValid, name) {
  const first = await dispatch()
  if (isValid(first)) return first
  log(`${name}: invalid return, dispatching once more`)
  const second = await dispatch()
  return isValid(second) ? second : null
}

function readIndex(index) {
  if (!index || !Array.isArray(index.stories) || !index.stories.length) return { problems: ['args.index has no stories (pass the JSON discovery.mjs split printed)'], stories: [] }
  const problems = []
  for (const s of index.stories) {
    if (!/^S-\d+$/.test(s.id ?? '')) problems.push(`story id "${s.id}"`)
    if (!filled(s.file)) problems.push(`${s.id}: no file`)
  }
  return { problems, stories: index.stories.map((s) => ({ id: s.id, file: s.file, criteria: s.criteria ?? [] })) }
}

// ---------- Find ----------

function hunterClaim(hunt, f, n) {
  const source = `hunter/${hunt}`
  if (!filled(f.quote, MIN_QUOTE) && clean(f.quote).toLowerCase() !== 'nothing') return drop(source, `"${f.title}": no quote`)
  if (!filled(f.gap)) return drop(source, `"${f.title}": no gap`)
  return { id: `${hunt}#${n}`, source, story: f.story, anchor: clean(f.anchor) || f.story || 'stories', title: f.title, quote: f.quote.trim(), where: f.where, gap: f.gap, fix: f.fix, proposed: f.severity,
    claim: `A hole hunter (hunt: ${hunt}) claims, about ${f.story || 'the stories'}:\nTitle: ${f.title}\nQuote: ${f.quote}\nWhere: ${f.where}\nGap: ${f.gap}\nProposed fix: ${f.fix}` }
}

async function hunt(name) {
  const report = await once(
    () => call('discovery-hole-hunter', `Hunt: ${name}.\n${files}`, { label: `hunt·${name}`, phase: 'Find', schema: HUNT }),
    (r) => r && (r.findings.length > 0 || r.verified.length > 0),
    `discovery-hole-hunter ${name}`,
  )
  if (!report) return { source: `hunter/${name}`, valid: false, verified: [], claims: [] }
  return { source: `hunter/${name}`, valid: true, verified: report.verified, claims: report.findings.map((f, i) => hunterClaim(name, f, i + 1)).filter(Boolean) }
}

const SEATS = ['builder', 'tester']

async function readBlind(s) {
  const covers = (r) => r && Array.isArray(r.readings) && s.criteria.every((c) => r.readings.some((x) => clean(x.criterion) === c))
  const read = (seat) => once(
    () => call('discovery-story-reader', `Seat: ${seat}.\nStory ${s.id}.\nThe story (read this file, and only this file): ${s.file}\nThe criterion ids: ${s.criteria.join(', ')}`, { label: `${seat}·${s.id}`, phase: 'Find', schema: READING }),
    covers,
    `discovery-story-reader ${s.id} ${seat}`,
  )
  const reports = await parallel(SEATS.map((seat) => () => read(seat)))
  const source = `readers/${s.id}`
  if (!reports[0] || !reports[1]) {
    log(`${s.id}: a seat did not cover every criterion twice; the story is unread`)
    return { source, valid: false, verified: [], claims: [] }
  }
  return { source, valid: true, story: s, reports, verified: [`${s.id}: ${s.criteria.length} criteria read blind from two seats`], claims: [] }
}

// ---------- Verify ----------

async function verify(c) {
  const verdict = await once(
    () => call('discovery-finding-verifier', `Mode: claim.\n${c.claim}\n\n${files}`, { label: `verify·${c.id}`, phase: 'Verify', schema: VERDICT }),
    (v) => v && filled(v.evidence),
    `verifier ${c.id}`,
  )
  const { claim, ...finding } = c
  return verdict ? { ...finding, ...verdict } : { ...finding, verdict: 'unverified' }
}

async function verifySource(run) {
  const verdicts = await parallel(run.claims.map((c) => () => verify(c)))
  return { ...run, verdicts: verdicts.map((v, i) => v ?? { ...run.claims[i], claim: undefined, verdict: 'unverified' }) }
}

// One comparison per story: a verifier per criterion cost forty agents a round and confirmed the same gap many times.
async function compareReadings(run) {
  if (!run.valid) return { ...run, verdicts: [] }
  const s = run.story
  const [builder, tester] = run.reports
  const coversAll = (r) => r && Array.isArray(r.findings) && s.criteria.every((c) => r.agreed.map(clean).includes(c) || r.findings.some((f) => f.criteria.map(clean).includes(c)))
  const report = await once(
    () => call('discovery-reading-comparer', `Story ${s.id}.\nThe story file: ${s.file}\nThe criterion ids: ${s.criteria.join(', ')}\n\nThe builder's report:\n${JSON.stringify(builder, null, 1)}\n\nThe tester's report:\n${JSON.stringify(tester, null, 1)}\n\n${files}`, { label: `compare·${s.id}`, phase: 'Verify', schema: COMPARISON }),
    coversAll,
    `discovery-reading-comparer ${s.id}`,
  )
  const { story, reports, ...rest } = run
  if (!report) {
    log(`${s.id}: the two readings were not compared; the story is unread`)
    return { ...rest, valid: false, verdicts: [] }
  }
  const verdicts = report.findings.filter((f) => filled(f.evidence)).map((f, i) => {
    const criteria = f.criteria.map(clean).filter(Boolean)
    return { id: `readers/${s.id}#${i + 1}`, source: rest.source, story: s.id, anchor: criteria[0] ?? s.id, criteria, title: f.title, gap: f.differs, quote: criteria.join(', ') || 'nothing',
      verdict: 'confirmed', kind: f.kind, severity: f.severity, evidence: f.evidence, where: f.where, conservative: f.conservative, touches: f.touches, fix: f.fix }
  })
  return { ...rest, claims: verdicts, verdicts }
}

// ---------- Delta ----------

async function checkFix(f) {
  const verdict = await once(
    () => call('discovery-finding-verifier', `Mode: fix.\nThe finding:\n${typeof f.finding === 'string' ? f.finding : JSON.stringify(f.finding, null, 1)}\n\nThe diff of the lines changed for it:\n${f.diff}\n\n${files}`, { label: `fix·${f.id}`, phase: 'Verify', schema: FIX_VERDICT }),
    (v) => v && filled(v.verdict),
    `fix ${f.id}`,
  )
  return { id: f.id, ...(verdict ?? { verdict: 'unverified', evidence: '', where: '', what: 'the verifier returned nothing twice' }) }
}

async function delta() {
  const fixes = Array.isArray(args?.fixes) ? args.fixes.filter((f) => filled(f.id) && filled(f.diff)) : []
  if (!fixes.length) { log('delta: args.fixes has no fix with an id and a diff'); return { valid: false, mode: 'delta', fixes: [] } }
  log(`delta: ${fixes.length} fix(es), each checked on its diff only`)
  const results = await parallel(fixes.map((f) => () => checkFix(f)))
  const checked = results.map((r, i) => r ?? { id: fixes[i].id, verdict: 'unverified', evidence: '', where: '', what: 'the verifier died' })
  const open = checked.filter((r) => r.verdict !== 'landed')
  log(`delta: ${checked.length - open.length} landed · ${open.length} to look at`)
  return { valid: true, mode: 'delta', fixes: checked }
}

// ---------- The round ----------

// Four hunts and the readers do not see each other, so one hole comes back several times: the conductor rules per place.
function groupByAnchor(findings) {
  const groups = new Map()
  for (const f of findings) {
    const g = groups.get(f.anchor) ?? { anchor: f.anchor, ids: [], blocks: 0, notes: 0 }
    g.ids.push(f.id)
    g[f.severity === 'blocks' ? 'blocks' : 'notes']++
    groups.set(f.anchor, g)
  }
  return [...groups.values()].sort((a, b) => b.blocks - a.blocks || b.ids.length - a.ids.length)
}

async function round() {
  const { problems, stories } = readIndex(args?.index)
  if (problems.length) {
    log(`index invalid: ${problems.slice(0, 5).join('; ')}`)
    return { valid: false, mode: 'round', found: 0, confirmed: [], groups: [], forDesign: [], refuted: [], unverified: [], unread: [], sources: [], dropped: problems.map((why) => ({ source: 'index', why })) }
  }
  if (!W || !args?.rules) log('workstream or rules missing in args: the agents cannot reach the material')

  const hunts = HUNTS[size]
  const readers = size === 'feature' ? stories.filter((s) => s.criteria.length) : []
  log(`round 1 (${size}): ${hunts.length} hunt(s), each claim verified · ${readers.length} stories × 2 blind readers, compared per story`)

  const finders = [...hunts.map((h) => ({ kind: 'hunt', name: h })), ...readers.map((s) => ({ kind: 'read', story: s }))]
  const runs = await pipeline(finders, (f) => (f.kind === 'hunt' ? hunt(f.name) : readBlind(f.story)), (run, f) => (f.kind === 'hunt' ? verifySource(run) : compareReadings(run)))
  const done = runs.map((r, i) => r ?? { source: finders[i].kind === 'hunt' ? `hunter/${finders[i].name}` : `readers/${finders[i].story.id}`, valid: false, verified: [], claims: [], verdicts: [] })

  // A mechanism (a status code, a lock, a retry) is the design's to answer: it never blocks the stories.
  const verdicts = done.flatMap((r) => r.verdicts ?? []).map((v) => (v.kind === 'mechanism' ? { ...v, severity: 'note' } : v))
  const holds = verdicts.filter((v) => v.verdict === 'confirmed')
  const confirmed = holds.filter((v) => v.kind !== 'mechanism')
  const forDesign = holds.filter((v) => v.kind === 'mechanism')
  const refuted = verdicts.filter((v) => v.verdict === 'refuted').map((v) => ({ id: v.id, title: v.title, evidence: v.evidence, where: v.where, touches: v.touches }))
  const unverified = verdicts.filter((v) => v.verdict === 'unverified')
  const invalidHunts = done.filter((r) => r.source.startsWith('hunter/') && !r.valid).map((r) => r.source)
  const unread = done.filter((r) => r.source.startsWith('readers/') && !r.valid).map((r) => r.source.split('/')[1])
  const valid = invalidHunts.length === 0 && !(readers.length > 0 && unread.length === readers.length)

  if (dropped.length) log(`${dropped.length} finding(s) dropped by the filter (no quote or no gap)`)
  log(`round 1: ${verdicts.length} claim(s) · ${confirmed.length} confirmed in ${groupByAnchor(confirmed).length} place(s) · ${forDesign.length} for the design · ${refuted.length} refuted${unverified.length ? ` · ${unverified.length} unverified` : ''}${unread.length ? ` · unread: ${unread.join(', ')}` : ''}${valid ? '' : ` · INVALID: ${[...invalidHunts, ...(unread.length === readers.length && readers.length ? ['every story unread'] : [])].join(', ')}`}`)

  return {
    valid, mode: 'round', size,
    found: verdicts.length,
    confirmed, groups: groupByAnchor(confirmed), forDesign, refuted, unverified, unread,
    sources: done.map((r) => ({ source: r.source, valid: r.valid, verified: r.verified, claims: r.claims.length })),
    dropped,
  }
}

return args?.mode === 'delta' ? await delta() : await round()
