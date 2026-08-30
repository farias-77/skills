/*
 * discovery-review.js — the stage-1 review round as deterministic code.
 *
 * Why a workflow: the guarantee that no lens is skipped must be
 * physical, not discipline. One mode: round 1 dispatches everything —
 * the three document lenses, the blind-reader panel and its ambiguity
 * pass; every later round passes `lenses` and dispatches only those —
 * the ones the judge kept open. The blind-reader experiment re-runs
 * only while `disc-reviewer-ambiguity` is in the set: fresh readers
 * diverge on something new every time they read, and re-running them
 * when ambiguity already converged is how the round manufactures its
 * own work. A clean pass without its "verified" enumeration is
 * re-dispatched once (a lazy pass is not a pass).
 *
 * THE READER PANEL is mixed-model on purpose — breadth over laps:
 * same-model readers share the same blind spots and agree too easily;
 * mixing Sonnet and Haiku decorrelates the readings, and the weaker
 * readers are the more sensitive ambiguity detector (the stage-3
 * principle at this end of the pipe). The referee clusters the builds
 * into camps per sentence; the judge rules each camp split by its
 * composition — a lone weak reader against a unanimous field is noise
 * unless the text itself admits that reading. Default 5 Sonnet + 5
 * Haiku; `readers` tunes it per demand.
 *
 * THE JUDGE closes the round, not the lenses: reviewers report at the
 * maximum bar (they always find something — that is by design), and
 * disc-judge rules every finding sustained / deferred / dismissed
 * against the discovery razor (a wrong guess would change what gets
 * built — the same razor stage 3's judge holds at the other end). The
 * returned `open` list is JUDGED: a lens stays open only for
 * sustained-ruled blocker/fix findings. An unruled finding counts as
 * sustained (fail-safe). `open` is the next round's `lenses`; empty
 * means the deltas converged — the stage's close is then ONE full
 * final round (no `lenses` arg) that the judge also clears.
 *
 * The briefs below carry INPUTS only — paths and round number. Every
 * instruction (each lens's rules, the reader's contract, the judge's
 * ruler) lives in the agent definitions under agents/, and the shared
 * reviewer contract in docs/standards/reviewer-contract.md.
 *
 * Invoked by the stage-discovery conductor:
 *   Workflow({ scriptPath: '<...>/workflows/discovery-review.js', args: {
 *                 // by scriptPath, never by name — the name registry
 *                 // does not reliably carry these workflows
 *     discoveryDir: 'absolute path to <slug>/00-discovery',
 *     round:        2,  // 1-based; informational, shown in labels
 *     lenses:       ['disc-reviewer-boundary'],  // the lenses this
 *                       // round runs — the previous round's `open`
 *                       // list. Omit on round 1 and on the full final
 *                       // round: everything runs.
 *     scope:        'what changed since the last round',  // optional;
 *                       // a focus note, not a fence — reviewers may
 *                       // still read everything
 *     readers:      { sonnet: 5, haiku: 5 }  // optional; the panel
 *                       // size per model — the default, tuned per
 *                       // demand by the conductor
 *   }})
 *
 * Returns { round, blockers, sustained, open, invalid, readings,
 * lenses } — lenses is [{ lens, verdict, verified, quote, findings,
 * invalid }] including the ambiguity pass; each finding carries `id`,
 * `ruling` and `reason` after judgment; `blockers`/`sustained` count
 * only sustained-ruled findings; `open` is every lens with a sustained
 * blocker/fix (pass it back as the next round's `lenses`; empty means
 * this round converged); readings is the panel's surviving builds,
 * each tagged with its reader id and model (kept for the audit). The conductor writes reviews.md (rulings included),
 * fixes the documents itself (stage 1's conductor is the writer),
 * takes to the interview what the judge marked "for the user", and
 * loops under the stage's exit rules — three delta rounds without
 * convergence turn everything still open into interview agenda.
 */

export const meta = {
  name: 'discovery-review',
  description: 'Stage-1 review round: walkthrough, acceptance and boundary lenses plus a mixed-model blind-reader panel and its ambiguity pass — the judge rules every finding by the discovery razor; deltas re-run only what stayed open',
  phases: [
    { title: 'Lenses', detail: 'the round’s document lenses over both documents' },
    { title: 'Blind reads', detail: 'the reader panel — 5 Sonnet + 5 Haiku by default — commits to concrete builds, alone; only while ambiguity is open' },
    { title: 'Ambiguity', detail: 'the referee clusters the panel’s builds into camps and runs the cross-document pass' },
    { title: 'Judge', detail: 'disc-judge rules every finding sustained/deferred/dismissed by the discovery razor', model: 'opus' },
  ],
}

const AMBIGUITY = 'disc-reviewer-ambiguity'
const JUDGE = 'disc-judge'
const DOC_LENSES = ['disc-reviewer-walkthrough', 'disc-reviewer-acceptance', 'disc-reviewer-boundary']
const ALL = [...DOC_LENSES, AMBIGUITY]

const READING = {
  type: 'object', additionalProperties: false,
  required: ['builds', 'covered'],
  properties: {
    builds: {
      type: 'array', minItems: 1,
      items: {
        type: 'object', additionalProperties: false,
        required: ['sentence', 'build'],
        properties: {
          sentence: { type: 'string', description: 'the normative sentence, verbatim' },
          build: { type: 'string', description: 'the concrete thing this reader would build — exact values, time anchors, actor, persistence, visibility' },
        },
      },
    },
    covered: {
      type: 'array', minItems: 1,
      items: { type: 'string', description: 'a story ID or PR-FAQ section this reader swept' },
    },
  },
}

const REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'verified', 'quote', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'pass with fixes', 'fail'] },
    verified: {
      type: 'array', minItems: 0,
      items: { type: 'string', description: 'one point this reviewer actually checked, with where it looked' },
    },
    quote: { type: 'string', description: 'verbatim sentence from the material it judged — the proof it read' },
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['severity', 'title', 'says', 'gap', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
          title: { type: 'string' },
          says: { type: 'string', description: 'what the material says, verbatim or "nothing"' },
          gap: { type: 'string', description: 'the concrete problem, through this lens' },
          fix: { type: 'string', description: 'the concrete change that would resolve it' },
        },
      },
    },
  },
}

const JUDGMENT = {
  type: 'object', additionalProperties: false,
  required: ['rulings'],
  properties: {
    rulings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'ruling', 'reason'],
        properties: {
          id: { type: 'string', description: 'the finding id exactly as given' },
          ruling: { type: 'string', enum: ['sustained', 'deferred', 'dismissed'] },
          reason: { type: 'string', description: 'one or two concrete sentences; say "for the user" when only the user can settle it, name the recurrence when the history shows one' },
        },
      },
    },
  },
}

const round = args?.round ?? 1

// The round runs exactly the lenses it was given — the previous round's
// `open` list — or everything when none is named (round 1, and the full
// final round). The blind readers belong to the ambiguity pass: they
// run only when it does.
const requested = Array.isArray(args?.lenses) ? args.lenses : []
const unknown = requested.filter(n => !ALL.includes(n))
if (unknown.length) log(`unknown lens name(s) ignored: ${unknown.join(', ')}`)
const named = requested.length ? ALL.filter(n => requested.includes(n)) : ALL
const docLenses = named.filter(n => n !== AMBIGUITY)
const withAmbiguity = named.includes(AMBIGUITY)
const shape = named.length < ALL.length ? 'delta' : 'full'

const inputs = `Round ${round}${shape === 'delta' ? ' (delta round — these lenses did not pass last round)' : ''}.
The documents: ${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md
The round audit so far: ${args.discoveryDir}/reviews.md${args?.scope ? `
Changed since the last round (the focus; the rest is context): ${args.scope}` : ''}`

// Re-dispatch once on the two invalid shapes: a dead agent, or a lazy
// clean pass (zero findings AND no verified enumeration proves nothing).
const reviewed = async (dispatch, name) => {
  let r = await dispatch()
  if (!r || (r.findings.length === 0 && r.verified.length === 0)) {
    log(`${name}: ${r ? 'clean pass without verification' : 'no output'} — re-dispatching`)
    r = await dispatch()
  }
  const lazy = r && r.findings.length === 0 && r.verified.length === 0
  return r && !lazy ? { ...r, invalid: false }
    : { verdict: 'fail', verified: [], quote: '', findings: [], invalid: true }
}

// The panel: mixed models, decorrelated readings. Every reader is the
// same disc-blind-reader definition — the model is set per dispatch.
const PANEL = { sonnet: 5, haiku: 5, ...(args?.readers ?? {}) }
const panelSpec = [
  ...Array.from({ length: PANEL.sonnet ?? 0 }, (_, i) => ({ id: `s${i + 1}`, model: 'sonnet' })),
  ...Array.from({ length: PANEL.haiku ?? 0 }, (_, i) => ({ id: `h${i + 1}`, model: 'haiku' })),
]
// The experiment stands on breadth: below half the panel (min 2) the
// divergence signal is not the one the judge is calibrated for.
const QUORUM = Math.max(2, Math.ceil(panelSpec.length / 2))

const readBlind = async (spec) => {
  const dispatch = () => agent(inputs, {
    label: `read#${spec.id}r${round}`, phase: 'Blind reads',
    agentType: 'disc-blind-reader', model: spec.model, schema: READING,
  })
  let r = await dispatch()
  if (!r) {
    log(`reader ${spec.id} (${spec.model}): no output — re-dispatching`)
    r = await dispatch()
  }
  return r ? { reader: spec.id, model: spec.model, ...r } : null
}

// ---------- the round: doc lenses and (when open) readers, concurrently ----------

phase('Lenses')
log(`round ${round}: ${shape} — ${named.length}/${ALL.length} lens(es)${shape === 'delta' ? ': ' + named.join(', ') : ''}`)
const [lensResults, readings] = await parallel([
  () => parallel(docLenses.map(name => () =>
    reviewed(() =>
      agent(inputs, { label: `${name}#r${round}`, phase: 'Lenses', agentType: name, schema: REVIEW }),
      name).then(r => ({ lens: name, ...r }))
  )),
  () => withAmbiguity
    ? parallel(panelSpec.map(spec => () => readBlind(spec))).then(rs => rs.filter(Boolean))
    : Promise.resolve([]),
])

// ---------- the ambiguity pass, with both builds in hand ----------

const lenses = [...lensResults]
if (withAmbiguity) {
  phase('Ambiguity')
  if (readings.length < QUORUM) {
    log(`only ${readings.length}/${panelSpec.length} blind reading(s) survived after retry (quorum ${QUORUM}) — the panel experiment is invalid this round`)
    lenses.push({ lens: AMBIGUITY, verdict: 'fail', verified: [], quote: '', findings: [], invalid: true })
  } else {
    const builds = readings.map(r =>
      `READER ${r.reader} (${r.model}):
${JSON.stringify({ builds: r.builds, covered: r.covered }, null, 2)}`).join('\n\n')
    lenses.push(await reviewed(() =>
      agent(`${inputs}

The panel's ${readings.length} blind builds of these documents (${panelSpec.length} dispatched — mixed models, decorrelated on purpose):

${builds}`, {
        label: `${AMBIGUITY}#r${round}`, phase: 'Ambiguity',
        agentType: AMBIGUITY, schema: REVIEW,
      }), AMBIGUITY).then(r => ({ lens: AMBIGUITY, ...r })))
  }
}

// ---- The judge: the lenses report, the judge closes ------------------
// Every finding gets an id; disc-judge rules each one against the
// discovery razor. An unruled finding counts as sustained — fail-safe,
// never fail-silent.
const allFindings = []
for (const r of lenses) r.findings.forEach((f, i) => {
  f.id = `${r.lens}#${i + 1}`
  allFindings.push({ lens: r.lens, f })
})

if (allFindings.length) {
  phase('Judge')
  const board = allFindings.map(({ lens, f }) =>
    `[${f.id}] ${lens} · ${f.severity} · ${f.title}
  says: ${f.says}
  gap: ${f.gap}
  fix: ${f.fix}`).join('\n')
  const dispatchJudge = () => agent(`${inputs}

The round's lenses have reported. Read the documents and the round audit (reviews.md — the history of what was already sustained and fixed), then rule EVERY finding below, by its id.

${board}`, { label: `${JUDGE}#r${round}`, phase: 'Judge', agentType: JUDGE, schema: JUDGMENT })

  let judgment = await dispatchJudge()
  const ruled = new Map((judgment?.rulings ?? []).map(x => [x.id, x]))
  if (allFindings.some(({ f }) => !ruled.has(f.id))) {
    log('judge: unruled finding(s) — re-dispatching once')
    judgment = await dispatchJudge()
    for (const x of judgment?.rulings ?? []) if (!ruled.has(x.id)) ruled.set(x.id, x)
  }
  for (const { f } of allFindings) {
    const r = ruled.get(f.id)
    f.ruling = r?.ruling ?? 'sustained'
    f.reason = r?.reason ?? 'UNRULED — sustained by construction'
  }
}

const sustainedOf = r => r.findings.filter(f => (f.ruling ?? 'sustained') === 'sustained')
const blockers = lenses.reduce((n, r) => n + sustainedOf(r).filter(f => f.severity === 'blocker').length, 0)
const sustained = lenses.reduce((n, r) => n + sustainedOf(r).length, 0)
const invalid = lenses.filter(r => r.invalid).map(r => r.lens)
// A lens stays open only for a sustained blocker/fix (or an invalid
// run). Everything else is finished for the deltas — deferred rulings
// batch into the close sweep, dismissed ones die with their reason. The
// stage's close is the full final round, judged by the same ruler.
const open = lenses.filter(r =>
  r.invalid || sustainedOf(r).some(f => f.severity !== 'detail')
).map(r => r.lens)
log(`round ${round}: ${allFindings.length} finding(s) → ${sustained} sustained (${blockers} blocker(s)) · ${lenses.length - open.length}/${lenses.length} closed${invalid.length ? ' · INVALID: ' + invalid.join(', ') : ''}`)
log(open.length ? `still open (next round's lenses): ${open.join(', ')}` : 'converged — no lens holds a sustained finding')

return { round, blockers, sustained, open, invalid, readings, lenses }
