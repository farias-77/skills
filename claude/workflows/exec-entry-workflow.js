export const meta = {
  name: 'exec-entry',
  description: 'One stage-4 entry end to end: builder-backend ∥ builder-frontend (Opus 5.5, medium) → exec-gate (Sonnet 5.5, low) → reviewer (Opus 5.5, high) ∥ the QAs the surface calls for (Opus 5.5, medium) → a mechanical triage → at most one fix pass → the delta; modes build, resume, update and fix',
  whenToUse: 'Called by the stage-execute session (the tech lead) once per entry, A.n round or X.n; args carry paths, never text',
  phases: [
    { title: 'Build', detail: 'builder-backend ∥ builder-frontend, each in its own folder of the same worktree' },
    { title: 'Gate', detail: 'exec-gate: the entry gate once; each red is code or machine; a test outside the diff runs again once' },
    { title: 'Check', detail: 'reviewer ∥ qa-frontend ∥ qa-backend, as the surface calls for' },
    { title: 'Fix', detail: 'a gate-fix pass on a code red (two at most), or the one review fix pass' },
    { title: 'Delta', detail: 'who blocked re-checks its items; the reviewer too when the delta touches tests or the gate' },
  ],
}

const AGENTS = {
  'builder-backend': { model: 'opus', effort: 'medium' },
  'builder-frontend': { model: 'opus', effort: 'medium' },
  'exec-gate': { model: 'sonnet', effort: 'low' },
  reviewer: { model: 'opus', effort: 'high' },
  'qa-frontend': { model: 'opus', effort: 'medium' },
  'qa-backend': { model: 'opus', effort: 'medium' },
}
const CEILING = { 'builder-backend': 120, 'builder-frontend': 120 }
const BUILDER_OF = { back: 'builder-backend', front: 'builder-frontend' }
const MIN_LEVEL = { ac: 4, bug: 4, security: 3, rule: 2 }
const MAX_GATE_FIXES = 2
const MAX_REVIEW_FIXES = 1
const MACHINE_RERUNS = 2
const NOTES_PER_SEAT = 5
const TEST_FILE = /(_test\.go|\.(spec|test)\.[cm]?[jt]sx?)$/

// ---------- schemas ----------

const str = { type: 'string' }
const strs = { type: 'array', items: str }
const obj = (properties) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties })
const arr = (items) => ({ type: 'array', items })
const SIDE = { type: 'string', enum: ['back', 'front', 'both'] }

const BUILD = obj({
  startHead: { type: 'string', description: 'the branch head when you began' },
  head: str,
  commits: arr(obj({ sha: str, message: str })),
  fastCheck: obj({ green: { type: 'boolean' }, lastLine: str }),
  proofs: arr(obj({ ac: str, proof: { type: 'string', description: 'the test that fails if the AC breaks, as file:name' } })),
  tried: { type: 'string', description: 'what you saw running the change once against the local stack; the empty string (no quotes, no "none") when it has no screen or endpoint' },
  screenChange: { type: 'string', enum: ['behaviour', 'visual', 'none'] },
  files: strs,
  outsideOwns: arr(obj({ path: str, why: str })),
  decided: arr(obj({ question: str, pick: str, why: str })),
  questions: arr(obj({ question: str, why: { type: 'string', description: 'why only the user can answer it, in person' } })),
  blocked: { type: 'string', description: 'a true impossibility, quoted; otherwise the empty string (no quotes, no "none")' },
  applied: arr(obj({ id: str, commit: str, why: str })),
})

const GATE = obj({
  green: { type: 'boolean' },
  head: str,
  summary: str,
  failures: arr(obj({
    command: str,
    where: str,
    output: { type: 'string', description: 'the failing lines, verbatim' },
    cause: { type: 'string', enum: ['code', 'machine'] },
    side: SIDE,
  })),
  flaky: arr(obj({ test: str, where: str, output: str })),
  load: str,
  surface: obj({
    api: { type: 'boolean' },
    screen: { type: 'boolean' },
    runtime: { type: 'boolean' },
    sensitive: { type: 'boolean', description: 'authentication, permissions or personal data; true when unsure' },
  }),
  changed: { ...strs, description: 'git diff --name-only <since> HEAD when a since is given; [] otherwise' },
  stack: { type: 'string', description: 'URLs and actors by role when you brought the stack up, never a token; "down" otherwise' },
})

const FINDING = obj({
  severity: { type: 'string', enum: ['blocks', 'note'] },
  basis: { type: 'string', enum: ['ac', 'bug', 'security', 'rule', 'other'] },
  title: str,
  where: str,
  says: { type: 'string', description: 'the lines or what you saw, verbatim' },
  fix: str,
  proof: { type: 'string', description: 'ac: the AC id and what happens instead · bug, security: the steps and what they showed · rule: the rule id, path:line and the sentence · "" for a note' },
  level: { type: 'integer', enum: [1, 2, 3, 4, 5], description: 'the proof ladder: 1 said · 2 pointed at the line · 3 showed the case can happen · 4 ran it · 5 reproduced it in the running app' },
  side: SIDE,
})

const REVIEW = obj({
  verified: strs,
  findings: arr(FINDING),
  closed: { ...strs, description: 'in a delta: the ids of your items now closed' },
  inconclusive: { type: 'string', description: 'what you could not run and why; the empty string (no quotes, no "none") when you ran everything your check needed' },
})

// ---------- the run ----------

const mode = ['build', 'resume', 'update', 'fix'].includes(args?.mode) ? args.mode : 'build'
const entry = args?.entry ?? '?'
const contractCommit = args?.kind === 'contract'
const sides = (Array.isArray(args?.sides) && args.sides.length ? args.sides : contractCommit ? ['back'] : ['back', 'front']).filter(s => BUILDER_OF[s])
const gatePaths = Array.isArray(args?.gatePaths) ? args.gatePaths : []
const qaMode = () => args?.qa ?? (contractCommit || mode === 'fix' ? 'none' : 'surface')

const result = {
  entry, mode, status: 'parked', reason: null, head: null, since: null,
  passes: { build: 0, gateFixes: 0, reviewFixes: 0 },
  blocking: [], notes: [], flaky: [], outsideOwns: [], decided: [], questions: [], blocked: null,
  tried: [], qa: null, gate: null, stack: null, inconclusive: [],
}

const said = (s) => { const v = (s ?? '').trim(); return /^(""|''|none|null|n\/a|-)$/i.test(v) ? '' : v }

const finish = (status, reason, why) => {
  result.status = status
  result.reason = reason
  log(`${entry}: ${status}${reason ? ` (${reason})` : ''}${why ? `: ${why}` : ''}`)
  return result
}
const interrupted = (who) => finish('interrupted', 'interrupted', `${who} returned nothing; relaunch with resumeFromRunId`)
const ready = () => result.inconclusive.length
  ? finish('parked', 'inconclusive', result.inconclusive.map(i => `${i.seat}: ${i.why}`).join(' · '))
  : finish('ready', null, `at ${result.head}, ${result.notes.length} note(s) for the PR`)

// ---------- calling an agent ----------

const beat = (name, label) => args?.heartbeat
  ? `\nHeartbeat: run \`${args.heartbeat} start ${label} ${CEILING[name] ?? 30}\` before anything else, and \`${args.heartbeat} end ${label}\` as your last command.`
  : ''

function call(name, prompt, opts) {
  const text = `${prompt}${beat(name, opts.label)}`
  if (args?.inlineAgents !== true) return agent(text, { ...opts, agentType: name })
  const { model, effort } = AGENTS[name]
  return agent(`Your instructions are ${args.agentsDir}/${name}.md: read it first and follow it.\n\n${text}`, { ...opts, model, effort })
}

const where = `Worktree: ${args?.worktree} · branch ${args?.branch} · base ${args?.base}`
const sources = `Brief: ${args?.briefPath}
Design: ${args?.designDir}
Stories: ${args?.storiesPath ?? '(not given)'}
Mock frames: ${args?.mockDir ?? '(none)'}
The project's CLAUDE.md (its standards and golden paths): ${args?.projectDocs}
Your role's references: ${args?.referencesDir}
Evidence folder: ${args?.evidenceDir}${args?.priorRuns?.length ? `\nEarlier runs of this entry: ${args.priorRuns.join(', ')}` : ''}`

// ---------- the builders ----------

const itemText = (i) => `- ${i.id}: ${i.title} — ${i.fix}${i.where ? `\n  where: ${i.where}` : ''}${i.proof ? `\n  proof: ${i.proof}` : ''}`

function routeItems(items) {
  const bySide = Object.fromEntries(sides.map(s => [s, []]))
  for (const i of items) (bySide[i.side] ?? bySide[sides.includes('back') ? 'back' : sides[0]]).push(i)
  return bySide
}

function builderPrompt(side, task, items) {
  const other = sides.length > 1 ? `\nThe other side is built at the same time in this worktree by ${BUILDER_OF[side === 'back' ? 'front' : 'back']}: stay in your folder.` : ''
  return `Entry ${entry}, side ${side}. ${task}${items.length ? `\n${items.map(itemText).join('\n')}` : ''}${other}
${where}
${sources}
Fast check, green on your last commit: ${args?.fastCheck ?? '(not given)'}
Commit trailer, verbatim:
${args?.trailer ?? '(none)'}`
}

function absorb(outs) {
  for (const b of outs) {
    result.outsideOwns.push(...b.outsideOwns)
    result.decided.push(...b.decided)
    if (said(b.tried)) result.tried.push(said(b.tried))
  }
  result.head = outs.at(-1).head
  const blocked = outs.map(b => said(b.blocked)).filter(Boolean)
  if (blocked.length) { result.blocked = blocked.join(' · '); return finish('blocked', 'blocked', result.blocked) }
  const questions = outs.flatMap(b => b.questions)
  if (questions.length) { result.questions = questions; return finish('parked', 'user', `${questions.length} question(s) only the user can answer`) }
  return null
}

let screenChange = 'none'
async function buildPass(task, items, label) {
  const bySide = items.length ? routeItems(items) : Object.fromEntries(sides.map(s => [s, []]))
  const active = Object.keys(bySide).filter(s => !items.length || bySide[s].length)
  phase(label === 'build' ? 'Build' : 'Fix')
  const outs = await parallel(active.map(side => () =>
    call(BUILDER_OF[side], builderPrompt(side, task, bySide[side]), { label: `${BUILDER_OF[side]}·${entry}·${label}`, phase: label === 'build' ? 'Build' : 'Fix', schema: BUILD })))
  if (outs.some(o => !o)) return interrupted(active.map(s => BUILDER_OF[s]).join(' ∥ '))
  if (label === 'build') {
    result.passes.build++
    const kinds = outs.map(o => o.screenChange)
    screenChange = kinds.includes('behaviour') ? 'behaviour' : kinds.includes('visual') ? 'visual' : 'none'
  }
  log(`${entry}: ${label} by ${active.map(s => BUILDER_OF[s]).join(' ∥ ')} → ${outs.at(-1).head}`)
  return absorb(outs)
}

// ---------- the gate ----------

const loadWait = () => `First wait for the machine: until the 1-min load is under ${args?.loadThreshold ?? 'nproc'}, at most 10 minutes:
timeout 590 bash -c 'until awk -v t="${args?.loadThreshold ?? '$(nproc)'}" "{ exit !(\\$1 + 0 < t + 0) }" /proc/loadavg; do sleep 15; done'
Then run the gate whatever its exit; put its last line in \`load\`.`

let gateN = 0
function runGate(task, since) {
  const bringUp = mode !== 'update' && qaMode() !== 'none'
  return call('exec-gate', `Entry ${entry}. ${task}
${where}
The gate commands, in order, each once:
${(args?.gateCommands ?? []).map((c, i) => `${i + 1}. ${c}`).join('\n')}
${since ? `Changed since ${since}: list \`git diff --name-only ${since} HEAD\` in \`changed\`.` : 'No since: `changed` is [].'}
${bringUp ? 'Green with an api or screen surface: bring the stack up on this head and leave it up.' : 'Never bring the stack up.'}
The project's CLAUDE.md (stack and env commands): ${args?.projectDocs}
Your role's references: ${args?.referencesDir}`, { label: `exec-gate·${entry}·g${++gateN}`, phase: 'Gate', schema: GATE })
}

const onlyMachine = (g) => !g.green && g.failures.length > 0 && g.failures.every(f => f.cause === 'machine')

async function gateOnce(task, since) {
  let g = await runGate(task, since)
  for (let wait = 1; g && onlyMachine(g); wait++) {
    if (wait > MACHINE_RERUNS) { result.gate = g; return { stop: finish('parked', 'machine', `red only for the machine after ${MACHINE_RERUNS} waits (load ${g.load})`) } }
    log(`${entry}: red only for the machine (load ${g.load}); the gate waits and runs again (${wait}/${MACHINE_RERUNS})`)
    g = await runGate(`${loadWait()}\nThen run the gate again; nothing changed.`, since)
  }
  if (!g) return { stop: interrupted('exec-gate') }
  result.gate = { head: g.head, summary: g.summary }
  result.head = g.head
  if (g.stack && g.stack !== 'down') result.stack = g.stack
  for (const f of g.flaky) if (!result.flaky.some(x => x.test === f.test)) result.flaky.push(f)
  log(`${entry}: gate ${g.green ? 'green' : `red, ${g.failures.length} failure(s)`} at ${g.head}${g.flaky.length ? ` · flaky outside the diff: ${g.flaky.map(f => f.test).join(', ')}` : ''}`)
  return { g }
}

async function gateGreen(since) {
  let r = await gateOnce('Run the gate on the entry branch.', since)
  while (!r.stop && !r.g.green) {
    if (result.passes.gateFixes >= MAX_GATE_FIXES) return { stop: finish('parked', 'gate-red', `still red on code after ${MAX_GATE_FIXES} gate-fix passes`) }
    result.passes.gateFixes++
    const items = r.g.failures.filter(f => f.cause === 'code').map((f, i) => ({ id: `g${gateN}.${i + 1}`, title: `${f.command} red`, where: f.where, fix: 'turn it green in the product code; never loosen the test', proof: f.output, side: f.side }))
    const stop = await buildPass('Mode: gate-fix. The gate is red; the failures, quoted:', items, 'gate-fix')
    if (stop) return { stop }
    r = await gateOnce('Run the gate on the entry branch after the fix.', since)
  }
  return r
}

// ---------- the check ----------

function qaSeats(surface) {
  const asked = qaMode()
  const front = asked === 'surface' && surface.screen && screenChange !== 'visual'
  const back = asked === 'backend' || (asked === 'surface' && (surface.api || surface.runtime || surface.sensitive))
  result.qa = {
    frontend: front ? 'run' : 'skipped',
    backend: back ? 'run' : 'skipped',
    why: asked === 'none' ? 'no QA for this entry'
      : [front ? 'screen behaviour changed' : surface.screen ? 'only a visual change on screen' : 'no screen changed',
         back ? 'the API, data or permissions changed' : 'no API, data or permission change'].join('; '),
  }
  log(`${entry}: qa-frontend ${result.qa.frontend}, qa-backend ${result.qa.backend} (${result.qa.why})`)
  return [...(front ? ['qa-frontend'] : []), ...(back ? ['qa-backend'] : [])]
}

const blocks = (f) => f.severity === 'blocks' && said(f.proof) !== '' &&
  (!contractCommit || f.basis === 'security') && f.level >= MIN_LEVEL[f.basis]

function checkPrompt(name, kind, since, own, diffCmd) {
  const diff = diffCmd ?? (kind === 'delta' ? `git diff ${since} HEAD` : `git diff ${args?.base}...HEAD`)
  const scope = kind === 'delta'
    ? `\nThis is a delta. ${own.length ? `Re-check only your items below; return the closed ids in \`closed\`, an open one again as a finding with its id in the title:\n${own.map(itemText).join('\n')}` : 'Read only this delta: a fix pass changed tests or gate files; block only if it weakens a proof or the gate.'}`
    : ''
  const fix = mode === 'fix' ? '\nThis is a fix entry.' : ''
  const files = name === 'reviewer' && result.outsideOwns.length ? `\nFiles changed outside the brief's Owns (read them whole): ${result.outsideOwns.map(o => `${o.path} (${o.why})`).join('; ')}` : ''
  const stack = name.startsWith('qa-') ? `\nThe running stack: ${result.stack ?? '(not up)'}` : ''
  return `Entry ${entry}${contractCommit ? ' (the contract commit: only a security hole blocks)' : ''}. ${kind === 'delta' ? 'Delta' : 'Check'}.
${where}
${sources}
The diff: \`${diff}\` in the worktree.${files}${stack}${fix}${scope}`
}

async function check(seats, kind, since, ownBySeat = {}, diffCmd = null) {
  phase(kind === 'delta' ? 'Delta' : 'Check')
  const outs = await parallel(seats.map(name => () =>
    call(name, checkPrompt(name, kind, since, ownBySeat[name] ?? [], diffCmd), { label: `${name}·${entry}·${kind}`, phase: kind === 'delta' ? 'Delta' : 'Check', schema: REVIEW })))
  const missing = seats.filter((_, i) => !outs[i])
  if (missing.length) return { stop: interrupted(missing.join(', ')) }
  const blocking = []
  seats.forEach((name, i) => {
    const items = outs[i].findings.map((f, k) => ({ id: `${name}#${kind}.${k + 1}`, agent: name, ...f }))
    const notes = items.filter(f => !blocks(f))
    if (said(outs[i].inconclusive)) result.inconclusive.push({ seat: name, why: said(outs[i].inconclusive) })
    blocking.push(...items.filter(blocks))
    if (notes.length > NOTES_PER_SEAT) log(`${entry}: ${name} gave ${notes.length} notes; the first ${NOTES_PER_SEAT} kept`)
    result.notes.push(...notes.slice(0, NOTES_PER_SEAT))
  })
  log(`${entry}: ${kind} by ${seats.join(' ∥ ')}: ${blocking.length} blocking, ${result.notes.length} note(s) so far`)
  return { blocking }
}

const touchesProofOrGate = (paths) => paths.some(p => TEST_FILE.test(p) || gatePaths.some(g => p === g || p.startsWith(g.replace(/\*+$/, ''))))

async function checkAndFix(seats) {
  const first = await check(seats, 'whole')
  if (first.stop) return first.stop
  if (!first.blocking.length) return ready()
  return fixAndDelta(first.blocking)
}

async function fixAndDelta(blocking) {
  result.blocking = blocking
  if (result.passes.reviewFixes >= MAX_REVIEW_FIXES) return finish('parked', 'round-cap', `${blocking.length} blocking item(s), no fix pass left`)
  result.passes.reviewFixes++
  const since = result.head
  result.since = since
  const stop = await buildPass('Mode: fix. Apply every blocking item below, its proof red first where it has one; one `applied` per id.', blocking, 'fix')
  if (stop) return stop
  const gate = await gateGreen(since)
  if (gate.stop) return gate.stop
  return delta(blocking, since, gate.g.changed)
}

async function delta(items, since, changed, diffCmd = null) {
  const own = {}
  items.forEach(i => (own[i.agent] ??= []).push(i))
  if (touchesProofOrGate(changed) && !own.reviewer) own.reviewer = []
  const seats = Object.keys(own)
  if (!seats.length) return ready()
  const d = await check(seats, 'delta', since, own, diffCmd)
  if (d.stop) return d.stop
  result.blocking = d.blocking
  return d.blocking.length ? finish('parked', 'round-cap', `${d.blocking.length} item(s) still blocking after the fix`) : ready()
}

// ---------- the modes ----------

async function build() {
  const stop = await buildPass(contractCommit ? 'Mode: build the contract commit.' : 'Mode: build.', [], 'build')
  if (stop) return stop
  const gate = await gateGreen(null)
  if (gate.stop) return gate.stop
  return checkAndFix(['reviewer', ...qaSeats(gate.g.surface)])
}

async function fix() {
  const stop = await buildPass('Mode: fix entry. The brief lists what to change; the smallest change, with the proof its AC needs.', [], 'build')
  if (stop) return stop
  const gate = await gateGreen(null)
  if (gate.stop) return gate.stop
  return checkAndFix(['reviewer', ...qaSeats(gate.g.surface)])
}

async function update() {
  const stop = await buildPass(`Mode: update. Merge ${args?.base} into ${args?.branch} (\`git merge --no-ff ${args?.base}\`, never a rebase), resolve every conflict keeping both intents, commit the merge.`, [], 'update')
  if (stop) return stop
  const since = result.head
  const gate = await gateGreen(null)
  if (gate.stop) return gate.stop
  const resolution = { id: 'merge', agent: 'reviewer', title: 'the conflict resolution', fix: 'both intents kept, nothing of the base dropped', where: '', proof: '' }
  return delta([resolution], since, gate.g.changed, `git show --cc ${since}\` and \`git diff ${since} HEAD`)
}

async function resume() {
  const r = args?.resume ?? {}
  log(`${entry}: resuming from ${r.head ?? '?'}, check ${r.check ?? 'whole'}`)
  if (r.fixesFile) {
    const stop = await buildPass(`Mode: fix. Apply every item in ${r.fixesFile} (its \`fixes\`: id, fix, proof); one \`applied\` per id.`, [], 'resume')
    if (stop) return stop
  }
  const gate = await gateGreen(r.head ?? null)
  if (gate.stop) return gate.stop
  if (r.check === 'delta') {
    const items = Array.isArray(r.items) ? r.items : []
    return delta(items.length ? items : [{ id: 'resume', agent: 'reviewer', title: 'the resumed change', fix: '', where: '', proof: '' }], r.head, gate.g.changed)
  }
  return checkAndFix(['reviewer', ...qaSeats(gate.g.surface)])
}

log(`${entry}: ${mode}${contractCommit ? ' (contract commit)' : ''} · sides ${sides.join(' ∥ ')}`)
return { build, fix, update, resume }[mode]()
