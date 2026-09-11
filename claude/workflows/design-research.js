/*
 * design-research.js — deep research on ONE topic of a design, as
 * deterministic code. The stage-design conductor runs one of these per
 * topic listed from the session's notes, all in parallel, between the
 * session and the playback per subject.
 *
 * The shape is the research pattern Anthropic documents for multi-agent
 * systems (orchestrator-workers): a planner turns the topic's questions
 * into angles; one searcher per angle, blind to the others (a
 * multi-modal sweep: official docs, the repo, the price page, a
 * measurement, a search); a synthesizer writes research/<topic>.md from
 * the template; a completeness critic asks what is missing and sends
 * one more loop when there is something (two loops at most); a citer
 * checks every claim against its source and downgrades what the source
 * does not sustain to "not verified". Every role is design-researcher
 * (Sonnet 5, high); the role is named in the brief.
 *
 * Invoked by the stage-design conductor:
 *   Workflow({ scriptPath: '<...>/workflows/design-research.js', args: {
 *     topic:      'minute-api',                 // the file name: research/<topic>.md
 *     title:      'The Minute panel API',       // for the file heading
 *     questions:  [ 'does the export carry the verdict?', 'rate limits?' ],
 *     designDir:  'absolute path to <slug>/01-design',
 *     template:   'absolute path to stage-design/templates/research-target.md',
 *     repos:      [ 'absolute paths the searchers may read' ],
 *     language:   'pt-BR',
 *     date:       '2026-09-11',                 // scripts cannot read the clock
 *   }})
 *
 * Returns { topic, file, angles, findings, notConfirmed, loops, downgraded }.
 */

export const meta = {
  name: 'design-research',
  description: 'Deep research on one design topic: planner → blind searchers per angle → synthesizer → completeness critic (one extra loop at most) → citer; writes research/<topic>.md',
  phases: [
    { title: 'Plan', detail: 'the questions become angles, one source each' },
    { title: 'Search', detail: 'one searcher per angle, blind to the others' },
    { title: 'Write', detail: 'the synthesizer writes the file from the template' },
    { title: 'Check', detail: 'the critic asks what is missing; the citer checks every source' },
  ],
}

const ROLE = 'design-researcher'
const topic = args?.topic
if (!topic) throw new Error('args.topic is required')
const questions = Array.isArray(args?.questions) ? args.questions : []
const file = `${args.designDir}/research/${topic}.md`

const base = `Topic: ${args.title ?? topic} (file: ${file})
Language: ${args.language ?? 'en'} · date: ${args.date ?? '(pass args.date)'}
The questions the design needs answered:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
Repos and folders you may read: ${(args.repos ?? []).join(', ') || '(none)'}
The template of the file: ${args.template}`

const ANGLES = {
  type: 'object', additionalProperties: false, required: ['angles'],
  properties: { angles: { type: 'array', minItems: 1, items: {
    type: 'object', additionalProperties: false, required: ['id', 'question', 'how'],
    properties: { id: { type: 'string' }, question: { type: 'string' }, how: { type: 'string', description: 'the source: official docs URL, repo path, price page, a measurement, a search' } } } } },
}
const FINDINGS = {
  type: 'object', additionalProperties: false, required: ['findings', 'notConfirmed'],
  properties: {
    findings: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['label', 'claim', 'source'],
      properties: { label: { type: 'string', enum: ['fact', 'inference', 'heuristic'] }, claim: { type: 'string' }, source: { type: 'string', description: 'URL; or the command and its output for an internal target' } } } },
    notConfirmed: { type: 'array', items: { type: 'string' } },
  },
}
const WRITTEN = { type: 'object', additionalProperties: false, required: ['file', 'facts', 'inferences', 'notConfirmed'],
  properties: { file: { type: 'string' }, facts: { type: 'number' }, inferences: { type: 'number' }, notConfirmed: { type: 'number' } } }
const MISSING = { type: 'object', additionalProperties: false, required: ['missing'],
  properties: { missing: { type: 'array', items: ANGLES.properties.angles.items } } }
const CITED = { type: 'object', additionalProperties: false, required: ['file', 'checked', 'downgraded', 'lines'],
  properties: { file: { type: 'string' }, checked: { type: 'number' }, downgraded: { type: 'number' }, lines: { type: 'array', items: { type: 'string' } } } }

const search = (a, loop) => agent(`ROLE: searcher.\n${base}\n\nYOUR ANGLE (answer it and only it):\n${a.id} — ${a.question}\nHow: ${a.how}`,
  { label: `${topic}·${a.id}·l${loop}`, phase: 'Search', agentType: ROLE, schema: FINDINGS })

phase('Plan')
const plan = await agent(`ROLE: planner.\n${base}`, { label: `${topic}·plan`, phase: 'Plan', agentType: ROLE, schema: ANGLES })
let angles = plan?.angles ?? []
log(`${topic}: ${angles.length} angle(s)`)

let loops = 0, all = []
while (loops < 2 && angles.length) {
  loops++
  phase('Search')
  const got = (await parallel(angles.map(a => () => search(a, loops)))).filter(Boolean)
  all.push(...got)
  phase('Write')
  await agent(`ROLE: synthesizer.\n${base}\n\nWrite (or rewrite, keeping what is already there and sourced) the file at ${file}.\n\nTHE SEARCHERS' RETURNS:\n${JSON.stringify(all, null, 2)}`,
    { label: `${topic}·write·l${loops}`, phase: 'Write', agentType: ROLE, schema: WRITTEN })
  phase('Check')
  const crit = await agent(`ROLE: critic.\n${base}\n\nThe file to check: ${file}`, { label: `${topic}·critic·l${loops}`, phase: 'Check', agentType: ROLE, schema: MISSING })
  angles = crit?.missing ?? []
  if (angles.length) log(`${topic}: the critic found ${angles.length} missing angle(s)${loops < 2 ? ' — one more loop' : ' — loop budget spent, listed in the file as not confirmed'}`)
}

const cited = await agent(`ROLE: citer.\n${base}\n\nThe file to check: ${file}`, { label: `${topic}·cite`, phase: 'Check', agentType: ROLE, schema: CITED })
const findings = all.reduce((n, r) => n + (r.findings?.length ?? 0), 0)
const notConfirmed = all.reduce((n, r) => n + (r.notConfirmed?.length ?? 0), 0)
log(`${topic}: ${findings} finding(s) · ${notConfirmed} not confirmed · ${cited?.checked ?? 0} checked · ${cited?.downgraded ?? 0} downgraded`)
return { topic, file, angles: plan?.angles ?? [], findings, notConfirmed, loops, downgraded: cited?.downgraded ?? 0 }
