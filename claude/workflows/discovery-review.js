/*
 * discovery-review.js — the stage-1 review round as deterministic code.
 *
 * Why a workflow: the guarantee that no lens is skipped must be
 * physical, not discipline. Every round is whole: the document lenses
 * (walkthrough, acceptance, boundary, and wireframe when wireframes
 * exist) and, per story, two blind readers and a referee, all in
 * parallel. There are no delta rounds — the round is cheap (Sonnet and
 * Haiku only) and running it whole after every fix is what catches the
 * loose wire a scoped re-read misses.
 *
 * THE BLIND READS are per story: two Haiku readers build one story
 * each, alone, one build per key (the story's AC ids, its bad-path
 * rows, the story sentence), in the documents' language. A Sonnet
 * referee compares the two readings key by key; only a
 * `different-product` verdict becomes a finding. The keys make the
 * comparison mechanical: a reading that misses a key is invalid and
 * re-dispatched once; a story whose two readings do not both survive
 * is reported as unread, never silently skipped. A round in which
 * EVERY story is unread is invalid as a whole: the conductor fixes the
 * cause and runs it again before judging anything.
 *
 * THERE IS NO JUDGE HERE. The workflow returns the findings with the
 * referees' verdicts; the conductor (Opus 5, high) rules every one of
 * them by the stage's references/judging.md — it has the interview and
 * the user's words, which no agent has.
 *
 * The briefs below carry INPUTS only. Every instruction lives in the
 * agent definitions under agents/ and in the shared reviewer contract
 * (docs/standards/reviewer-contract.md).
 *
 * Invoked by the stage-discovery conductor:
 *   Workflow({ scriptPath: '<...>/workflows/discovery-review.js', args: {
 *                 // by scriptPath, never by name
 *     discoveryDir:  'absolute path to <slug>/00-discovery',
 *     round:         1,          // 1-based; shown in labels and ids
 *     language:      'pt-BR',    // the documents' language; the readers build in it
 *     wireframesDir: 'absolute path to <slug>/00-discovery/wireframes', // optional
 *     vocabulary:    '<the stories file's vocabulary block, verbatim>',
 *     stories: [                 // one entry per story block, verbatim —
 *       { id: 'S-001', text: '## S-001 — ...\n...' },   // scripts cannot
 *     ],                         // read files: the conductor splits the
 *                                // file at every "## S-" heading
 *   }})
 *
 * Returns { round, valid, findings, lenses, unread } — findings is
 * every finding with its id, lens, story (for referee findings),
 * severity, title, says, gap, fix; lenses is [{ lens, verdict,
 * verified, quote, findings, invalid }] with the referees merged as one
 * `disc-reviewer-ambiguity` entry; unread lists the story ids whose
 * readings did not survive; valid is false when every story was
 * unread (or a lens came back invalid twice). The conductor judges,
 * writes reviews.md, sends the author fixes, asks the user by
 * decision, and runs the round again (ceiling: three rounds, the user
 * asked after each).
 */

export const meta = {
  name: 'discovery-review',
  description: 'Stage-1 review round, always whole: the document lenses (walkthrough, acceptance, boundary, wireframe when present) in parallel with two Haiku blind readers and a Sonnet referee per story; returns every finding for the conductor to judge',
  phases: [
    { title: 'Lenses', detail: 'walkthrough, acceptance, boundary — and wireframe when wireframes exist' },
    { title: 'Blind reads', detail: 'per story: two Haiku readers build it alone, a Sonnet referee compares them key by key' },
  ],
}

const DOC_LENSES = ['disc-reviewer-walkthrough', 'disc-reviewer-acceptance', 'disc-reviewer-boundary']
const WIREFRAME_LENS = 'disc-reviewer-wireframe'
const REFEREE = 'disc-reviewer-ambiguity'
const READER = 'disc-blind-reader'

const FINDING = {
  type: 'object', additionalProperties: false,
  required: ['severity', 'title', 'says', 'gap', 'fix'],
  properties: {
    severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
    title: { type: 'string' },
    says: { type: 'string', description: 'what the material says, verbatim or "nothing"' },
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
    quote: { type: 'string', description: 'verbatim sentence from the material it judged — the proof it read' },
    findings: { type: 'array', items: FINDING },
  },
}

const READING = {
  type: 'object', additionalProperties: false,
  required: ['story', 'builds'],
  properties: {
    story: { type: 'string' },
    builds: {
      type: 'array', minItems: 1,
      items: {
        type: 'object', additionalProperties: false,
        required: ['key', 'sentence', 'build'],
        properties: {
          key: { type: 'string', description: 'an AC id, bad-path:<category>, or story' },
          sentence: { type: 'string', description: 'the sentence, verbatim' },
          build: { type: 'string', description: 'what this reader would build — exact values, anchors, actor, persistence, visibility; at most sixty words, in the documents\' language' },
        },
      },
    },
  },
}

const REFEREE_REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['story', 'keys', 'verdict', 'verified', 'quote', 'findings'],
  properties: {
    story: { type: 'string' },
    keys: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['key', 'verdict'],
        properties: {
          key: { type: 'string' },
          verdict: { type: 'string', enum: ['same', 'same-in-other-words', 'different-product'] },
        },
      },
    },
    verdict: REVIEW.properties.verdict,
    verified: REVIEW.properties.verified,
    quote: REVIEW.properties.quote,
    findings: REVIEW.properties.findings,
  },
}

const round = args?.round ?? 1
const language = args?.language ?? 'the language of the documents'
const stories = Array.isArray(args?.stories) ? args.stories.filter(s => s && s.id && s.text) : []
const vocabulary = args?.vocabulary ?? ''
const wireframesDir = args?.wireframesDir ?? null
if (!stories.length) log('no stories passed in args — the blind reads are skipped this round; pass stories: [{id, text}] to run them')

const docInputs = `Round ${round}.
The documents: ${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md
${wireframesDir ? `The wireframes: ${wireframesDir} (README.md maps screen → stories → states)\n` : ''}The round audit so far: ${args.discoveryDir}/reviews.md`

// ---------- mechanical checks on a reading ----------

// The keys a story defines: every AC id, one per bad-path row, and the
// story sentence. AC ids look like <SLUG>-S-001-AC-1; bad-path rows are
// the table lines under "### Bad paths" whose first cell names the
// category.
const expectedKeys = (text) => {
  const keys = new Set(['story'])
  for (const m of text.matchAll(/`?([A-Za-z0-9]+-S-\d{3}-AC-\d+)`?/g)) keys.add(m[1])
  const bad = text.split(/###\s*Bad paths/i)[1]?.split(/\n###/)[0] ?? ''
  for (const line of bad.split('\n')) {
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 3 || /^-+$/.test(cells[0]) || /^category$/i.test(cells[0])) continue
    const cat = cells[0].toLowerCase()
    if (/boundary/.test(cat)) keys.add('bad-path:boundary')
    else if (/repeat|concurren/.test(cat)) keys.add('bad-path:repeat')
    else if (/dependen/.test(cat)) keys.add('bad-path:dependency')
    else if (/permission/.test(cat)) keys.add('bad-path:permission')
  }
  return keys
}

// Hedge words that make a build not one thing. A plain "or" is not a
// hedge: it appears in legitimate enumerations ("approved or rejected").
// The list is the reviewer contract's; every review workflow copies it
// literally. Portuguese equivalents included because readers build in
// the documents' language.
const HEDGE = /\b(either|depends|could be|probably|maybe|possibly|talvez|provavelmente|possivelmente|depende|poderia ser)\b/i
const normalizeKey = (k) => {
  const s = String(k).trim().replace(/^`|`$/g, '')
  const bp = s.match(/^bad-path:\s*(.+)$/i)
  if (!bp) return s
  const cat = bp[1].toLowerCase()
  if (/boundary/.test(cat)) return 'bad-path:boundary'
  if (/repeat|concurren/.test(cat)) return 'bad-path:repeat'
  if (/dependen/.test(cat)) return 'bad-path:dependency'
  if (/permission/.test(cat)) return 'bad-path:permission'
  return s
}

const readingProblems = (reading, expected) => {
  if (!reading) return ['no output']
  const problems = []
  const got = new Map(reading.builds.map(b => [normalizeKey(b.key), b]))
  for (const k of expected) if (!got.has(k)) problems.push(`missing key ${k}`)
  for (const [k, b] of got) {
    if (!b.build || !b.build.trim()) problems.push(`empty build at ${k}`)
    else if (HEDGE.test(b.build)) problems.push(`hedged build at ${k}`)
  }
  return problems
}

// ---------- dispatch helpers ----------

// Re-dispatch once on the two invalid shapes: a dead agent, or a lazy
// clean pass (zero findings AND no verified enumeration proves nothing).
const reviewed = async (dispatch, name) => {
  let r = await dispatch()
  if (!r || (r.findings.length === 0 && r.verified.length === 0)) {
    log(`${name}: ${r ? 'clean pass without verification' : 'no output'} — re-dispatching`)
    r = await dispatch()
  }
  const lazy = r && r.findings.length === 0 && r.verified.length === 0
  return r && !lazy ? { ...r, invalid: false }
    : { verdict: 'fail', verified: [], quote: '', findings: [], invalid: true }
}

const storyInputs = (s) => `Round ${round}. Story ${s.id}. Language of the documents: ${language} — write every build in it.

VOCABULARY:
${vocabulary}

STORY:
${s.text}`

const readBlind = async (s, n) => {
  const expected = expectedKeys(s.text)
  const dispatch = () => agent(storyInputs(s), {
    label: `${s.id}·read${n}·r${round}`, phase: 'Blind reads',
    agentType: READER, schema: READING,
  })
  let r = await dispatch()
  let problems = readingProblems(r, expected)
  if (problems.length) {
    log(`${s.id} reader ${n}: ${problems.join(', ')} — re-dispatching`)
    r = await dispatch()
    problems = readingProblems(r, expected)
  }
  if (problems.length) { log(`${s.id} reader ${n}: still invalid (${problems.join(', ')}) — dropped`); return null }
  return { reader: n, builds: r.builds.map(b => ({ ...b, key: normalizeKey(b.key) })) }
}

const referee = async (s, readings) => {
  const r = await reviewed(() => agent(`${storyInputs(s)}

READING 1:
${JSON.stringify(readings[0].builds, null, 2)}

READING 2:
${JSON.stringify(readings[1].builds, null, 2)}`, {
    label: `${s.id}·referee·r${round}`, phase: 'Blind reads',
    agentType: REFEREE, schema: REFEREE_REVIEW,
  }), `${s.id} referee`)
  return { story: s.id, ...r }
}

// ---------- the round: lenses and per-story reads, concurrently ----------

const lensNames = wireframesDir ? [...DOC_LENSES, WIREFRAME_LENS] : DOC_LENSES

phase('Lenses')
log(`round ${round}: ${lensNames.length} lenses · ${stories.length} stories × (2 readers + referee)`)

const [lensResults, storyResults] = await parallel([
  () => parallel(lensNames.map(name => () =>
    reviewed(() =>
      agent(docInputs, { label: `${name}·r${round}`, phase: 'Lenses', agentType: name, schema: REVIEW }),
      name).then(r => ({ lens: name, ...r }))
  )),
  () => pipeline(
    stories,
    (s) => parallel([() => readBlind(s, 1), () => readBlind(s, 2)]).then(rs => rs.filter(Boolean)),
    (readings, s) => readings.length === 2
      ? referee(s, readings)
      : Promise.resolve({ story: s.id, unread: true }),
  ),
])

// The referees merge into one ambiguity lens entry: the conductor and
// the audit see one lens with per-story findings.
const refereed = (storyResults ?? []).filter(Boolean)
const unread = refereed.filter(r => r.unread).map(r => r.story)
const perStory = refereed.filter(r => !r.unread)
if (unread.length) log(`unread this round (readings did not survive): ${unread.join(', ')}`)

const ambiguity = {
  lens: REFEREE,
  verdict: perStory.some(r => r.verdict === 'fail') ? 'fail'
    : perStory.some(r => r.verdict === 'pass with fixes') ? 'pass with fixes' : 'pass',
  verified: perStory.flatMap(r => r.verified.map(v => `${r.story}: ${v}`)),
  quote: perStory[0]?.quote ?? '',
  findings: perStory.flatMap(r => r.findings.map(f => ({ ...f, story: r.story }))),
  invalid: perStory.some(r => r.invalid) || (stories.length > 0 && perStory.length === 0),
  keys: perStory.map(r => ({ story: r.story, keys: r.keys })),
}
const lenses = [...(lensResults ?? []).filter(Boolean), ...(stories.length ? [ambiguity] : [])]

const findings = []
for (const r of lenses) r.findings.forEach((f, i) => {
  f.id = `${r.lens}#${i + 1}`
  findings.push({ lens: r.lens, ...f })
})

// A round is invalid when every story was unread or a document lens
// came back invalid after its re-dispatch: the conductor fixes the
// cause and runs the round again; nothing here is judged.
const allUnread = stories.length > 0 && unread.length === stories.length
const invalidLenses = lenses.filter(l => l.invalid).map(l => l.lens)
const valid = !allUnread && invalidLenses.length === 0
log(`round ${round}: ${findings.length} finding(s) from ${lenses.length} lens(es)${unread.length ? ` · unread: ${unread.length}/${stories.length}` : ''}${valid ? '' : ` · INVALID ROUND: ${allUnread ? 'every story unread' : ''}${invalidLenses.length ? ' lenses ' + invalidLenses.join(', ') : ''}`}`)

return { round, valid, findings, lenses, unread }
