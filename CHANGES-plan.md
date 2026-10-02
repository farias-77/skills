# CHANGES — stage 3 (Plan) for v9

Branch `v9-draft`. This changes only stage 3: `claude/skills/stage-plan/`,
`claude/agents/plan-*.md`, `claude/workflows/plan-review.js`, and the
stage 3 paragraph of `README.md`.

**Goal.** The plan hands v9's execute stage exactly what it needs:
- checkable **acceptance** lines, which the verifier turns into checks
  before the build;
- the **golden paths** that one builder per entry follows;
- entries small enough for **one context**.

At the same time, the plan catches at stage 3 the foundation gaps that
used to cost stage 4 hours.

Evidence paths are short:
- `L/` = `labs/code/designs/2026-09-25-landings/`
- `I/` = `labs/code/designs/2026-09-25-platform-ingestion/`
- `PF/` = `labs/code/designs/2026-09-23-platform-foundation/`
- `W40` = `labs/code/designs/_retros/2026-W40.md`
- `v9/` = `proposals/v9/`

## The foundation amendments, classified

The three runs had 26 amendments in total.

| Class | Amendments | Cheapest catch at plan |
|---|---|---|
| A name the entry needs is missing from a frozen file or from F's harness: a contract field or input, a module read, a config key, a per-project test target, a time budget | PF F.1, F.2, F.3, F.4, F.7, F.8, ½ F.6, F.9 (partly) · L F.1 | The foundation's writer goes first and lists every name F creates ("Provides"). Each entry writer copies the names it uses from that list. A missing name becomes a question before the review (rows 2 and 3) |
| Additions to non-frozen files that F created: tokens, a component's props, a shared icon, enum values, a fake's mode, an exported rule | L F.5, F.6, F.7, F.8 · I F.2, F.3, F.4, F.7 | No catch is needed: only the doctrine's shared files are frozen, and the entry extends the rest (row 1) |
| A foundation test pinned a stub that the entry replaces | I W-5 (E-01, E-08, X.8, X.10 sent back) | A rule: no foundation test pins a stub (row 4) |
| A duty with no owner | I W-6 (I F.2) | Every "Uses" line names its producer (row 3) |
| Not the plan's: a latent defect, the environment, another workstream's merge, a dependency, a change of rule mid-stage | L F.2, F.3, F.4, F.9 · I F.1, F.5, F.6 · PF F.5, F.10 | Out of scope. PF F.5 is already handled by P-02 (the ruler is closed before stage 4) |

## Changes

The effects are estimates ("est."), except where a count is shown.

| # | Evidence | Change | Expected effect |
|---|---|---|---|
| 1 | `L/02-plan/plan.md:109,113,117` (F.7, F.6, F.5) and `L/03-execution/slices/F.8.md:1`: all four are tokens, a component's props or a shared icon. `I/02-plan/plan.md:148,149,151,154` (F.2, F.3, F.4, F.7): a domain function, enum values, a fake's mode, an exported rule. The plans had widened "frozen" beyond the doctrine: `L/02-plan/briefs/E-01.md:11` ("Onde a F não deixou uma dessas peças… é emenda da fundação") and `I/02-plan/briefs/E-04.md:11` (the domain types). `v9/20-build.md:45-50` ("most were helpers and tokens that this rule removes") | `SKILL.md` §Three words and §six rules, and the `brief.md` and `plan.md` templates. **Only the doctrine's shared files are frozen** after F: migrations, the contract, the generated code, the module registry. The plan never widens that list. An entry extends any other file F created by addition, or by a correction toward the design. It declares this under the brief's new section **"Extends"**. The order lens treats a declared Extends as no collision | 8 of the 16 amendments in landings and ingestion would not exist. In landings each one ran 1–3 rounds and held an entry (est. −1 to −2 h of stalled entries per workstream). Risk: two entries add the same thing. The structure-reviewer's duplication check and the order lens's "same addition" rule catch it |
| 2 | `PF/03-execution/retro/flow.md:151-163`: F.1–F.4, F.7, F.8 and ½ F.6 had "sim" in the stage-3-check column; 5.6 h of stalled entries, 2.7 h on the critical path. `L/02-plan/plan.md:121` (F.1: an undeclared header). `I/02-plan/reviews.md:163`: "A maior parte do round nasceu das correções do round 1" (round 2 came from F's harness names mirrored into seven briefs). `L/02-plan/plan.md:123`: 9 of the 26 writer answers added pieces to F after the entry briefs were written | `SKILL.md` §Step 3, `plan-writer.md`, `brief.md`. **3a**: the foundation's writer runs alone first. It writes F.md with **"Provides"** (every name F creates, exactly as an entry imports it) and **"Exemplars"**. **3b**: the entry writers run in parallel against F.md. Each writes **"Uses from the foundation"** with names copied verbatim from Provides. A missing name comes back as an `F gap` question. The conductor adds it to F (`ruled: conductor`, open to veto) before round 1. The (a)–(e) walk of P-01 (approved 28/09) stays, now done by each writer for its own entry, name by name. Category (a) also covers the inputs a route reads (L F.1) | The P-01 class of gaps is caught before the review, not at round 1 or at stage 4. PF's retro put this class at ~3.2 h on the critical path (`PF/retro-stage-4.md:265`). Plan wall clock: +15–25 min for the serial F writer (est.). Round 2 loses its biggest source: renames of F's names after the entries were written |
| 3 | `I/05-close/retro.md:88-92` (W-6): "O plano deu à E-02 a sequência de janelas do export e nenhuma entry a calculava". `I/05-close/retro.md:183-188` (I-4): "todo dever de brief tem dono" | `brief.md` "Uses" has a **Producer** column (F, or an entry behind an edge). A use with no producer is a question (`plan-writer.md` step 4). Missing producers are a never-dismissed class in `references/judging.md` | Amendments of the I F.2 class become writer questions |
| 4 | `I/05-close/retro.md:82-86` (W-5): foundation tests asserting `ErrNotImplemented` went red when the entry built the operation: "needs-amendment em E-01, E-08, X.8, X.10, F.1". The plan template asked for it: "expect … the new routes answer 501" (old `templates/plan.md`) | `SKILL.md` §How the foundation is found: **no test pins a stub**. The F proof in `plan.md` drops the "answers 501" expectation. `plan-reviewer-order.md` and `plan-reviewer-verifiability.md` flag such a test. `judging.md` never dismisses it | 4 needs-amendment returns in the ingestion would not happen (est. ~0.5–1 h each of a builder rerun) |
| 5 | v9 execute: `claude/agents/verifier.md:32-46` writes "one check per line of acceptance", reading back "the stored rows and the side effects". `claude/workflows/exec-entry.js:15-24` writes them "from the brief's acceptance and proof lines" | `brief.md` **"Acceptance"** table: carries · actor does · observes · side effect read back · check (journey or integration). A bad path is required for each route and each permission. Screens list both themes, 390 px and the artboard. `plan-writer.md` step 2. `plan-reviewer-verifiability.md` is rewritten to judge acceptance lines ("could a verifier write exactly one check from this line…") | The verifier gets lines it can turn into checks with no guess. The read-back is explicit, so a check cannot pass on a screen that never stored anything (the referee example in `plan-reviewer-ambiguity.md`) |
| 6 | `exec-entry.js:98` takes `gateCommands` once for every entry. In `L/02-plan/reviews.md`, 17 of the 43 finding groups across the two rounds were about commands and what they print, repeated in six briefs: G-1, G-3–G-6, G-8–G-10 at lines 29–60, and H-1, H-2, H-6, H-7, H-9–H-12, H-14 at lines 137–180 | `templates/plan.md` gets a new **"Gate commands"** section, fixed once at the cut. No brief repeats them (`SKILL.md` six rules, `plan-writer.md` step 2). `judging.md` dismisses a finding about how a brief spells a gate command, quoting `plan.md` | est. −35 to −40% of plan findings on a landings-sized plan, and fewer writer apply batches |
| 7 | CTO direction (golden paths per entry). `builder.md:12-14,33-37` and `structure-reviewer.md:40-44` read "the exemplary module the golden paths name for its kind" | `templates/recon.md` gets a **"Golden paths"** section: kind → exemplar → which rule picked it. `plan-scout.md` step 5 fills it. `brief.md` gets **"Golden paths"**: kind → path, from the recon or from F. The coverage and verifiability lenses check that every kind has one | Every builder of the same kind follows one named module. Example: in L F.6, E-01 had built "a parallel `SectionHead.tsx`", which the panel refused (`L/02-plan/plan.md:113`). Fewer structure-reviewer blocks (est.) |
| 8 | CTO direction (F creates the first exemplar). `I/02-plan/plan.md:145`: F already laid "esqueletos `Service`/`Store` dos três módulos", ad hoc | `SKILL.md` §The foundation lays the first exemplar. `brief.md` F-only **"Exemplars"**. `templates/plan.md` gets an `exemplar` row. When the recon says "none" for a kind, F builds the first instance in the doctrine's full shape, with no business behavior | Parallel entries of a new kind write one shape, not one each |
| 9 | Merged entry diffs in `labs-platform` (`git diff --shortstat <merge>^1 <merge>`) ran from 1,140 to 4,232 lines. L E-01 (4,158) and E-03 (4,232) took 4 rounds each; E-04 (1,140) and E-05 (1,530) took 3 (`L/03-execution/board.md:5-26`). `v9/20-build.md:523`: "An L slice is too much for one context" | `SKILL.md` §The size cap: **L is the cap**. That is one screen with its states and one server flow, ≤ 8 story ACs, and about ≤ 2,500 changed lines with tests. Over the cap, the entry splits into thinner vertical slices. `brief.md` gets **"Size"**. The verifiability lens checks it | One builder per entry fits one context (est.). The two landing-page-sized entries would have been cut in two |
| 10 | `L/02-plan/reviews.md:195`: "H-2 é a G-1 de novo, nos dois briefs que a ruling do round 1 não mandou corrigir". `I/02-plan/reviews.md:163`. `W40:68-76`: G-6, propagation of a fix across documents, **applied** by him to the design | `SKILL.md` §Step 4: before a fix batch leaves, the conductor greps every changed name, value or key across the briefs and `plan.md`. Every hit goes to its writer in the same batch | Round-2 findings that are recurrences or propagation misses disappear (est. 3–6 per round 2 on landings or ingestion) |
| 11 | v9 execute delta: "only the reviewers that blocked re-check their own items" (`exec-entry.js:53-56`) | `plan-review.js` gets a new `lenses` argument: a delta round re-runs only the lenses with a finding sustained in round 1. `SKILL.md` §Step 5 passes it. Blind readers reopen only the briefs whose acceptance or builds changed | Small today: in all three runs every lens had something sustained in round 1. It pays once rows 2 and 6 empty a lens. Round 2 stays automatic, as the house rule says |
| 12 | v9: "the verifier and the builder are two readers too". The old blind-reader key `proof` compared command lines that are now plan-level | `plan-review.js` KEYS: `proof` → `acceptance`. `plan-blind-reader.md` and `plan-reviewer-ambiguity.md` now compare what the checks would assert | Ambiguity in the acceptance line, the thing the verifier and the builder read apart, is caught at plan |
| 13 | CTO direction: fewer stops that are not his rulings. `L/02-plan/plan.md:123`: 26 writer answers, of which 9 were F additions | `SKILL.md` interruptions paragraph and Step 3: a foundation gap a writer raises is ruled by the conductor when the graph keeps its shape. It is listed at the close for veto and is never a stop | No new stop; the F additions stop needing him |
| 14 | Task instruction | `SKILL.md` §Step 6: "the stage report: follow claude/docs/stage-report.md (video, slides, blueprint)" | The close produces the stage report |
| 15 | Single builder per entry (`builder.md:97-100` owns the feature map) | The brief's feature-map line names the rows, not a side. `templates/plan.md` "Feature map" column holds rows | P-06 (side ownership) is kept in spirit; it is moot with one builder |

What is checked and kept, not added again:
- **P-01** (the walk "a fundação serve cada entry", approved 28/09) is in `SKILL.md` and `plan-reviewer-order.md` and is kept. Row 2 changes who runs it and when.
- **P-02** (the ruler closed before stage 4) is kept.
- **P-03** (the stacked edge) is kept.
- **P-04** (size and critical path) is kept, and the size now has a cap.
- **P-05** (the measured cap) is kept.
- The pre-flight stays as it was: what the entries need and the open decisions of doctrine or test. Nothing from the release is added (G-4 respected).

## For his ruling

**Applied, open to his veto**

These are cheaper mechanisms that hit the evidence of a dropped group.

1. **The "Uses → Provides" comparison in the order lens (row 2).** It touches
   G-5's evidence. He dropped G-5 at W40 (`W40:58-66`): "a lens table:
   every table, route, module, factory, fake and config → the F line;
   use without line is a blocker". The difference:
   - here the **writer** writes the list, which it needs anyway for the
     builder;
   - it writes it **before** the review, against a fixed F.md;
   - a gap becomes a question answered before round 1, not a finding and
     a round.

   The lens only compares two lists the briefs already carry, so it reads
   no more than it did under P-01 (approved 28/09, `PF/retro-stage-4.md:265`,
   which put this check in the order lens). If he wants G-5's drop to cover
   this too, remove the "Every name an entry uses is provided" bullet from
   `plan-reviewer-order.md`. The writer-side lists still catch the class.
2. **The narrowed freeze (row 1).** It reverses the plans' habit of freezing
   everything F created. Risk: duplicated additions by parallel entries.
   The structure-reviewer and the merge are the guard.

**Not applied**

3. **I-12** (`I/05-close/retro.md:239`): "o workflow de deploy é entry do
   plano". It is close to **G-2** (first-deploy entry), which he dropped
   at W40 (`W40:28-36`). The v9 proposal moves the first deploy into
   Build (`v9/40-proposal.md:93-97`). That is the execute author's call
   and his, not the plan's.
4. **I-5** (`I/05-close/retro.md` I-5, W-7): the machine scout also
   measures disk pressure (`/proc/pressure/io`), and the cap comes from
   the first resource that saturates. Three false reds came from disk.
   It costs one line in `plan-scout.md`. It is held because v9's execute
   may set concurrency by load slots (`v9/40-proposal.md:115`).
5. **The foundation is over the size cap.** The merged F diffs were
   9,574 lines in 186 files (landings) and 10,714 lines in 135 files
   (ingestion). PF's F took 11.9 h. In v9 F gets one builder too. An
   option: split F by side (F-server, F-screen) when it exceeds L. The
   cost is one more serial step, or a generated-client hand-off.
6. **Skip round 2 when round 1 sustained only wording.** This contradicts
   the house rule in `CLAUDE.md` ("round 2 runs automatically over the
   delta"), so it is left for him. Rows 2, 6 and 10 should already shrink
   round 2.
7. **F's proof exercises a route's final response shape** (204 with no
   body, a header the handler reads). Source: `L/dreaming-notes.md:6`
   ("o stub 501 da F escondia"). It needs a test route in F or a proxy
   test. Unclear that it is cheaper than the verifier's red-first checks
   in v9.
8. **Who writes F's exemplars into the project's golden paths file.**
   The builder may not edit it (`builder.md:147-148`). Suggestion for the
   execute author: after F merges, the session adds F's "Exemplars" to
   `golden-paths.md`. The briefs already carry the paths, so stage 4
   works either way.
