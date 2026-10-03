/*
 * design-tiers.js — stage 2's sizing (G1 and G2) as deterministic code.
 *
 * Why a workflow: the guarantee that the design is chosen part by part
 * from three real alternatives, and attacked from both sides before
 * anyone writes a document, must be physical, not discipline.
 *
 *   breadboard   architect (Opus 5.5, high), breadboard mode: what must
 *                happen, no mechanism chosen; the parts, sub-parts and
 *                effects (E-n) every tier copies → tiers/breadboard.md
 *   tiers        three architects (Opus 5.5, high) in parallel, blind to
 *                each other, one per tier: lean, balanced, hardened →
 *                tiers/<tier>.md; each part with build hours, run cost,
 *                risks covered and accepted
 *   pick         sizing-judge (Opus 5.5, high): R × V × C per part, a
 *                tier per part, the evolution path → sizing.md (draft)
 *   critics      overengineering-critic and risk-critic (Sonnet 5.5,
 *                high) in parallel, attacking the draft from opposite
 *                sides
 *   reconcile    sizing-judge again: rules every critic finding,
 *                writes tiers/critics.md and sizing.md (final)
 *
 * MECHANICAL CHECKS between the steps, each with one re-dispatch:
 *   - every tier covers exactly the breadboard's parts and sub-parts,
 *     each with hours and cost; lean meets every AC and the floor (a
 *     lean that does not is a strawman);
 *   - every pick follows the rubric (need = R × V) or says why not;
 *     every lean part with R >= 2 has an evolution row whose signal
 *     has a watcher; the picked hours add up from the tier files;
 *   - every critic finding has a ruling.
 * What still fails after the re-dispatch is returned in `problems`;
 * the conductor reads sizing.md and rules on it before the call.
 *
 * THE ARGS CARRY PATHS, NOT TEXT; every instruction lives in the agent
 * definitions (agents/) and the right-sizing pack they load.
 *
 * RUNNING UNREGISTERED AGENTS: with args.inlineAgents, agent() is called
 * without agentType; the prompt points at <agentsDir>/<name>.md and at
 * the SKILL.md of each pack the agent loads (<packsDir>/<pack>/SKILL.md),
 * and the model and effort come from the AGENTS map below.
 *
 * Invoked by the stage-design conductor:
 *   Workflow({ scriptPath: '<...>/workflows/design-tiers.js', args: {
 *     designDir:     '/abs/.../<slug>/01-design',
 *     discoveryDir:  '/abs/.../<slug>/00-discovery',
 *     doctrineDir:   '/abs/.../docs/engineering',
 *     repos:         '<each repo the design builds on, path and base branch>',
 *     templatesDir:  '/abs/.../skills/stage-design/templates',
 *     packsDir:      '/abs/.../skills',
 *     agentsDir:     '/abs/.../agents',
 *     appetiteHours: 6,              // the frame in notes.md
 *     language:      'pt-BR',
 *     date:          '2026-10-02',   // scripts cannot read the clock
 *     inlineAgents:  false,
 *     reuseBreadboard: false,        // true: tiers/breadboard.md on disk is kept (a rerun after a premise was confirmed)
 *   }})
 *
 * Returns { status, files, appetiteHours, totals, picks, evolution,
 * doors, questions, critics, problems }. status is 'sized' or
 * 'incomplete' (a tier, the pick or the reconcile did not survive; rerun
 * with resumeFromRunId after fixing the cause).
 */

export const meta = {
  name: 'design-tiers',
  description: 'Stage-2 sizing: a breadboard, three architects in parallel (lean, balanced, hardened), the sizing judge picks a tier per part, two critics attack the pick from opposite sides, the judge reconciles into sizing.md',
  phases: [
    { title: 'Breadboard', detail: 'one architect fixes what must happen: parts, effects, no mechanism', model: 'opus' },
    { title: 'Tiers', detail: 'three architects in parallel, one per tier, blind to each other', model: 'opus' },
    { title: 'Pick', detail: 'the sizing judge scores R × V × C and picks a tier per part', model: 'opus' },
    { title: 'Critics', detail: 'overengineering and risk, in parallel, against the draft' },
    { title: 'Reconcile', detail: 'the judge rules every critic finding and writes sizing.md', model: 'opus' },
  ],
}

const AGENTS = {
  architect: { model: 'opus', effort: 'high', packs: ['pack-right-sizing', 'pack-ops'] },
  'sizing-judge': { model: 'opus', effort: 'high', packs: ['pack-right-sizing'] },
  'overengineering-critic': { model: 'sonnet', effort: 'high', packs: ['pack-right-sizing'] },
  'risk-critic': { model: 'sonnet', effort: 'high', packs: ['pack-right-sizing'] },
}
const TIERS = ['lean', 'balanced', 'hardened']
const PARTS = ['data', 'contracts', 'compute', 'integrations', 'security', 'ops', 'ui', 'tests']
const CRITICS = ['overengineering-critic', 'risk-critic']

// ---------- schemas ----------

const STR = { type: 'string' }
const STRS = { type: 'array', items: STR }
const NUM = { type: 'number' }

const BREADBOARD = {
  type: 'object', additionalProperties: false,
  required: ['file', 'parts', 'effects', 'acs', 'premises'],
  properties: {
    file: STR,
    parts: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['part', 'subparts', 'untouched'],
      properties: { part: { type: 'string', enum: PARTS }, subparts: { ...STRS, description: 'named sub-parts ("compute.invite-email"), or empty' }, untouched: { type: 'boolean' } } } },
    effects: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'what', 'kind'],
      properties: { id: STR, what: STR, kind: STR } } },
    acs: { ...NUM, description: 'acceptance criteria with a server line' },
    premises: STRS,
  },
}

const TIER = {
  type: 'object', additionalProperties: false,
  required: ['file', 'tier', 'parts', 'totals', 'meetsEveryAC', 'acsNotMet', 'floorMet', 'floorNotMet', 'doors', 'premises'],
  properties: {
    file: STR,
    tier: { type: 'string', enum: TIERS },
    parts: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['part', 'line', 'buildHours', 'runCostMonth', 'risksCovered', 'risksAccepted', 'noChoice'],
      properties: {
        part: { ...STR, description: 'a part, or a sub-part as the breadboard names it' },
        line: { ...STR, description: 'this tier\'s design of the part in one line' },
        buildHours: NUM, runCostMonth: { ...NUM, description: 'US$ per month added' },
        risksCovered: STRS, risksAccepted: STRS, noChoice: { type: 'boolean' },
      } } },
    totals: { type: 'object', additionalProperties: false, required: ['buildHours', 'runCostMonth'], properties: { buildHours: NUM, runCostMonth: NUM } },
    meetsEveryAC: { type: 'boolean' }, acsNotMet: STRS,
    floorMet: { type: 'boolean' }, floorNotMet: STRS,
    doors: STRS, premises: STRS,
  },
}

const PICK_PART = { type: 'object', additionalProperties: false,
  required: ['part', 'tier', 'r', 'v', 'c', 'why', 'offRubric'],
  properties: {
    part: STR, tier: { type: 'string', enum: TIERS },
    r: { type: 'integer', minimum: 1, maximum: 3 }, v: { type: 'integer', minimum: 1, maximum: 3 }, c: { type: 'integer', minimum: 1, maximum: 3 },
    why: { ...STR, description: 'one line, naming the requirement' },
    offRubric: { ...STR, description: 'why the pick departs from the rubric (a composition need, a door); empty when it follows it' },
  } }

const PICK = {
  type: 'object', additionalProperties: false,
  required: ['file', 'status', 'parts', 'totals', 'evolution', 'doors', 'questions'],
  properties: {
    file: STR, status: { type: 'string', enum: ['draft', 'final', 'amended'] },
    parts: { type: 'array', items: PICK_PART },
    totals: TIER.properties.totals,
    evolution: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['part', 'now', 'signal', 'watcher', 'next', 'cost'],
      properties: { part: STR, now: STR, signal: { ...STR, description: 'with its number' }, watcher: { ...STR, description: 'the alarm, read or query that already watches it' }, next: STR, cost: STR } } },
    doors: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['door', 'decided', 'his'],
      properties: { door: STR, decided: STR, his: { type: 'boolean' } } } },
    questions: { type: 'array', maxItems: 4, items: { type: 'object', additionalProperties: false, required: ['id', 'question', 'options', 'pick'],
      properties: { id: STR, question: STR, options: STRS, pick: STR } } },
  },
}

const RECONCILE = {
  ...PICK,
  required: [...PICK.required, 'rulings', 'changed'],
  properties: {
    ...PICK.properties,
    rulings: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'ruling', 'reason'],
      properties: { id: STR, ruling: { type: 'string', enum: ['kept', 'dismissed'] }, reason: STR } } },
    changed: { ...STRS, description: 'what the critics changed, one line each, six at most' },
  },
}

const CRITIQUE = {
  type: 'object', additionalProperties: false,
  required: ['verified', 'quote', 'findings'],
  properties: {
    verified: { type: 'array', items: { type: 'string', description: 'one mechanism, effect or floor item walked, with the answer the pick gives' } },
    quote: { ...STR, description: 'one line of sizing.md, verbatim' },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['part', 'check', 'mechanism', 'says', 'gap', 'fix', 'who', 'likelihood'],
      properties: { part: STR, check: { ...STR, description: 'list C id (C1–C17), floor id (D1–D10), R, door or signal' }, mechanism: STR, says: STR, gap: STR, fix: STR, who: STR, likelihood: STR } } },
  },
}

// ---------- the run's inputs ----------

const inline = args?.inlineAgents === true
const agentsDir = args?.agentsDir
const packsDir = args?.packsDir
const designDir = args?.designDir
const tiersDir = `${designDir}/tiers`
const appetite = typeof args?.appetiteHours === 'number' ? args.appetiteHours : null
if (!designDir) throw new Error('args.designDir is required')
if (appetite === null) log('no appetiteHours given — the pick is not checked against the appetite; the frame in notes.md should carry one')

const files = {
  breadboard: `${tiersDir}/breadboard.md`,
  tiers: Object.fromEntries(TIERS.map(t => [t, `${tiersDir}/${t}.md`])),
  sizing: `${designDir}/sizing.md`,
  critics: `${tiersDir}/critics.md`,
}

const sources = `The lock (the product the user approved): ${args?.discoveryDir} — stories.md, journeys/*.yaml, prototype/ (its frames/), pr-faq.md
The conductor's notes (the frame: appetite, no-gos; what exists today): ${designDir}/notes.md
Recon and research: ${designDir}/recon/ · ${designDir}/research/
The project's engineering doctrine: ${args?.doctrineDir ?? '(not given)'}
The repos, at their base branch (a claim about the code is checked there): ${args?.repos ?? '(not given)'}
Appetite: ${appetite ?? '(not given)'} h · Language: ${args?.language ?? 'en'} · Date: ${args?.date ?? '(not given)'}`

// One call shape for registered and inline agents.
const call = (name, prompt, opts) => {
  const def = AGENTS[name]
  if (inline) {
    const packs = def.packs.map(p => `${packsDir}/${p}/SKILL.md`).join(', ')
    return agent(`Your instructions are the file ${agentsDir}/${name}.md (read it first and follow it; its frontmatter's model and effort are already applied). Read these knowledge packs before you work, as its frontmatter's skills: ${packs}.

${prompt}`, { ...opts, model: def.model, effort: def.effort })
  }
  return agent(prompt, { ...opts, agentType: name })
}

// Dispatch, check, re-dispatch once with the problems named.
const checked = async (name, prompt, opts, problemsOf) => {
  let r = await call(name, prompt, opts)
  let problems = problemsOf(r)
  if (problems.length) {
    log(`${opts.label}: ${problems.join('; ')} — re-dispatching once`)
    r = await call(name, `${prompt}

YOUR LAST RETURN FAILED THESE CHECKS; fix the file and return again:
${problems.map(p => `- ${p}`).join('\n')}`, { ...opts, label: `${opts.label}·2` })
    problems = problemsOf(r)
  }
  return { r, problems }
}

// ---------- mechanical checks ----------

const expectedParts = (bb) => bb.parts.flatMap(p => p.subparts && p.subparts.length ? p.subparts : [p.part])

const breadboardProblems = (bb) => {
  if (!bb) return ['no output']
  const problems = []
  const got = new Set(bb.parts.map(p => p.part))
  for (const p of PARTS) if (!got.has(p)) problems.push(`part ${p} missing (all eight, always; "untouched" when the demand does not touch it)`)
  bb.parts.forEach(p => (p.subparts || []).forEach(s => { if (!s.startsWith(`${p.part}.`)) problems.push(`sub-part ${s} must be named ${p.part}.<name>`) }))
  if (!bb.effects.length) log('breadboard: no effect leaves the process — the tiers will differ little')
  return problems
}

const tierProblems = (t, tier, expected) => {
  if (!t) return ['no output']
  const problems = []
  if (t.tier !== tier) problems.push(`returned tier ${t.tier}, was asked for ${tier}`)
  const got = new Set(t.parts.map(p => p.part))
  for (const p of expected) if (!got.has(p)) problems.push(`part ${p} of the breadboard is missing`)
  for (const p of got) if (!expected.includes(p)) problems.push(`part ${p} is not in the breadboard (copy its parts and sub-parts exactly)`)
  t.parts.forEach(p => {
    if (!(p.buildHours >= 0)) problems.push(`${p.part}: build hours missing`)
    if (!(p.runCostMonth >= 0)) problems.push(`${p.part}: run cost missing`)
  })
  if (tier === 'lean' && !t.meetsEveryAC) problems.push(`lean fails ${t.acsNotMet.join(', ') || 'an AC'}: lean meets every AC (a lean that fails one is a strawman)`)
  if (!t.floorMet) problems.push(`the floor is not met (${t.floorNotMet.join(', ') || 'unnamed'}): every tier meets the whole floor`)
  return problems
}

// The rubric of the right-sizing pack (§5 R2): need = R × V.
const allowedTiers = ({ r, v, c }) => {
  const need = r * v
  if (need <= 3) return ['lean']
  if (need === 4) return c === 1 ? ['lean', 'balanced'] : ['lean']
  if (need === 6) return r === 3 && c <= 2 ? ['balanced', 'hardened'] : ['balanced']
  return TIERS // 9: the cheapest tier that closes the door; the judge names it
}

const sum = (xs) => Math.round(xs.reduce((a, b) => a + b, 0) * 10) / 10

const pickProblems = (pick, tiers, expected, critique) => {
  if (!pick) return ['no output']
  const problems = []
  const byPart = new Map(pick.parts.map(p => [p.part, p]))
  for (const p of expected) if (!byPart.has(p)) problems.push(`part ${p} has no pick`)
  const noChoice = new Set(expected.filter(p => TIERS.every(t => tiers[t]?.parts.find(x => x.part === p)?.noChoice)))
  for (const p of pick.parts) {
    if (noChoice.has(p.part)) continue
    const allowed = allowedTiers(p)
    if (!allowed.includes(p.tier) && !p.offRubric.trim()) problems.push(`${p.part}: R${p.r} V${p.v} C${p.c} (need ${p.r * p.v}) allows ${allowed.join('/')}, picked ${p.tier} with no reason in offRubric`)
    if (p.r * p.v === 9 && !/door/i.test(`${p.why} ${p.offRubric}`)) problems.push(`${p.part}: need 9 — the why names the door the pick closes`)
    if (p.c === 3 && p.r * p.v <= 4 && p.tier !== 'lean') problems.push(`${p.part}: C3 with need ${p.r * p.v} — the pack flags this (C6 or C14); lean, or a reason`)
    if (p.tier === 'lean' && p.r >= 2 && !pick.evolution.some(e => e.part === p.part || e.part.startsWith(`${p.part}.`) || p.part.startsWith(`${e.part}.`))) problems.push(`${p.part}: lean with R${p.r} needs an evolution-path row (B3)`)
  }
  pick.evolution.forEach(e => { if (!e.watcher.trim()) problems.push(`evolution ${e.part}: the signal "${e.signal}" has no watcher`) })
  // the picked hours and run cost add up from the tier files
  const picked = pick.parts.map(p => tiers[p.tier]?.parts.find(x => x.part === p.part)).filter(Boolean)
  const hours = sum(picked.map(p => p.buildHours)), cost = sum(picked.map(p => p.runCostMonth))
  if (Math.abs(hours - pick.totals.buildHours) > 0.5) problems.push(`the picked hours add up to ${hours} h from the tier files; sizing.md says ${pick.totals.buildHours} h`)
  if (Math.abs(cost - pick.totals.runCostMonth) > 1) problems.push(`the picked run cost adds up to US$ ${cost}/month; sizing.md says ${pick.totals.runCostMonth}`)
  if (appetite !== null && hours > appetite && !pick.questions.length) problems.push(`the pick (${hours} h) is over the appetite (${appetite} h) and asks no scope question: cut scope (a question for the user), never the floor or an AC`)
  if (critique) {
    const ruled = new Set((pick.rulings || []).map(r => r.id))
    critique.forEach(f => { if (!ruled.has(f.id)) problems.push(`critic finding ${f.id} has no ruling`) })
  }
  return problems
}

// A critic's clean pass with nothing walked proves nothing: re-dispatch once.
const criticize = async (name, prompt) => {
  const opts = { label: name, phase: 'Critics', schema: CRITIQUE }
  let r = await call(name, prompt, opts)
  if (!r || (r.findings.length === 0 && r.verified.length === 0)) {
    log(`${name}: ${r ? 'clean pass without verification' : 'no output'} — re-dispatching`)
    r = await call(name, prompt, { ...opts, label: `${name}·2` })
  }
  const invalid = !r || (r.findings.length === 0 && r.verified.length === 0)
  if (invalid) return { critic: name, invalid: true, verified: [], quote: '', findings: [] }
  return { critic: name, invalid: false, ...r, findings: r.findings.map((f, i) => ({ id: `${name}#${i + 1}`, critic: name, ...f })) }
}

const problems = []
const result = (status, extra) => ({ status, files, appetiteHours: appetite, problems, ...extra })

// ---------- 1 · breadboard ----------

phase('Breadboard')
const bbPrompt = `MODE: breadboard.
${sources}
Template: ${args?.templatesDir}/breadboard.md
Write: ${files.breadboard}${args?.reuseBreadboard ? `
The file already exists and the conductor keeps it: read it, fix only what fails the template, and return it.` : ''}`
const bb = await checked('architect', bbPrompt, { label: 'architect·breadboard', phase: 'Breadboard', schema: BREADBOARD }, breadboardProblems)
if (bb.problems.length) {
  problems.push(...bb.problems.map(p => `breadboard: ${p}`))
  if (!bb.r) return result('incomplete', { at: 'breadboard' })
}
const expected = expectedParts(bb.r)
log(`breadboard: ${expected.length} parts (${expected.join(', ')}) · ${bb.r.effects.length} effects · ${bb.r.acs} ACs · ${bb.r.premises.length} premise(s)`)
if (bb.r.premises.length) log(`premises not confirmed: ${bb.r.premises.join(' · ')} — the tiers carry them as assumed`)

// ---------- 2 · three tiers, in parallel ----------

phase('Tiers')
const tierRuns = await parallel(TIERS.map(tier => () => checked('architect', `MODE: tier. YOUR TIER: ${tier}.
${sources}
The breadboard (copy its parts, sub-parts and effect ids exactly): ${files.breadboard}
Template: ${args?.templatesDir}/tier.md
Write: ${files.tiers[tier]}
Do not read the other tier files.`, { label: `architect·${tier}`, phase: 'Tiers', schema: TIER }, (t) => tierProblems(t, tier, expected))))

const tiers = {}
TIERS.forEach((tier, i) => {
  const run = tierRuns[i]
  if (run?.r) tiers[tier] = run.r
  ;(run?.problems ?? ['no output']).forEach(p => problems.push(`${tier}: ${p}`))
})
const missing = TIERS.filter(t => !tiers[t])
if (missing.length) { log(`tier(s) with no output: ${missing.join(', ')} — the judge needs all three`); return result('incomplete', { at: 'tiers' }) }
const totals = Object.fromEntries(TIERS.map(t => [t, tiers[t].totals]))
log(`tiers: ${TIERS.map(t => `${t} ${totals[t].buildHours} h · US$ ${totals[t].runCostMonth}/mo`).join(' | ')}`)

// ---------- 3 · the pick ----------

phase('Pick')
const tierFiles = TIERS.map(t => files.tiers[t]).join(', ')
const pickPrompt = `MODE: pick.
${sources}
The breadboard: ${files.breadboard}
The three tiers: ${tierFiles}
Template: ${args?.templatesDir}/sizing.md
Write: ${files.sizing} (status draft)`
const pick = await checked('sizing-judge', pickPrompt, { label: 'sizing-judge·pick', phase: 'Pick', schema: PICK }, (p) => pickProblems(p, tiers, expected))
if (!pick.r) { problems.push(...pick.problems.map(p => `pick: ${p}`)); return result('incomplete', { at: 'pick', totals }) }
if (pick.problems.length) log(`pick: still ${pick.problems.length} problem(s) — the critics read the draft as it is; reconcile gets them`)
const draftByTier = TIERS.map(t => `${pick.r.parts.filter(p => p.tier === t).length} ${t}`).join(' · ')
log(`draft pick: ${draftByTier} · ${pick.r.totals.buildHours} h · US$ ${pick.r.totals.runCostMonth}/mo${appetite !== null ? ` (appetite ${appetite} h)` : ''}`)

// ---------- 4 · the critics, from opposite sides ----------

phase('Critics')
const criticPrompt = `${sources}
The draft pick: ${files.sizing}
The breadboard and the three tiers: ${files.breadboard}, ${tierFiles}`
const critiques = await parallel(CRITICS.map(name => () => criticize(name, criticPrompt)))
const critique = critiques.filter(Boolean)
critique.filter(c => c.invalid).forEach(c => problems.push(`${c.critic}: no valid return — the reconcile ran without it`))
const criticFindings = critique.flatMap(c => c.findings)
log(`critics: ${critique.map(c => `${c.critic} ${c.invalid ? 'INVALID' : `${c.findings.length} finding(s)`}`).join(' · ')}`)

// ---------- 5 · reconcile ----------

phase('Reconcile')
const reconcilePrompt = `MODE: reconcile.
${sources}
The draft pick: ${files.sizing}
The breadboard and the three tiers: ${files.breadboard}, ${tierFiles}
Template: ${args?.templatesDir}/sizing.md
Write: ${files.sizing} (status final) and ${files.critics} (one row per finding)
${pick.problems.length ? `
THE DRAFT FAILED THESE CHECKS; the final must not:
${pick.problems.map(p => `- ${p}`).join('\n')}
` : ''}
THE CRITICS' FINDINGS (rule every id):
${JSON.stringify(criticFindings, null, 2)}`
const final = await checked('sizing-judge', reconcilePrompt, { label: 'sizing-judge·reconcile', phase: 'Reconcile', schema: RECONCILE }, (p) => pickProblems(p, tiers, expected, criticFindings))
if (!final.r) { problems.push(...final.problems.map(p => `reconcile: ${p}`)); return result('incomplete', { at: 'reconcile', totals }) }
problems.push(...final.problems.map(p => `sizing.md: ${p}`))

const kept = final.r.rulings.filter(r => r.ruling === 'kept').length
const byTier = Object.fromEntries(TIERS.map(t => [t, final.r.parts.filter(p => p.tier === t).map(p => p.part)]))
log(`sizing.md: ${TIERS.map(t => `${byTier[t].length} ${t}`).join(' · ')} · ${final.r.totals.buildHours} h · US$ ${final.r.totals.runCostMonth}/mo · critics ${kept} kept, ${final.r.rulings.length - kept} dismissed · ${final.r.questions.length} question(s) for his call${problems.length ? ` · ${problems.length} problem(s) for the conductor` : ''}`)

return result('sized', {
  totals: { ...totals, pick: final.r.totals },
  picks: final.r.parts,
  evolution: final.r.evolution,
  doors: final.r.doors,
  questions: final.r.questions,
  critics: {
    findings: criticFindings.length,
    kept,
    dismissed: final.r.rulings.length - kept,
    changed: final.r.changed,
    invalid: critique.filter(c => c.invalid).map(c => c.critic),
  },
})
