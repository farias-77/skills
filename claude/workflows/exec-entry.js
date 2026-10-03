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
 * starts one run per entry, in parallel up to the cap, and
 * only merges what comes back ready, through its local-CI queue.
 *
 * THE FLOW (mode 'build'):
 *   1. acceptance  verifier (Opus 5.5, medium), author mode, writes the
 *                  entry's acceptance checks from the brief's acceptance
 *                  and proof lines and the discovery journeys (browser
 *                  journeys for screens, integration tests for the
 *                  server, in the doctrine's test layout), runs them on
 *                  the base where they must fail for the right reason,
 *                  and commits them. From then on they are read-only for
 *                  the builder: the gate's first check rejects any diff
 *                  to them. Skipped when args.acceptance names an earlier
 *                  run's commit; redone for the named checks only when
 *                  args.acceptanceRevision points at a ruling or an
 *                  amendment that changes them.
 *   2. build       builder (Opus 5.5, medium), the single writer for back
 *                  and front, in the entry worktree: the smallest change
 *                  that passes the acceptance, along the golden paths,
 *                  with the packs of its surface; no mechanism the brief
 *                  does not name. A shared file or an acceptance check it
 *                  must change stops the run: 'needs-amendment'. What
 *                  needs the user in person: 'parked' (user). The
 *                  amendments already closed (args.closedAmendments) are
 *                  listed to the builder as done; a needsAmendment whose
 *                  files a closed one already names is logged and the run
 *                  goes on to the gate, once; a second such echo returns
 *                  'needs-amendment' with reason "repeats closed <id>".
 *   3. gate        exec-gate (Sonnet 5.5, medium): acceptance untouched,
 *                  the gate commands (the fast check, the affected tests,
 *                  the structure check), the surface (api/screen/runtime),
 *                  the stack up for the verifier. Red → the builder again
 *                  at effort high, up to maxGateFixes, then 'parked'
 *                  (gate-red). A failure the gate tags `machine` (a
 *                  timeout with the load at or above the threshold, a
 *                  known infrastructure flake; never an assertion) never
 *                  goes to a builder: a red that is only the machine's
 *                  runs the gate again after a wait for the load (at most
 *                  10 min, until the 1-min load is under loadThreshold,
 *                  nproc by default), at most twice, then 'parked'
 *                  (machine); a mixed red sends only the code failures to
 *                  the builder, and the gate after its fix waits for the
 *                  load first. A builder that changed nothing and whose
 *                  own gate commands are green goes straight to the gate.
 *   4. check       in parallel, over the entry diff: the verifier, prove
 *                  mode (the acceptance checks on the running stack,
 *                  screenshots and video, the PII canary, the failure-mode
 *                  block when the server changed; PASS / FAIL /
 *                  INCONCLUSIVE, INCONCLUSIVE = FAIL), followed, when the
 *                  screen changed, by ux-reviewer (Opus 5.5, medium) on
 *                  that evidence against the locked mock's frames ∥
 *                  reviewer (Opus 5.5, medium): correctness and fidelity ∥
 *                  structure-reviewer (Opus 5.5, medium): golden paths,
 *                  boundaries, duplication, mechanisms nobody named ∥
 *                  exec-lens-security (Opus 5.5, high): every diff ∥
 *                  exec-lens-operations (Opus 5.5, medium): when the
 *                  server's product code or the runtime changed.
 *   5. triage      mechanical: a finding blocks when its severity is not
 *                  'detail' and it carries a repro or a written rule (for
 *                  ux-reviewer the locked mock's frame is the written
 *                  rule), or when the verifier did not PASS; a non-detail
 *                  without proof → `deferred`; a detail → `learnLog`.
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
 *                  → 'parked' (round-cap). Ready is not the merge: the
 *                  session's queue tests the merged tree and signs it off.
 *
 * THE FLOW (mode 'update'): the session merges a moved base into the entry
 * branch itself and calls this mode only on a conflict. The gate tries the
 * merge (never a rebase); a clean merge runs the ready gate and the record
 * and returns. A conflict is resolved by the builder, and the resolution
 * is code: gate, then the whole check over the entry diff, as in build.
 *
 * THE FLOW (mode 'resume'): a parked run continues without a new build
 * and without a whole review: the builder (effort high) applies the items
 * of resume.fixesFile (the session wrote them: the still-blocking items,
 * an answer of the user's, a gate diagnosis), the gate runs, and one delta
 * checks them: the verifier and the reviewers the items name.
 *
 * THE FLOW (mode 'batch'): a finishing slice of the deferred register. The
 * builder applies the lines in batchPath; the gate; then only the verifier,
 * structure-reviewer and, when the screen changed, ux-reviewer check it
 * (it opens no new review); one fix and one delta, as above.
 *
 * MODELS. The builder builds at medium: on mergeable-without-edits work
 * Opus 5.5 peaks at medium and adds out-of-scope edits above it; every fix
 * (gate red, blocking items, a resume) runs at high. The reviewers are
 * Opus 5.5 (higher precision than Sonnet at a similar cost on judgment
 * work), security at high. The gate runs scripted commands and reads logs:
 * Sonnet 5.5, medium. Source: the model-selection pack.
 *
 * PACKS. Each registered agent preloads its packs through `skills:` in its
 * frontmatter. With args.packsDir, the prompt also names the SKILL.md of
 * each of the agent's packs (PACKS below); the agent reads the ones not
 * already in its context. That is how inline agents get them, and it
 * covers a pack that cannot be preloaded.
 *
 * STOP HOOKS. A project may run its fast check in a Stop or SubagentStop
 * hook so the builder cannot end its turn red. Claude Code overrides a hook
 * after 8 consecutive blocks by default (CLAUDE_CODE_STOP_HOOK_BLOCK_CAP,
 * hooks and env-vars docs). Nothing here depends on that number: after
 * every builder return the gate runs and its result decides what follows.
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
 *     discoveryDir:    '/abs/.../00-discovery',             // the locked mock's prototype/frames/ and journeys/*.yaml
 *     reconDir:        '/abs/.../02-plan/recon',
 *     doctrineDir:     '/abs/.../docs/engineering',
 *     goldenPathsPath: '/abs/.../docs/engineering/golden-paths.md',
 *     gateCommands:    ['make check', 'make test-affected base=feat/<slug>', 'make structure'],
 *     rulingsPath:     '/abs/.../rulings.md',
 *     judgingPath:     '/abs/.../stage-execute/references/judging.md',
 *     agentsDir:       '/abs/.../agents',
 *     packsDir:        '/abs/.../skills',                   // holds pack-<name>/SKILL.md
 *     evidenceDir:     '/abs/.../03-execution/entries/E-03',
 *     worktree:        '/abs/.../.worktrees/<slug>-E-03',
 *     branch:          'story/<slug>/E-03',
 *     base:            'feat/<slug>',
 *     trailer:         'the attribution trailer for commits, verbatim',
 *     maxRounds:       2,
 *     maxGateFixes:    3,
 *     inlineAgents:    false,
 *     priorRuns:       ['/abs/.../entries/E-03/run-1.json'],
 *     closedAmendments: [{ id: 'F.1', what: 'Owns += backend/generated/**, e2e/teamFixtures.ts', sha: '<sha>' }],  // optional; from rulings.md
 *     loadThreshold:   8,                                   // optional; the 1-min load the gate waits under before a re-run (default: nproc)
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
 * id); reason, when parked, is 'user' | 'gate-red' | 'round-cap' |
 * 'machine' (red only for the machine after two load waits: wait for
 * the load, then resume); with 'needs-amendment' it is null, or
 * 'repeats closed <id>' when the builder asked twice for a closed one.
 */

export const meta = {
  name: 'exec-entry',
  description: 'Stage-4 entry (v9): acceptance checks written first and read-only, one builder under the gate commands, the verifier proving on the running stack (then ux-reviewer on its screenshots against the locked mock) in parallel with the reviewers (correctness, structure, security, operations), a mechanical triage, one fix at high effort and a delta check, the record before ready',
  phases: [
    { title: 'Acceptance', detail: 'verifier (Opus 5.5, medium), author mode: the acceptance checks, red on the base for the right reason, committed', model: 'opus' },
    { title: 'Build', detail: 'builder (Opus 5.5, medium), single writer, golden paths and its packs, the smallest change until the gate commands are green', model: 'opus' },
    { title: 'Gate', detail: 'exec-gate (Sonnet 5.5, medium): acceptance untouched, the gate commands, the surface, the stack, the record before ready; a red only the machine caused runs again after a load wait', model: 'sonnet' },
    { title: 'Check', detail: 'verifier prove → ux-reviewer on screen diffs ∥ reviewer ∥ structure-reviewer ∥ exec-lens-operations (Opus 5.5, medium) ∥ exec-lens-security (Opus 5.5, high); mechanical triage', model: 'opus' },
    { title: 'Fix', detail: 'builder (Opus 5.5, high), on the gate red or the blocking items; then the gate', model: 'opus' },
    { title: 'Delta', detail: 'the verifier again and the reviewers that blocked, over their own items only', model: 'opus' },
  ],
}

// name → model and effort, as in each definition's frontmatter (used when the agents run inline).
const AGENTS = {
  builder: { model: 'opus', effort: 'medium' },
  verifier: { model: 'opus', effort: 'medium' },
  reviewer: { model: 'opus', effort: 'medium' },
  'structure-reviewer': { model: 'opus', effort: 'medium' },
  'ux-reviewer': { model: 'opus', effort: 'medium' },
  'exec-gate': { model: 'sonnet', effort: 'medium' },
  'exec-lens-security': { model: 'opus', effort: 'high' },
  'exec-lens-operations': { model: 'opus', effort: 'medium' },
}
// name → the knowledge packs it reads, as in each definition's `skills:` (named in the prompt with args.packsDir).
const PACKS = {
  builder: ['pack-go-backend', 'pack-react-frontend', 'pack-design-taste', 'pack-motion-3d', 'pack-ops'],
  reviewer: ['pack-go-backend', 'pack-react-frontend'],
  'structure-reviewer': ['pack-right-sizing', 'pack-go-backend', 'pack-react-frontend'],
  'ux-reviewer': ['pack-design-taste', 'pack-motion-3d', 'pack-react-frontend'],
  'exec-lens-operations': ['pack-ops'],
}
const BUILDER = 'builder'
const VERIFIER = 'verifier'
const GATE = 'exec-gate'
const REVIEWER = 'reviewer'
const STRUCTURE = 'structure-reviewer'
const UX = 'ux-reviewer'
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
  commits: { type: 'array', description: 'the commits of this turn only; empty when you changed nothing', items: obj({ sha: str, message: str }) },
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
  failures: { type: 'array', items: obj({ check: str, where: str, output: str, cause: { type: 'string', enum: ['code', 'machine'] }, load: { type: 'string', description: 'the 1-min load from /proc/loadavg when the failing command ended, and nproc (e.g. "34.2 · nproc 8"); for a machine flake that is not a timeout, the output line that names the infrastructure' } }) },
  load: { type: 'string', description: 'nproc and the 1-min load when the gate started and ended; the wait line when a load wait was asked' },
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
const closedAmendments = Array.isArray(args?.closedAmendments) ? args.closedAmendments.filter(a => a?.id) : []
const loadThreshold = Number(args?.loadThreshold) > 0 ? Number(args.loadThreshold) : null
const MACHINE_RERUNS = 2
if (!gateCommands.length) log(`${entry}: no gateCommands given — the builder and the gate have nothing to turn green`)

const result = {
  entry, mode, status: 'parked', reason: null, head: null,
  acceptance: args?.acceptance ?? null, verdicts: [], rounds: [], precision: {},
  questions: [], amendment: null, gate: null, deferred: [], learnLog: [], decided: [], choices: [], record: null,
}

const interrupted = (what) => { result.status = 'interrupted'; result.reason = 'interrupted'; log(`${entry}: ${what} returned nothing — interrupted; relaunch by resumeFromRunId`); return result }
const park = (reason, what) => { result.status = 'parked'; result.reason = reason; log(`${entry}: ${what} — parked (${reason})`); return result }

// The packs of an agent, as paths, when args.packsDir is given.
const packsText = (name) => args?.packsDir && PACKS[name]?.length
  ? `\nYour knowledge packs (read each one whose content is not already in your context, before you work):\n${PACKS[name].map(p => `- ${args.packsDir}/${p}/SKILL.md`).join('\n')}`
  : ''

// One call shape for registered and inline agents.
const call = (name, prompt, opts, effort) => {
  const def = AGENTS[name]
  const eff = effort ?? def.effort
  if (inline) {
    return agent(`Your instructions are the file ${agentsDir}/${name}.md (read it first and follow it; its frontmatter's model/effort are already applied).${packsText(name)}

${prompt}`, { ...opts, model: def.model, effort: eff })
  }
  return agent(`${prompt}${packsText(name)}`, { ...opts, agentType: name, ...(eff !== def.effort ? { effort: eff } : {}) })
}

const mockText = args?.discoveryDir ? `
The locked mock (screens are built to it and checked against it): frames ${args.discoveryDir}/prototype/frames · journeys ${args.discoveryDir}/journeys` : ''
const docs = `Brief: ${args?.briefPath}
Design (notes.md is the law): ${args?.designDir}${mockText}
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
const closedText = closedAmendments.length ? `
Amendments already applied and closed — done: their files are inside the entry's Owns or on the base; never ask for them again:
${closedAmendments.map(a => `- ${a.id}${a.sha ? ` (${a.sha})` : ''}: ${a.what ?? ''}`).join('\n')}` : ''

// The files a text names (paths with a slash, globs and {a,b} groups expanded), for matching an
// amendment the builder asks for against the closed ones.
const expandBraces = (s) => {
  const m = s.match(/\{([^{}]*)\}/)
  return m ? m[1].split(',').flatMap(p => expandBraces(s.slice(0, m.index) + p + s.slice(m.index + m[0].length))) : [s]
}
const pathsIn = (text) => [...new Set((String(text ?? '').match(/(?:[\w.@*-]|\{[^{}\s]*\})*\/(?:[\w.@*\/-]|\{[^{}\s]*\})*/g) ?? [])
  .map(p => p.replace(/^\.\//, '').replace(/\.+$/, '').replace(/\/$/, '/**'))
  .filter(p => /\w/.test(p))
  .flatMap(expandBraces))]
const globRe = (g) => new RegExp(`^${g.split('**').map(part => part.split('*').map(x => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('.*')}$`)
const covers = (pattern, path) => pattern === path || globRe(pattern).test(path) || globRe(path).test(pattern)
// The ids of the closed amendments that already name every file the request names; null when one is new.
const closedEcho = (text) => {
  const asked = pathsIn(text)
  if (!asked.length || !closedAmendments.length) return null
  const ids = new Set()
  for (const p of asked) {
    const hit = closedAmendments.filter(a => pathsIn(a.what).some(q => covers(q, p)))
    if (!hit.length) return null
    hit.forEach(a => ids.add(a.id))
  }
  return [...ids]
}
let closedEchoes = 0

// The load wait the gate runs before a re-run of a red the machine caused.
const loadWait = () => {
  const t = loadThreshold ?? '$(nproc)'
  return `First wait for the load (this is the one wait you are asked for): until the 1-min load average is under ${loadThreshold ?? 'the core count (nproc)'}, at most 10 minutes. Run exactly this, with the Bash tool's timeout at 600000 ms:
timeout 590 bash -c 'until awk -v t="${t}" "{ exit !(\\$1 + 0 < t + 0) }" /proc/loadavg; do sleep 15; done'; echo "wait exit $? · load $(cut -d' ' -f1-3 /proc/loadavg) · nproc $(nproc) · threshold ${t}"
Put its last line in \`load\`. Exit 0: the load is under the threshold. Exit 124: ten minutes passed above it; run the gate anyway.`
}
const onlyMachine = (g) => Boolean(g && !g.green && !g.conflicts.length && g.failures.length && g.failures.every(f => f.cause === 'machine'))
const machineList = (g) => g.failures.filter(f => f.cause === 'machine').map(f => `${f.check} at ${f.where}${f.load ? ` (load ${f.load})` : ''}`).join('; ')
const parkMachine = (g, waits) => {
  result.gate = g; result.head = g.head
  return park('machine', `the gate is still red only for the machine after ${waits} load wait(s) and re-run(s) — load ${g.load || '?'}, threshold ${loadThreshold ?? 'nproc'}: ${machineList(g)}`)
}

// ---------- the agents' calls ----------

const author = (revision) => call(VERIFIER, `Mode: author${revision ? ` (revision: change only the checks ${revision} names)` : ''}. Entry ${entry}.
${where}
${docs}
${revision ? `${acceptanceText()}\n` : ''}${trailer}`, { label: `${VERIFIER}·${entry}·author`, phase: 'Acceptance', schema: ACCEPTANCE })

const build = (task, label, phaseName, effort) => call(BUILDER, `${task}
${where}
${docs}${closedText}
${acceptanceText()}
The gate commands — every one green, in order, on your final head, before you end your turn:
${gateList}
${trailer}`, { label: `${BUILDER}·${entry}·${label}`, phase: phaseName, schema: BUILD }, effort)

let lastHead = null // the head the last gate ran on: a builder that returns it changed nothing
const runGate = (task, label) => call(GATE, `Entry ${entry}. ${task}
${where}
${acceptanceText()}
The gate commands, in order:
${gateList}${loadThreshold ? `
Load threshold (a timeout at or above it reads as the machine): ${loadThreshold}` : ''}
Doctrine (its local-development document names the stack, env, whole gate and evidence commands): ${args?.doctrineDir}
Evidence folder: ${args?.evidenceDir}`, { label: `${GATE}·${entry}·${label}`, phase: 'Gate', schema: GATE_REPORT }).then(g => { if (g?.head) lastHead = g.head; return g })

const SCOPE = {
  round: 'Scope: round — acceptance untouched, then every gate command in order, stopping at the first red.',
  ready: 'Scope: ready — acceptance untouched, then every gate command in its keep-going form, each read to its end, every failure reported.',
}
const recordTask = (items) => `Then, only when green, the record: the doctrine's evidence command on the head; the evidence folder swept for tokens and secrets, each one redacted; every pointer of the feature map this entry touched resolved to a file that exists.${items.length ? `
Record items to close with the record, or report open:
${items.map(i => `- ${i.id}: ${i.fix}`).join('\n')}` : ''}`

// Absorbs a builder's return: stops the run on an amendment or a question for the user.
// An amendment a closed one already covers goes on to the gate once; twice, it stops the run.
const absorb = (b, who) => {
  if (!b) return interrupted(who)
  b.decided.forEach(d => result.decided.push(d))
  b.choices.forEach(c => result.choices.push(c))
  if (b.needsAmendment) {
    const ids = closedEcho(b.needsAmendment)
    if (ids && closedEchoes === 0) {
      closedEchoes++
      log(`${entry}: ${who} asked again for closed amendment ${ids.join(', ')} (the same files) — logged, not an amendment; on to the gate: ${b.needsAmendment}`)
    } else {
      result.status = 'needs-amendment'; result.amendment = b.needsAmendment; result.head = b.head
      if (ids) { result.reason = `repeats closed ${ids.join(', ')}`; log(`${entry}: needs an amendment, but it repeats closed ${ids.join(', ')} a second time — stopped: ${b.needsAmendment}`) } else log(`${entry}: needs an amendment: ${b.needsAmendment}`)
      return result
    }
  }
  if (b.questions.length) { result.questions = b.questions.map(q => ({ to: 'user', ...q })); result.head = b.head; return park('user', `${b.questions.length} question(s) only the user can answer`) }
  const red = b.checks.filter(c => !c.green).map(c => c.command)
  const sameHead = Boolean(lastHead && b.head && (lastHead.startsWith(b.head) || b.head.startsWith(lastHead)))
  log(b.commits.length && !sameHead
    ? `${entry}: ${who} returned ${b.head}: ${b.commits.length} commit(s); its own gate commands ${red.length ? `red on ${red.join(', ')}` : 'green'} — the gate`
    : `${entry}: ${who} changed nothing (${sameHead ? 'the head the gate last ran on' : 'no commit'}) at ${b.head}; its own gate commands ${red.length ? `red on ${red.join(', ')} — the gate decides` : 'green — nothing to do, straight to the gate'}`)
  return null
}

// The gate, then its fix loop: the builder turns the red green, the gate runs again.
// Returns { g, fixed } or { stop } when the run must return.
const gateUntilGreen = async (task, label, scope, record = null) => {
  const fixed = []
  const tail = `${SCOPE[scope]}${record ? `\n${recordTask(record)}` : ''}
When green, bring the stack up on the head (rebuilt when the head changed since it last came up) and leave it up.`
  let g = await runGate(`${task}\n${tail}`, label)
  let n = 0
  let waits = 0
  while (g && !g.green && !g.conflicts.length) {
    // A red that is only the machine's never goes to a builder: the gate waits for the load and runs again.
    if (onlyMachine(g)) {
      if (waits >= MACHINE_RERUNS) return { stop: parkMachine(g, waits) }
      waits++
      log(`${entry}: gate red only for the machine (${machineList(g)}; load ${g.load || '?'}) — no builder; the gate waits for the load under ${loadThreshold ?? 'nproc'} and runs again (${waits}/${MACHINE_RERUNS})`)
      g = await runGate(`${loadWait()}\nThen run the gate again on the entry branch, in the same scope; nothing changed since its last run.\n${tail}`, `${label}-wait${waits}`)
      continue
    }
    if (n >= maxGateFixes) break
    n++
    // A mixed red: the code failures go to the builder; the machine ones are re-run by the gate after the fix.
    const machine = g.failures.filter(f => f.cause === 'machine')
    const items = g.failures.filter(f => f.cause !== 'machine').map((f, i) => ({ id: `gate-${label}-${n}#${i + 1}`, reviewer: GATE, fix: `turn green: ${f.check} at ${f.where} (${f.cause})`, repro: f.output, rule: '' }))
    log(machine.length
      ? `${entry}: gate red (${items.length} code failure(s), ${machine.length} machine: ${machineList(g)}) — builder try ${n}/${maxGateFixes} on the code ones only; the gate after it waits for the load`
      : `${entry}: gate red (${g.failures.length} failure(s)) — builder try ${n}/${maxGateFixes}`)
    phase('Fix')
    const b = await build(`Mode: fix. Entry ${entry}. Turn the gate green; the failures, quoted:\n${items.map(i => `- ${i.id}: ${i.fix}\n  ${i.repro}`).join('\n')}${machine.length ? `\nNot yours (the machine's, re-run by the gate after your fix): ${machineList(g)}` : ''}`, `fix-gate-${label}-${n}`, 'Fix', 'high')
    const stop = absorb(b, `the builder (gate fix ${n})`)
    if (stop) return { stop }
    fixed.push(...items)
    phase('Gate')
    g = await runGate(`${machine.length ? `${loadWait()}\n` : ''}Run the gate again on the entry branch after the builder's fix.\n${tail}`, `${label}-${n}`)
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
  const phaseName = kind === 'whole' ? 'Check' : 'Delta'
  const prove = () => call(VERIFIER, `Mode: prove. ${common}
The head to prove: ${head}
The entry touches the server's product code: ${surface.api ? 'yes — run the failure-mode block' : 'no'}
The entry touches the screen's product code: ${surface.screen ? 'yes — a screenshot of every state the journeys reach, named by the frame it matches' : 'no'}${fixesText}${kind === 'delta' && own?.verifier?.length ? `
The checks that failed the last proof:\n${own.verifier.map(i => `- ${i.title}`).join('\n')}` : ''}`, { label: `${VERIFIER}·${entry}·prove-r${round}`, phase: phaseName, schema: VERDICT })
  const review = (name, extra = '') => call(name, `You are ${name}. ${common}${extra}${fixesText}${ownText(name)}`, { label: `${name}·${entry}·r${round}`, phase: phaseName, schema: REVIEW })
  // ux-reviewer reads the verifier's screenshots and video, so it runs after the verifier, inside its seat.
  const proveThenUx = async () => {
    const v = await prove()
    if (!v) return { v: null, u: null }
    const u = await review(UX, `
The verifier's evidence of this head (${v.verdict}): ${v.evidence.folder}${v.evidence.files.length ? ` — ${v.evidence.files.join(', ')}` : ''}`)
    return { v, u }
  }
  const uxSeated = seats.includes(UX)
  const order = seats.filter(s => s !== UX)
  log(`${entry} check ${round} (${kind}): ${order.map(s => s === VERIFIER && uxSeated ? `${VERIFIER} → ${UX}` : s).join(' ∥ ')}`)
  const raw = await parallel(order.map(name => () => name === VERIFIER ? (uxSeated ? proveThenUx() : prove()) : review(name)))
  const outOf = {}
  order.forEach((name, i) => {
    if (name === VERIFIER && uxSeated) { outOf[VERIFIER] = raw[i]?.v; outOf[UX] = raw[i]?.u } else outOf[name] = raw[i]
  })
  const outs = seats.map(name => outOf[name])
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
  let g = await runGate(`Update ${args?.branch} with ${args?.base}: \`git merge --no-ff ${args?.base}\` on the entry branch, never a rebase, then push. On a conflict, \`git merge --abort\` and report the files. On a clean merge, run the gate.
${SCOPE.ready}
${recordTask([])}`, 'update')
  // A red only the machine caused: the gate waits for the load and runs again, as in gateUntilGreen.
  for (let w = 0; onlyMachine(g);) {
    if (w >= MACHINE_RERUNS) return parkMachine(g, w)
    w++
    log(`${entry}: gate red only for the machine after the merge (${machineList(g)}; load ${g.load || '?'}) — the gate waits for the load under ${loadThreshold ?? 'nproc'} and runs again (${w}/${MACHINE_RERUNS})`)
    g = await runGate(`${loadWait()}\nThen run the gate again on the entry branch (no merge: the base is already merged), in the same scope.\n${SCOPE.ready}\n${recordTask([])}`, `update-wait${w}`)
  }
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
  const b = await build(`Mode: fix. Entry ${entry}. In the worktree, merge ${args?.base} into ${args?.branch} (\`git merge --no-ff ${args?.base}\`; you are asked to) and resolve the conflicts in: ${g.conflicts.join(', ')}. Keep both intents; never drop the base's change. Commit the merge and push; never a rebase, never a force-push.`, 'fix-update', 'Fix', 'high')
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
  ? [VERIFIER, STRUCTURE, ...(surface.screen ? [UX] : [])]
  : [VERIFIER, REVIEWER, STRUCTURE, SECURITY, ...(surface.api || surface.runtime ? [OPERATIONS] : []), ...(surface.screen ? [UX] : [])]

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
