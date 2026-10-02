/*
 * exec-entry.js — one entry of a stage-4 plan as deterministic code (v9):
 * acceptance first, one builder under its gate, prove ∥ review, a
 * mechanical triage, one fix, a delta check.
 *
 * Why a workflow: "no code enters without review" must be physical.
 * Every commit that reaches the entry branch passes the gate commands
 * and then a verifier and reviewers that never wrote it. There is no
 * judge: a finding blocks by a rule written in code below
 * (references/judging.md is its prose). The session that runs stage 4
 * starts one run per entry, in parallel up to the measured cap, and
 * only merges what comes back ready.
 *
 * THE FLOW (mode 'build'):
 *   1. acceptance  verifier (Sonnet 5.5, high), author mode, writes the
 *                  entry's acceptance checks from the brief's acceptance
 *                  and proof lines (Playwright journeys for screens, Go
 *                  integration tests for the server, in the doctrine's
 *                  test layout), runs them on the base where they must
 *                  fail for the right reason, and commits them. From then
 *                  on they are read-only for the builder: the gate's
 *                  first check rejects any diff to them. Skipped when
 *                  args.acceptance names an earlier run's commit; redone
 *                  for the named checks only when args.acceptanceRevision
 *                  points at a ruling or an amendment that changes them.
 *   2. build       builder (Opus 5.5, medium), the single writer for back
 *                  and front, in the entry worktree: follows the golden
 *                  paths, reuses before it writes, keeps functions and
 *                  files small, and does not end its turn until the gate
 *                  commands are green. A shared file or an acceptance
 *                  check it must change stops the run: 'needs-amendment'.
 *                  What needs the user in person: 'parked' (user).
 *   3. gate        exec-gate (Sonnet 5.5, low): acceptance untouched, the
 *                  gate commands (the fast check, the affected tests, the
 *                  structure check), the surface (api/screen/runtime),
 *                  the stack up for the verifier. Red → the builder again,
 *                  up to maxGateFixes, then 'parked' (gate-red).
 *   4. check       in parallel, over the entry diff: verifier, prove mode
 *                  (the acceptance checks on the running stack, evidence,
 *                  the PII canary, the failure-mode block when the server
 *                  changed; PASS / FAIL / INCONCLUSIVE, INCONCLUSIVE =
 *                  FAIL) ∥ reviewer (Sonnet 5.5, high): correctness and
 *                  fidelity ∥ structure-reviewer (Opus 5.5, medium): the
 *                  golden paths, boundaries, duplication, size, tests of
 *                  behaviour ∥ exec-lens-security (Opus 5.5, medium):
 *                  every diff ∥ exec-lens-operations (Opus 5.5, medium):
 *                  when the server's product code or the runtime changed.
 *   5. triage      mechanical: a finding blocks when its severity is not
 *                  'detail' and it carries a repro or a written rule, or
 *                  when the verifier did not PASS; a non-detail without
 *                  proof → `deferred`; a detail → `learnLog`.
 *   6. fix         the same builder at effort high, once, applies every
 *                  blocking item → the gate → the delta: the verifier runs
 *                  the acceptance checks again, and only the reviewers that
 *                  blocked re-check their own items over the delta, under
 *                  the same triage. Still blocking → 'parked' (round-cap).
 *                  maxRounds = 2 counts the review and one delta.
 *   7. ready       the gate commands keep-going against the base, then the
 *                  record: the doctrine's evidence command on the head, the
 *                  evidence swept for tokens and redacted, the feature
 *                  map's pointers checked. A fix the ready gate needed is
 *                  checked by one delta of the whole panel; still blocking
 *                  → 'parked' (round-cap).
 *
 * THE FLOW (mode 'update'): the gate merges the moved base into the entry
 * branch — a merge, never a rebase — and runs the ready gate and the
 * record. A clean merge adds no authored code and the run returns. A
 * conflict is resolved by the builder, and the resolution is code: gate,
 * then the whole check over the entry diff, as in build mode.
 *
 * THE FLOW (mode 'resume'): a parked run continues without a new build
 * and without a whole review: the builder (effort high) applies the items
 * of resume.fixesFile (the session wrote them: the still-blocking items,
 * an answer of the user's, a gate diagnosis), the gate runs, and one delta
 * checks them: the verifier and the reviewers the items name.
 *
 * THE FLOW (mode 'batch'): a finishing slice of the deferred register. The
 * builder applies the lines in batchPath; the gate; then only the verifier
 * and structure-reviewer check it (it opens no new review); one fix and
 * one delta, as above.
 *
 * RUNNING UNREGISTERED AGENTS: with args.inlineAgents, agent() is called
 * without agentType; the prompt starts by pointing at <agentsDir>/<name>.md
 * and the model and effort come from the AGENTS map below.
 *
 * THE ARGS CARRY PATHS, NOT TEXT. The prompts below carry inputs only;
 * every instruction lives in the agent definitions.
 *
 * Invoked by the stage-execute session:
 *   Workflow({ scriptPath: '<...>/workflows/exec-entry.js', args: {
 *     mode:            'build' | 'update' | 'resume' | 'batch',
 *     entry:           'E-03',
 *     briefPath:       '/abs/.../02-plan/briefs/E-03.md',   // batch: the slice's brief
 *     designDir:       '/abs/.../01-design',
 *     reconDir:        '/abs/.../02-plan/recon',
 *     doctrineDir:     '/abs/.../docs/engineering',
 *     goldenPathsPath: '/abs/.../docs/engineering/golden-paths.md',
 *     gateCommands:    ['make check', 'make test-affected base=feat/<slug>', 'make structure'],
 *     rulingsPath:     '/abs/.../rulings.md',
 *     judgingPath:     '/abs/.../stage-execute/references/judging.md',
 *     agentsDir:       '/abs/.../agents',
 *     evidenceDir:     '/abs/.../03-execution/entries/E-03',
 *     worktree:        '/abs/.../.worktrees/<slug>-E-03',
 *     branch:          'story/<slug>/E-03',
 *     base:            'feat/<slug>',
 *     trailer:         'the attribution trailer for commits, verbatim',
 *     maxRounds:       2,
 *     maxGateFixes:    3,
 *     inlineAgents:    false,
 *     priorRuns:       ['/abs/.../entries/E-03/run-1.json'],
 *     acceptance:      { commit: '<sha>', files: ['...'] },  // from an earlier run; omitted on a fresh build
 *     acceptanceRevision: '/abs/.../amendments/F.2.md',    // only when a ruling changes named checks
 *     resume:          { fixesFile: '/abs/.../E-03/fixes-2.json', head: '<parked head sha>', reviewers: ['reviewer'] },  // 'resume' only; reviewers: whose items the file carries
 *     batchPath:       '/abs/.../03-execution/batch-X.1.md',  // 'batch' only
 *   }})
 *
 * Returns { entry, mode, status, reason, head, acceptance, verdicts,
 * rounds, precision, questions, amendment, gate, deferred, learnLog,
 * decided, choices, record } — status is 'ready' | 'parked' |
 * 'needs-amendment' | 'interrupted' (an agent returned nothing: the API,
 * the network or the quota failed; the session relaunches the run by its
 * id); reason, when parked, is 'user' | 'gate-red' | 'round-cap'.
 */

export const meta = {
  name: 'exec-entry',
  description: 'Stage-4 entry (v9): acceptance checks written first and read-only, one builder under the gate commands, the verifier proving on the running stack in parallel with the reviewers (correctness, structure, security, operations), a mechanical triage, one fix at high effort and a delta check, the record before ready',
  phases: [
    { title: 'Acceptance', detail: 'verifier (Sonnet 5.5, high), author mode: the acceptance checks, red on the base for the right reason, committed', model: 'sonnet' },
    { title: 'Build', detail: 'builder (Opus 5.5, medium), single writer, golden paths, until the gate commands are green', model: 'opus' },
    { title: 'Gate', detail: 'exec-gate (Sonnet 5.5, low): acceptance untouched, the gate commands, the surface, the stack, the record before ready', model: 'sonnet' },
    { title: 'Check', detail: 'verifier prove ∥ reviewer (Sonnet 5.5, high) ∥ structure-reviewer (Opus 5.5, medium) ∥ exec-lens-security ∥ exec-lens-operations (Opus 5.5, medium); mechanical triage', model: 'sonnet' },
    { title: 'Fix', detail: 'builder (Opus 5.5, high), once, on the blocking items; then the gate', model: 'opus' },
    { title: 'Delta', detail: 'the verifier again and the reviewers that blocked, over their own items only', model: 'sonnet' },
  ],
}

// name → model and effort, as in each definition's frontmatter (used when the agents run inline).
const AGENTS = {
  builder: { model: 'opus', effort: 'medium' },
  verifier: { model: 'sonnet', effort: 'high' },
  reviewer: { model: 'sonnet', effort: 'high' },
  'structure-reviewer': { model: 'opus', effort: 'medium' },
  'exec-gate': { model: 'sonnet', effort: 'low' },
  'exec-lens-security': { model: 'opus', effort: 'medium' },
  'exec-lens-operations': { model: 'opus', effort: 'medium' },
}
const BUILDER = 'builder'
const VERIFIER = 'verifier'
const GATE = 'exec-gate'
const REVIEWER = 'reviewer'
const STRUCTURE = 'structure-reviewer'
const SECURITY = 'exec-lens-security'
const OPERATIONS = 'exec-lens-operations'

// ---------- schemas ----------

const str = { type: 'string' }
const strs = { type: 'array', items: str }
const obj = (props, required = Object.keys(props)) => ({ type: 'object', additionalProperties: false, required, properties: props })

const QUESTION = obj({ question: str, context: str, options: strs, pick: str })

const ACCEPTANCE = obj({
  commit: str,
  files: strs,
  checks: { type: 'array', items: obj({ line: str, file: str, redOnBase: str, rightReason: { type: 'boolean' } }) },
  alreadyGreen: strs,
  cannotCheck: strs,
})

const BUILD = obj({
  branch: str,
  head: str,
  commits: { type: 'array', items: obj({ sha: str, message: str }) },
  checks: { type: 'array', description: 'one per gate command, in order', items: obj({ command: str, lastLine: str, green: { type: 'boolean' } }) },
  files: strs,
  reused: strs,
  goldenPaths: strs,
  choices: strs,
  decided: { type: 'array', items: obj({ question: str, pick: str, reason: str }) },
  questions: { type: 'array', description: 'only what needs the user in person', items: QUESTION },
  needsAmendment: { type: 'string', description: 'the shared file or the acceptance check that must change, and why; empty when none' },
  couldNotHonour: strs,
  applied: { type: 'array', items: obj({ id: str, commit: str, why: str }) },
})

const GATE_REPORT = obj({
  green: { type: 'boolean' },
  head: str,
  scope: str,
  summary: str,
  checks: { type: 'array', items: obj({ name: str, green: { type: 'boolean' }, lastLine: str }) },
  failures: { type: 'array', items: obj({ check: str, where: str, output: str, cause: { type: 'string', enum: ['code', 'machine'] } }) },
  stack: str,
  conflicts: strs,
  record: obj({ evidence: str, redacted: strs, open: strs }),
  surface: obj({ api: { type: 'boolean' }, screen: { type: 'boolean' }, runtime: { type: 'boolean' }, paths: strs }),
})

const FINDING = obj({
  severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
  title: str,
  says: str,
  gap: str,
  fix: str,
  repro: { type: 'string', description: 'a failing test, a command and its output, or the steps and what they showed; empty when none' },
  rule: { type: 'string', description: 'the written rule broken, path:line with the sentence quoted; empty when none' },
})

const REVIEW = obj({
  verdict: { type: 'string', enum: ['pass', 'pass with fixes', 'fail'] },
  verified: strs,
  quote: str,
  findings: { type: 'array', items: FINDING },
  closed: { type: 'array', description: 'in a delta: the ids of your items now closed', items: str },
})

const VERDICT = obj({
  verdict: { type: 'string', enum: ['PASS', 'FAIL', 'INCONCLUSIVE'] },
  head: str,
  checks: { type: 'array', items: obj({ file: str, green: { type: 'boolean' }, summary: str }) },
  failures: { type: 'array', items: obj({ check: str, expected: str, observed: str, command: str, output: str, evidence: str }) },
  sideEffects: { type: 'array', items: obj({ command: str, output: str }) },
  canary: obj({ hits: strs }),
  failureModes: { type: 'array', items: obj({ route: str, case: str, expected: str, observed: str, ok: { type: 'boolean' } }) },
  evidence: obj({ folder: str, files: strs }),
  blocked: str,
})

// ---------- the run's state ----------

const mode = ['update', 'rebase'].includes(args?.mode) ? 'update' : ['resume', 'batch'].includes(args?.mode) ? args.mode : 'build'
const resume = mode === 'resume' ? args?.resume ?? {} : null
const entry = args?.entry ?? '?'
const maxRounds = Math.max(1, args?.maxRounds ?? 2)
const maxGateFixes = args?.maxGateFixes ?? 3
const inline = args?.inlineAgents === true
const priorRuns = Array.isArray(args?.priorRuns) ? args.priorRuns : []
const gateCommands = Array.isArray(args?.gateCommands) ? args.gateCommands : []
const agentsDir = args?.agentsDir ?? args?.judgingPath?.replace(/\/skills\/stage-execute\/references\/judging\.md$/, '/agents')
if (!gateCommands.length) log(`${entry}: no gateCommands given — the builder and the gate have nothing to turn green`)

const result = {
  entry, mode, status: 'parked', reason: null, head: null,
  acceptance: args?.acceptance ?? null, verdicts: [], rounds: [], precision: {},
  questions: [], amendment: null, gate: null, deferred: [], learnLog: [], decided: [], choices: [], record: null,
}

const interrupted = (what) => { result.status = 'interrupted'; result.reason = 'interrupted'; log(`${entry}: ${what} returned nothing — interrupted; relaunch by resumeFromRunId`); return result }
const park = (reason, what) => { result.status = 'parked'; result.reason = reason; log(`${entry}: ${what} — parked (${reason})`); return result }

// One call shape for registered and inline agents.
const call = (name, prompt, opts, effort) => {
  const def = AGENTS[name]
  const eff = effort ?? def.effort
  if (inline) {
    return agent(`Your instructions are the file ${agentsDir}/${name}.md (read it first and follow it; its frontmatter's model/effort are already applied).

${prompt}`, { ...opts, model: def.model, effort: eff })
  }
  return agent(prompt, { ...opts, agentType: name, ...(eff !== def.effort ? { effort: eff } : {}) })
}

const docs = `Brief: ${args?.briefPath}
Design (notes.md is the law): ${args?.designDir}
Recon: ${args?.reconDir}
Engineering doctrine of the project: ${args?.doctrineDir}
Golden paths: ${args?.goldenPathsPath}
Rulings of the workstream (not reopened): ${args?.rulingsPath}
Evidence folder of this entry: ${args?.evidenceDir}${priorRuns.length ? `
Earlier runs of this entry (their returns): ${priorRuns.join(', ')}` : ''}`

const where = `Worktree: ${args?.worktree} · branch ${args?.branch} · base ${args?.base}`
const gateList = gateCommands.map((c, i) => `${i + 1}. ${c}`).join('\n') || '(none given)'
const acceptanceText = () => result.acceptance
  ? `Acceptance files (read-only for the builder), added by ${result.acceptance.commit}:\n${(result.acceptance.files ?? []).map(f => `- ${f}`).join('\n')}`
  : 'Acceptance files: none for this run.'
const trailer = `Attribution trailer for every commit, verbatim:\n${args?.trailer ?? '(none given)'}`

// ---------- the agents' calls ----------

const author = (revision) => call(VERIFIER, `Mode: author${revision ? ` (revision: change only the checks ${revision} names)` : ''}. Entry ${entry}.
${where}
${docs}
${revision ? `${acceptanceText()}\n` : ''}${trailer}`, { label: `${VERIFIER}·${entry}·author`, phase: 'Acceptance', schema: ACCEPTANCE })

const build = (task, label, phaseName, effort) => call(BUILDER, `${task}
${where}
${docs}
${acceptanceText()}
The gate commands — every one green, in order, on your final head, before you end your turn:
${gateList}
${trailer}`, { label: `${BUILDER}·${entry}·${label}`, phase: phaseName, schema: BUILD }, effort)

const runGate = (task, label) => call(GATE, `Entry ${entry}. ${task}
${where}
${acceptanceText()}
The gate commands, in order:
${gateList}
Doctrine (its local-development document names the stack, env, whole gate and evidence commands): ${args?.doctrineDir}
Evidence folder: ${args?.evidenceDir}`, { label: `${GATE}·${entry}·${label}`, phase: 'Gate', schema: GATE_REPORT })

const SCOPE = {
  round: 'Scope: round — acceptance untouched, then every gate command in order, stopping at the first red.',
  ready: 'Scope: ready — acceptance untouched, then every gate command in its keep-going form, each read to its end, every failure reported.',
}
const recordTask = (items) => `Then, only when green, the record: the doctrine's evidence command on the head; the evidence folder swept for tokens and secrets, each one redacted; every pointer of the feature map this entry touched resolved to a file that exists.${items.length ? `
Record items to close with the record, or report open:
${items.map(i => `- ${i.id}: ${i.fix}`).join('\n')}` : ''}`

// Absorbs a builder's return: stops the run on an amendment or a question for the user.
const absorb = (b, who) => {
  if (!b) return interrupted(who)
  b.decided.forEach(d => result.decided.push(d))
  b.choices.forEach(c => result.choices.push(c))
  if (b.needsAmendment) { result.status = 'needs-amendment'; result.amendment = b.needsAmendment; result.head = b.head; log(`${entry}: needs an amendment: ${b.needsAmendment}`); return result }
  if (b.questions.length) { result.questions = b.questions.map(q => ({ to: 'user', ...q })); result.head = b.head; return park('user', `${b.questions.length} question(s) only the user can answer`) }
  return null
}

// The gate, then its fix loop: the builder turns the red green, the gate runs again.
// Returns { g, fixed } or { stop } when the run must return.
const gateUntilGreen = async (task, label, scope, record = null) => {
  const fixed = []
  const tail = `${SCOPE[scope]}${record ? `\n${recordTask(record)}` : ''}
When green, bring the stack up on the head (rebuilt when the head changed since it last came up) and leave it up.`
  let g = await runGate(`${task}\n${tail}`, label)
  for (let n = 1; g && !g.green && !g.conflicts.length && n <= maxGateFixes; n++) {
    const items = g.failures.map((f, i) => ({ id: `gate-${label}-${n}#${i + 1}`, reviewer: GATE, fix: `turn green: ${f.check} at ${f.where} (${f.cause})`, repro: f.output, rule: '' }))
    log(`${entry}: gate red (${g.failures.length} failure(s)) — builder try ${n}/${maxGateFixes}`)
    phase('Fix')
    const b = await build(`Mode: fix. Entry ${entry}. Turn the gate green; the failures, quoted:\n${items.map(i => `- ${i.id}: ${i.fix}\n  ${i.repro}`).join('\n')}`, `fix-gate-${label}-${n}`, 'Fix')
    const stop = absorb(b, `the builder (gate fix ${n})`)
    if (stop) return { stop }
    fixed.push(...items)
    phase('Gate')
    g = await runGate(`Run the gate again on the entry branch after the builder's fix.\n${tail}`, `${label}-${n}`)
  }
  if (!g) return { stop: interrupted('the gate') }
  return { g, fixed }
}

// ---------- the check: prove ∥ review, then the mechanical triage ----------

const proven = (f) => Boolean((f.repro ?? '').trim() || (f.rule ?? '').trim())
const precisionOf = (name) => result.precision[name] ?? (result.precision[name] = { found: 0, blocking: 0, deferred: 0, learn: 0, withRepro: 0, ruleOnly: 0, closed: 0 })

const verifyItems = (v, key) => v.verdict === 'PASS' ? [] : v.failures.length
  ? v.failures.map((f, i) => ({ id: `${key}.${i + 1}`, reviewer: VERIFIER, severity: 'blocker', title: `${f.check}: ${v.verdict}`, fix: `make it pass: expected ${f.expected}; observed ${f.observed}`, repro: `${f.command}\n${f.output}`, rule: f.check }))
  : [{ id: `${key}.1`, reviewer: VERIFIER, severity: 'blocker', title: `the proof was ${v.verdict}`, fix: v.blocked || 'the verifier could not prove the entry', repro: v.blocked, rule: '' }]

const check = async ({ round, kind, seats, since, own }) => {
  const diffCmd = kind === 'whole' ? `git diff ${args?.base}...${args?.branch}` : `git diff $(git merge-tree --write-tree ${since} ${args?.base} | head -1) ${args?.branch}`
  const fixesText = kind === 'delta' ? `
THIS IS A DELTA (\`${diffCmd}\`). The fixes applied since the last check:
${(result.rounds.at(-1)?.fixes ?? own?.all ?? []).map(f => `- ${f.id}: ${f.fix}`).join('\n') || '(none listed)'}` : ''
  const ownText = (name) => kind === 'delta' && own?.[name]?.length ? `
Your own blocking items of the check before — re-check only these, over the delta; return the closed ones in \`closed\`, and any still open again as a finding with its id in the title:
${own[name].map(i => `- ${i.id}: ${i.title} — ${i.fix}${i.repro ? `\n  repro: ${i.repro}` : ''}${i.rule ? `\n  rule: ${i.rule}` : ''}`).join('\n')}` : ''
  const common = `Entry ${entry}. Check ${round} (${kind}).
${where}
${docs}
${acceptanceText()}
The diff: run \`${diffCmd}\` in the worktree.
The running stack: ${stackLine}`
  const thunks = seats.map(name => () => name === VERIFIER
    ? call(VERIFIER, `Mode: prove. ${common}
The head to prove: ${head}
The entry touches the server's product code: ${surface.api ? 'yes — run the failure-mode block' : 'no'}${fixesText}${kind === 'delta' && own?.verifier?.length ? `
The checks that failed the last proof:\n${own.verifier.map(i => `- ${i.title}`).join('\n')}` : ''}`, { label: `${VERIFIER}·${entry}·prove-r${round}`, phase: kind === 'whole' ? 'Check' : 'Delta', schema: VERDICT })
    : call(name, `You are ${name}. ${common}${fixesText}${ownText(name)}`, { label: `${name}·${entry}·r${round}`, phase: kind === 'whole' ? 'Check' : 'Delta', schema: REVIEW }))
  log(`${entry} check ${round} (${kind}): ${seats.join(' ∥ ')}`)
  const outs = await parallel(thunks)
  const missing = seats.filter((_, i) => !outs[i])
  if (missing.length) return { stop: interrupted(missing.join(', ')) }

  const blocking = []
  const tally = {}
  seats.forEach((name, i) => {
    const out = outs[i]
    const key = `${name}#r${round}`
    if (name === VERIFIER) {
      result.verdicts.push({ round, verdict: out.verdict, head: out.head, canary: out.canary.hits.length, failureModes: out.failureModes.length, evidence: out.evidence.folder })
      const items = verifyItems(out, key)
      blocking.push(...items)
      tally[name] = { verdict: out.verdict, blocking: items.length }
      return
    }
    const p = precisionOf(name)
    p.closed += out.closed.length
    const t = tally[name] = { found: out.findings.length, blocking: 0, deferred: 0, learn: 0, closed: out.closed.length }
    out.findings.forEach((f, k) => {
      const item = { id: `${key}.${k + 1}`, reviewer: name, ...f }
      p.found++
      if (f.severity !== 'detail' && proven(f)) {
        blocking.push(item); p.blocking++; t.blocking++
        if ((f.repro ?? '').trim()) p.withRepro++; else p.ruleOnly++
      } else if (f.severity !== 'detail') {
        result.deferred.push({ round, ...item }); p.deferred++; t.deferred++
      } else {
        result.learnLog.push({ round, ...item }); p.learn++; t.learn++
      }
    })
  })
  result.rounds.push({ round, kind, seats, tally, blocking: blocking.map(b => ({ id: b.id, reviewer: b.reviewer, severity: b.severity, title: b.title, repro: Boolean((b.repro ?? '').trim()), rule: b.rule })), fixes: [] })
  log(`${entry} check ${round}: ${blocking.length} blocking (${[...new Set(blocking.map(b => b.reviewer))].join(', ') || 'none'}), ${result.deferred.filter(d => d.round === round).length} deferred, ${result.learnLog.filter(d => d.round === round).length} to the learn log`)
  return { blocking }
}

// ---------- 1. acceptance ----------

if ((mode === 'build' && !result.acceptance) || args?.acceptanceRevision) {
  phase('Acceptance')
  const a = await author(args?.acceptanceRevision)
  if (!a) return interrupted('the verifier (author)')
  const wrong = a.checks.filter(c => !c.rightReason)
  if (wrong.length) log(`${entry}: ${wrong.length} acceptance check(s) red on the base for the wrong reason: ${wrong.map(c => c.file).join(', ')}`)
  result.acceptance = { commit: a.commit, files: a.files, alreadyGreen: a.alreadyGreen, cannotCheck: a.cannotCheck, wrongReason: wrong.map(c => `${c.file}: ${c.redOnBase}`) }
  log(`${entry}: ${a.checks.length} acceptance check(s) committed at ${a.commit}${a.cannotCheck.length ? `; ${a.cannotCheck.length} line(s) cannot be a check` : ''}`)
} else if (!result.acceptance) {
  log(`${entry}: no acceptance files given for mode ${mode} — the verifier proves what the brief names`)
}

// ---------- 2. build / update / resume / batch ----------

let since = args?.base
if (mode === 'update') {
  phase('Gate')
  const g = await runGate(`Update ${args?.branch} with ${args?.base}: \`git merge --no-ff ${args?.base}\` on the entry branch, never a rebase, then push. On a conflict, \`git merge --abort\` and report the files. On a clean merge, run the gate.
${SCOPE.ready}
${recordTask([])}`, 'update')
  result.gate = g
  if (!g) return interrupted('the gate')
  if (!g.conflicts.length) {
    result.head = g.head
    if (!g.green) return park('gate-red', 'the gate is red after a clean merge of the base')
    result.record = g.record
    g.record.open.forEach((o, i) => result.deferred.push({ round: 0, id: `record-update#${i + 1}`, reviewer: GATE, kind: 'record', fix: o }))
    result.status = 'ready'
    log(`${entry}: clean merge of the base, the gate green — ready`)
    return result
  }
  phase('Fix')
  const b = await build(`Mode: fix. Entry ${entry}. In the worktree, merge ${args?.base} into ${args?.branch} (\`git merge --no-ff ${args?.base}\`; you are asked to) and resolve the conflicts in: ${g.conflicts.join(', ')}. Keep both intents; never drop the base's change. Commit the merge and push; never a rebase, never a force-push.`, 'fix-update', 'Fix')
  const stop = absorb(b, 'the builder (update)')
  if (stop) return stop
}

if (mode === 'build' || mode === 'batch') {
  phase('Build')
  const b = await build(mode === 'batch'
    ? `Mode: build (a finishing slice). Entry ${entry}. Apply every line of ${args?.batchPath}: each is a deferred finding of an entry already merged, with its fix; one commit per line where separable, its id in the commit body; a line the code no longer needs is reported in \`applied\` with why.`
    : `Mode: build. Entry ${entry}.`, 'build', 'Build')
  const stop = absorb(b, 'the builder')
  if (stop) return stop
}

let resumeItems = []
if (resume) {
  since = resume.head
  phase('Fix')
  log(`${entry}: resuming from ${resume.head} — applying ${resume.fixesFile}`)
  const b = await build(`Mode: fix. Entry ${entry}. The items to apply are in ${resume.fixesFile} (its \`fixes\`: id, reviewer, fix, repro, rule). Apply every one; return one \`applied\` entry per id.`, 'fix-resume', 'Fix', 'high')
  const stop = absorb(b, 'the builder (resume)')
  if (stop) return stop
  resumeItems = Array.isArray(resume.reviewers) ? resume.reviewers : []
}

// ---------- 3. gate ----------

phase('Gate')
const g0r = await gateUntilGreen(mode === 'update' ? 'Run the gate on the entry branch after the conflict resolution (no merge).' : 'Run the gate on the entry branch.', 'r0', 'round')
if (g0r.stop) return g0r.stop
let g0 = g0r.g
result.gate = g0
if (!g0.green) { result.head = g0.head; return park('gate-red', g0.conflicts.length ? 'the merge still conflicts' : `the gate is still red after ${maxGateFixes} tries`) }

const surface = g0.surface ?? { api: true, screen: true, runtime: true, paths: [] }
let head = g0.head
let stackLine = g0.stack
log(`${entry}: surface ${['api', 'screen', 'runtime'].filter(k => surface[k]).join(' + ') || 'none (tests, tooling, build or docs only)'}`)

const wholeSeats = mode === 'batch'
  ? [VERIFIER, STRUCTURE]
  : [VERIFIER, REVIEWER, STRUCTURE, SECURITY, ...(surface.api || surface.runtime ? [OPERATIONS] : [])]

// ---------- 4–6. check, triage, one fix, the delta ----------

let own = null
let round = 1
let pending = { kind: 'whole', seats: wholeSeats }
if (resume) {
  // The resume's items were applied above: the first check is already the delta, by the
  // verifier and the reviewers the items name (reviewer and structure-reviewer when none is named).
  const named = resumeItems.filter(r => wholeSeats.includes(r) && r !== VERIFIER)
  own = { all: [{ id: 'resume', fix: `the items in ${resume.fixesFile}` }] }
  round = maxRounds
  pending = { kind: 'delta', seats: [VERIFIER, ...(named.length ? named : wholeSeats.filter(s => s === REVIEWER || s === STRUCTURE))] }
}

for (;;) {
  const c = await check({ round, kind: pending.kind, seats: pending.seats, since, own })
  if (c.stop) return c.stop
  if (!c.blocking.length) break
  if (round >= maxRounds) { result.head = head; return park('round-cap', `${c.blocking.length} item(s) still blocking after the fix`) }

  phase('Fix')
  since = head
  const b = await build(`Mode: fix. Entry ${entry}. Apply every blocking item below; run its proof red first, then make it green; return one \`applied\` entry per id.
${c.blocking.map(i => `- ${i.id} (${i.reviewer}, ${i.severity}): ${i.title} — ${i.fix}${(i.repro ?? '').trim() ? `\n  repro: ${i.repro}` : ''}${(i.rule ?? '').trim() ? `\n  rule: ${i.rule}` : ''}`).join('\n')}`, `fix-r${round}`, 'Fix', 'high')
  const stop = absorb(b, `the builder (fix of check ${round})`)
  if (stop) return stop
  phase('Gate')
  const gr = await gateUntilGreen('Run the gate on the entry branch after the fix.', `r${round}`, 'round')
  if (gr.stop) return gr.stop
  result.gate = gr.g
  if (!gr.g.green) { result.head = gr.g.head; return park('gate-red', `the gate is red after the fix of check ${round}`) }
  result.rounds.at(-1).fixes = [...c.blocking.map(i => ({ id: i.id, fix: i.fix })), ...gr.fixed.map(i => ({ id: i.id, fix: i.fix }))]
  head = gr.g.head; stackLine = gr.g.stack

  // Only the reviewers that blocked come back, each with its own items; the verifier always.
  own = {}
  c.blocking.forEach(i => (own[i.reviewer] ??= []).push(i))
  pending = { kind: 'delta', seats: [VERIFIER, ...wholeSeats.filter(s => s !== VERIFIER && own[s])] }
  round++
}

// ---------- 7. ready: the gate keep-going and the record ----------

phase('Gate')
const recordItems = result.deferred.filter(d => d.kind === 'record')
const fin = await gateUntilGreen('Nothing blocks: the last gate before ready, on the entry branch (no merge).', 'ready', 'ready', recordItems)
if (fin.stop) return fin.stop
result.gate = fin.g
if (!fin.g.green) { result.head = fin.g.head; return park('gate-red', 'the gate is red before ready') }
if (fin.fixed.length) {
  // The ready gate needed code: one delta of the whole panel over it, no fix after it.
  log(`${entry}: the ready gate needed ${fin.fixed.length} fix(es) — one delta of the whole panel reads them`)
  result.rounds.at(-1).fixes.push(...fin.fixed.map(i => ({ id: i.id, fix: i.fix })))
  since = head; head = fin.g.head; stackLine = fin.g.stack
  const c = await check({ round: round + 1, kind: 'delta', seats: wholeSeats, since, own: { all: fin.fixed } })
  if (c.stop) return c.stop
  if (c.blocking.length) { result.head = head; return park('round-cap', `the fix the ready gate needed still blocks (${c.blocking.length})`) }
}
result.record = fin.g.record
fin.g.record.open.forEach((o, i) => result.deferred.push({ round, id: `record-ready#${i + 1}`, reviewer: GATE, kind: 'record', fix: o }))
await runGate('The entry is done: bring the stack down.', 'down')
result.status = 'ready'
result.head = fin.g.head
log(`${entry}: ready at ${fin.g.head}`)
return result
