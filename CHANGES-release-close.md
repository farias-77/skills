# v9 draft — stage 5 (release), stage 6 (close), weekly retro

Scope: `claude/skills/stage-release/`, `claude/skills/stage-close/`,
`claude/skills/weekly-retro/`, `claude/agents/release-scribe.md`,
`claude/agents/close-harvester.md`, `claude/workflows/close-harvest.js`,
and the stage 5/6 paragraphs of `README.md`.

Evidence paths are under `labs/code/designs/`:
`ING` = `2026-09-25-platform-ingestion`, `FND` = `2026-09-23-platform-foundation`,
`PAY` = `2026-09-15-creator-payments`, `INV` = `2026-09-15-inventory-and-person-fixes`,
`W40` = `_retros/2026-W40.md`.

What stays as it was: six stages; release keeps its control role (staging
on its own, production only through the project's CI) and his "vai?";
every fix is an entry `R.n` through stage 4; nothing is ruled at the close
and no issue is opened there; the pipeline changes only at the weekly.

## Changes

### Stage 5 — release

| # | Evidence | Change | Expected effect |
|---|---|---|---|
| R-1 | `ING/04-release/trace.md:6-8` (pre-flight 1–2 with him by `!` at 02:47; the bootstrap apply blocked for the session at 02:58; the builder dispatch and the credential read blocked at 02:59), `:11` (the apply's plan redone at 03:49 inside R.2), `:16` (the wait ended at its 2 h limit, 06:37), `:17` (the apply run by him at 12:26), `:18` (the "delegated" secret write blocked at 12:27) · `ING/04-release/plan.md:54` (secret write marked "delegável") · `ING/05-close/retro.md` W-15, I-13 ("9,5 h de espera") · `FND/04-release/trace.md:7,12` (the same apply class, twice) | `SKILL.md` step 0 and `references/plan.md` § pre-flight: everything only he can run, plus the four classes the classifier reserves for him (infra apply, writing a secret's value, reading a credential or a person's data, dispatching a production-deploy agent), goes to him **in one message and one PushNotification** right after the plan, each with its `!` command ready (or a scratchpad script that pipes the value), each final when sent. Those classes are never marked "delegated". The session keeps working on what does not depend on them. Template: a "Ready command" column and the "sent at" line. Release-local: the plan stage is not touched (this is not G-4) | The 9.5 h measured in ING drops to the time he takes to run the commands while he is still present; the 19 min stop at `trace.md:18` disappears |
| R-2 | `ING/04-release/trace.md:21` (red 2: Cloud Run refuses the job, secret without a version) · `ING/dreaming-notes.md:22-24` · `FND/dreaming-notes.md:20` · `FND/04-release/trace.md:11-12` (the Resend secrets moved and applied in the middle of the release) · `ING/05-close/retro.md` W-16, I-14 | `references/plan.md`: a secret that a resource mounts gets its value in the pre-flight, before the first deploy that creates the resource, even when the rollout puts it later; the rollout's line goes to `dreaming-notes.md` | One staging red avoided per first deploy (it happened in two releases in a row) |
| R-3 | `FND/dreaming-notes.md:22` (black-screen console behind a green suite; 414 journeys, all local), `:23` (the staging suite had never run) · `FND/04-release/trace.md:28-30` · CTO direction: the verifier re-runs on alpha | `SKILL.md` step 1, `references/plan.md`, plan/trace/report templates: once the CI's staging run is green, one `verifier (Sonnet 5.5, high)` per entry, in prove mode, runs that entry's acceptance checks against staging: browser journeys, side effects read back, the PII canary on staging's logs, and the lines stage 4 could not check locally that staging can reach. The failure-mode block stays in stage 4. FAIL or INCONCLUSIVE counts as a red. The "vai?" carries the verifier's line | Defects of the black-screen class, and a staging suite that never ran, are caught before "vai?" by the same checks that defined done, with video evidence |
| R-4 | `FND/dreaming-notes.md:23` (run from the station: ~10 min vs ~35 min per PR+CI+deploy cycle) · `FND/04-release/trace.md:26-33` (PRs #4, #5, #6 one after another) | `SKILL.md` step 1: when the defect is in the staging suite or the checks themselves (not in the product), the R.n's verifier runs them from the station against staging until they pass, then opens one PR | One CI+deploy cycle per test-only fix instead of one per attempt |
| R-5 | `PAY/dreaming-notes.md:16` ("tá maluco esperar isso tudo pra quê, vamos seguir sem vigília") · `PAY/04-release/trace.md:31-32` · `INV/04-release/trace.md:26,29` ("eu dou permissão para skippar"; OK = "no datapoints") · `ING/04-release/trace.md:34` (watch 4–6 read before the 2 h window, with a reason) | `references/watch.md`, `references/plan.md`, `SKILL.md`, plan template: an existing alarm's first evaluation is no longer a watch row. Its state is read once at the end of production and written as it is ("no datapoints" is not "healthy"). Wakeups are only for proofs with their own hour (first scheduled run, first real data). The 48 h cap is unchanged | No more 1 h waits that he cancels by hand (two in a row); the stage closes at the end of production unless a proof has its own hour |
| R-6 | `ING/04-release/trace.md:29` (the "vai" given in his goal U-50: "com a minha permissão de deployar em prod e mergear na main desde que siga o procedimento padrão") · `ING/04-release/plan.md:74` | `SKILL.md` step 3, trace template, README: when a goal of his already authorizes this production merge by name, the session quotes it verbatim as the answer (trace, `rulings.md`, release PR) and merges on green. Anything the goal did not foresee still asks: a production red, a new artifact after a rollback, a rollback not safe for data. It is still his "vai", given earlier | Matches what the last run did, without a second stop; the record shows his words either way |
| R-7 | `FND/04-release/trace.md:32` (git's standard reverts counted as 2 commits "fora da convenção") · CTO direction (revert rate) | `release-scribe.md`: git's own revert cancels the commit it names, is not "unparsed", and is returned under `reverts` | Clean versions, and the revert count the close and the weekly read |
| R-8 | CTO direction (stage report) | `SKILL.md` step 6 and the report template: "the stage report: follow claude/docs/stage-report.md (video, slides, blueprint)" | One report format across stages |

### Stage 6 — close

| # | Evidence | Change | Expected effect |
|---|---|---|---|
| C-1 | CTO direction (maintainability: "time bomb") · `proposals/v9/40-proposal.md:51,135` (revert rate as a metric) · R-7 | `SKILL.md` step 2, retro and trace templates: the session runs the project's structure check (the role in `docs/project-contract.md`; the doctrine names the command), in throwaway worktrees, on `main` at the workstream's merge-base and at the release merge, and compares the two with the project's comparison command, saving to `05-close/structure/`. Five numbers go before → after: duplication, complexity, boundary violations, gate runtime, reverts. A measure past the weekly's threshold becomes a `W-` with the files. No structure check in the project → "not measured" and one `doctrine` idea | Every workstream leaves a measured footprint on main's structure. The weekly can tell which workstream moved the trend |
| C-2 | `ING/05-close/trace.md:5` ("execution não leu os ~1700 arquivos de evidência (só os run-*.json)") · `close-harvest.js:21-22` before this change (folders passed as paths) | `references/harvest.md`, `close-harvest.js`, `close-harvester.md`: the harvest gets **files, never folders**. The session lists each `run-*.json` itself; the harvester reads exactly what it is given and never walks an entry's evidence | The harvester can no longer wander through ~1,700 evidence files. The cost is capped by the run files; recall is unchanged (they already record what the evidence showed) |
| C-3 | CTO direction (stage report) | `SKILL.md` step 6 and the trace template: the stage-report line | — |

### Weekly retro

| # | Evidence | Change | Expected effect |
|---|---|---|---|
| W-1 | CTO direction (a weekly report on main with a threshold that schedules a refactor slice) · C-1 | `SKILL.md` step 1b "the structure of main": for each repo merged that week, the structure check on main's last commit of the week, compared with last week; test runtime (median CI gate duration on main); revert rate (`git log`); trend against the four-week median. Default thresholds, unless the doctrine sets its own: boundary violations up; duplication or complexity +10%; test runtime +20%; reverts >5% or 2. Crossing one ranks a **refactor slice** group first on the board, with the files, the golden path to converge to, and as acceptance the measure back under the threshold with every acceptance check unchanged. On apply, its brief goes to `_refactor/<week>.md` as the next demand, built through stage 4 | A slow drift no single workstream shows becomes a scheduled refactor, decided on a board he already reads. No new stop |
| W-2 | `W40:36` (G-2 dropped after "nao entendi, isso é o teste em alpha?") | Steps 3–4: every group opens, on the board and in the question, with one plain sentence of what changes in practice, before any file or term | Fewer groups dropped because they were unclear |
| W-3 | `W40:28-36` (G-2 dropped) vs `ING/05-close/retro.md:239-244` (I-12 proposes the same thing again: the deploy workflow as a plan entry) · `W40:17-26` (G-1 dropped on his note) | Step 2: a group that proposes what he dropped at an earlier weekly goes under "dropped before" (the week, his words, the new evidence) and is not asked again. He can pull one back by naming it | His rulings hold, and the board stops spending questions on settled ground |
| W-4 | CTO direction (the weekly also gets video + slides) | Step 6: "the week's report: follow claude/docs/stage-report.md (video, slides; the board is its page)" | — |

### README

Stage 5 paragraph: R-1, R-3, R-5, R-6. Stage 6 paragraph: C-1, plus one
clause naming the weekly's trend.

## For his ruling

Not changed. Each one either contradicts a ruling of his or needs one.

| # | What | Evidence | Why it is his |
|---|---|---|---|
| H-1 | **A short path for config-only fixes in the release** (7 lines of config through the full stage-4 pipeline) | `FND/dreaming-notes.md:19` (his veto: "se for sempre isso, nosso fluxo de desenvolvimento está quebrado"; the budget currency fixed directly) · `ING/04-release/trace.md:5` (R.1 again done "via enxuta, sem entry") | It conflicts with his W40 drop of G-1 ("eu nao quero essas vias por risco", `W40:22-26`). The v9 stage-4 fix (one builder + verifier + reviewers) may make it unnecessary. Kept: every fix is `R.n` |
| H-2 | **A permission rule** that lets the session apply infra and write secrets in staging (or in a sandbox project) | `W40:101` (I-12 handed to him as operations) · `proposals/v9/40-proposal.md` Migration, phase 0 ("rule on … a permission rule for apply/destroy there") | Security posture. R-1 cuts the wait. This would remove the stop |
| H-3 | **A production smoke** by the verifier's read-only journeys after the prod deploy | `proposals/v9/40-proposal.md` §3 Ship ("Prod: a smoke run over the read-only journeys") | No run shows a production defect the CI's checks missed (prod was green first time, `ING/04-release/trace.md:31`, `FND/04-release/trace.md:37`). It is cost without evidence yet |
| H-4 | **Lessons become checks** (a lint, hook, verify gotcha or eval case), not prose or another reviewer, when the weekly applies a group | `proposals/v9/40-proposal.md` §4 Learn · `W40:76,86` (both applied groups were prose lines) | It changes what "apply" means at the weekly |
| H-5 | **Issues at the close**: the brief said "lessons become issues", but the current close opens none, and the house rule agrees (`CLAUDE.md`: "At the close nothing is ruled… The pipeline changes only at the weekly retro"; commit `1a96c9d`) | `PAY/05-close/trace.md:16` (his "nao vira issue no skills") | Kept as it is: no issue opened. Bringing issues back is his call |
| H-6 | **Secret before its consumer** as a doctrine rule (design side) | `ING/05-close/retro.md` I-14 ("lands: doctrine") | The project's doctrine. R-2 only enforces it in the release plan |
| H-7 | **The thresholds** (10% / 20% / 5% or 2 reverts / boundary violations up) and whether a refactor slice goes ahead of new features | W-1 | Cost and sequence. The defaults are a starting point, and the doctrine can override them |
| H-8 | **A cheaper harvester** (Sonnet 5.5 medium → low; it locates and quotes, like the scout) | No token record for the close (`ING/05-close/retro.md:11`: "tokens: o registro não traz") | No evidence that it is heavy beyond C-2. Recording the harvest's tokens first would settle it |

## Dependencies on other v9 files (not mine)

- `docs/project-contract.md` does not yet name the **structure check**
  and its **comparison** as roles, nor the **golden paths** file. C-1
  and W-1 refer to them as roles. The execute v9 author should add
  them; the kit being built at `proposals/v9/test/kit/`
  (`structure-check.sh`, `compare.sh`) is the reference
  implementation.
- R-3 relies on the `verifier` agent's prove mode accepting a staging
  environment as "the running stack" (URLs + actors + the sha it must
  find). `claude/agents/verifier.md` says "the running stack (URLs and
  actors)", which fits. Its "fresh build" step reads the deployed sha.
