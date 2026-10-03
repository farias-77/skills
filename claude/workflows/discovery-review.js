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
 *     storiesDir:   'absolute path to 00-discovery/reviews/r<N>/stories',   // written by `proto.mjs split`
 *     only:    ['S-002'],              // delta: the stories whose text changed (default: all)
 *     verify:  [ { id: 'disc-reviewer-acceptance#3', title, fix } ],   // delta: round-1 sustained, to confirm closed
 *     lenses:  ['disc-reviewer-acceptance', 'disc-reviewer-boundary'], // optional; delta may run fewer
 *   }})
 *
 * The stories never travel inline. Before the round the conductor runs
 *   node proto.mjs split 00-discovery/stories.md 00-discovery/reviews/r<N>/stories
 * which writes one S-NNN.md per story block, vocabulary.md and index.json (each
 * story's file, the AC ids it defines, and its [build] ACs). A script cannot
 * read files, so the first phase sends a scout (Sonnet 5.5, low) to quote
 * index.json; the AC ids it returns are checked against their own shape, and
 * the blind readers read their story file and the vocabulary file themselves.
 * An AC marked [build] is proved by the build, not by the mock: no blind
 * reader judges it. (The v9-draft args `stories: [{id, text}]` and
 * `vocabulary` still run, for a conductor that has the text at hand.)
 *
 * Where the return lives: the Workflow result (and the task's output file)
 * is an envelope { summary, logs, result, … }; what this script returns is
 * its `.result`. Save `.result` as reviews/round-N.json.
 *
 * Returns { round, mode, valid, findings, lenses, walks, unread, skippedBuild }:
 * findings carry id, lens, story (for blind walks), ac, severity, title,
 * says, gap, fix; walks is the blind readers' per-AC verdicts; unread
 * lists the stories whose reading did not survive; valid is false when
 * every story was unread or a lens came back invalid twice.
 */

export const meta = {
  name: 'discovery-review',
  description: 'Stage-1 review of the documents derived from the locked mock: acceptance and boundary lenses, and one blind reader per story walking the mock AC by AC; round 1 whole, round 2 the delta; returns every finding for the conductor to judge',
  phases: [
    { title: 'Index', detail: 'a scout quotes the split stories index (storiesDir)' },
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

const INDEX = {
  type: 'object', additionalProperties: false,
  required: ['vocabulary', 'stories'],
  properties: {
    vocabulary: { type: ['string', 'null'], description: 'index.json "vocabulary", verbatim' },
    stories: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'file', 'acs', 'build'],
        properties: {
          id: { type: 'string' }, file: { type: 'string' },
          acs: { type: 'array', items: { type: 'string' } },
          build: { type: 'array', items: { type: 'string' } },
        },
      },
    },
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
const verify = Array.isArray(args?.verify) ? args.verify : []
const lensNames = Array.isArray(args?.lenses) && args.lenses.length ? args.lenses.filter(l => ALL_LENSES.includes(l)) : ALL_LENSES
const only = Array.isArray(args?.only) && args.only.length ? new Set(args.only) : null
if (!args?.mock || !args?.proto) log('mock or proto missing in args: the blind walks and the lenses cannot drive the mock')
if (mode === 'delta' && !verify.length) log('delta round with no findings to verify: the lenses read only the changed stories')

// ---------- the stories: from storiesDir (proto.mjs split), or inline ----------

const AC_ID = /^(J\d+\.s\d+\.\d+|frame:[A-Za-z0-9_.-]+\.\d+)$/
const SD = typeof args?.storiesDir === 'string' ? args.storiesDir.replace(/\/+$/, '') : null
let stories = []          // { id, file?, text?, acs: Set, build: [] }
let vocabulary = args?.vocabulary ?? ''
let vocabularyFile = null
let indexBroken = false
if (SD) {
  phase('Index')
  const indexProblems = (x) => {
    if (!x || !Array.isArray(x.stories) || !x.stories.length) return ['no stories in index.json']
    const p = []
    for (const s of x.stories) {
      if (!/^S-\d+$/.test(s.id)) p.push(`story id "${s.id}"`)
      if (!s.file.startsWith(SD + '/') || !s.file.endsWith('.md')) p.push(`${s.id}: file ${s.file} is not under ${SD}`)
      for (const a of [...s.acs, ...s.build]) if (!AC_ID.test(a)) p.push(`${s.id}: "${a}" is not an AC id`)
    }
    return p
  }
  const quote = () => agent(`Quote one file, whole and literally, as structured output: ${SD}/index.json (written by proto.mjs split). Copy every story's id, file, acs and build exactly as the file has them, in the file's order, and its "vocabulary" value. Read nothing else.`,
    { label: `index·r${round}`, phase: 'Index', agentType: 'scout', schema: INDEX })
  let ix = await quote()
  let bad = indexProblems(ix)
  if (bad.length) { log(`index.json quote invalid (${bad.slice(0, 3).join('; ')}), asking again`); ix = await quote(); bad = indexProblems(ix) }
  if (bad.length) { log(`index.json still unreadable (${bad.slice(0, 3).join('; ')}): no blind walks this round`); indexBroken = true }
  else {
    vocabularyFile = ix.vocabulary
    stories = ix.stories.map(s => ({ id: s.id, file: s.file, acs: new Set(s.acs), build: s.build }))
  }
} else if (Array.isArray(args?.stories)) {
  stories = args.stories.filter(s => s && s.id && s.text).map(s => ({ id: s.id, text: s.text, ...acIdsInline(s.text) }))
}
if (only) stories = stories.filter(s => only.has(s.id))
if (!stories.length && !indexBroken) log('no stories to walk: the blind walks are skipped this round')
const skippedBuild = stories.flatMap(s => s.build.map(ac => `${s.id} ${ac}`))
if (skippedBuild.length) log(`${skippedBuild.length} AC(s) marked [build]: proved by the build, not walked blind`)

const D = args.discoveryDir
const docInputs = `Round ${round} · ${mode}.
The documents: ${D}/stories.md · ${D}/pr-faq.md · ${D}/journeys/ · ${D}/notes.md (its Rules and Out blocks)
The locked mock: ${args.mock}
The tool: node ${args.proto}
The round audit so far: ${D}/reviews.md
An AC marked [build] after its rule ids is proved by the build, not by the mock.${mode === 'delta' ? `
Changed stories (read only these, plus the findings below): ${stories.map(s => s.id).join(', ') || 'none'}
Round-1 findings to confirm closed, each with its fix:
${verify.map(f => `- ${f.id}: ${f.title}${f.fix ? ' — fix: ' + f.fix : ''}`).join('\n') || '- none'}` : ''}`

// ---------- mechanical checks on a blind walk ----------

// Inline stories only: the keys a story defines are the AC ids that open a list item
// (- **`J1.s2.1`** [RULE] …), never an id it merely mentions; [build] ones go apart.
function acIdsInline(text) {
  const acs = new Set(), build = []
  for (const m of text.matchAll(/^\s*-\s+\*\*`?(J\d+\.s\d+\.\d+|frame:[A-Za-z0-9_.-]+\.\d+)`?\*\*\s*\[([^\]]*)\](\s*\[build\])?/gm)) {
    if (m[3] || m[2].split(',').map(x => x.trim()).includes('build')) build.push(m[1]); else acs.add(m[1])
  }
  return { acs, build }
}
// The AC's own text, for the finding's `says`: from its id to the next list item
// (from storiesDir the text is not here: the id and the story file stand for it).
const acText = (s, id) => {
  if (!s.text) return `${id} (${s.file})`
  const text = s.text
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

const storyInputs = (s) => s.file ? `Round ${round}. Story ${s.id}. Language of the documents: ${language}.
The locked mock: ${args.mock}
The tool: node ${args.proto}
The story (read this file): ${s.file}
The vocabulary (read this file): ${vocabularyFile || 'none'}
The AC ids to judge, one entry each: ${[...s.acs].join(', ')}
${s.build.length ? `Marked [build], not yours (no entry): ${s.build.join(', ')}` : ''}` : `Round ${round}. Story ${s.id}. Language of the documents: ${language}.
The locked mock: ${args.mock}
The tool: node ${args.proto}
The AC ids to judge, one entry each: ${[...s.acs].join(', ')}
${s.build.length ? `Marked [build], not yours (no entry): ${s.build.join(', ')}` : ''}

VOCABULARY:
${vocabulary}

STORY:
${s.text}`

const walkBlind = async (s) => {
  const expected = s.acs
  if (!expected.size && s.build.length) { log(`${s.id}: every AC is [build]; nothing to walk`); return { story: s.id, checks: [], findings: [], unread: false } }
  if (!expected.size) { log(`${s.id}: no AC ids found in the story`); return { story: s.id, unread: true } }
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
    ? { severity: 'blocker', title: `${c.ac}: the locked mock does otherwise`, says: acText(s, c.ac), gap: `walked blind: ${c.saw} (ran: ${c.how})`, fix: 'write the AC to what the locked mock does; if the mock is what is wrong, that is an amendment for the user', ac: c.ac }
    : { severity: 'fix', title: `${c.ac}: a stranger cannot judge it from the story`, says: acText(s, c.ac), gap: `walked blind: ${c.saw} (ran: ${c.how})`, fix: 'name the GIVEN state, the one event, and where each outcome is observed, with concrete values', ac: c.ac })
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
  invalid: indexBroken || (stories.length > 0 && read.length === 0),
}
const lenses = [...(lensResults ?? []).filter(Boolean), ...(stories.length || indexBroken ? [blind] : [])]

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
  unread, skippedBuild,
}
