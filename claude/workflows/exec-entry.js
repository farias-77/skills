/*
 * exec-entry.js — one entry of a stage-4 plan as deterministic code:
 * build, gate, review, judge, fix, until clean or parked.
 *
 * Why a workflow: "no code enters without review" must be physical.
 * Every commit that reaches the entry branch passes the mechanical
 * gate (the project's gate command) and then a panel of lenses and QA that never
 * wrote it, judged by an agent that did not write it either. The
 * session that runs stage 4 starts one run per entry, in parallel up
 * to the plan's cap, and only merges what comes back ready.
 *
 * THE FLOW (mode 'build'):
 *   1. build   builder-backend ∥ builder-frontend (Opus 5.5, high), each
 *              in its own side worktree: two builders never commit to
 *              one tree at once. A side the entry does not have is
 *              skipped. A builder that must change a shared file stops
 *              the run: status 'needs-amendment'.
 *   2. gate    exec-gate (Sonnet 5, high) merges the sides into the entry
 *              branch, brings the stack up, runs the gate command. Red → the
 *              failing side's builder fixes in the entry worktree →
 *              gate again, up to maxGateFixes; still red → 'parked'.
 *   3. panel   the lenses (Opus 5.5, medium; visual only with a front)
 *              and the QA (Opus 5.5, medium; per side) in parallel over
 *              the diff — whole in round 1, the delta after.
 *   4. judge   exec-judge (Opus 5.5, medium) rules every finding. A
 *              question for the user → 'parked' with the questions.
 *              Nothing sustained or deferred → 'ready'.
 *   5. fix     the builders apply the fixes, side by side in series in
 *              the entry worktree → gate → the next round's panel reads
 *              the delta. After maxRounds panel rounds with something
 *              still sustained → 'parked'.
 *
 * THE FLOW (mode 'rebase'): the gate rebases the entry branch on the
 * moved base. A clean rebase adds no authored code: the gate verifies
 * and the run returns. A conflict is resolved by the builders of the
 * sides it touches, and the resolution is code: gate, then the panel
 * over the whole entry diff, then the judge, as in build mode.
 *
 * THE ARGS CARRY PATHS, NOT TEXT. The prompts below carry inputs only;
 * every instruction lives in the agent definitions.
 *
 * Invoked by the stage-execute session:
 *   Workflow({ scriptPath: '<...>/workflows/exec-entry.js', args: {
 *     mode:          'build' | 'rebase',
 *     entry:         'E-03',
 *     briefPath:     '/abs/.../02-plan/briefs/E-03.md',
 *     designDir:     '/abs/.../01-design',
 *     reconDir:      '/abs/.../02-plan/recon',
 *     doctrineDir:   '/abs/.../docs/engineering',
 *     rulingsPath:   '/abs/.../rulings.md',
 *     judgingPath:   '/abs/.../stage-execute/references/judging.md',
 *     evidenceDir:   '/abs/.../03-execution/entries/E-03',
 *     worktree:      '/abs/.../.worktrees/<slug>-E-03',
 *     branch:        'story/<slug>/E-03',
 *     base:          'feat/<slug>',
 *     sides:         { back: { worktree, branch } | null, front: { worktree, branch } | null },
 *     trailer:       'the attribution trailer for commits, verbatim',
 *     maxRounds:     3,
 *     maxGateFixes:  3,
 *   }})
 *
 * Returns { entry, mode, status, head, rounds, precision, questions,
 * amendment, gate } — status is 'ready' | 'parked' | 'needs-amendment';
 * rounds lists each panel round with its findings and rulings;
 * precision sums, per lens and QA, found · sustained · deferred ·
 * latitude · dismissed · user.
 */

export const meta = {
  name: 'exec-entry',
  description: 'Stage-4 entry: two Opus builders in parallel, the mechanical gate, a panel of seven lenses and two QA that never wrote the code, an Opus judge; fix and review the delta until clean, three rounds at most',
  phases: [
    { title: 'Build', detail: 'builder-backend ∥ builder-frontend (Opus 5.5, high), each in its side worktree', model: 'opus' },
    { title: 'Gate', detail: 'exec-gate (Sonnet 5, high): merge the sides, the gate command, attribute every red', model: 'sonnet' },
    { title: 'Panel', detail: 'seven lenses and the QA (Opus 5.5, medium) over the diff', model: 'opus' },
    { title: 'Judge', detail: 'exec-judge (Opus 5.5, medium) rules every finding', model: 'opus' },
    { title: 'Fix', detail: 'the builders apply what was sustained, then the gate, then the panel over the delta', model: 'opus' },
  ],
}

const BUILDERS = { back: 'builder-backend', front: 'builder-frontend' }
const GATE = 'exec-gate'
const JUDGE = 'exec-judge'
const CODE_LENSES = ['exec-lens-fidelity', 'exec-lens-workaround', 'exec-lens-craft', 'exec-lens-proof', 'exec-lens-security', 'exec-lens-operations']
const VISUAL_LENS = 'exec-lens-visual'
const QA = { back: 'exec-qa-backend', front: 'exec-qa-frontend' }

const BUILD = {
  type: 'object', additionalProperties: false,
  required: ['branch', 'head', 'commits', 'checks', 'files', 'choices', 'needsAmendment', 'couldNotHonour', 'applied'],
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
  },
}

const GATE_REPORT = {
  type: 'object', additionalProperties: false,
  required: ['green', 'head', 'summary', 'failures', 'stack', 'screenshots', 'conflicts'],
  properties: {
    green: { type: 'boolean' },
    head: { type: 'string' },
    summary: { type: 'string', description: 'the summary lines of the gate command, verbatim' },
    failures: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['check', 'side', 'where', 'output'], properties: { check: { type: 'string' }, side: { type: 'string', enum: ['back', 'front'] }, where: { type: 'string' }, output: { type: 'string' } } } },
    stack: { type: 'string', description: 'the URLs and actors, or "down"' },
    screenshots: { type: 'string', description: 'the folder and the file count' },
    conflicts: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['file', 'side'], properties: { file: { type: 'string' }, side: { type: 'string', enum: ['back', 'front'] } } } },
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

const RULINGS = {
  type: 'object', additionalProperties: false,
  required: ['rulings', 'toUser', 'seen', 'precision'],
  properties: {
    rulings: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['ids', 'ruling', 'side', 'fix', 'reason'], properties: {
      ids: { type: 'array', items: { type: 'string' } },
      ruling: { type: 'string', enum: ['sustained', 'deferred', 'latitude', 'dismissed', 'user'] },
      side: { type: 'string', enum: ['back', 'front', 'none'] },
      fix: { type: 'string' },
      reason: { type: 'string' },
    } } },
    toUser: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['question', 'context', 'options', 'pick'], properties: { question: { type: 'string' }, context: { type: 'string' }, options: { type: 'array', items: { type: 'string' } }, pick: { type: 'string' } } } },
    seen: { type: 'array', items: { type: 'string' } },
    precision: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['lens', 'found', 'sustained', 'deferred', 'latitude', 'dismissed', 'user'], properties: {
      lens: { type: 'string' }, found: { type: 'integer' }, sustained: { type: 'integer' }, deferred: { type: 'integer' }, latitude: { type: 'integer' }, dismissed: { type: 'integer' }, user: { type: 'integer' },
    } } },
  },
}

const mode = args?.mode === 'rebase' ? 'rebase' : 'build'
const entry = args?.entry ?? '?'
const sides = Object.entries(args?.sides ?? {}).filter(([, v]) => v).map(([k]) => k)
const maxRounds = args?.maxRounds ?? 3
const maxGateFixes = args?.maxGateFixes ?? 3
if (!sides.length) log(`${entry}: no sides given — pass sides: { back: {worktree, branch}, front: {worktree, branch} }`)

const docs = `Brief: ${args?.briefPath}
Design (notes.md is the law): ${args?.designDir}
Recon: ${args?.reconDir}
Engineering doctrine of the project: ${args?.doctrineDir}
Rulings of the workstream (not reopened): ${args?.rulingsPath}
Evidence folder of this entry: ${args?.evidenceDir}`

const result = { entry, mode, status: 'parked', head: null, rounds: [], precision: {}, questions: [], amendment: null, gate: null }
const addPrecision = (rows) => rows.forEach(p => {
  const t = result.precision[p.lens] ?? (result.precision[p.lens] = { found: 0, sustained: 0, deferred: 0, latitude: 0, dismissed: 0, user: 0 })
  for (const k of Object.keys(t)) t[k] += p[k] ?? 0
})

const builder = (side, prompt, label) => agent(prompt, { label: `${BUILDERS[side]}·${entry}·${label}`, phase: label.startsWith('fix') ? 'Fix' : 'Build', agentType: BUILDERS[side], schema: BUILD })

const runGate = (task, label) => agent(`Entry ${entry}. ${task}
Entry worktree: ${args?.worktree} · branch ${args?.branch} · base ${args?.base}
Doctrine (its local-development document names the commands): ${args?.doctrineDir}
Evidence folder: ${args?.evidenceDir}`, { label: `${GATE}·${entry}·${label}`, phase: 'Gate', agentType: GATE, schema: GATE_REPORT })

const fixPrompt = (side, items) => `Mode: fix. Entry ${entry}, ${side} side. Work in the entry worktree ${args?.worktree} on ${args?.branch}.
${docs}
Attribution trailer for every commit, verbatim:
${args?.trailer ?? '(none given)'}
Apply each item below; return one \`applied\` entry per id.
${items.map(i => `- ${i.id}: ${i.fix}`).join('\n')}`

// The gate, then its fix loop: the failing side fixes, the gate runs again.
const gateUntilGreen = async (task, label) => {
  let g = await runGate(task, label)
  for (let n = 1; g && !g.green && n <= maxGateFixes; n++) {
    if (g.conflicts.length) return g
    const bySide = {}
    g.failures.forEach((f, i) => (bySide[f.side] ??= []).push({ id: `gate-${label}-${n}#${i + 1}`, fix: `turn green: ${f.check} at ${f.where} — ${f.output}` }))
    log(`${entry}: gate red (${g.failures.length} failure(s)) — fix ${n}/${maxGateFixes} by ${Object.keys(bySide).join(' and ')}`)
    for (const side of Object.keys(bySide)) if (sides.includes(side)) await builder(side, fixPrompt(side, bySide[side]), `fix-gate-${n}`)
    g = await runGate('Run the gate again on the entry branch (no merge). Leave the stack up.', `${label}-${n}`)
  }
  return g
}

// ---------- mode: rebase ----------

let since = args?.base
if (mode === 'rebase') {
  phase('Gate')
  const g = await runGate(`Rebase ${args?.branch} onto ${args?.base}. On a conflict, abort the rebase and report the files by side. On a clean rebase, bring the stack up and run the gate.`, 'rebase')
  result.gate = g
  if (!g) { log(`${entry}: gate returned nothing`); return result }
  if (!g.conflicts.length) {
    result.head = g.head
    result.status = g.green ? 'ready' : 'parked'
    log(`${entry}: clean rebase — ${g.green ? 'gate green, ready' : 'gate red after a clean rebase, parked for the session'}`)
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
    if (!b) { log(`${entry}: ${BUILDERS[side]} returned nothing — parked`); return result }
    if (b.needsAmendment) { result.status = 'needs-amendment'; result.amendment = { side, what: b.needsAmendment }; log(`${entry}: needs a foundation amendment (${side}): ${b.needsAmendment}`); return result }
  }
}

phase('Gate')
const g0 = await gateUntilGreen(mode === 'build'
  ? `Merge the side branches into ${args?.branch}: ${sides.map(s => args?.sides[s].branch).join(', ')}. Bring the stack up, run the gate command, leave the stack up.`
  : 'Run the gate on the entry branch after the conflict resolution. Leave the stack up.', 'r0')
result.gate = g0
if (!g0 || !g0.green) { log(`${entry}: the gate is still red — parked`); return result }

// ---------- the review rounds ----------

let head = g0.head
for (let round = 1; round <= maxRounds; round++) {
  const diffCmd = round === 1 ? `git diff ${args?.base}...${args?.branch}` : `git diff ${since}..${args?.branch}`
  const lastFixes = result.rounds.at(-1)?.fixes ?? []
  const panelInputs = (name) => `Round ${round} (${round === 1 ? 'whole' : 'delta'}). Entry ${entry}. You are ${name}.
${docs}
Worktree: ${args?.worktree} · branch ${args?.branch} · base ${args?.base}
The diff to read first: run \`${diffCmd}\` in the worktree.
The gate's evidence: ${args?.evidenceDir} (the gate output; screenshots)
The running stack: ${g0.stack}${round > 1 ? `

THIS IS A DELTA ROUND. The fixes applied since the last round:
${lastFixes.map(f => `- ${f.id} (${f.side}): ${f.fix}`).join('\n') || '(none listed)'}` : ''}`

  phase('Panel')
  const names = [...CODE_LENSES, ...(sides.includes('front') ? [VISUAL_LENS] : []), ...sides.map(s => QA[s])]
  log(`${entry} round ${round}: ${names.length} reviewers over \`${diffCmd}\``)
  const reviews = (await parallel(names.map(name => () =>
    agent(panelInputs(name), { label: `${name}·${entry}·r${round}`, phase: 'Panel', agentType: name, schema: REVIEW }).then(r => ({ lens: name, ...(r ?? { verdict: 'fail', verified: [], quote: '', findings: [] }), invalid: !r }))
  ))).filter(Boolean)

  const findings = []
  reviews.forEach(r => r.findings.forEach((f, i) => findings.push({ id: `${r.lens}#r${round}.${i + 1}`, lens: r.lens, ...f })))
  const invalid = reviews.filter(r => r.invalid).map(r => r.lens)
  if (invalid.length) log(`${entry} round ${round}: no output from ${invalid.join(', ')}`)

  phase('Judge')
  const j = await agent(`Round ${round}. Entry ${entry}.
${docs}
The ruler (read it whole first): ${args?.judgingPath}
Worktree: ${args?.worktree} · the diff: \`${diffCmd}\`
Reviewers that returned nothing this round: ${invalid.join(', ') || 'none'}
${result.rounds.length ? `Previous rounds' rulings:\n${JSON.stringify(result.rounds.map(r => ({ round: r.round, rulings: r.rulings })), null, 1)}\n` : ''}
The findings of this round:
${JSON.stringify(findings, null, 1)}`, { label: `${JUDGE}·${entry}·r${round}`, phase: 'Judge', agentType: JUDGE, schema: RULINGS })
  if (!j) { log(`${entry} round ${round}: the judge returned nothing — parked`); return result }
  addPrecision(j.precision)

  const fixes = j.rulings.filter(r => (r.ruling === 'sustained' || r.ruling === 'deferred') && r.side !== 'none')
    .map((r, i) => ({ id: r.ids.join('+') || `j#${i + 1}`, side: r.side, fix: r.fix }))
  result.rounds.push({ round, findings: findings.length, invalid, rulings: j.rulings, fixes, seen: j.seen })
  log(`${entry} round ${round}: ${findings.length} finding(s) → ${fixes.length} to fix, ${j.toUser.length} for the user`)

  if (j.toUser.length) { result.questions = j.toUser; result.head = head; log(`${entry}: parked for the user`); return result }
  if (!fixes.length) {
    await runGate('The entry is done: bring the stack down.', 'down')
    result.status = 'ready'; result.head = head
    log(`${entry}: ready at ${head}`)
    return result
  }
  if (round === maxRounds) { result.head = head; log(`${entry}: still ${fixes.length} to fix after ${maxRounds} rounds — parked`); return result }

  phase('Fix')
  since = head
  for (const side of ['back', 'front']) {
    const mine = fixes.filter(f => f.side === side)
    if (mine.length && sides.includes(side)) await builder(side, fixPrompt(side, mine), `fix-r${round}`)
  }
  const g = await gateUntilGreen('Run the gate on the entry branch after the fixes (no merge). Leave the stack up.', `r${round}`)
  result.gate = g
  if (!g || !g.green) { log(`${entry}: the gate is red after the round-${round} fixes — parked`); return result }
  head = g.head
}

return result
