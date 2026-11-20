export const meta = {
  name: 'discovery-review',
  description: 'Stage-1 review of the stories: hole hunters and, per story, two blind readers in different seats, in parallel; every claim checked by a verifier before the conductor sees it; delta mode checks only the diff of each fix',
  whenToUse: 'Stage 1 (discovery), stop 6, after discovery.mjs check passes and split has cut the stories; again with mode "delta" after the fixes',
  phases: [
    { title: 'Find', detail: 'discovery-hole-hunter per hunt; per story, two story-readers (builder, tester)' },
    { title: 'Verify', detail: 'discovery-finding-verifier per claim' },
  ],
}

const AGENTS = {
  'discovery-story-reader': { model: 'haiku', effort: 'high' },
  'discovery-hole-hunter': { model: 'sonnet', effort: 'medium' },
  'discovery-finding-verifier': { model: 'sonnet', effort: 'medium' },
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
        required: ['severity', 'title', 'story', 'quote', 'where', 'gap', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['blocks', 'note'] },
          title: text, story: text,
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
  return { id: `${hunt}#${n}`, source, story: f.story, title: f.title, quote: f.quote.trim(), where: f.where, gap: f.gap, fix: f.fix, proposed: f.severity,
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

const seatLines = (seat, r) => r
  ? `The ${seat} read it as: ${r.reading}\n  would accept: ${r.passes}\n  would refuse: ${r.fails}\n  had to guess: ${r.guesses.length ? r.guesses.map((g) => `${g.about} (picked: ${g.picked})`).join('; ') : 'nothing'}`
  : `The ${seat} gave no reading of this criterion.`

function readerClaims(s, reports) {
  const bySeat = SEATS.map((seat, i) => new Map((reports[i]?.readings ?? []).map((r) => [clean(r.criterion), r])))
  const perCriterion = s.criteria.map((c) => {
    const [a, b] = bySeat.map((m) => m.get(c))
    return {
      id: `readers/${s.id}/${c}`, source: `readers/${s.id}`, story: s.id, title: `${c}: two strangers read it`, quote: c, where: `${W}/stories.md`,
      gap: [a, b].flatMap((r) => r?.guesses ?? []).map((g) => `${g.about} → ${g.picked}`).join('; '), fix: '', proposed: 'blocks',
      claim: `Two readers who saw only story ${s.id}, one as builder and one as tester, each read criterion ${c} without seeing the other.\n${seatLines('builder', a)}\n${seatLines('tester', b)}\nThe claim to check: the two readings differ in what gets built or accepted, or one of them differs from what was decided, or a guess one of them needed would change what is built.`,
    }
  })
  const questions = SEATS.flatMap((seat, i) => (reports[i]?.questions ?? []).filter((q) => filled(q, MIN_QUOTE)).map((q, n) => ({
    id: `readers/${s.id}/${seat}-q${n + 1}`, source: `readers/${s.id}`, story: s.id, title: `${s.id}: the ${seat} would have to ask`, quote: 'nothing', where: `${W}/stories.md`, gap: q, fix: '', proposed: 'blocks',
    claim: `A reader who saw only story ${s.id}, as ${seat}, could not go on without this answer: ${q}\nThe claim to check: the stories do not answer it, and a wrong guess would change what is built.`,
  })))
  return [...perCriterion, ...questions]
}

async function readBlind(s) {
  const covers = (r) => r && Array.isArray(r.readings) && s.criteria.every((c) => r.readings.some((x) => clean(x.criterion) === c))
  const read = (seat) => once(
    () => call('discovery-story-reader', `Seat: ${seat}.\nStory ${s.id}.\nThe story (read this file, and only this file): ${s.file}\nThe criterion ids: ${s.criteria.join(', ')}`, { label: `${seat}·${s.id}`, phase: 'Find', schema: READING }),
    covers,
    `discovery-story-reader ${s.id} ${seat}`,
  )
  const reports = await parallel(SEATS.map((seat) => () => read(seat)))
  if (!reports[0] || !reports[1]) {
    log(`${s.id}: a seat did not cover every criterion twice; the story is unread`)
    return { source: `readers/${s.id}`, valid: false, verified: [], claims: [] }
  }
  return { source: `readers/${s.id}`, valid: true, verified: [`${s.id}: ${s.criteria.length} criteria read blind from two seats`], claims: readerClaims(s, reports) }
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

async function round() {
  const { problems, stories } = readIndex(args?.index)
  if (problems.length) {
    log(`index invalid: ${problems.slice(0, 5).join('; ')}`)
    return { valid: false, mode: 'round', found: 0, confirmed: [], refuted: [], unverified: [], sources: [], dropped: problems.map((why) => ({ source: 'index', why })) }
  }
  if (!W || !args?.rules) log('workstream or rules missing in args: the agents cannot reach the material')

  const hunts = HUNTS[size]
  const readers = size === 'feature' ? stories.filter((s) => s.criteria.length) : []
  log(`round 1 (${size}): ${hunts.length} hunt(s) · ${readers.length} stories × 2 blind readers · every claim verified`)

  const finders = [...hunts.map((h) => ({ kind: 'hunt', name: h })), ...readers.map((s) => ({ kind: 'read', story: s }))]
  const runs = await pipeline(finders, (f) => (f.kind === 'hunt' ? hunt(f.name) : readBlind(f.story)), verifySource)
  const done = runs.map((r, i) => r ?? { source: finders[i].kind === 'hunt' ? `hunter/${finders[i].name}` : `readers/${finders[i].story.id}`, valid: false, verified: [], claims: [], verdicts: [] })

  const verdicts = done.flatMap((r) => r.verdicts ?? [])
  const confirmed = verdicts.filter((v) => v.verdict === 'confirmed')
  const refuted = verdicts.filter((v) => v.verdict === 'refuted').map((v) => ({ id: v.id, title: v.title, evidence: v.evidence, where: v.where, touches: v.touches }))
  const unverified = verdicts.filter((v) => v.verdict === 'unverified')
  const invalidHunts = done.filter((r) => r.source.startsWith('hunter/') && !r.valid).map((r) => r.source)
  const unread = done.filter((r) => r.source.startsWith('readers/') && !r.valid).map((r) => r.source.split('/')[1])
  const valid = invalidHunts.length === 0 && !(readers.length > 0 && unread.length === readers.length)

  if (dropped.length) log(`${dropped.length} finding(s) dropped by the filter (no quote or no gap)`)
  log(`round 1: ${verdicts.length} claim(s) · ${confirmed.length} confirmed · ${refuted.length} refuted${unverified.length ? ` · ${unverified.length} unverified` : ''}${unread.length ? ` · unread: ${unread.join(', ')}` : ''}${valid ? '' : ` · INVALID: ${[...invalidHunts, ...(unread.length === readers.length && readers.length ? ['every story unread'] : [])].join(', ')}`}`)

  return {
    valid, mode: 'round', size,
    found: verdicts.length,
    confirmed, refuted, unverified, unread,
    sources: done.map((r) => ({ source: r.source, valid: r.valid, verified: r.verified, claims: r.claims.length })),
    dropped,
  }
}

return args?.mode === 'delta' ? await delta() : await round()
