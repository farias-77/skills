/*
 * discovery-review.js — the stage-1 review as deterministic code.
 *
 * What it reviews: the documents derived from the LOCKED mock (stories.md
 * with its acceptance criteria, pr-faq.md, journeys/*.yaml). The mock is
 * the oracle; the mechanical proof (proto.mjs walk at the lock, proto.mjs
 * trace after the derivation) already ran. The review covers what cannot
 * be run:
 *
 *   - disc-reviewer-acceptance (Sonnet 5.5, medium): is each AC judgeable
 *     alone, and does the set cover everything the mock does?
 *   - disc-reviewer-boundary (Sonnet 5.5, medium): is every capability, and
 *     every control the mock shows, In or Out?
 *   - one disc-blind-reader (Sonnet 5.5, low) per story: walks the mock with
 *     that story only and marks each AC pass, fail or cannot-judge. A
 *     `fail` means the derivation and the locked mock disagree; a
 *     `cannot-judge` means the AC does not stand alone. Both become
 *     findings here, mechanically.
 *
 * Two rounds, no more. Round 1 is whole. Round 2 is the delta: only the
 * stories whose text changed get a blind walk, and the lenses read the
 * changed stories plus the round-1 findings they must confirm closed
 * (`verify`). The conductor decides what changed; the script runs it.
 *
 * THERE IS NO JUDGE HERE. The conductor (Opus 5.5, medium; high when it rules) rules every
 * finding by the stage's references/judging.md.
 *
 * The briefs carry INPUTS only; every instruction lives in the agent
 * definitions and the reviewer contract (docs/standards/reviewer-contract.md).
 *
 * Invoked by the stage-discovery conductor, by scriptPath, never by name:
 *   Workflow({ scriptPath: '<...>/workflows/discovery-review.js', args: {
 *     discoveryDir: 'absolute path to <slug>/00-discovery',
 *     mock:         'absolute path to 00-discovery/prototype/versions/v<N>.html',
 *     proto:        'absolute path to claude/skills/stage-discovery/scripts/proto.mjs',
 *     round:        1,                 // 1 or 2
 *     mode:         'whole',           // 'whole' (round 1) or 'delta' (round 2)
 *     language:     'pt-BR',           // the documents' language
 *     vocabulary:   '<the vocabulary block of stories.md, verbatim>',
 *     stories: [ { id: 'S-001', text: '## S-001 — ...' } ],   // delta: only the changed ones
 *     verify:  [ { id: 'disc-reviewer-acceptance#3', title, fix } ],   // delta: round-1 sustained, to confirm closed
 *     lenses:  ['disc-reviewer-acceptance', 'disc-reviewer-boundary'], // optional; delta may run fewer
 *   }})
 *
 * Returns { round, mode, valid, findings, lenses, walks, unread }:
 * findings carry id, lens, story (for blind walks), ac, severity, title,
 * says, gap, fix; walks is the blind readers' per-AC verdicts; unread
 * lists the stories whose reading did not survive; valid is false when
 * every story was unread or a lens came back invalid twice.
 */

export const meta = {
  name: 'discovery-review',
  description: 'Stage-1 review of the documents derived from the locked mock: acceptance and boundary lenses, and one blind reader per story walking the mock AC by AC; round 1 whole, round 2 the delta; returns every finding for the conductor to judge',
  phases: [
    { title: 'Lenses', detail: 'acceptance, boundary' },
    { title: 'Blind walks', detail: 'per story: one reader walks the locked mock with that story only' },
  ],
}

const ALL_LENSES = ['disc-reviewer-acceptance', 'disc-reviewer-boundary']
const READER = 'disc-blind-reader'

const FINDING = {
  type: 'object', additionalProperties: false,
  required: ['severity', 'title', 'says', 'gap', 'fix'],
  properties: {
    severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
    title: { type: 'string' },
    says: { type: 'string', description: 'what the material says, verbatim, or "nothing"' },
    gap: { type: 'string', description: 'the concrete problem, through this lens' },
    fix: { type: 'string', description: 'the concrete change that would resolve it' },
  },
}

const REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'verified', 'quote', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'pass with fixes', 'fail'] },
    verified: { type: 'array', items: { type: 'string', description: 'one point this reviewer actually checked, with where it looked' } },
    quote: { type: 'string', description: 'a verbatim line from the material it judged: the proof it read' },
    findings: { type: 'array', items: FINDING },
  },
}

const WALK = {
  type: 'object', additionalProperties: false,
  required: ['story', 'checks'],
  properties: {
    story: { type: 'string' },
    checks: {
      type: 'array', minItems: 1,
      items: {
        type: 'object', additionalProperties: false,
        required: ['ac', 'verdict', 'how', 'saw'],
        properties: {
          ac: { type: 'string', description: 'the AC id: J1.s2.1 or frame:<token>.1' },
          verdict: { type: 'string', enum: ['pass', 'fail', 'cannot-judge'] },
          how: { type: 'string', description: 'the exact proto.mjs look command(s) run' },
          saw: { type: 'string', description: 'what the mock showed, or what could not be found; at most sixty words, in the documents\' language' },
        },
      },
    },
  },
}

const round = args?.round ?? 1
const mode = args?.mode === 'delta' ? 'delta' : 'whole'
const language = args?.language ?? 'the language of the documents'
const stories = Array.isArray(args?.stories) ? args.stories.filter(s => s && s.id && s.text) : []
const vocabulary = args?.vocabulary ?? ''
const verify = Array.isArray(args?.verify) ? args.verify : []
const lensNames = Array.isArray(args?.lenses) && args.lenses.length ? args.lenses.filter(l => ALL_LENSES.includes(l)) : ALL_LENSES
if (!args?.mock || !args?.proto) log('mock or proto missing in args: the blind walks and the lenses cannot drive the mock')
if (!stories.length) log('no stories passed in args: the blind walks are skipped this round')
if (mode === 'delta' && !verify.length) log('delta round with no findings to verify: the lenses read only the changed stories')

const D = args.discoveryDir
const docInputs = `Round ${round} · ${mode}.
The documents: ${D}/stories.md · ${D}/pr-faq.md · ${D}/journeys/ · ${D}/notes.md (its Rules and Out blocks)
The locked mock: ${args.mock}
The tool: node ${args.proto}
The round audit so far: ${D}/reviews.md${mode === 'delta' ? `
Changed stories (read only these, plus the findings below): ${stories.map(s => s.id).join(', ') || 'none'}
Round-1 findings to confirm closed, each with its fix:
${verify.map(f => `- ${f.id}: ${f.title}${f.fix ? ' — fix: ' + f.fix : ''}`).join('\n') || '- none'}` : ''}`

// ---------- mechanical checks on a blind walk ----------

// The keys a story defines: every AC id in it (J1.s2.1, frame:<token>.1).
const acIds = (text) => {
  const ids = new Set()
  for (const m of text.matchAll(/\b(J\d+\.s\d+\.\d+)\b/g)) ids.add(m[1])
  for (const m of text.matchAll(/\b(frame:[A-Za-z0-9_.-]+\.\d+)\b/g)) ids.add(m[1])
  return ids
}
// The AC's own text, for the finding's `says`: from its id to the next list item.
const acText = (text, id) => {
  const i = text.indexOf(id)
  if (i < 0) return id
  const rest = text.slice(i)
  const end = rest.search(/\n\s*-\s+\*\*|\n#{2,3}\s/)
  return rest.slice(0, end < 0 ? 600 : Math.min(end, 600)).replace(/[`*]/g, '').trim()
}
const walkProblems = (walk, expected) => {
  if (!walk) return ['no output']
  const got = new Set(walk.checks.map(c => c.ac.replace(/[`*\s]/g, '')))
  const problems = []
  for (const k of expected) if (!got.has(k)) problems.push(`missing AC ${k}`)
  for (const c of walk.checks) if (c.verdict !== 'pass' && !c.saw.trim()) problems.push(`empty "saw" at ${c.ac}`)
  return problems
}

// ---------- dispatch helpers ----------

// Re-dispatch once on the two invalid shapes: a dead agent, or a lazy
// clean pass (zero findings AND no verified enumeration proves nothing).
const reviewed = async (dispatch, name) => {
  let r = await dispatch()
  if (!r || (r.findings.length === 0 && r.verified.length === 0)) {
    log(`${name}: ${r ? 'clean pass without verification' : 'no output'}, re-dispatching`)
    r = await dispatch()
  }
  const lazy = r && r.findings.length === 0 && r.verified.length === 0
  return r && !lazy ? { ...r, invalid: false }
    : { verdict: 'fail', verified: [], quote: '', findings: [], invalid: true }
}

const storyInputs = (s) => `Round ${round}. Story ${s.id}. Language of the documents: ${language}.
The locked mock: ${args.mock}
The tool: node ${args.proto}

VOCABULARY:
${vocabulary}

STORY:
${s.text}`

const walkBlind = async (s) => {
  const expected = acIds(s.text)
  if (!expected.size) { log(`${s.id}: no AC ids found in the story text`); return { story: s.id, unread: true } }
  const dispatch = () => agent(storyInputs(s), {
    label: `${s.id}·walk·r${round}`, phase: 'Blind walks', agentType: READER, schema: WALK,
  })
  let r = await dispatch()
  let problems = walkProblems(r, expected)
  if (problems.length) {
    log(`${s.id} reader: ${problems.join(', ')}, re-dispatching`)
    r = await dispatch()
    problems = walkProblems(r, expected)
  }
  if (problems.length) { log(`${s.id} reader: still invalid (${problems.join(', ')}), dropped`); return { story: s.id, unread: true } }
  const checks = r.checks.map(c => ({ ...c, ac: c.ac.replace(/[`*\s]/g, '') })).filter(c => expected.has(c.ac))
  const findings = checks.filter(c => c.verdict !== 'pass').map(c => c.verdict === 'fail'
    ? { severity: 'blocker', title: `${c.ac}: the locked mock does otherwise`, says: acText(s.text, c.ac), gap: `walked blind: ${c.saw} (ran: ${c.how})`, fix: 'write the AC to what the locked mock does; if the mock is what is wrong, that is an amendment for the user', ac: c.ac }
    : { severity: 'fix', title: `${c.ac}: a stranger cannot judge it from the story`, says: acText(s.text, c.ac), gap: `walked blind: ${c.saw} (ran: ${c.how})`, fix: 'name the GIVEN state, the one event, and where each outcome is observed, with concrete values', ac: c.ac })
  return { story: s.id, checks, findings, unread: false }
}

// ---------- the round: lenses and blind walks, concurrently ----------

phase('Lenses')
log(`round ${round} (${mode}): ${lensNames.length} lens(es) · ${stories.length} blind walk(s)`)

const [lensResults, walkResults] = await parallel([
  () => parallel(lensNames.map(name => () =>
    reviewed(() =>
      agent(docInputs, { label: `${name}·r${round}`, phase: 'Lenses', agentType: name, schema: REVIEW }),
      name).then(r => ({ lens: name, ...r }))
  )),
  () => parallel(stories.map(s => () => walkBlind(s))),
])

const walked = (walkResults ?? []).filter(Boolean)
const unread = walked.filter(w => w.unread).map(w => w.story)
const read = walked.filter(w => !w.unread)
if (unread.length) log(`unread this round (walk did not survive): ${unread.join(', ')}`)

// The blind walks merge into one lens entry, so the audit sees one lens
// with per-story findings.
const blind = {
  lens: READER,
  verdict: read.some(w => w.findings.some(f => f.severity === 'blocker')) ? 'fail'
    : read.some(w => w.findings.length) ? 'pass with fixes' : 'pass',
  verified: read.flatMap(w => w.checks.map(c => `${w.story} ${c.ac}: ${c.verdict}`)),
  quote: read[0]?.checks[0]?.saw ?? '',
  findings: read.flatMap(w => w.findings.map(f => ({ ...f, story: w.story }))),
  invalid: stories.length > 0 && read.length === 0,
}
const lenses = [...(lensResults ?? []).filter(Boolean), ...(stories.length ? [blind] : [])]

const findings = []
for (const r of lenses) r.findings.forEach((f, i) => {
  f.id = `${r.lens}#r${round}.${i + 1}`
  findings.push({ lens: r.lens, ...f })
})

const allUnread = stories.length > 0 && unread.length === stories.length
const invalidLenses = lenses.filter(l => l.invalid).map(l => l.lens)
const valid = !allUnread && invalidLenses.length === 0
log(`round ${round} (${mode}): ${findings.length} finding(s) from ${lenses.length} lens(es)${unread.length ? ` · unread: ${unread.length}/${stories.length}` : ''}${valid ? '' : ` · INVALID ROUND:${allUnread ? ' every story unread' : ''}${invalidLenses.length ? ' lenses ' + invalidLenses.join(', ') : ''}`}`)

return {
  round, mode, valid, findings, lenses,
  walks: read.map(w => ({ story: w.story, checks: w.checks })),
  unread,
}
