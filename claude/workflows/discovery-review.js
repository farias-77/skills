/*
 * discovery-review.js — the stage-1 review as deterministic code.
 *
 * What it reviews: the documents derived from the LOCKED mock (stories.md
 * with its acceptance criteria, pr-faq.md, journeys/*.yaml). The mock is
 * the oracle; the mechanical proof (proto.mjs walk at the lock, proto.mjs
 * trace after the derivation) already ran. The review covers what cannot
 * be run:
 *
 *   - disc-reviewer (Sonnet 5.5, medium): can a stranger judge each AC;
 *     is every capability, and every control the mock shows, In or Out;
 *     does every rule and every behavior the mock shows have its one AC?
 *   - one disc-blind-reader (Sonnet 5.5, low) per story: walks the mock with
 *     that story only and reports an AC only when it could not decide pass
 *     or fail (`undecidable`, saying what was missing) or when the mock does
 *     otherwise (`contradicts`, quoting both). Everything judgeable returns
 *     an empty list.
 *
 * One round, whole. There is no delta round: the conductor verifies its own
 * fixes by reading them.
 *
 * THE FILTER. A blind finding passes only with its `kind`, the AC quoted,
 * and, by kind, what was missing or what the mock showed. A finding without
 * them, or on an AC id the reader was not given, is dropped here,
 * mechanically, and listed in `dropped`.
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
 *     language:     'pt-BR',           // the documents' language
 *     storiesDir:   'absolute path to 00-discovery/reviews/stories',   // written by `proto.mjs split`
 *   }})
 *
 * The stories never travel inline. Before the round the conductor runs
 *   node proto.mjs split 00-discovery/stories.md 00-discovery/reviews/stories
 * which writes one S-NNN.md per story block, vocabulary.md and index.json (each
 * story's file, the AC ids it defines, and its [build] ACs). A script cannot
 * read files, so the first phase sends a scout (Sonnet 5.5, low) to quote
 * index.json; the AC ids it returns are checked against their own shape, and
 * the blind readers read their story file and the vocabulary file themselves.
 * An AC marked [build] is proved by the build, not by the mock: no blind
 * reader judges it. (Inline `stories: [{id, text}]` and `vocabulary` still
 * run, for a conductor that has the text at hand.)
 *
 * Where the return lives: the Workflow result (and the task's output file)
 * is an envelope { summary, logs, result, … }; what this script returns is
 * its `.result`. Save `.result` as reviews/round-1.json.
 *
 * Returns { round, valid, findings, lenses, walks, unread, skippedBuild, dropped }:
 * findings carry id, lens, story (for blind walks), ac, kind (blind),
 * severity, title, says, gap, fix; walks lists per story the AC ids judged
 * and the findings kept; unread lists the stories whose reading did not
 * survive; dropped lists the blind findings the filter removed, with why;
 * valid is false when every story was unread or the reviewer came back
 * invalid twice.
 */

export const meta = {
  name: 'discovery-review',
  description: 'Stage-1 review of the documents derived from the locked mock: one reviewer (judgeable ACs, the In/Out fence, one AC per rule and behavior) and one blind reader per story walking the mock; one round; returns every finding for the conductor to judge',
  phases: [
    { title: 'Index', detail: 'a scout quotes the split stories index (storiesDir)' },
    { title: 'Review', detail: 'disc-reviewer' },
    { title: 'Blind walks', detail: 'per story: one reader walks the locked mock with that story only' },
  ],
}

const LENS = 'disc-reviewer'
const READER = 'disc-blind-reader'
const round = 1

const FINDING = {
  type: 'object', additionalProperties: false,
  required: ['severity', 'title', 'says', 'gap', 'fix'],
  properties: {
    severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
    title: { type: 'string' },
    says: { type: 'string', description: 'what the material says, verbatim, or "nothing"' },
    gap: { type: 'string', description: 'the concrete problem' },
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
  required: ['story', 'judged', 'findings'],
  properties: {
    story: { type: 'string' },
    judged: { type: 'array', minItems: 1, items: { type: 'string', description: 'an AC id walked on the mock: J1.s2.1 or frame:<token>.1' } },
    findings: {
      type: 'array', description: 'empty when every AC was judgeable and the mock agrees',
      items: {
        type: 'object', additionalProperties: false,
        required: ['ac', 'kind', 'quote', 'missing', 'mock', 'how'],
        properties: {
          ac: { type: 'string', description: 'the AC id' },
          kind: { type: 'string', enum: ['undecidable', 'contradicts'] },
          quote: { type: 'string', description: 'the AC, verbatim from the story (the line or lines at issue)' },
          missing: { type: 'string', description: 'undecidable: exactly what was missing to decide pass or fail; contradicts: ""' },
          mock: { type: 'string', description: 'contradicts: what the mock showed, quoted; undecidable: ""' },
          how: { type: 'string', description: 'the exact proto.mjs look command(s) run' },
        },
      },
    },
  },
}

if (args?.round > 1 || args?.mode === 'delta' || args?.verify || args?.only || args?.lenses) log('round, mode, verify, only and lenses are gone: the review is one whole round; ignored')
if (!args?.mock || !args?.proto) log('mock or proto missing in args: the blind walks and the reviewer cannot drive the mock')
const language = args?.language ?? 'the language of the documents'

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
    { label: 'index', phase: 'Index', agentType: 'scout', schema: INDEX })
  let ix = await quote()
  let bad = indexProblems(ix)
  if (bad.length) { log(`index.json quote invalid (${bad.slice(0, 3).join('; ')}), asking again`); ix = await quote(); bad = indexProblems(ix) }
  if (bad.length) { log(`index.json still unreadable (${bad.slice(0, 3).join('; ')}): no blind walks`); indexBroken = true }
  else {
    vocabularyFile = ix.vocabulary
    stories = ix.stories.map(s => ({ id: s.id, file: s.file, acs: new Set(s.acs), build: s.build }))
  }
} else if (Array.isArray(args?.stories)) {
  stories = args.stories.filter(s => s && s.id && s.text).map(s => ({ id: s.id, text: s.text, ...acIdsInline(s.text) }))
}
if (!stories.length && !indexBroken) log('no stories to walk: the blind walks are skipped')
const skippedBuild = stories.flatMap(s => s.build.map(ac => `${s.id} ${ac}`))
if (skippedBuild.length) log(`${skippedBuild.length} AC(s) marked [build]: proved by the build, not walked blind`)

const D = args?.discoveryDir
const docInputs = `Round 1 · whole.
The documents: ${D}/stories.md · ${D}/pr-faq.md · ${D}/journeys/ · ${D}/notes.md (its Rules, Journeys and Out blocks)
The locked mock: ${args?.mock}
The tool: node ${args?.proto}
An AC marked [build] after its rule ids is proved by the build, not by the mock.`

// Inline stories only: the keys a story defines are the AC ids that open a list item
// (- **`J1.s2.1`** [RULE] …), never an id it merely mentions; [build] ones go apart.
function acIdsInline(text) {
  const acs = new Set(), build = []
  for (const m of text.matchAll(/^\s*-\s+\*\*`?(J\d+\.s\d+\.\d+|frame:[A-Za-z0-9_.-]+\.\d+)`?\*\*\s*\[([^\]]*)\](\s*\[build\])?/gm)) {
    if (m[3] || m[2].split(',').map(x => x.trim()).includes('build')) build.push(m[1]); else acs.add(m[1])
  }
  return { acs, build }
}

// ---------- the filter on a blind walk ----------

const clean = (id) => String(id ?? '').replace(/[`*\s]/g, '')
const missingIds = (walk, expected) => {
  if (!walk) return ['no output']
  const got = new Set(walk.judged.map(clean))
  return [...expected].filter(k => !got.has(k)).map(k => `missing AC ${k}`)
}
// Why a blind finding does not pass, or null when it does.
const dropReason = (f, expected) => {
  const ac = clean(f.ac)
  if (!expected.has(ac)) return `${ac || '(no id)'}: not an AC id this reader was given`
  if (f.kind !== 'undecidable' && f.kind !== 'contradicts') return `${ac}: no kind`
  if ((f.quote ?? '').trim().length < 12) return `${ac}: the AC is not quoted`
  if (f.kind === 'undecidable' && !(f.missing ?? '').trim()) return `${ac}: undecidable without what was missing`
  if (f.kind === 'contradicts' && !(f.mock ?? '').trim()) return `${ac}: contradicts without what the mock showed`
  return null
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

const storyInputs = (s) => s.file ? `Story ${s.id}. Language of the documents: ${language}.
The locked mock: ${args.mock}
The tool: node ${args.proto}
The story (read this file): ${s.file}
The vocabulary (read this file): ${vocabularyFile || 'none'}
The AC ids to judge: ${[...s.acs].join(', ')}
${s.build.length ? `Marked [build], not yours: ${s.build.join(', ')}` : ''}` : `Story ${s.id}. Language of the documents: ${language}.
The locked mock: ${args.mock}
The tool: node ${args.proto}
The AC ids to judge: ${[...s.acs].join(', ')}
${s.build.length ? `Marked [build], not yours: ${s.build.join(', ')}` : ''}

VOCABULARY:
${vocabulary}

STORY:
${s.text}`

const dropped = []
const walkBlind = async (s) => {
  const expected = s.acs
  if (!expected.size && s.build.length) { log(`${s.id}: every AC is [build]; nothing to walk`); return { story: s.id, judged: [], findings: [], unread: false } }
  if (!expected.size) { log(`${s.id}: no AC ids found in the story`); return { story: s.id, unread: true } }
  const dispatch = () => agent(storyInputs(s), {
    label: `${s.id}·walk`, phase: 'Blind walks', agentType: READER, schema: WALK,
  })
  let r = await dispatch()
  let problems = missingIds(r, expected)
  if (problems.length) {
    log(`${s.id} reader: ${problems.join(', ')}, re-dispatching`)
    r = await dispatch()
    problems = missingIds(r, expected)
  }
  if (problems.length) { log(`${s.id} reader: still invalid (${problems.join(', ')}), dropped`); return { story: s.id, unread: true } }
  const findings = []
  const seen = new Set()
  for (const f of r.findings) {
    const why = dropReason(f, expected)
    if (why) { dropped.push({ story: s.id, why }); continue }
    const ac = clean(f.ac)
    if (seen.has(`${ac}|${f.kind}`)) { dropped.push({ story: s.id, why: `${ac}: a second ${f.kind} on the same AC` }); continue }
    seen.add(`${ac}|${f.kind}`)
    findings.push(f.kind === 'contradicts'
      ? { severity: 'blocker', kind: f.kind, ac, title: `${ac}: the locked mock does otherwise`, says: f.quote.trim(), gap: `the mock shows: ${f.mock.trim()} (ran: ${f.how})`, fix: 'write the AC to what the locked mock does; if the mock is what is wrong, that is an amendment for the user' }
      : { severity: 'fix', kind: f.kind, ac, title: `${ac}: a stranger cannot decide pass or fail`, says: f.quote.trim(), gap: `missing: ${f.missing.trim()} (ran: ${f.how})`, fix: 'name the GIVEN state, the one event, and where each outcome is observed, with concrete values' })
  }
  return { story: s.id, judged: [...new Set(r.judged.map(clean))].filter(a => expected.has(a)), findings, unread: false }
}

// ---------- the round: the reviewer and the blind walks, concurrently ----------

phase('Review')
log(`round 1: ${LENS} · ${stories.length} blind walk(s)`)

const [lensResult, walkResults] = await parallel([
  () => reviewed(() => agent(docInputs, { label: LENS, phase: 'Review', agentType: LENS, schema: REVIEW }), LENS).then(r => ({ lens: LENS, ...r })),
  () => parallel(stories.map(s => () => walkBlind(s))),
])

const walked = (walkResults ?? []).filter(Boolean)
const unread = walked.filter(w => w.unread).map(w => w.story)
const read = walked.filter(w => !w.unread)
if (unread.length) log(`unread (walk did not survive): ${unread.join(', ')}`)
if (dropped.length) log(`${dropped.length} blind finding(s) dropped by the filter`)

// The blind walks merge into one lens entry, so the audit sees one lens
// with per-story findings.
const blind = {
  lens: READER,
  verdict: read.some(w => w.findings.some(f => f.severity === 'blocker')) ? 'fail'
    : read.some(w => w.findings.length) ? 'pass with fixes' : 'pass',
  verified: read.map(w => `${w.story}: ${w.judged.length} AC(s) judged, ${w.findings.length} finding(s)`),
  quote: read.flatMap(w => w.findings)[0]?.says ?? '',
  findings: read.flatMap(w => w.findings.map(f => ({ ...f, story: w.story }))),
  invalid: indexBroken || (stories.length > 0 && read.length === 0),
}
const lenses = [...(lensResult ? [lensResult] : []), ...(stories.length || indexBroken ? [blind] : [])]

const findings = []
for (const r of lenses) r.findings.forEach((f, i) => {
  f.id = `${r.lens}#${i + 1}`
  findings.push({ lens: r.lens, ...f })
})

const allUnread = stories.length > 0 && unread.length === stories.length
const invalidLenses = lenses.filter(l => l.invalid).map(l => l.lens)
const valid = !!lensResult && !allUnread && invalidLenses.length === 0
log(`round 1: ${findings.length} finding(s) from ${lenses.length} lens(es)${unread.length ? ` · unread: ${unread.length}/${stories.length}` : ''}${valid ? '' : ` · INVALID ROUND:${allUnread ? ' every story unread' : ''}${invalidLenses.length ? ' lenses ' + invalidLenses.join(', ') : ''}`}`)

return {
  round, valid, findings, lenses,
  walks: read.map(w => ({ story: w.story, judged: w.judged, findings: w.findings.length })),
  unread, skippedBuild, dropped,
}
