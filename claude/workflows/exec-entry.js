/*
 * exec-entry.js — one entry of a stage-4 plan as deterministic code:
 * build, gate, review ∥ QA, at most one review fix pass, the delta.
 *
 * Why a workflow: "no code enters without review" must be physical, and
 * so must the budget. Every commit that reaches the entry branch passes
 * the gate and agents that never wrote it, and an entry never loops: one
 * review fix pass at most, and at most two gate-fix passes, then it is
 * ready or it parks. The session that runs stage 4 starts one run per entry, in
 * parallel up to the cap, and merges only what comes back ready, through
 * its local-CI queue.
 *
 * Done means the brief's ACs are implemented and the gate is green.
 * Nothing else blocks.
 *
 * THE FLOW (mode 'build'):
 *   1. build    builder (Opus 5.5, medium) writes the code and the tests
 *               for the entry's ACs, running only the fast checks (types,
 *               lint, unit tests) while it builds; never the journeys.
 *               With args.contract (the brief carries a Contract section:
 *               routes, request and response JSON, error cases), two
 *               builders run in parallel, side 'back' and side 'front', in
 *               the same worktree, each against the contract. Without it,
 *               one builder does both sides. A file outside the brief's
 *               Owns is allowed: the builder lists it in `outsideOwns` and
 *               the reviewer reads it. `blocked` is only for a true
 *               impossibility (a missing secret, a contradiction in the
 *               plan); `questions` only for what needs the user in person.
 *   2. gate     exec-gate (Sonnet 5.5, low) runs the gate commands once (the
 *               fast check and the affected journeys): the only place the
 *               suites run. Green or red, each failure `code` or `machine`.
 *               A red only the machine caused never goes to a builder: the
 *               gate waits for the load (at most 10 min, under
 *               loadThreshold, nproc by default) and runs again, at most
 *               twice, then 'parked' (machine). A code red → a gate-fix pass.
 *               Green on a screen or API surface: the gate brings the
 *               stack up for the QAs.
 *   3. check    in parallel over the entry diff: reviewer (Opus 5.5, high)
 *               always ∥ qa-frontend (Opus 5.5, medium) when the screen
 *               changed ∥ qa-backend (Opus 5.5, medium) when the API or the
 *               data changed.
 *   4. triage   mechanical: a finding blocks only when the agent marked it
 *               `blocking`, its basis is one of `ac` (an AC not met), `bug`
 *               (a concrete reproduction), `security` (a hole) or `rule` (a
 *               written rule of the project broken), and its `proof` is not
 *               empty. Everything else is a note: notes go to the entry's
 *               notes.md and the PR body, never to another pass.
 *   5. fix      one review fix pass of the builder(s) (medium) with every
 *               blocking item, then the gate, then the delta: only the
 *               agents that raised blocking items re-check those items.
 *               Still blocking → 'parked' (round-cap).
 *
 * THE BUDGET. A builder pass that fixes a code-red gate is part of
 * building: it does not consume the review fix pass. The hard bound is
 * MAX_GATE_FIXES (2) gate-fix passes per run: the gate still red on code
 * after them → 'parked' (gate-red). The gate after the review fix pass
 * may take one gate-fix too, under the same run-wide bound. The review
 * fix pass is the one counted: maxPasses - 1 of them (one by default).
 *
 * THE FLOW (mode 'update'): the session merges a moved base into the entry
 * branch itself and calls this mode only on a conflict. The gate tries the
 * merge (never a rebase); a clean merge runs the gate and returns. A
 * conflict is resolved by the builder (one pass), the gate runs, and the
 * reviewer reads the resolution; one review fix pass at most, as above.
 *
 * THE FLOW (mode 'resume'): a parked run continues. args.resume names the
 * parked head, the passes the run already used (passesUsed, and the
 * parked return's reviewFixes and gateFixes), an optional fixes file
 * the builder applies (the user's answer, the session's reading of a
 * blocked builder; it does not count against the budget), and the check
 * to run after the gate: 'whole' (the run parked before its check),
 * 'delta' (resume.items, the parked run's blocking items, re-checked by
 * the agents that raised them) or 'none'.
 *
 * TIMES. A workflow has no clock: every agent stamps `started` and `ended`
 * (UTC, from `date -u`), and the run returns `steps`, one line per agent
 * call with its minutes. The target is 30–60 minutes per entry.
 *
 * MODELS. Builders at medium (on mergeable-without-edits work Opus 5.5
 * peaks at medium and edits out of scope above it); the fix pass too. The
 * reviewer at high: one reader carries the whole closed scope. The QAs at
 * medium: they drive the app. The gate runs commands and reads logs:
 * Sonnet 5.5, low. Source: docs/models.md.
 *
 * PACKS. Each registered agent preloads its packs through `skills:`; with
 * args.packsDir the prompt also names each pack's SKILL.md (PACKS below),
 * which is how inline agents get them.
 *
 * RUNNING UNREGISTERED AGENTS: with args.inlineAgents, agent() is called
 * without agentType; the prompt points at <agentsDir>/<name>.md and the
 * model and effort come from the AGENTS map below.
 *
 * THE ARGS CARRY PATHS, NOT TEXT. Every instruction lives in the agent
 * definitions.
 *
 * Invoked by the stage-execute session:
 *   Workflow({ scriptPath: '<...>/workflows/exec-entry.js', args: {
 *     mode:            'build' | 'update' | 'resume',
 *     entry:           'E-03',
 *     briefPath:       '/abs/.../02-plan/briefs/E-03.md',
 *     contract:        true,                               // the brief carries a Contract section: two builders
 *     designDir:       '/abs/.../01-design',
 *     discoveryDir:    '/abs/.../00-discovery',            // the locked mock's journeys
 *     reconDir:        '/abs/.../02-plan/recon',
 *     doctrineDir:     '/abs/.../docs/engineering',
 *     goldenPathsPath: '/abs/.../docs/engineering/golden-paths.md',
 *     fastChecks:      ['make check'],                     // the builder's loop: types, lint, unit tests
 *     gateCommands:    ['make check', 'make test-affected base=feat/<slug>'],
 *     rulingsPath:     '/abs/.../rulings.md',
 *     agentsDir:       '/abs/.../agents',
 *     packsDir:        '/abs/.../skills',
 *     evidenceDir:     '/abs/.../03-execution/entries/E-03',
 *     worktree:        '/abs/.../.worktrees/<slug>-E-03',
 *     branch:          'story/<slug>/E-03',
 *     base:            'feat/<slug>',
 *     trailer:         'the attribution trailer for commits, verbatim',
 *     maxPasses:       2,
 *     loadThreshold:   8,                                  // optional (default: nproc)
 *     inlineAgents:    false,
 *     priorRuns:       ['/abs/.../entries/E-03/run-1.json'],
 *     resume:          { head: '<sha>', passesUsed: 1, reviewFixes: 0, gateFixes: 0, fixesFile: '/abs/.../fixes-2.json', check: 'whole' | 'delta' | 'none',
 *                        items: [{ id, agent, title, fix, proof }] },   // 'resume' only; items for 'delta'
 *   }})
 *
 * Returns { entry, mode, status, reason, head, passes, reviewFixes,
 * gateFixes, steps, rounds,
 * tally, notes, outsideOwns, decided, choices, questions, blocked, gate,
 * stack } — status is 'ready' | 'parked' | 'blocked' | 'interrupted' (an
 * agent returned nothing: the session relaunches by the run id); reason,
 * when parked, is 'user' | 'gate-red' | 'round-cap' | 'machine'.
 */

export const meta = {
  name: 'exec-entry',
  description: 'Stage-4 entry: one builder (two in parallel when the brief fixes the contract), the gate as the only place the suites run, the reviewer in parallel with the QAs of the surface, a mechanical triage, at most one review fix pass (gate-fix passes apart, two at most) and a delta by the agents that blocked',
  phases: [
    { title: 'Build', detail: 'builder (Opus 5.5, medium): the code and the tests for the ACs, fast checks only; back ∥ front when the brief carries a Contract', model: 'opus' },
    { title: 'Gate', detail: 'exec-gate (Sonnet 5.5, low): the gate commands once, each failure code or machine; a machine red runs again after a load wait', model: 'sonnet' },
    { title: 'Check', detail: 'reviewer (Opus 5.5, high) ∥ qa-frontend (Opus 5.5, medium) on screens ∥ qa-backend (Opus 5.5, medium) on API and data', model: 'opus' },
    { title: 'Fix', detail: 'builder (Opus 5.5, medium): a gate-fix pass on a code red (two at most), or the one review fix pass over the blocking items', model: 'opus' },
    { title: 'Delta', detail: 'only the agents that raised blocking items, over those items', model: 'opus' },
  ],
}

// name → model and effort, as in each definition's frontmatter (used when the agents run inline).
const AGENTS = {
  builder: { model: 'opus', effort: 'medium' },
  'exec-gate': { model: 'sonnet', effort: 'low' },
  reviewer: { model: 'opus', effort: 'high' },
  'qa-frontend': { model: 'opus', effort: 'medium' },
  'qa-backend': { model: 'opus', effort: 'medium' },
}
// name → the knowledge packs it reads, as in each definition's `skills:`.
const PACKS = {
  builder: ['pack-go-backend', 'pack-react-frontend', 'pack-design-taste', 'pack-motion-3d', 'pack-ops'],
  reviewer: ['pack-go-backend', 'pack-react-frontend', 'pack-ops'],
  'qa-frontend': ['pack-react-frontend'],
  'qa-backend': ['pack-go-backend'],
}
const BUILDER = 'builder'
const GATE = 'exec-gate'
const REVIEWER = 'reviewer'
const QA_FRONT = 'qa-frontend'
const QA_BACK = 'qa-backend'
const BLOCKING_BASES = ['ac', 'bug', 'security', 'rule']

// ---------- schemas ----------

const str = { type: 'string' }
const strs = { type: 'array', items: str }
const obj = (props, required = Object.keys(props)) => ({ type: 'object', additionalProperties: false, required, properties: props })
const STAMP = { started: { type: 'string', description: 'UTC when you began, from `date -u +%FT%TZ`' }, ended: { type: 'string', description: 'UTC when you finished, from `date -u +%FT%TZ`' } }
const SIDE = { type: 'string', enum: ['back', 'front', 'both'] }

const QUESTION = obj({ question: str, context: str, options: strs, pick: str })

const BUILD = obj({
  branch: str,
  head: str,
  commits: { type: 'array', description: 'the commits of this turn only; empty when you changed nothing', items: obj({ sha: str, message: str }) },
  checks: { type: 'array', description: 'one per fast check, in order', items: obj({ command: str, lastLine: str, green: { type: 'boolean' } }) },
  tests: { type: 'array', description: 'one per AC: the test that proves it', items: obj({ ac: str, test: str }) },
  files: strs,
  outsideOwns: { type: 'array', description: 'every file you changed outside the brief\'s Owns and Extends, with why', items: obj({ path: str, why: str }) },
  reused: strs,
  choices: strs,
  decided: { type: 'array', items: obj({ question: str, pick: str, reason: str }) },
  questions: { type: 'array', description: 'only what needs the user in person', items: QUESTION },
  blocked: { type: 'string', description: 'only a true impossibility: a missing secret, a contradiction in the plan; empty otherwise' },
  applied: { type: 'array', items: obj({ id: str, commit: str, why: str }) },
  ...STAMP,
})

const GATE_REPORT = obj({
  green: { type: 'boolean' },
  head: str,
  summary: str,
  checks: { type: 'array', items: obj({ name: str, green: { type: 'boolean' }, lastLine: str }) },
  failures: { type: 'array', items: obj({ check: str, where: str, output: str, cause: { type: 'string', enum: ['code', 'machine'] }, side: SIDE, load: { type: 'string', description: 'the 1-min load from /proc/loadavg when the failing command ended, and nproc ("34.2 · nproc 8"); for an infrastructure flake, the output line that names it' } }) },
  load: { type: 'string', description: 'nproc and the 1-min load when the gate started and ended; the wait line when a load wait was asked' },
  stack: { type: 'string', description: 'the URLs and actors when the stack is up, never a token; "down" otherwise' },
  conflicts: strs,
  surface: obj({ api: { type: 'boolean' }, screen: { type: 'boolean' }, runtime: { type: 'boolean' }, paths: strs }),
  ...STAMP,
})

const FINDING = obj({
  severity: { type: 'string', enum: ['blocking', 'note'] },
  basis: { type: 'string', enum: ['ac', 'bug', 'security', 'rule', 'other'], description: 'ac: an AC not met · bug: a concrete reproduction · security: a hole · rule: a written rule of the project broken · other: anything else (always a note)' },
  title: str,
  where: { type: 'string', description: 'file:line, the route, or the screen and its state' },
  says: str,
  fix: str,
  proof: { type: 'string', description: 'ac: the AC id and what the code does instead · bug and security: the steps or the command and what they showed · rule: path:line and the sentence quoted; empty when none' },
  side: SIDE,
})

const REVIEW = obj({
  verified: strs,
  findings: { type: 'array', items: FINDING },
  closed: { type: 'array', description: 'in a delta: the ids of your items now closed', items: str },
  ...STAMP,
})

// ---------- the run's state ----------

const mode = ['update', 'rebase'].includes(args?.mode) ? 'update' : args?.mode === 'resume' ? 'resume' : 'build'
const resume = mode === 'resume' ? args?.resume ?? {} : null
const entry = args?.entry ?? '?'
const maxPasses = Math.max(1, args?.maxPasses ?? 2)
const twoBuilders = args?.contract === true && mode === 'build'
const inline = args?.inlineAgents === true
const priorRuns = Array.isArray(args?.priorRuns) ? args.priorRuns : []
const gateCommands = Array.isArray(args?.gateCommands) ? args.gateCommands : []
const fastChecks = Array.isArray(args?.fastChecks) && args.fastChecks.length ? args.fastChecks : gateCommands.slice(0, 1)
const agentsDir = args?.agentsDir
const loadThreshold = Number(args?.loadThreshold) > 0 ? Number(args.loadThreshold) : null
const MACHINE_RERUNS = 2
const MAX_GATE_FIXES = 2
if (!gateCommands.length) log(`${entry}: no gateCommands given — the gate has nothing to run`)

const result = {
  entry, mode, status: 'parked', reason: null, head: null, passes: resume ? Number(resume.passesUsed) || 0 : 0,
  // The review fix passes and the gate-fix passes used; a resume without them reads the old count (one pass past the build = the fix used).
  reviewFixes: resume ? Number(resume.reviewFixes ?? Math.min(1, Math.max(0, (Number(resume.passesUsed) || 0) - 1))) || 0 : 0,
  gateFixes: resume ? Number(resume.gateFixes) || 0 : 0,
  steps: [], rounds: [], tally: {}, notes: [], outsideOwns: [], decided: [], choices: [], questions: [], blocked: null, gate: null, stack: null,
}

const interrupted = (what) => { result.status = 'interrupted'; result.reason = 'interrupted'; log(`${entry}: ${what} returned nothing — interrupted; relaunch by resumeFromRunId`); return result }
const park = (reason, what) => { result.status = 'parked'; result.reason = reason; log(`${entry}: ${what} — parked (${reason})`); return result }

// The minutes between two `date -u` stamps; null when either is missing or unreadable.
const minutes = (a, b) => {
  const p = (s) => { const m = String(s ?? '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : NaN }
  const d = (p(b) - p(a)) / 60000
  return Number.isFinite(d) && d >= 0 ? Math.round(d * 10) / 10 : null
}
const stamp = (label, out) => {
  if (!out) return out
  const m = minutes(out.started, out.ended)
  result.steps.push({ step: label, started: out.started ?? null, ended: out.ended ?? null, minutes: m })
  log(`${entry}: ${label} took ${m ?? '?'} min`)
  return out
}

const packsText = (name) => args?.packsDir && PACKS[name]?.length
  ? `\nYour knowledge packs (read each one whose content is not already in your context, before you work):\n${PACKS[name].map(p => `- ${args.packsDir}/${p}/SKILL.md`).join('\n')}`
  : ''

// One call shape for registered and inline agents; every return is stamped.
const call = (name, prompt, opts) => {
  const def = AGENTS[name]
  const stampLine = '\nStamp `started` and `ended` with `date -u +%FT%TZ` when you begin and when you finish.'
  const run = inline
    ? agent(`Your instructions are the file ${agentsDir}/${name}.md (read it first and follow it; its frontmatter's model/effort are already applied).${packsText(name)}

${prompt}${stampLine}`, { ...opts, model: def.model, effort: def.effort })
    : agent(`${prompt}${packsText(name)}${stampLine}`, { ...opts, agentType: name })
  return run.then(out => stamp(opts.label, out))
}

const docs = `Brief: ${args?.briefPath}
Design (notes.md is the law): ${args?.designDir}
Discovery journeys: ${args?.discoveryDir ? `${args.discoveryDir}/journeys` : '(none given)'}
Recon: ${args?.reconDir}
Engineering doctrine of the project: ${args?.doctrineDir}
Golden paths: ${args?.goldenPathsPath}
Rulings of the workstream (not reopened): ${args?.rulingsPath}
Evidence folder of this entry: ${args?.evidenceDir}${priorRuns.length ? `
Earlier runs of this entry (their returns): ${priorRuns.join(', ')}` : ''}`
const where = `Worktree: ${args?.worktree} · branch ${args?.branch} · base ${args?.base}`
const trailer = `Attribution trailer for every commit, verbatim:\n${args?.trailer ?? '(none given)'}`

// ---------- the builder ----------

const sideText = (side) => side === 'both'
  ? 'Side: both — you build the back and the front.'
  : `Side: ${side} — you build only the ${side === 'back' ? 'server' : 'screen'} side, against the brief's Contract section; the other side is built by another builder at the same time in this worktree. Commit only your side's paths (\`git add -- <paths>\`, never \`git add -A\`); never stash, reset or check out; if git reports an index lock, wait a few seconds and retry.`

const builder = (task, side, label, phaseName) => call(BUILDER, `${task}
${sideText(side)}
${where}
${docs}
The fast checks — green on your final head before you end your turn (never the journeys: the gate runs them):
${fastChecks.map((c, i) => `${i + 1}. ${c}`).join('\n') || '(none given)'}
${trailer}`, { label: `${BUILDER}·${entry}·${label}${side === 'both' ? '' : `·${side}`}`, phase: phaseName, schema: BUILD })

// Absorbs builder returns: stops the run on a true impossibility or a question for the user.
const absorb = (outs, who) => {
  if (outs.some(b => !b)) return interrupted(who)
  for (const b of outs) {
    b.decided.forEach(d => result.decided.push(d))
    b.choices.forEach(c => result.choices.push(c))
    b.outsideOwns.forEach(o => result.outsideOwns.push(o))
  }
  const head = outs.at(-1).head
  const blocked = outs.map(b => b.blocked).filter(s => s && s.trim())
  if (blocked.length) { result.status = 'blocked'; result.reason = 'blocked'; result.blocked = blocked.join(' · '); result.head = head; log(`${entry}: the builder is blocked: ${result.blocked}`); return result }
  const questions = outs.flatMap(b => b.questions)
  if (questions.length) { result.questions = questions.map(q => ({ to: 'user', ...q })); result.head = head; return park('user', `${questions.length} question(s) only the user can answer`) }
  const red = outs.flatMap(b => b.checks.filter(c => !c.green).map(c => c.command))
  const outside = outs.flatMap(b => b.outsideOwns.map(o => o.path))
  log(`${entry}: ${who} returned ${head}: ${outs.reduce((n, b) => n + b.commits.length, 0)} commit(s); fast checks ${red.length ? `red on ${red.join(', ')}` : 'green'}${outside.length ? `; outside Owns: ${outside.join(', ')}` : ''}`)
  return null
}

// One builder pass: two builders by side when the run has two and the items split cleanly, else one.
const pass = async (task, items, label) => {
  result.passes++
  phase(label === 'build' ? 'Build' : 'Fix')
  const sides = !twoBuilders ? ['both']
    : label === 'build' ? ['back', 'front']
    : items.every(i => i.side === 'back' || i.side === 'front') && new Set(items.map(i => i.side)).size === 2 ? ['back', 'front']
    : ['both']
  const list = (side) => items.filter(i => side === 'both' || i.side === side)
  const text = (side) => items.length ? `${task}\n${list(side).map(i => `- ${i.id} (${i.agent}): ${i.title} — ${i.fix}${i.where ? `\n  where: ${i.where}` : ''}${(i.proof ?? '').trim() ? `\n  proof: ${i.proof}` : ''}`).join('\n')}` : task
  const outs = await parallel(sides.map(side => () => builder(text(side), side, label, label === 'build' ? 'Build' : 'Fix')))
  log(`${entry}: builder pass ${result.passes} (${label}; review fixes ${result.reviewFixes}/${maxPasses - 1}, gate fixes ${result.gateFixes}/${MAX_GATE_FIXES}; ${sides.length === 2 ? 'back ∥ front' : 'one builder'})`)
  return absorb(outs, `the builder (${label})`)
}

// ---------- the gate ----------

const loadWait = () => {
  const t = loadThreshold ?? '$(nproc)'
  return `First wait for the load (this is the one wait you are asked for): until the 1-min load average is under ${loadThreshold ?? 'the core count (nproc)'}, at most 10 minutes. Run exactly this, with the Bash tool's timeout at 600000 ms:
timeout 590 bash -c 'until awk -v t="${t}" "{ exit !(\\$1 + 0 < t + 0) }" /proc/loadavg; do sleep 15; done'; echo "wait exit $? · load $(cut -d' ' -f1-3 /proc/loadavg) · nproc $(nproc) · threshold ${t}"
Put its last line in \`load\`. Exit 0: the load is under the threshold. Exit 124: ten minutes passed above it; run the gate anyway.`
}
const onlyMachine = (g) => Boolean(g && !g.green && !g.conflicts.length && g.failures.length && g.failures.every(f => f.cause === 'machine'))
const machineList = (g) => g.failures.filter(f => f.cause === 'machine').map(f => `${f.check} at ${f.where}${f.load ? ` (load ${f.load})` : ''}`).join('; ')

let gateN = 0
const runGate = (task, label) => call(GATE, `Entry ${entry}. ${task}
${where}
The gate commands, in order, each run once:
${gateCommands.map((c, i) => `${i + 1}. ${c}`).join('\n') || '(none given)'}${loadThreshold ? `
Load threshold (a timeout at or above it reads as the machine): ${loadThreshold}` : ''}
When green and the surface has api or screen, bring the stack up on this head (rebuilt when the head changed) and leave it up for the QAs.
Doctrine (its local-development document names the stack and env commands): ${args?.doctrineDir}`, { label: `${GATE}·${entry}·${label}`, phase: 'Gate', schema: GATE_REPORT })

// The gate once, with the machine re-runs. Returns the report, or { stop }.
const gateOnce = async (task) => {
  const label = `g${++gateN}`
  let g = await runGate(task, label)
  for (let w = 0; onlyMachine(g);) {
    if (w >= MACHINE_RERUNS) { result.gate = g; result.head = g.head; return { stop: park('machine', `the gate is still red only for the machine after ${w} load wait(s) — load ${g.load || '?'}, threshold ${loadThreshold ?? 'nproc'}: ${machineList(g)}`) } }
    w++
    log(`${entry}: gate red only for the machine (${machineList(g)}; load ${g.load || '?'}) — no builder; the gate waits for the load and runs again (${w}/${MACHINE_RERUNS})`)
    g = await runGate(`${loadWait()}\nThen run the gate again on the entry branch; nothing changed since its last run.`, `${label}-wait${w}`)
  }
  if (!g) return { stop: interrupted('the gate') }
  result.gate = g; result.head = g.head; result.stack = g.stack
  log(`${entry}: gate ${g.green ? 'green' : `red (${g.failures.length} failure(s))`} at ${g.head}`)
  return { g }
}

// The gate after a builder pass; a code red gets a gate-fix pass, outside the review
// budget, up to `allowed` here and MAX_GATE_FIXES in the whole run. Returns { g } green, or { stop }.
const gateGreen = async (task, allowed = MAX_GATE_FIXES) => {
  let r = await gateOnce(task)
  for (let k = 0; ; k++) {
    if (r.stop) return r
    if (r.g.green) return r
    if (r.g.conflicts.length) { result.head = r.g.head; return { stop: park('gate-red', `the merge still conflicts: ${r.g.conflicts.join(', ')}`) } }
    if (k >= allowed || result.gateFixes >= MAX_GATE_FIXES) { result.head = r.g.head; return { stop: park('gate-red', `the gate is red on code after ${result.gateFixes} gate-fix pass(es)`) } }
    result.gateFixes++
    const machine = r.g.failures.filter(f => f.cause === 'machine')
    const items = r.g.failures.filter(f => f.cause !== 'machine').map((f, i) => ({ id: `gate-${gateN}#${i + 1}`, agent: GATE, title: `${f.check} red`, where: f.where, fix: 'turn it green in the product code', proof: f.output, side: f.side }))
    const stop = await pass(`Mode: fix. Entry ${entry}. Turn the gate green; the failures, quoted:${machine.length ? `\n(Not yours, the machine's, re-run by the gate: ${machineList(r.g)})` : ''}`, items, 'gate-fix')
    if (stop) return { stop }
    r = await gateOnce(`${machine.length ? `${loadWait()}\n` : ''}Run the gate on the entry branch after the builder's fix.`)
  }
}

// ---------- the check and the triage ----------

const blocks = (f) => f.severity === 'blocking' && BLOCKING_BASES.includes(f.basis) && Boolean((f.proof ?? '').trim())
const tallyOf = (name) => result.tally[name] ?? (result.tally[name] = { found: 0, blocking: 0, notes: 0, downgraded: 0, closed: 0 })

const check = async ({ round, kind, seats, since, own }) => {
  const diffCmd = kind === 'delta'
    ? `git diff $(git merge-tree --write-tree ${since} ${args?.base} | head -1) ${args?.branch}`
    : `git diff ${args?.base}...${args?.branch}`
  const ownText = (name) => kind === 'delta' ? `
THIS IS A DELTA. Re-check only your own blocking items below, over the delta; return the closed ones in \`closed\`, and any still open again as a finding with its id in the title. Nothing else:
${(own[name] ?? []).map(i => `- ${i.id}: ${i.title} — ${i.fix}${(i.proof ?? '').trim() ? `\n  proof: ${i.proof}` : ''}`).join('\n')}` : ''
  const outsideText = result.outsideOwns.length ? `\nFiles the builder changed outside the brief's Owns (read them): ${result.outsideOwns.map(o => `${o.path} (${o.why})`).join('; ')}` : ''
  const prompt = (name) => `Entry ${entry}. Check ${round} (${kind}).
${where}
${docs}
The diff: run \`${diffCmd}\` in the worktree.${name === REVIEWER ? outsideText : `\nThe running stack: ${result.stack ?? '(not given)'}`}${ownText(name)}`
  phase(kind === 'delta' ? 'Delta' : 'Check')
  log(`${entry} check ${round} (${kind}): ${seats.join(' ∥ ')}`)
  const outs = await parallel(seats.map(name => () => call(name, prompt(name), { label: `${name}·${entry}·r${round}`, phase: kind === 'delta' ? 'Delta' : 'Check', schema: REVIEW })))
  const missing = seats.filter((_, i) => !outs[i])
  if (missing.length) return { stop: interrupted(missing.join(', ')) }

  const blocking = []
  seats.forEach((name, i) => {
    const out = outs[i]
    const t = tallyOf(name)
    t.closed += out.closed.length
    out.findings.forEach((f, k) => {
      const item = { id: `${name}#r${round}.${k + 1}`, agent: name, ...f }
      t.found++
      if (blocks(f)) { blocking.push(item); t.blocking++ } else {
        if (f.severity === 'blocking') { t.downgraded++; log(`${entry}: ${item.id} marked blocking without a blocking basis and a proof — a note`) }
        result.notes.push({ round, ...item }); t.notes++
      }
    })
  })
  result.rounds.push({ round, kind, seats, blocking: blocking.map(b => ({ id: b.id, agent: b.agent, basis: b.basis, title: b.title })), notes: result.notes.filter(n => n.round === round).length })
  log(`${entry} check ${round}: ${blocking.length} blocking (${[...new Set(blocking.map(b => b.agent))].join(', ') || 'none'}), ${result.notes.filter(n => n.round === round).length} note(s)`)
  return { blocking }
}

// The check, then at most one review fix pass and its delta. Returns the final result.
const checkAndFix = async (first) => {
  let round = 1
  let c = await check({ round, ...first })
  if (c.stop) return c.stop
  if (!c.blocking.length) return ready()
  if (result.reviewFixes >= maxPasses - 1) { result.head = result.gate?.head ?? result.head; return park('round-cap', `${c.blocking.length} blocking item(s) and no review fix pass left (${result.reviewFixes}/${maxPasses - 1})`) }
  const since = result.head
  result.reviewFixes++
  const stop = await pass(`Mode: fix. Entry ${entry}. Apply every blocking item below, its proof red first where it has one, then green; return one \`applied\` entry per id.`, c.blocking, 'fix')
  if (stop) return stop
  const gr = await gateGreen('Run the gate on the entry branch after the fix.', 1)
  if (gr.stop) return gr.stop
  const own = {}
  c.blocking.forEach(i => (own[i.agent] ??= []).push(i))
  round++
  c = await check({ round, kind: 'delta', seats: Object.keys(own), since, own })
  if (c.stop) return c.stop
  if (c.blocking.length) return park('round-cap', `${c.blocking.length} item(s) still blocking after the fix pass`)
  return ready()
}

const ready = () => {
  result.status = 'ready'
  log(`${entry}: ready at ${result.head} after ${result.passes} builder pass(es), ${result.notes.length} note(s) for the PR`)
  return result
}

const seatsFor = (surface) => [REVIEWER, ...(surface.screen ? [QA_FRONT] : []), ...(surface.api || surface.runtime ? [QA_BACK] : [])]

// ---------- the run ----------

if (mode === 'update') {
  const r = await gateOnce(`Update ${args?.branch} with ${args?.base}: \`git merge --no-ff ${args?.base}\` on the entry branch, never a rebase, then push. On a conflict, \`git merge --abort\` and report the files. On a clean merge, run the gate.`)
  if (r.stop) return r.stop
  if (!r.g.conflicts.length) {
    if (!r.g.green) return park('gate-red', 'the gate is red after a clean merge of the base')
    log(`${entry}: clean merge of the base, the gate green`)
    return ready()
  }
  const since = r.g.head
  const stop = await pass(`Mode: fix. Entry ${entry}. In the worktree, merge ${args?.base} into ${args?.branch} (\`git merge --no-ff ${args?.base}\`) and resolve the conflicts in: ${r.g.conflicts.join(', ')}. Keep both intents; never drop the base's change. Commit the merge and push; never a rebase, never a force-push.`, [], 'merge')
  if (stop) return stop
  const gr = await gateGreen('Run the gate on the entry branch after the conflict resolution (no merge).')
  if (gr.stop) return gr.stop
  return await checkAndFix({ kind: 'delta', seats: [REVIEWER], since, own: { [REVIEWER]: [{ id: 'merge', title: 'the conflict resolution', fix: `both intents kept in ${r.g.conflicts.join(', ')}` }] } })
}

if (mode === 'resume') {
  log(`${entry}: resuming from ${resume.head ?? '?'} (${result.passes} pass(es) used), check ${resume.check ?? 'whole'}`)
  if (resume.fixesFile) {
    // The user's answer or the session's reading of a blocked builder: outside the budget (neither counter moves).
    const stop = await pass(`Mode: fix. Entry ${entry}. The items to apply are in ${resume.fixesFile} (its \`fixes\`: id, agent, fix, proof). Apply every one; return one \`applied\` entry per id.`, [], 'resume')
    if (stop) return stop
  }
  const gr = await gateGreen('Run the gate on the entry branch.')
  if (gr.stop) return gr.stop
  if (resume.check === 'none') return ready()
  if (resume.check === 'delta') {
    const items = Array.isArray(resume.items) ? resume.items : []
    const own = {}
    items.forEach(i => (own[i.agent] ??= []).push(i))
    const seats = Object.keys(own).filter(s => AGENTS[s] && s !== BUILDER && s !== GATE)
    return await checkAndFix({ kind: 'delta', seats: seats.length ? seats : [REVIEWER], since: resume.head, own })
  }
  return await checkAndFix({ kind: 'whole', seats: seatsFor(gr.g.surface), since: args?.base, own: {} })
}

// mode 'build'
const stop = await pass(`Mode: build. Entry ${entry}.`, [], 'build')
if (stop) return stop
const g0 = await gateGreen('Run the gate on the entry branch.')
if (g0.stop) return g0.stop
const surface = g0.g.surface ?? { api: true, screen: true, runtime: true, paths: [] }
log(`${entry}: surface ${['api', 'screen', 'runtime'].filter(k => surface[k]).join(' + ') || 'none (tests, tooling, build or docs only)'}`)
return await checkAndFix({ kind: 'whole', seats: seatsFor(surface), since: args?.base, own: {} })
