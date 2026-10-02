/*
 * exec-entry.js — one entry of a stage-4 plan as deterministic code:
 * build, gate, review, judge, fix, until clean or parked.
 *
 * Why a workflow: "no code enters without review" must be physical.
 * Every commit that reaches the entry branch passes the mechanical
 * gate (the project's commands) and then a panel of lenses and QA that
 * never wrote it, judged by an agent that did not write it either. The
 * session that runs stage 4 starts one run per entry, in parallel up
 * to the plan's cap, and only merges what comes back ready.
 *
 * THE FLOW (mode 'build'):
 *   1. build   builder-backend ∥ builder-frontend (Opus 5.5, high), each
 *              in its own side worktree: two builders never commit to
 *              one tree at once. A side the entry does not have is
 *              skipped. A builder that must change a shared file stops
 *              the run: status 'needs-amendment'. Before it returns, a
 *              builder fills its self-check item by item with the
 *              evidence, distilled from the lenses' definitions.
 *   2. gate    exec-gate (Sonnet 5.5, medium) merges the sides into the entry
 *              branch, brings the stack up and runs the round scope: the
 *              doctrine's fast check and affected tests (the whole gate
 *              when the doctrine names no affected-tests command). Red →
 *              the failing sides fix in parallel, each in its side
 *              worktree → gate again, up to maxGateFixes; still red →
 *              'parked'.
 *   3. panel   in parallel, over the diff. The whole first reading:
 *              fidelity, workaround, proof (one per side when the entry
 *              has both), security (Opus 5.5, medium; fidelity Sonnet
 *              5.5, high) always; the rest by the surface the gate read
 *              from the diff's paths: operations when it touches the
 *              server's product code or the runtime (infra, deploy,
 *              config); visual (Sonnet 5.5, high) and exec-qa-frontend
 *              when it touches a screen; exec-qa-backend when it touches
 *              the server's product code; exec-qa-abuse when it touches
 *              either (Opus 5.5, high); craft only in the foundation's
 *              (F) first reading. A diff of tests, tooling, build files
 *              or docs only seats no QA. Each QA has its adversarial
 *              checklist and a coverage line per category — an output
 *              missing a category is sent back once for the missing
 *              ones. Panel 'lean' seats no operations. A delta round is
 *              a verification, not a new review: did each fix land as
 *              described, did it break what it touched, and only what
 *              the ruler never defers beyond that. It seats fidelity,
 *              workaround and the proof of the sides the fixes touched;
 *              security only when a fix touches scope, a log, a
 *              credential, a person's data or evidence; visual only when
 *              a fix changes a screen; operations only when it had a
 *              finding sustained the round before; never craft and never
 *              an exploring QA: exec-qa-replay (Sonnet 5.5, medium) replays
 *              the scripts the QA saved and the case of each fix, for the
 *              sides the fixes touched whose QA ran. Every reviewer receives the
 *              rulings of the entry's earlier rounds and runs.
 *   4. judge   exec-judge (Opus 5.5, medium) rules every finding and every
 *              QA `unsettled` observation. Autonomous (the default, the
 *              session runs under a goal): it decides where the documents
 *              are silent and records it in `decided` for the audit; a
 *              question for the user (the bar, money, outside the repo,
 *              irreversible, the security posture) → 'parked'; a
 *              recurrence or a fix that needs a shared file →
 *              'needs-session', with the recommended option. Deferred
 *              rulings do not hold the entry: they are returned in
 *              `deferred`, for the finishing entries at the end of the
 *              stage; a record item (evidence, feature-map pointer) goes
 *              to the gate's record, never to a builder.
 *   5. fix     the builders apply the sustained fixes, back ∥ front, each
 *              in its side worktree; in series only where the judge
 *              marked `after` → the gate merges and runs the round scope
 *              → the next round's panel verifies the delta. After maxRounds
 *              (two) panel rounds with something still sustained → 'parked'.
 *   6. ready   nothing sustained → the fast check and the affected tests
 *              against the base, keep-going (the whole gate runs once, at
 *              the end of the stage, never per entry), then
 *              the record: the doctrine's evidence command on the head,
 *              the evidence swept for tokens and redacted, the feature
 *              map's pointers checked. A red there is fixed and its fix
 *              reviewed as a delta round.
 *
 * THE FLOW (mode 'rebase'): the gate rebases the entry branch on the
 * moved base and runs the fast check and the affected tests against it,
 * and the record. A clean rebase adds
 * no authored code and the run returns. A conflict is resolved by the
 * builders of the sides it touches, and the resolution is code: gate,
 * then the panel over the whole entry diff, then the judge, as in build
 * mode.
 *
 * THE FLOW (mode 'resume'): a run that parked or needed the session (a
 * question answered in the rulings, or the round cap reached) continues
 * without a new build and without a whole review: the builders apply
 * the parked run's last sustained rulings, the gate runs, and the review
 * rounds read only the delta from the parked head, with the parked
 * run's rulings in front of the reviewers and the judge. maxRounds fresh
 * rounds.
 *
 * THE ARGS CARRY PATHS, NOT TEXT. The prompts below carry inputs only;
 * every instruction lives in the agent definitions.
 *
 * Invoked by the stage-execute session:
 *   Workflow({ scriptPath: '<...>/workflows/exec-entry.js', args: {
 *     mode:          'build' | 'rebase' | 'resume',
 *     entry:         'E-03',
 *     briefPath:     '/abs/.../02-plan/briefs/E-03.md',
 *     designDir:     '/abs/.../01-design',
 *     reconDir:      '/abs/.../02-plan/recon',
 *     doctrineDir:   '/abs/.../docs/engineering',
 *     rulingsPath:   '/abs/.../rulings.md',
 *     judgingPath:   '/abs/.../stage-execute/references/judging.md',
 *     agentsDir:     '/abs/.../agents',  // the lenses' definitions the builders read; default: beside the ruler's skill
 *     evidenceDir:   '/abs/.../03-execution/entries/E-03',
 *     worktree:      '/abs/.../.worktrees/<slug>-E-03',
 *     branch:        'story/<slug>/E-03',
 *     base:          'feat/<slug>',
 *     sides:         { back: { worktree, branch } | null, front: { worktree, branch } | null },
 *     trailer:       'the attribution trailer for commits, verbatim',
 *     maxRounds:     2,
 *     maxGateFixes:  3,
 *     panel:         'full' | 'lean',  // lean: no operations lens
 *     autonomous:    true,             // false only when the session does not run under a goal
 *     priorRuns:     ['/abs/.../entries/E-03/run-1.json'],  // earlier runs' returns of this entry, if any
 *     resume:        { rulingsFile: '/abs/.../<parked run return>.json', round: 3, head: '<parked head sha>', after: 'back' | 'front' | undefined },  // 'resume' only; after: the side whose rulings land first, when the parked round marked one
 *   }})
 *
 * Returns { entry, mode, status, reason, head, rounds, precision, questions,
 * amendment, gate, deferred, decided, record } — status is 'ready' |
 * 'parked' | 'needs-session' | 'needs-amendment' | 'interrupted' (an
 * agent returned nothing: the API, the network or the quota failed; the
 * session relaunches the run by its id); reason, when parked, is 'user' |
 * 'gate-red' | 'round-cap'; questions carry `to`
 * ('user' or 'session'); rounds lists each panel round with its
 * findings, unsettled, QA coverage, rulings and fixes; precision sums,
 * per lens and QA, found · sustained · deferred · latitude · dismissed ·
 * user; decided lists what the judge decided where the documents were
 * silent, for the audit; record is the gate's last record.
 */

export const meta = {
  name: 'exec-entry',
  description: 'Stage-4 entry: two Opus builders in parallel, the mechanical gate, a panel of lenses and adversarial QA that never wrote the code, an Opus judge that rules on its own under a goal; fixes back ∥ front and a verification of the delta, two rounds at most; the whole gate and the record before ready',
  phases: [
    { title: 'Build', detail: 'builder-backend ∥ builder-frontend (Opus 5.5, high), each in its side worktree, self-check before return', model: 'opus' },
    { title: 'Gate', detail: 'exec-gate (Sonnet 5.5, medium): merge the sides, fast check + affected tests per round, the whole gate and the record before ready', model: 'sonnet' },
    { title: 'Panel', detail: 'the lenses (Opus 5.5, medium; fidelity and visual Sonnet 5.5, high) and the QA (Opus 5.5, high; replay Sonnet 5.5, medium) over the diff, seated by the surface it touches; the delta verified', model: 'opus' },
    { title: 'Judge', detail: 'exec-judge (Opus 5.5, medium) rules every finding and every unsettled observation', model: 'opus' },
    { title: 'Fix', detail: 'the builders apply what was sustained, back ∥ front (deferred go to the finishing entries), then the gate, then the panel over the delta', model: 'opus' },
  ],
}

const BUILDERS = { back: 'builder-backend', front: 'builder-frontend' }
const GATE = 'exec-gate'
const JUDGE = 'exec-judge'
const FIDELITY = 'exec-lens-fidelity'
const WORKAROUND = 'exec-lens-workaround'
const PROOF = 'exec-lens-proof'
const SECURITY = 'exec-lens-security'
const OPERATIONS = 'exec-lens-operations'
const CRAFT = 'exec-lens-craft'
const VISUAL = 'exec-lens-visual'
const QA = { back: 'exec-qa-backend', front: 'exec-qa-frontend' }
const QA_ABUSE = 'exec-qa-abuse'
const QA_REPLAY = 'exec-qa-replay'
const TOUCHES = ['scope', 'log', 'credential', 'personal-data', 'evidence', 'concurrency', 'screen']
const SECURITY_TOUCHES = ['scope', 'log', 'credential', 'personal-data', 'evidence']

const QA_CATEGORIES = {
  [QA.back]: ['empty-missing-wrong-type', 'huge-and-limit', 'whitespace', 'unicode', 'injection', 'repetition', 'concurrency', 'other-actor', 'token', 'dependencies', 'log-personal-data'],
  [QA.front]: ['content', 'injection', 'other-actor', 'double-click', 'navigation', 'two-tabs', 'keyboard', 'narrow-landscape-zoom', 'axe', 'reduced-motion', 'js-storage-blocked', 'slow-and-down'],
  [QA_ABUSE]: ['idor-enumeration', 'token', 'injection', 'rate-limit', 'personal-data-in-log-or-mail', 'toctou'],
}

const BUILD = {
  type: 'object', additionalProperties: false,
  required: ['branch', 'head', 'commits', 'checks', 'files', 'choices', 'needsAmendment', 'couldNotHonour', 'applied', 'selfCheck'],
  properties: {
    branch: { type: 'string' },
    head: { type: 'string' },
    commits: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['sha', 'message'], properties: { sha: { type: 'string' }, message: { type: 'string' } } } },
    checks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['name', 'lastLine', 'green'], properties: { name: { type: 'string' }, lastLine: { type: 'string' }, green: { type: 'boolean' } } } },
    files: { type: 'array', items: { type: 'string' } },
    choices: { type: 'array', items: { type: 'string' } },
    needsAmendment: { type: 'string', description: 'the shared file that must change and why; empty when none' },
    couldNotHonour: { type: 'array', items: { type: 'string' } },
    applied: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'commit', 'why'], properties: { id: { type: 'string' }, commit: { type: 'string' }, why: { type: 'string' } } } },
    selfCheck: { type: 'array', description: 'every item of the self-check in the builder definition, with its evidence', items: { type: 'object', additionalProperties: false, required: ['item', 'evidence', 'ok'], properties: { item: { type: 'string' }, evidence: { type: 'string' }, ok: { type: 'boolean' } } } },
  },
}

const GATE_REPORT = {
  type: 'object', additionalProperties: false,
  required: ['green', 'head', 'scope', 'summary', 'checks', 'failures', 'stack', 'screenshots', 'conflicts', 'record', 'surface'],
  properties: {
    green: { type: 'boolean' },
    head: { type: 'string' },
    scope: { type: 'string', description: 'what ran: "round" or "ready" (fast check + affected tests), "full" (the whole gate), or "full (no affected-tests command)"' },
    summary: { type: 'string', description: 'the summary lines of what ran, verbatim' },
    checks: { type: 'array', description: 'one per step that ran, in order', items: { type: 'object', additionalProperties: false, required: ['name', 'green', 'lastLine'], properties: { name: { type: 'string' }, green: { type: 'boolean' }, lastLine: { type: 'string' } } } },
    failures: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['check', 'side', 'where', 'output'], properties: { check: { type: 'string' }, side: { type: 'string', enum: ['back', 'front'] }, where: { type: 'string' }, output: { type: 'string' } } } },
    stack: { type: 'string', description: 'the URLs and actors (never a token), or "down"' },
    screenshots: { type: 'string', description: 'the folder and the file count' },
    conflicts: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['file', 'side'], properties: { file: { type: 'string' }, side: { type: 'string', enum: ['back', 'front'] } } } },
    surface: { type: 'object', additionalProperties: false, required: ['api', 'screen', 'runtime', 'paths'], description: 'what the entry diff against the base touches, read from `git diff --name-only <base>...<branch>` and the doctrine\'s layout', properties: {
      api: { type: 'boolean', description: 'product code of the server side changed (not its tests, tooling, build files or docs)' },
      screen: { type: 'boolean', description: 'product code of the screen side changed (not its tests, e2e, tooling, build files or docs)' },
      runtime: { type: 'boolean', description: 'infra, deploy, the config the running service reads, alarms or migrations changed' },
      paths: { type: 'array', items: { type: 'string' }, description: 'the paths that made each true, as "api: <path>"' },
    } },
    record: { type: 'object', additionalProperties: false, required: ['evidence', 'redacted', 'open'], properties: {
      evidence: { type: 'string', description: 'the evidence command run on the head and what it wrote; empty when the record was not asked' },
      redacted: { type: 'array', items: { type: 'string' }, description: 'file: what was redacted' },
      open: { type: 'array', items: { type: 'string' }, description: 'a feature-map pointer to a file that does not exist, or a record item the gate could not close' },
    } },
  },
}

const FINDING = {
  type: 'object', additionalProperties: false,
  required: ['severity', 'title', 'says', 'gap', 'fix'],
  properties: {
    severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
    title: { type: 'string' },
    says: { type: 'string', description: 'the lines verbatim with file:line, the request and response, or the steps and screenshot; "nothing" for something missing' },
    gap: { type: 'string' },
    fix: { type: 'string' },
  },
}

const REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'verified', 'quote', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'pass with fixes', 'fail'] },
    verified: { type: 'array', items: { type: 'string' } },
    quote: { type: 'string' },
    findings: { type: 'array', items: FINDING },
  },
}

const qaReview = (categories) => ({
  type: 'object', additionalProperties: false,
  required: [...REVIEW.required, 'coverage', 'unsettled'],
  properties: {
    ...REVIEW.properties,
    coverage: { type: 'array', description: 'one line per category of your checklist', items: { type: 'object', additionalProperties: false, required: ['category', 'tried', 'cases', 'command', 'result', 'why_not'], properties: {
      category: { type: 'string', enum: categories }, tried: { type: 'boolean' }, cases: { type: 'integer' }, command: { type: 'string' }, result: { type: 'string' }, why_not: { type: 'string', description: 'required when tried is false' },
    } } },
    unsettled: { type: 'array', description: 'behaviors the documents do not settle', items: { type: 'object', additionalProperties: false, required: ['title', 'says', 'why'], properties: { title: { type: 'string' }, says: { type: 'string' }, why: { type: 'string' } } } },
  },
})

const QUESTION = { type: 'object', additionalProperties: false, required: ['question', 'context', 'options', 'pick'], properties: { question: { type: 'string' }, context: { type: 'string' }, options: { type: 'array', items: { type: 'string' } }, pick: { type: 'string' } } }

const RULINGS = {
  type: 'object', additionalProperties: false,
  required: ['rulings', 'toUser', 'toSession', 'decided', 'seen', 'precision'],
  properties: {
    rulings: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['ids', 'ruling', 'side', 'fix', 'after', 'touches', 'reason'], properties: {
      ids: { type: 'array', items: { type: 'string' } },
      ruling: { type: 'string', enum: ['sustained', 'deferred', 'latitude', 'dismissed', 'user', 'session'] },
      side: { type: 'string', enum: ['back', 'front', 'none'] },
      fix: { type: 'string' },
      after: { type: 'string', enum: ['back', 'front', 'none'], description: 'the other side whose fix this one needs first; none when the sides fix in parallel' },
      touches: { type: 'array', items: { type: 'string', enum: TOUCHES } },
      reason: { type: 'string' },
    } } },
    toUser: { type: 'array', items: QUESTION },
    toSession: { type: 'array', items: QUESTION },
    decided: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['ids', 'question', 'pick', 'reason'], properties: { ids: { type: 'array', items: { type: 'string' } }, question: { type: 'string' }, pick: { type: 'string' }, reason: { type: 'string' } } } },
    seen: { type: 'array', items: { type: 'string' } },
    precision: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['lens', 'found', 'sustained', 'deferred', 'latitude', 'dismissed', 'user'], properties: {
      lens: { type: 'string' }, found: { type: 'integer' }, sustained: { type: 'integer' }, deferred: { type: 'integer' }, latitude: { type: 'integer' }, dismissed: { type: 'integer' }, user: { type: 'integer' },
    } } },
  },
}

const mode = ['rebase', 'resume'].includes(args?.mode) ? args.mode : 'build'
const resume = mode === 'resume' ? args?.resume ?? {} : null
const entry = args?.entry ?? '?'
const sides = Object.entries(args?.sides ?? {}).filter(([, v]) => v).map(([k]) => k)
const maxRounds = args?.maxRounds ?? 2
const maxGateFixes = args?.maxGateFixes ?? 3
const lean = args?.panel === 'lean'
const autonomous = args?.autonomous !== false
const priorRuns = Array.isArray(args?.priorRuns) ? args.priorRuns : []
const agentsDir = args?.agentsDir ?? args?.judgingPath?.replace(/\/skills\/stage-execute\/references\/judging\.md$/, '/agents')
if (!sides.length) log(`${entry}: no sides given — pass sides: { back: {worktree, branch}, front: {worktree, branch} }`)

const docs = `Brief: ${args?.briefPath}
Design (notes.md is the law): ${args?.designDir}
Recon: ${args?.reconDir}
Engineering doctrine of the project: ${args?.doctrineDir}
Rulings of the workstream (not reopened): ${args?.rulingsPath}
Evidence folder of this entry: ${args?.evidenceDir}`

const result = { entry, mode, status: 'parked', reason: null, head: null, rounds: [], precision: {}, questions: [], amendment: null, gate: null, deferred: [], decided: [], record: null }
// An agent that returned nothing failed on the API, the network or the quota: the run is
// interrupted, never parked, and the session relaunches it by its run id.
const interrupted = (what) => { result.status = 'interrupted'; result.reason = 'interrupted'; log(`${entry}: ${what} returned nothing — interrupted; relaunch by resumeFromRunId`); return result }
const park = (reason, what) => { result.status = 'parked'; result.reason = reason; log(`${entry}: ${what} — parked (${reason})`); return result }
const addPrecision = (rows) => rows.forEach(p => {
  const t = result.precision[p.lens] ?? (result.precision[p.lens] = { found: 0, sustained: 0, deferred: 0, latitude: 0, dismissed: 0, user: 0 })
  for (const k of Object.keys(t)) t[k] += p[k] ?? 0
})

const builder = (side, prompt, label) => agent(`${prompt}
The lenses' definitions your self-check is distilled from: ${agentsDir}/exec-lens-*.md`, { label: `${BUILDERS[side]}·${entry}·${label}`, phase: label.startsWith('fix') ? 'Fix' : 'Build', agentType: BUILDERS[side], schema: BUILD })
  .then(b => {
    b?.selfCheck.filter(c => !c.ok).forEach(c => log(`${entry}: ${BUILDERS[side]} self-check not met — ${c.item}: ${c.evidence}`))
    return b
  })

const runGate = (task, label) => agent(`Entry ${entry}. ${task}
Entry worktree: ${args?.worktree} · branch ${args?.branch} · base ${args?.base}
Side worktrees: ${sides.map(s => `${s} ${args?.sides[s].worktree} · ${args?.sides[s].branch}`).join(' · ') || 'none'}
Doctrine (its local-development document names the commands): ${args?.doctrineDir}
Evidence folder: ${args?.evidenceDir}`, { label: `${GATE}·${entry}·${label}`, phase: 'Gate', agentType: GATE, schema: GATE_REPORT })

const mergeSides = (which) => which.length
  ? `Merge the side branches into ${args?.branch}: ${which.map(s => args?.sides[s].branch).join(', ')}.`
  : `No side changed; do not merge.`

const SCOPE = {
  round: `Scope: round — the doctrine's fast check and its affected-tests command against ${args?.base} (the whole gate command when the doctrine names no affected-tests command; say so in \`scope\`).`,
  full: 'Scope: full — the whole gate command in its keep-going form; read every check and report every failure, never only the first.',
  ready: `Scope: ready — the doctrine's fast check and its affected-tests command against ${args?.base}, every check read to its end and every failure reported, never only the first (the whole gate command when the doctrine names no affected-tests command; say so in \`scope\`). The whole gate runs once, at the end of the stage, never per entry.`,
}
const readyScope = args?.readyScope === 'full' ? 'full' : 'ready'
const recordTask = (items) => `Then, only when green, the record: the doctrine's evidence command on the head; the evidence folder swept for tokens and secrets (the JWT pattern and whatever the doctrine names), each one redacted; every pointer of the feature map this entry touched resolved to a file that exists.${items.length ? `
The judge's record items, to close with the record or report open:
${items.map(i => `- ${i.id}: ${i.fix}`).join('\n')}` : ''}`

const sideTree = (side) => `Your side worktree: ${args?.sides?.[side]?.worktree} · branch ${args?.sides?.[side]?.branch}. First, before anything else, bring it to the entry branch: \`git merge --ff-only ${args?.branch}\` (every commit of your side is already in it); if that refuses because the entry branch was rebased, \`git reset --hard ${args?.branch}\` and push with --force-with-lease to your side branch only.`
const afterLine = (after) => after ? `
Then merge the ${after} side's branch, whose fixes of this round yours build on: \`git merge ${args?.sides?.[after]?.branch}\`.` : ''

const fixPrompt = (side, items, after) => `Mode: fix. Entry ${entry}, ${side} side.
${sideTree(side)}${afterLine(after)}
${docs}
Attribution trailer for every commit, verbatim:
${args?.trailer ?? '(none given)'}
Apply each item below; return one \`applied\` entry per id.
${items.map(i => `- ${i.id}: ${i.fix}`).join('\n')}`

// The sides fix in parallel, each in its side worktree; in series only
// where an item of one side is marked `after` the other.
const applyFixes = async (bySide, label, promptFor) => {
  const todo = ['back', 'front'].filter(s => sides.includes(s) && bySide[s]?.length)
  const first = todo.find(s => todo.some(o => o !== s && bySide[o].some(i => i.after === s)))
  if (first) {
    const second = todo.find(s => s !== first)
    log(`${entry}: the ${second} fixes wait for the ${first} fixes (marked by the judge)`)
    await builder(first, promptFor(first, bySide[first], null), label)
    await builder(second, promptFor(second, bySide[second], first), label)
  } else {
    await parallel(todo.map(s => () => builder(s, promptFor(s, bySide[s], null), label)))
  }
  return todo
}

// The gate, then its fix loop: the failing sides fix, the gate merges and runs again.
const gateUntilGreen = async (task, label, scope, record = null) => {
  const fixed = []
  const tail = `${SCOPE[scope]}${record ? `\n${recordTask(record)}` : ''}
Leave the stack up.`
  let g = await runGate(`${task}\n${tail}`, label)
  for (let n = 1; g && !g.green && n <= maxGateFixes; n++) {
    if (g.conflicts.length) break
    const bySide = {}
    g.failures.forEach((f, i) => (bySide[f.side] ??= []).push({ id: `gate-${label}-${n}#${i + 1}`, side: f.side, fix: `turn green: ${f.check} at ${f.where} — ${f.output}` }))
    log(`${entry}: gate red (${g.failures.length} failure(s)) — fix ${n}/${maxGateFixes} by ${Object.keys(bySide).join(' and ')}`)
    phase('Fix')
    const touched = await applyFixes(bySide, `fix-gate-${n}`, fixPrompt)
    touched.forEach(s => fixed.push(...bySide[s]))
    phase('Gate')
    g = await runGate(`${mergeSides(touched)} Run the gate again on the entry branch.\n${tail}`, `${label}-${n}`)
  }
  return g && { ...g, fixed }
}

const closeRecord = (g, round) => {
  result.record = g.record
  g.record.open.forEach((o, i) => result.deferred.push({ round, id: `record-r${round}#${i + 1}`, side: 'none', fix: o }))
}

// ---------- mode: rebase ----------

let since = args?.base
if (mode === 'rebase') {
  phase('Gate')
  const g = await runGate(`Rebase ${args?.branch} onto ${args?.base}. On a conflict, abort the rebase and report the files by side. On a clean rebase, bring the stack up and run the gate.
${SCOPE[readyScope]}
${recordTask([])}`, 'rebase')
  result.gate = g
  if (!g) return interrupted('the gate')
  if (!g.conflicts.length) {
    result.head = g.head
    result.status = g.green ? 'ready' : 'parked'
    if (!g.green) result.reason = 'gate-red'
    if (g.green) closeRecord(g, 0)
    log(`${entry}: clean rebase — ${g.green ? 'the gate green, ready' : 'the gate red after a clean rebase, parked for the session'}`)
    return result
  }
  const bySide = {}
  g.conflicts.forEach(c => (bySide[c.side] ??= []).push(c.file))
  for (const side of Object.keys(bySide)) {
    await builder(side, `Mode: fix. Entry ${entry}, ${side} side. In ${args?.worktree}, rebase ${args?.branch} onto ${args?.base} (you are asked to) and resolve the conflicts in: ${bySide[side].join(', ')}. Keep both intents; never drop the base's change. Push with --force-with-lease to ${args?.branch} only.
${docs}
Attribution trailer: ${args?.trailer ?? '(none given)'}`, 'fix-rebase')
  }
}

// ---------- mode: build — the sides in parallel ----------

if (mode === 'build') {
  phase('Build')
  log(`${entry}: building ${sides.join(' ∥ ')}`)
  const built = await parallel(sides.map(side => () => builder(side, `Mode: build. Entry ${entry}, ${side} side.
Your worktree: ${args?.sides[side].worktree} · branch ${args?.sides[side].branch} (cut from ${args?.base})
${docs}
Attribution trailer for every commit, verbatim:
${args?.trailer ?? '(none given)'}`, 'build').then(b => ({ side, b }))))
  for (const { side, b } of built.filter(Boolean)) {
    if (!b) return interrupted(BUILDERS[side])
    if (b.needsAmendment) { result.status = 'needs-amendment'; result.amendment = { side, what: b.needsAmendment }; log(`${entry}: needs a foundation amendment (${side}): ${b.needsAmendment}`); return result }
  }
}

// ---------- mode: resume — a parked run's last rulings, applied back ∥ front, then delta rounds ----------

if (resume) {
  since = resume.head
  log(`${entry}: resuming from ${resume.head} — applying the rulings of round ${resume.round} in ${resume.rulingsFile}`)
  phase('Fix')
  const after = ['back', 'front'].includes(resume.after) ? resume.after : null
  const resumePrompt = (side, _items, first) => `Mode: fix. Entry ${entry}, ${side} side.
${sideTree(side)}${afterLine(first)}
${docs}
Attribution trailer for every commit, verbatim:
${args?.trailer ?? '(none given)'}
The rulings to apply are in ${resume.rulingsFile}: the return of the parked run (its \`rounds\`, round ${resume.round}, \`rulings\`), or a judge's return (its \`rulings\`). Apply every ruling there whose \`ruling\` is "sustained" and whose \`side\` is "${side}"; its id is its \`ids\` joined with "+". Return one \`applied\` entry per id. If nothing there is for your side, change nothing after bringing your worktree to the entry branch.`
  const bySide = Object.fromEntries(sides.map(s => [s, [{ id: 'resume', side: s, after: after && after !== s ? after : 'none' }]]))
  await applyFixes(bySide, 'fix-resume', resumePrompt)
}

phase('Gate')
const g0 = await gateUntilGreen(mode === 'build'
  ? `${mergeSides(sides)} Bring the stack up and run the gate.`
  : resume
    ? `${mergeSides(sides)} Bring the stack up if it is down, and run the gate.`
    : 'Run the gate on the entry branch after the conflict resolution (no merge).', 'r0', 'round')
result.gate = g0
if (!g0) return interrupted('the gate')
if (!g0.green) return park('gate-red', 'the gate is still red')

// ---------- the review rounds ----------

const hasFront = sides.includes('front')
// The surface the gate read from the diff's paths; unknown → every seat, as before.
const surface = g0.surface ?? { api: true, screen: true, runtime: true, paths: [] }
const qaSides = sides.filter(s => s === 'back' ? surface.api : surface.screen)
log(`${entry}: surface ${['api', 'screen', 'runtime'].filter(k => surface[k]).join(' + ') || 'none (tests, tooling, build or docs only)'}`)
const proofSeats = (on) => {
  const split = sides.length > 1 ? sides.filter(s => on.includes(s)) : []
  return split.length ? split.map(side => ({ agent: PROOF, side })) : [{ agent: PROOF }]
}
const wholeSeats = () => [
  { agent: FIDELITY }, { agent: WORKAROUND }, ...proofSeats(sides), { agent: SECURITY },
  ...(!lean && (surface.api || surface.runtime) ? [{ agent: OPERATIONS }] : []),
  ...(entry === 'F' && mode === 'build' ? [{ agent: CRAFT }] : []),
  ...(hasFront && surface.screen ? [{ agent: VISUAL }] : []),
  ...qaSides.map(s => ({ agent: QA[s] })),
  ...(qaSides.length ? [{ agent: QA_ABUSE }] : []),
]
const deltaSeats = (f) => {
  const fixed = f ? sides.filter(s => f.sides.has(s)) : sides
  const touches = f ? f.touches : new Set(TOUCHES)
  const replay = sides.filter(s => (fixed.includes(s) || (s === 'back' && touches.has('concurrency'))) && qaSides.includes(s))
  return [
    { agent: FIDELITY }, { agent: WORKAROUND }, ...proofSeats(fixed.length ? fixed : sides),
    ...(SECURITY_TOUCHES.some(t => touches.has(t)) ? [{ agent: SECURITY }] : []),
    ...(hasFront && touches.has('screen') ? [{ agent: VISUAL }] : []),
    ...(!lean && (surface.api || surface.runtime) && (!f || f.lenses.has(OPERATIONS)) ? [{ agent: OPERATIONS }] : []),
    ...(replay.length ? [{ agent: QA_REPLAY, replay }] : []),
  ]
}
const seatName = (seat) => `${seat.agent}${seat.side ? `·${seat.side}` : ''}`
const coverageGaps = (coverage, cats) => cats.filter(c => !(coverage ?? []).some(x => x.category === c && (x.tried ? x.cases > 0 : x.why_not.trim())))

const priorText = () => {
  const parts = []
  if (priorRuns.length) parts.push(`Earlier runs of this entry (their returns, every round's rulings): ${priorRuns.join(', ')}`)
  if (resume) parts.push(`The parked run this one resumes: ${resume.rulingsFile}`)
  if (result.rounds.length) parts.push(`This run's earlier rounds:\n${JSON.stringify(result.rounds.map(r => ({ round: r.round, rulings: r.rulings.map(x => ({ ids: x.ids, ruling: x.ruling, reason: x.reason })) })), null, 1)}`)
  return parts.length ? `

ALREADY RULED — a finding ruled there is not reported again unless the code under it changed since:
${parts.join('\n')}` : ''
}

let head = g0.head
let stack = g0.stack
let focus = null
const recordItems = []
let lastRound = maxRounds
for (let round = 1; round <= lastRound; round++) {
  const whole = round === 1 && !resume
  const diffCmd = whole ? `git diff ${args?.base}...${args?.branch}` : `git diff ${since}..${args?.branch}`
  const lastFixes = result.rounds.at(-1)?.fixes ?? (resume ? [{ id: `round ${resume.round} of the parked run`, side: 'back+front', fix: `the sustained rulings in ${resume.rulingsFile}` }] : [])
  const panelInputs = (seat) => `Round ${round} (${whole ? 'whole' : 'delta'}). Entry ${entry}. You are ${seat.agent}${seat.side ? `, for the ${seat.side} side only` : ''}.${seat.replay ? ` Replay the saved QA scripts of the ${seat.replay.join(' and ')} side(s), and write and run the case of each fix.` : ''}
${docs}
Worktree: ${args?.worktree} · branch ${args?.branch} · base ${args?.base}
The diff to read first: run \`${diffCmd}\` in the worktree.
The gate's evidence: ${args?.evidenceDir} (the gate output; screenshots; the QA scripts under qa-*/)
The running stack: ${stack}${priorText()}${!whole ? `

THIS IS A DELTA ROUND — a verification of the fixes below, by your definition's delta rule. The fixes applied since the last round:
${lastFixes.map(f => `- ${f.id} (${f.side}): ${f.fix}`).join('\n') || '(none listed)'}` : ''}`

  const runSeat = async (seat) => {
    const cats = QA_CATEGORIES[seat.agent]
    const schema = cats ? qaReview(cats) : REVIEW
    const label = `${seatName(seat)}·${entry}·r${round}`
    const prompt = panelInputs(seat)
    let r = await agent(prompt, { label, phase: 'Panel', agentType: seat.agent, schema })
    let missing = cats && r ? coverageGaps(r.coverage, cats) : []
    if (missing.length) {
      log(`${label}: no coverage for ${missing.join(', ')} — sent back for those`)
      const more = await agent(`${prompt}

YOUR FIRST PASS IS DONE; ITS COVERAGE MISSED: ${missing.join(', ')}. Cover only these categories now (tried with its cases, or not tried with why_not), and report what they find.`, { label: `${label}·more`, phase: 'Panel', agentType: seat.agent, schema })
      if (more) r = { ...r, verified: [...r.verified, ...more.verified], findings: [...r.findings, ...more.findings], coverage: [...r.coverage, ...more.coverage], unsettled: [...r.unsettled, ...more.unsettled] }
      missing = coverageGaps(r.coverage, cats)
    }
    return { seat, ...(r ?? { verdict: 'fail', verified: [], quote: '', findings: [] }), invalid: !r ? 'no output' : missing.length ? `no coverage for ${missing.join(', ')}` : null }
  }

  phase('Panel')
  const seats = whole ? wholeSeats() : deltaSeats(focus)
  log(`${entry} round ${round}: ${seats.length} reviewers (${seats.map(seatName).join(', ')}) over \`${diffCmd}\``)
  const reviews = (await parallel(seats.map(seat => () => runSeat(seat)))).filter(Boolean)
  if (reviews.every(r => r.invalid === 'no output')) return interrupted(`every reviewer of round ${round}`)

  const findings = []
  const unsettled = []
  reviews.forEach(r => {
    const key = `${r.seat.agent}#r${round}${r.seat.side ? `.${r.seat.side}` : ''}`
    r.findings.forEach((f, i) => findings.push({ id: `${key}.${i + 1}`, lens: r.seat.agent, ...f }))
    ;(r.unsettled ?? []).forEach((u, i) => unsettled.push({ id: `${key}.u${i + 1}`, lens: r.seat.agent, ...u }))
  })
  const invalid = reviews.filter(r => r.invalid).map(r => `${seatName(r.seat)} (${r.invalid})`)
  if (invalid.length) log(`${entry} round ${round}: invalid output from ${invalid.join(', ')}`)
  const coverage = reviews.filter(r => r.coverage).map(r => ({ qa: r.seat.agent, coverage: r.coverage }))

  phase('Judge')
  const j = await agent(`Round ${round}. Entry ${entry}. ${autonomous
    ? 'Autonomous: the session runs under a goal and nobody answers until the audit — the ruler\'s autonomous mode applies.'
    : 'Not autonomous: what the ruler sends to the session or decides on its own goes to the user.'}
${docs}
The ruler (read it whole first): ${args?.judgingPath}
Worktree: ${args?.worktree} · the diff: \`${diffCmd}\`
Reviewers that returned nothing or an incomplete coverage this round: ${invalid.join(', ') || 'none'}
${priorRuns.length ? `Earlier runs of this entry, with their rulings (a finding ruled there is not ruled again unless the code changed under it): ${priorRuns.join(', ')}\n` : ''}${resume ? `The parked run this one resumes, with its rounds' rulings (a finding ruled there is not ruled again unless the code changed under it): ${resume.rulingsFile}\n` : ''}${result.rounds.length ? `Previous rounds' rulings:\n${JSON.stringify(result.rounds.map(r => ({ round: r.round, rulings: r.rulings })), null, 1)}\n` : ''}
The findings of this round:
${JSON.stringify(findings, null, 1)}
The QA's unsettled observations of this round, each ruled like a finding:
${JSON.stringify(unsettled, null, 1)}`, { label: `${JUDGE}·${entry}·r${round}`, phase: 'Judge', agentType: JUDGE, schema: RULINGS })
  if (!j) return interrupted(`the judge of round ${round}`)
  addPrecision(j.precision)

  const fixes = j.rulings.filter(r => r.ruling === 'sustained' && r.side !== 'none')
    .map((r, i) => ({ id: r.ids.join('+') || `j#${i + 1}`, side: r.side, fix: r.fix, after: r.after, touches: r.touches }))
  j.rulings.filter(r => r.ruling === 'deferred').forEach((r, i) => {
    const item = { round, id: r.ids.join('+') || `d#${round}.${i + 1}`, side: r.side, fix: r.fix }
    if (r.side === 'none') recordItems.push(item)
    else result.deferred.push(item)
  })
  j.decided.forEach(d => result.decided.push({ round, ...d }))
  result.rounds.push({ round, findings: findings.length, unsettled: unsettled.length, invalid, coverage, rulings: j.rulings, fixes, seen: j.seen })
  log(`${entry} round ${round}: ${findings.length} finding(s) and ${unsettled.length} unsettled → ${fixes.length} to fix, ${result.deferred.filter(d => d.round === round).length} deferred, ${j.decided.length} decided, ${j.toSession.length} for the session, ${j.toUser.length} for the user`)

  if (j.toUser.length || j.toSession.length) {
    result.questions = [...j.toUser.map(q => ({ to: 'user', ...q })), ...j.toSession.map(q => ({ to: 'session', ...q }))]
    result.status = j.toUser.length ? 'parked' : 'needs-session'
    if (j.toUser.length) result.reason = 'user'
    result.head = head
    log(`${entry}: ${result.status === 'parked' ? 'parked for the user' : 'waits for the session'}`)
    return result
  }

  if (!fixes.length) {
    phase('Gate')
    const fin = await gateUntilGreen(`Nothing sustained in round ${round}: the last gate before ready, on the entry branch (no merge).`, `final-r${round}`, readyScope, recordItems)
    result.gate = fin
    if (!fin) return interrupted('the gate')
    if (!fin.green) { result.head = head; return park('gate-red', 'the gate is red before ready') }
    if (!fin.fixed.length) {
      closeRecord(fin, round)
      await runGate('The entry is done: bring the stack down.', 'down')
      result.status = 'ready'; result.head = fin.head
      log(`${entry}: ready at ${fin.head}`)
      return result
    }
    if (round === lastRound && lastRound > maxRounds) { result.head = fin.head; return park('round-cap', 'the gate needed fixes again after the extra round') }
    if (round === lastRound) { lastRound++; log(`${entry}: the whole gate needed fixes in the last round — one extra round reviews only them`) }
    result.rounds.at(-1).fixes = fin.fixed
    focus = { lenses: new Set(), sides: new Set(fin.fixed.map(f => f.side)), touches: new Set(fin.fixed.some(f => f.side === 'front') ? ['screen'] : []) }
    since = head; head = fin.head; stack = fin.stack
    continue
  }
  if (round >= maxRounds) { result.head = head; return park('round-cap', `still ${fixes.length} to fix after ${maxRounds} rounds`) }

  focus = {
    lenses: new Set(j.rulings.filter(r => r.ruling === 'sustained').flatMap(r => r.ids.map(id => id.split('#')[0]))),
    sides: new Set(fixes.map(f => f.side)),
    touches: new Set(fixes.flatMap(f => f.touches)),
  }
  phase('Fix')
  since = head
  const bySide = {}
  fixes.forEach(f => (bySide[f.side] ??= []).push(f))
  const touched = await applyFixes(bySide, `fix-r${round}`, fixPrompt)
  const g = await gateUntilGreen(`${mergeSides(touched)} Then run the gate on the entry branch.`, `r${round}`, 'round')
  result.gate = g
  if (!g) return interrupted('the gate')
  if (!g.green) return park('gate-red', `the gate is red after the round-${round} fixes`)
  g.fixed.forEach(f => { focus.sides.add(f.side); if (f.side === 'front') focus.touches.add('screen') })
  result.rounds.at(-1).fixes = [...fixes, ...g.fixed]
  head = g.head; stack = g.stack
}

return result
