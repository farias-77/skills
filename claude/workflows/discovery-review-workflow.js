export const meta = {
  name: 'discovery-review',
  description: 'Stage-1 review of the stories derived from the locked mock: three lenses and, per story, two blind readers and a judge, in parallel; one round; every finding goes to the conductor',
  whenToUse: 'Stage 1 (discovery), step D5, after proto.mjs trace passes and proto.mjs split has cut the stories',
  phases: [
    { title: 'Lenses', detail: 'disc-lens × 3: in-out, coverage, acceptance' },
    { title: 'Double-blind', detail: 'per story: blind-reader × 2, then blind-judge' },
  ],
}

const AGENTS = {
  'disc-lens': { model: 'sonnet', effort: 'medium' },
  'blind-reader': { model: 'sonnet', effort: 'low' },
  'blind-judge': { model: 'sonnet', effort: 'medium' },
}
const LENSES = ['in-out', 'coverage', 'acceptance']
const AC_ID = /^(J\d+\.s\d+\.\d+|frame:[A-Za-z0-9_.-]+\.\d+)$/
const MIN_QUOTE = 12

const LENS_REPORT = {
  type: 'object', additionalProperties: false,
  required: ['verified', 'findings'],
  properties: {
    verified: { type: 'array', items: { type: 'string', description: 'one thing this lens checked, and where' } },
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['severity', 'title', 'quote', 'where', 'gap', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['blocks', 'note'] },
          title: { type: 'string' },
          quote: { type: 'string', description: 'the line at issue, verbatim: an AC, a rule, an Out line, or the mock text' },
          where: { type: 'string', description: 'file:line, or the frame token' },
          gap: { type: 'string' },
          fix: { type: 'string' },
        },
      },
    },
  },
}

const READING = {
  type: 'object', additionalProperties: false,
  required: ['story', 'readings'],
  properties: {
    story: { type: 'string' },
    readings: {
      type: 'array', minItems: 1,
      items: {
        type: 'object', additionalProperties: false,
        required: ['ac', 'understood', 'verdict', 'observed', 'missing', 'how'],
        properties: {
          ac: { type: 'string' },
          understood: { type: 'string', description: 'in one or two sentences, what this AC requires' },
          verdict: { type: 'string', enum: ['pass', 'fail', 'undecidable'] },
          observed: { type: 'string', description: 'what the mock showed, quoted' },
          missing: { type: 'string', description: 'undecidable: exactly what was missing; otherwise ""' },
          how: { type: 'string', description: 'the exact proto.mjs look commands run' },
        },
      },
    },
  },
}

const JUDGMENT = {
  type: 'object', additionalProperties: false,
  required: ['story', 'findings'],
  properties: {
    story: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['ac', 'kind', 'quote', 'readingA', 'readingB', 'gap', 'fix'],
        properties: {
          ac: { type: 'string' },
          kind: { type: 'string', enum: ['diverge', 'contradicts', 'undecidable'] },
          quote: { type: 'string', description: 'the AC text at issue, verbatim' },
          readingA: { type: 'string', description: 'reader A, quoted' },
          readingB: { type: 'string', description: 'reader B, quoted' },
          gap: { type: 'string', description: 'why two engineers would build or judge differently' },
          fix: { type: 'string', description: 'the AC rewritten so one reading is left' },
        },
      },
    },
  },
}

const TITLES = {
  diverge: 'two readers read it differently',
  contradicts: 'the locked mock does otherwise',
  undecidable: 'a stranger cannot decide pass or fail',
}

const dropped = []
const drop = (source, why) => { dropped.push({ source, why }); return null }
const clean = (id) => String(id ?? '').replace(/[`*\s]/g, '')
const filled = (text, min = 1) => String(text ?? '').trim().length >= min

function readIndex(index) {
  if (!index || !Array.isArray(index.stories) || !index.stories.length) return { problems: ['args.index has no stories (pass the JSON proto.mjs split printed)'] }
  const problems = []
  for (const s of index.stories) {
    if (!/^S-\d+$/.test(s.id ?? '')) problems.push(`story id "${s.id}"`)
    if (!filled(s.file)) problems.push(`${s.id}: no file`)
    for (const ac of [...(s.acs ?? []), ...(s.build ?? [])]) if (!AC_ID.test(ac)) problems.push(`${s.id}: "${ac}" is not an AC id`)
  }
  const stories = index.stories.map((s) => ({ id: s.id, file: s.file, acs: new Set(s.acs ?? []), build: s.build ?? [] }))
  return { problems, stories, vocabulary: index.vocabulary || null }
}

const D = args?.discoveryDir
const language = args?.language ?? 'the language of the documents'
const { problems, stories = [], vocabulary } = readIndex(args?.index)
const rules = String(args?.proto ?? '').replace(/scripts\/proto\.mjs$/, 'references/stories.md')
const sources = `The documents: ${D}/stories.md · ${D}/journeys/ · ${D}/notes.md
The rules for stories: ${rules}
The locked mock: ${args?.mock}
The tool: node ${args?.proto}
Language of the documents: ${language}`

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

// ---------- Lenses ----------

function keepLensFinding(lens, f) {
  const source = `disc-lens/${lens}`
  if (!filled(f.quote, MIN_QUOTE)) return drop(source, `"${f.title}": no quote`)
  if (!filled(f.where)) return drop(source, `"${f.title}": no file:line or frame`)
  return { source, severity: f.severity, title: f.title, quote: f.quote.trim(), where: f.where.trim(), gap: f.gap, fix: f.fix }
}

async function runLens(lens) {
  const report = await once(
    () => call('disc-lens', `Lens: ${lens}.\n${sources}`, { label: lens, phase: 'Lenses', schema: LENS_REPORT }),
    (r) => r && (r.findings.length > 0 || r.verified.length > 0),
    `disc-lens ${lens}`,
  )
  if (!report) return { lens, valid: false, verified: [], findings: [] }
  return { lens, valid: true, verified: report.verified, findings: report.findings.map((f) => keepLensFinding(lens, f)).filter(Boolean) }
}

// ---------- Double-blind ----------

const storyInputs = (s) => `Story ${s.id}.
The locked mock: ${args?.mock}
The tool: node ${args?.proto}
The story (read this file): ${s.file}
The vocabulary (read this file): ${vocabulary ?? 'none'}
The AC ids: ${[...s.acs].join(', ')}
${s.build.length ? `Marked [build], not walked: ${s.build.join(', ')}\n` : ''}Language of the documents: ${language}`

const coversEvery = (s) => (r) => {
  if (!r || !Array.isArray(r.readings)) return false
  const got = new Set(r.readings.map((x) => clean(x.ac)))
  return [...s.acs].every((ac) => got.has(ac))
}

async function readTwice(s) {
  const read = (who) => once(
    () => call('blind-reader', `Reader ${who}, of one story.\n${storyInputs(s)}`, { label: `${s.id}·${who}`, phase: 'Double-blind', schema: READING }),
    coversEvery(s),
    `${s.id} reader ${who}`,
  )
  const [a, b] = await parallel([() => read('A'), () => read('B')])
  return { a, b }
}

const onlyGiven = (s, r) => r.readings.filter((x) => s.acs.has(clean(x.ac))).map((x) => ({ ...x, ac: clean(x.ac) }))

function keepBlindFinding(s, f, seen) {
  const ac = clean(f.ac), source = `blind/${s.id}`
  if (!s.acs.has(ac)) return drop(source, `${ac || '(no id)'}: not an AC id of this story`)
  if (!filled(f.quote, MIN_QUOTE)) return drop(source, `${ac}: the AC is not quoted`)
  if (!filled(f.gap)) return drop(source, `${ac}: ${f.kind} without its gap`)
  if (f.kind === 'diverge' && !(filled(f.readingA) && filled(f.readingB))) return drop(source, `${ac}: diverge without both readings`)
  if (seen.has(`${ac}|${f.kind}`)) return drop(source, `${ac}: a second ${f.kind} on the same AC`)
  seen.add(`${ac}|${f.kind}`)
  return { source, story: s.id, ac, kind: f.kind, severity: 'blocks', title: `${ac}: ${TITLES[f.kind]}`, quote: f.quote.trim(), readings: [f.readingA, f.readingB], gap: f.gap, fix: f.fix }
}

async function judge(pair, s) {
  if (!pair?.a || !pair?.b) {
    log(`${s.id}: a reader did not cover every AC twice; the story is unread`)
    return { story: s.id, unread: true }
  }
  const prompt = `Story ${s.id}.
The story (read this file): ${s.file}
The vocabulary (read this file): ${vocabulary ?? 'none'}
The rules for stories: ${rules}
The AC ids: ${[...s.acs].join(', ')}
Language of the documents: ${language}

Reading A:
${JSON.stringify(onlyGiven(s, pair.a), null, 1)}

Reading B:
${JSON.stringify(onlyGiven(s, pair.b), null, 1)}`
  const verdict = await once(
    () => call('blind-judge', prompt, { label: `${s.id}·judge`, phase: 'Double-blind', schema: JUDGMENT }),
    (r) => r && Array.isArray(r.findings),
    `${s.id} judge`,
  )
  if (!verdict) return { story: s.id, unread: true }
  const seen = new Set()
  return { story: s.id, unread: false, judged: [...s.acs], findings: verdict.findings.map((f) => keepBlindFinding(s, f, seen)).filter(Boolean) }
}

async function runDoubleBlind() {
  const walkable = stories.filter((s) => {
    if (s.acs.size) return true
    log(`${s.id}: every AC is [build]; nothing to read blind`)
    return false
  })
  const results = await pipeline(walkable, readTwice, judge)
  return results.map((r, i) => r ?? { story: walkable[i].id, unread: true })
}

// ---------- The round ----------

if (problems.length) {
  log(`index invalid: ${problems.slice(0, 5).join('; ')}`)
  return { valid: false, findings: [], lenses: [], stories: [], unread: [], skippedBuild: [], dropped: problems.map((why) => ({ source: 'index', why })) }
}
if (!args?.mock || !args?.proto || !D) log('discoveryDir, mock or proto missing in args: the agents cannot reach the material')

const skippedBuild = stories.flatMap((s) => s.build.map((ac) => `${s.id} ${ac}`))
log(`round 1: ${LENSES.length} lenses · ${stories.length} stories × (2 readers + 1 judge) · ${skippedBuild.length} [build] AC(s) not read blind`)

const [lensRuns, storyRuns] = await parallel([
  () => parallel(LENSES.map((lens) => () => runLens(lens))),
  () => runDoubleBlind(),
])

const lenses = (lensRuns ?? []).map((r, i) => r ?? { lens: LENSES[i], valid: false, verified: [], findings: [] })
const read = (storyRuns ?? []).filter((r) => !r.unread)
const unread = (storyRuns ?? []).filter((r) => r.unread).map((r) => r.story)

const findings = [
  ...lenses.flatMap((l) => l.findings.map((f, i) => ({ id: `${f.source}#${i + 1}`, ...f }))),
  ...read.flatMap((r) => r.findings.map((f, i) => ({ id: `${f.source}#${i + 1}`, ...f }))),
]
const invalidLenses = lenses.filter((l) => !l.valid).map((l) => l.lens)
const everyStoryUnread = stories.some((s) => s.acs.size) && read.length === 0
const valid = invalidLenses.length === 0 && !everyStoryUnread

if (dropped.length) log(`${dropped.length} finding(s) dropped by the filter`)
log(`round 1: ${findings.length} finding(s)${unread.length ? ` · unread: ${unread.join(', ')}` : ''}${valid ? '' : ` · INVALID:${invalidLenses.length ? ` lenses ${invalidLenses.join(', ')}` : ''}${everyStoryUnread ? ' every story unread' : ''}`}`)

return {
  valid,
  findings,
  lenses: lenses.map((l) => ({ lens: l.lens, valid: l.valid, verified: l.verified, findings: l.findings.length })),
  stories: read.map((r) => ({ story: r.story, judged: r.judged, findings: r.findings.length })),
  unread,
  skippedBuild,
  dropped,
}
