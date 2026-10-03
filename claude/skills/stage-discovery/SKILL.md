---
name: stage-discovery
description: Conducts stage 1 (Discovery) — an interview in which the user says what to build while a clickable mock of it is built and iterated in front of him. The mock is exact in look and behavior, every state reachable, fully faked and never fragile; he validates through it and locks it ("lock it", in his words). From the locked mock, journeys, use cases and acceptance criteria (given/when/then, tied to a journey step and a rule) are derived, a one-page PR-FAQ is written, one review round plus a delta runs, and the stage closes with video, slides and blueprint. The conductor is Opus 5.5 (medium; high on the turns that rule). Use when the user brings a new demand, asks to open a discovery, or resumes one.
disable-model-invocation: false
argument-hint: "[slug]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, ArtifactData, ArtifactComments, Skill, WebSearch, WebFetch, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(cp *), Bash(rm *), Bash(git *), Bash(node *), Bash(sha256sum *), Bash(realpath *)
---

# Stage 1: Discovery

He says everything that needs to be built. You compile it into
something nobody can misread: a **mock** of the product, built while he
talks, that looks and behaves exactly like what will be built, with
every screen and every state, all of it faked and none of it fragile.
He validates by using it. When he locks it ("lock it", in his words), the journeys, the
use cases and the acceptance criteria are derived from it, so every
later stage builds against a thing he clicked, not a text he read.

Discovery decides **what** gets built and **how it looks and behaves**.
It does not decide how it is built: no architecture, no data model, no
technology. Stage 2 makes the mock real.

The conductor is **Opus 5.5 at medium effort**, raised with `/effort
high` for the turns where it rules (the lock gate, judging the
review). If the session runs another model, ask him to switch
(`/model`) before the first question and wait. A non-interactive run
cannot switch: continue on the session's model and effort and write
one line in `dreaming-notes.md`.
At the open, load the interview pack: `Skill` →
`pack-interview-journeys-copy`. Its checklist (I-, J-, C-, A- items) is
the bar this stage is held to.

## Two modes, declared

**Interview mode** — D1, the conversation side of D2, the lock gate's
summary (D3), the lock (D4), and the one batch of questions in D6. He
is in the room; questions are the work. Never run ahead of his answers,
never decide in his place, never put in the mock a rule he did not say
or confirm (a guess goes to the notes' Inferred block and is asked
before the lock).

**Autonomous mode** — D0, every prototyper build, D5, D6 except its
question batch, and the file work of D7. He is waiting, not answering.
Dispatch, run, judge, write, publish, without asking permission. Say in
one line what you are about to do; close with a recap that stands on
its own. Never end a turn on a plan or a promise.

## The pattern

```
D0 recon        from his first sentence, in the background: feature maps, current screens,
                exported tokens and components, other fronts           scout (Sonnet 5.5, low) ×N
D1 interview    voice dump → grilling in batches of ≤ 4 through the question tool → notes.md
D2 mock loop    one journey clear → prototyper (Opus 5.5, medium) builds v1 in the background →
                walk → publish (local mode: shots) → he clicks, gives step verdicts, comments,
                talks → v2, v3 …
                D1 and D2 run together until no question passes the razor
D3 lock gate    prototype-checker (Sonnet 5.5, high): the mechanical walk of every journey and
                every state, the taste checklist on screenshots, his verdicts on this version;
                may run beside his last round of feedback
D4 lock         he says "lock it" → proto.mjs lock → LOCK.json, versions/vN.html, frames/
D5 derivation   journey-scribe (Sonnet 5.5, high) ∥ disc-author-prfaq (Sonnet 5.5, high)
                → journeys/*.yaml, stories.md, pr-faq.md, their JSON → proto.mjs trace
D6 review       discovery-review: round 1 whole, round 2 delta. You judge; his questions go
                out in one batch
D7 report       blueprint JSON → build → video (the mock in use) → slides → approval → /clear
```

He is in the loop at four points: the interview with the mock (D1–D2),
the lock (D4), the one batch of questions (D6) and the approval (D7).

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the conductor (this session) | Opus 5.5, medium; high on the turns that rule | interviews, relays feedback, publishes, judges, asks |
| `scout` | Sonnet 5.5, low | recon: quotes the feature maps, the tokens export, other fronts |
| `prototyper` | Opus 5.5, medium | builds and iterates the mock from the shell, the notes and the recon |
| `prototype-checker` | Sonnet 5.5, high | the lock gate: mechanical walk plus the design-taste checklist |
| `journey-scribe` | Sonnet 5.5, high | derives journeys, stories and AC from the locked mock and the notes |
| `disc-author-prfaq` | Sonnet 5.5, high | the one-page PR-FAQ from the locked mock and the notes |
| `disc-reviewer-acceptance` | Sonnet 5.5, medium | can a stranger judge each AC; does the set cover the mock? |
| `disc-reviewer-boundary` | Sonnet 5.5, medium | is every capability In or Out, nothing in limbo? |
| `disc-blind-reader` | Sonnet 5.5, low | walks the mock with one story only, AC by AC |
| `video-scribe`, `slides-scribe` | Sonnet 5.5, medium · Sonnet 5.5, high | the stage report (D7) |

## Files

```
designs-root/<slug>/
├── .state.md                 # stage, step (D0–D7), kit (resolved), mode (artifact | local), mock URL and version, locked version, round
├── rulings.md · taste-notes.md · dreaming-notes.md      # house files, created on first use
├── blueprint/                # workstream.json, prfaq.json, stories.json, review.json, report.json, figures.json
├── blueprint.html            # built, never edited
├── report/discovery/         # storyboard.json, video.mp4, project/ (the deck)
└── 00-discovery/
    ├── notes.md              # the interview, written every turn
    ├── telemetry.json        # the stage's measures (claude/docs/telemetry.md)
    ├── recon/                # areas.md (the scouts' quotes), screens/*.png
    ├── prototype/
    │   ├── index.html        # the mock: the file published; the prototyper's only output
    │   ├── versions/vN.html  # every published version, copied before the publish
    │   ├── walks/vN.json     # the walk of each version
    │   ├── walks/verdicts.json  # local mode only: his step verdicts, written by you from the chat
    │   ├── shots/vN/         # local mode only: the pictures he looked at (proto.mjs shots)
    │   ├── gate-vN.md        # the checker's report at D3
    │   ├── frames/           # at the lock: <screen>.<state>.png (the reference), every state × theme × language × width (gitignored),
    │   │                     # journeys/J<n>.s<k>.png (every step), manifest.json
    │   └── LOCK.json         # version, date, his words, sha256 of the source and of the frames
    ├── journeys/J<n>-<name>.yaml
    ├── stories.md            # use cases + acceptance criteria
    ├── pr-faq.md             # one page
    ├── reviews/round-N.json  # the workflow's return (its `.result`), as is
    ├── reviews/rN/stories/   # stories.md cut for round N (proto.mjs split)
    └── reviews.md            # the judging audit
```

(`_run/`, at the workstream root, is not committed: the review
workflow's copy when the host refuses its path, D6.)

The tool behind the mechanical steps is
`node ${CLAUDE_SKILL_DIR}/scripts/proto.mjs` (written `proto.mjs`
below): `walk`, `frames`, `look`, `shots`, `lock`, `trace`, `split`;
its header documents each.

## Prerequisites and the host

**The kit's paths.** `${CLAUDE_SKILL_DIR}/../..` is the pipeline's
`claude/` folder (written `<kit>` below). When the skills folder is a
symlink, `..` resolves through the link's target, not beside the
link: at the open run `realpath ${CLAUDE_SKILL_DIR}/../..` once, write
it in `.state.md` as `kit:`, and give every agent the resolved paths
(`<kit>/blueprint/schema/discovery.md`, `<kit>/skills/stage-discovery/scripts/proto.mjs`).

**The browser.** `proto.mjs` needs `playwright-core` and a Chromium.
It finds `playwright-core` in `PLAYWRIGHT_DIR` when set, else in the
pipeline's own video kit (`<kit>/video/node_modules`; `npm ci` there
installs it), else in the working directory and the global modules;
the browser in `PROTO_CHROME`, else the system Chrome or Chromium. If
either is missing at the open, say so in one line with the install
command (`npm ci --prefix <kit>/video`) and keep interviewing.

**The host's tools.** Check at the open which of these the session
has; say in one line what is missing and run on:

| Missing | What changes |
|---|---|
| `Artifact`, `ArtifactData`, `ArtifactComments` (a headless or cloud run, a host without claude.ai artifacts) | **local mode** (below); `.state.md` gets `mode: local` |
| the question tool | the batches go as text, same shape (D1) |
| `Workflow` accepting the review's `scriptPath` (the kit is a symlink that resolves outside the working directories) | copy it into the workstream, sha checked (D6) |

**Local mode.** The mock is never published; everything else holds.

| Step | With the Artifact tools | Local mode |
|---|---|---|
| D2, each version | publish `index.html` | `node proto.mjs shots 00-discovery/prototype/index.html <the changed states and journeys>` writes `prototype/shots/v<N>/`; the message gives the PNG paths (attached when the host shows images) and the path of `index.html` |
| his step verdicts | the `walks` collection, read with `ArtifactData` | he answers in chat per journey or step ("J2 as it should", "J3.s2 change: …"); you write each answer as a row of `prototype/walks/verdicts.json`: `{journey, step, verdict: "ok" or "change", note, version, source: "chat", words}`; an answer that covers a whole version ("all of v4 as it should") becomes one row per step, each with his words |
| comments | `ArtifactComments` | chat only |
| D3, check 6 | the verdict rows from `ArtifactData` | the rows of `walks/verdicts.json` |
| D7, blueprint | `lock.url`: the mock's link | `lock.url: "local"` (and `"local"` in `mock.json`) |
| D7, stage report | deck and blueprint published, placeholders filled with their URLs | the video and the deck stay in `report/discovery/`; in each slide file replace `__VIDEO_URL__` with the relative path to `video.mp4` and `__BLUEPRINT_URL__` with the relative path to `blueprint.html`; `stage-report.json` names the video and, as `slides`, the deck's first slide (`report/discovery/project/slides/<id>.html`); the message gives the local paths |

A run with no human in the room (a test harness, a print-mode
session) has more limits of its own; see
[claude/docs/testing-the-pipeline.md](../../docs/testing-the-pipeline.md).

## The front door

A demand arrives in conversation. An explicit request to open a
discovery opens it. When the intent is unclear, ask one closed
question: open a discovery, or just talk? Only an explicit "open it"
creates state.

On open:

1. Ask for Opus 5.5 (medium effort) if the session is not on it.
2. Derive the slug: `YYYY-MM-DD-<short-kebab-name>`. When the
   designs root's `CLAUDE.md` fixes a naming rule (for instance "slug
   in English"), check the slug against it; one that breaks it gets a
   one-line warning with a compliant slug, and he picks.
3. Create the workstream folder at the designs root (the consuming
   project's `CLAUDE.md` says where), `.state.md` with
   `stage: discovery` and `step: D1`, and `blueprint/workstream.json`
   (slug, title, his language, `stage: discovery`).
4. Create `00-discovery/notes.md` from
   [templates/notes.md](templates/notes.md) on the first turn and write
   it every turn. A dead session loses nothing. Create
   `00-discovery/telemetry.json` with `openedAt` and the session's
   model (claude/docs/telemetry.md).
5. Start D0 in the same turn.

When he points to a document that already decides things (a spec, an
earlier workstream), send a scout to quote its decisions; write them
into the notes as **Confirmed** with their source and interview only
the gaps and the contradictions.

## D0 — recon, in the background

From his first sentence, dispatch in parallel, in the background, one
`scout (Sonnet 5.5, low)` per question; never wait on them to talk to
him:

- the feature map of each area he names (project contract: feature
  maps), quoted;
- the exported design tokens and components (project contract: design
  tokens and components, exported): the paths of the tokens CSS, the
  tokens JSON and the components list, and the lines that name the
  typeface, radius and color roles;
- other fronts: every running workstream's `.state.md` and
  coordination file that touches the same areas;
- term collisions: for each domain word he used, the places where the
  product already uses that word for something else (a label, a feature
  map's heading, an entity), quoted with `path:line`. A collision goes
  to the notes' Recon block and to the Vocabulary's "avoid".

Write what comes back to `00-discovery/recon/areas.md` (paths and
quotes) and the notes' Recon block. When the project's screens are
drivable (project contract: a browser-drivable app), capture the
current screens of the named areas yourself, one command each, without
opening the images. If the stack is not up, you may bring it up with
the project's stack-up command (project contract: stack up / env /
down, with test actors), in the background, and take it down with its
down command when the captures are done. Log in as a test actor
without putting a secret on the command line: `--env-cmd` runs the
project's env command and reads its `KEY=VALUE` lines, and a fill
value `env:NAME` is read from them (or from the environment), never
printed. A single-page app needs a wait after the click:

```
node proto.mjs look <app-url>/<login-path> --env-cmd "<the project's env command>" \
  --fill '<e-mail field>::env:<ACTOR_EMAIL>' --fill '<password field>::env:<ACTOR_PASSWORD>' \
  --click '<submit button>' --wait-url <the path it lands on> --wait '<a selector of that screen>' \
  --click '<the area link>' --wait '<a selector of the area>' \
  --shot 00-discovery/recon/screens/<name>.png --width 1280
```

The prototyper reads them. A missing export or a stack that cannot
come up is one line in the notes and in `dreaming-notes.md`; the mock
then uses the shell's default tokens, and the gap is said at the
lock.

## D1 — the interview

**How he talks.** First a free voice dump: he says everything, by
voice or a long paste, in any order. Do not interrupt it with
questions. Write it into the notes (Starting point, Themes, Said) and
restate it in one short message: what you understood, in his words,
as a list of the journeys you heard. Then grill.

**Grilling in batches.** Questions go through the question tool, at
most four per call, in the house shape: the question carries the
context (the quote, the gap, why a wrong guess changes the build) and
asks one thing; each option's label is the answer itself; your
recommendation comes first and says so. Ask the **frontier**: the
decisions whose prerequisites are already settled; recompute it after
every batch. A question with no sensible closed options is asked in
prose, one per turn. Facts are yours, decisions are his: what the
code, the docs or `rulings.md` can answer goes to a scout, never to
him.

**Without the question tool** (a headless run, a host that lacks it),
the batch goes as text in one message, in the same shape: numbered
questions, each carrying its context and asking one thing; lettered
options, each the answer in his words with why it is an option, your
recommendation first and marked; he answers by number and letter
("1a, 2b, 3: …"). Record his answers as you would the tool's.

**What to cover** (the pack's interview checklist): the people and
their jobs (a job story per journey: When…, I want to…, so I can…);
the journeys, trigger to end, happy and bad; every rule that carries a
number (limit, expiry, cadence, threshold) with an id, a value, a unit
and an example ("the one where…"); where each value on a screen comes
from; the states of each screen; the copy and its languages; the look
(the references he likes, and what in them); In and Out, with Out split
in "not building, because" and "future direction"; the bets.

**The razor.** A question is asked only when a wrong guess at its
answer would change what gets built: scope, data, behavior, or a look
he would notice. A question every answer of which builds the same
thing is not asked; the implementer decides it. When he brings a
solution ("add a CSV export"), ask why until the business goal, then
stop.

**Infer to go faster.** Propose the behavior you believe is right ("I
assume an expired invite stays in the list, marked expired; confirm?").
Confirmed, it is a fact. Not discussed, it goes to the notes' Inferred
block and is asked before the lock. Never inferred silently.

**Anchor on the concrete.** For something that already happens, ask
about the last real case, never about what users "would" do. For
something new, walk a scenario ("the first customer lands here
tomorrow").

**Self-check before every question.** Rewrite or drop a question that
is two questions; smuggles its answer (proposing openly is fine); asks
a vague hypothetical; is already answered in the notes; ladders "why"
past the business goal.

> **Passes:** "When an admin re-invites an e-mail whose invite expired,
> does the old one disappear or stay marked expired?" Two answers, two
> different lists; the notes did not settle it.
>
> **Fails:** "Should the button be blue?" The mock answers it: he will
> see the button and say.

**The mock answers what words cannot.** What he will recognize when he
sees it (a layout, a density, a tone of copy, which of two flows) is
never forced into prose: it goes into the mock and he reacts there.
Structurally different options for one open look go into the mock as
variants (three at most), switchable in its debug bar.

**Restate before closing a theme.** Your rewrite of his words,
confirmed, is what goes to Confirmed. Keep the coverage map current: it
says where the unknowns are; it is not the goal.

## D2 — the mock loop

**When v1 is built.** As soon as one journey is clear: its actor, its
trigger, its steps and where it ends are in the notes' Journeys block.
That is usually after the first one or two batches. Do not wait for
the whole interview.

**The dispatch.** `prototyper (Opus 5.5, medium)`, in the background,
with: the path to `notes.md`, the recon folder, the tokens and
components paths (or "none"), the shell
([templates/prototype-shell.html](templates/prototype-shell.html)),
the output path `00-discovery/prototype/index.html`, the version
number, the languages, the path of `proto.mjs`, the actors he named
(the shell's "View as") and whether time matters (the shell's clock),
and, from v2 on, the **change list**. Keep interviewing while it
builds. Continue the same
prototyper with `SendMessage` for every later version while it lives
(it keeps its context); a fresh dispatch reads `index.html` and the
notes first.

**Before each publish.** The prototyper returns only after its own
`proto.mjs walk` passes; its report carries the walk summary. Then:

1. `cp 00-discovery/prototype/index.html 00-discovery/prototype/versions/v<N>.html`;
   keep the walk output as `walks/v<N>.json`.
   In local mode, steps 2 and 3 are `proto.mjs shots` (see the table in
   Prerequisites), and step 4 sends the pictures instead of the link.
2. Read `index.html` whole: the Artifact tool publishes only what the
   session has read. This is why the mock stays under 300 KB.
3. Publish it with the `Artifact` tool, always from this same path so
   the URL never changes. First publish: `icon: "prototype"`, a
   one-sentence `description`, and
   `capabilities: {"db": {}, "user": {}, "comments": {"composer_only": true}}`
   (the step verdicts are stored in the artifact's `walks` collection;
   "Comment" opens the composer on a step's target). Later publishes
   omit `icon` and `capabilities`. After the first publish, one
   `ArtifactData` `list` of `walks` proves the store answers (empty is
   fine); say in one line what you could not exercise.
4. Record the URL and version in `.state.md` and a row in the notes'
   Mock log, and tell him in one message: the link, what changed per
   journey (so he re-walks only those), and what to look at first.
   Deep links he can use: `#play-J2` opens a journey in the panel,
   `#<screen>.<state>` opens a state, and `~dark`, `~pt-BR`, `~phone`
   add to either.

**How his feedback comes back.** Three channels, all read by you, none
re-typed by him:

| Channel | How you read it |
|---|---|
| Step verdicts ("As it should" / "Change…" with a note) in the journey panel | `ArtifactData` `list` of collection `walks`; each row has journey, step, verdict, note, version. A verdict on an older version is stale |
| Comments on any element | the publish watches the artifact; read and answer with `ArtifactComments` |
| Chat | what he says in the session; in local mode also his step verdicts, which you write to `walks/verdicts.json` |

Turn each item into one line of the next change list: the source
(`verdict J1.s2`, `comment <id>`, `chat`), the change in his words,
and your restatement. Sort each item before it goes:

- **look, copy, layout, motion, a missing state** → to the prototyper
  directly;
- **a rule, a number, scope, data shown, a journey added or cut** →
  restate it, get his confirmation (in the next batch of questions),
  write it to the notes as Confirmed, then send it to the prototyper;
  a ruling on it goes to `rulings.md`.

Answer each comment once its change is in a published version ("done
in v4").

**The timebox.** Declared at the open in the notes: behavior locked
within the day. Past v8 or past one day, propose locking the behavior
now and parking the visual polish as a named follow-up; he decides.

## D3 — the lock gate

When no question passes the razor and he says the mock is right, or he
says "lock it" before the gate ran, dispatch
`prototype-checker (Sonnet 5.5, high)` with `index.html`, `notes.md`,
the walk of this version, the verdict rows of this version (from
`ArtifactData`, passed inline; in local mode the path of
`walks/verdicts.json`), the unanswered comments, and the output path
`00-discovery/prototype/gate-v<N>.md`.

The gate may run beside his last round of feedback: when the version
he is walking is likely the last, dispatch the checker on it at once
instead of waiting for his "it is right"; the gate's minutes overlap
his. If his feedback then changes the mock, run the gate again on the
new version. The gate passes when:

1. **Every journey plays end to end** through the real UI (the walk):
   each step lands on its declared state, shows its copy, and produces
   exactly its declared side effects, no more. Step ids run s1, s2, …
   in play order (the walk's `idOrder` is empty): the AC ids derive
   from them and freeze at the lock, so the prototyper renumbers
   before it; its report maps the old ids to the new, and his verdicts
   move with them.
2. **Every state exists and is reachable**: every frame renders as
   itself, in every language and both themes, with no console error,
   no missing copy, no sideways scroll at 390 and 1280 px, no dead end;
   every frame is visited by a journey or marked debug-only; each
   screen has its empty, loading, error, permission and success states,
   or the notes say why not.
3. **The copy is final** in each language: no placeholder, each
   language native (the pack's copy checklist).
4. **Every rule in the notes' Rules table is exercised** by at least
   one journey step, or is marked `[build]` in the table's Proof column:
   a rule a one-file mock cannot show (real time, a server's refusal, a
   reload, a second session), which he confirmed is proved by the build.
   A `[build]` rule counts as covered; the gate lists it as such.
5. **The design-taste checklist** passes on the screenshots and the
   DOM audit; a failure names its frame.
6. **He walked it**: every journey step on this version has "As it
   should" (from `ArtifactData`, or in local mode from
   `walks/verdicts.json`), no "Change…" is open, no comment is
   unanswered, the notes' Open and Inferred blocks are empty.

Show him the gate in one short table (check · result · the gaps). Gaps
the prototyper can close go back to it; a gap that is his (an Inferred
line, a journey he did not walk) becomes a question. He may lock over
the gaps ("lock it as it is"): that is an override, recorded in `rulings.md`
with the gaps listed; each gap he accepted goes to `proto.mjs lock` as a
`--gap`, so `LOCK.json` carries it in `gaps[]` and it travels to the
blueprint.

## D4 — the lock

He says "lock it" (or its equivalent in his language). Then:

```
node proto.mjs lock 00-discovery/prototype --words "<his words, verbatim>" \
  [--override "<his words>" --gap "<check · where>::<what>" …]
```

It walks the mock once more, refuses step ids out of order always and
a failure unless overridden, records in `gaps[]` the walk's failures
and every `--gap` (`{source, where, what}`),
writes `versions/v<N>.html`, renders `frames/` (one reference picture
per state, `<screen>.<state>.png`; every state × light and dark × each
language × 390 and 1280 px; every journey step) with `manifest.json`, and writes `LOCK.json` with the sha256 of each. Only the
reference per state, the journey steps and the manifest are committed:
the full matrix is gitignored (a `.gitignore` the lock writes in
`frames/`) and regenerated on demand with `proto.mjs frames`, its
hashes kept in the manifest. Write
the notes' Lock block, a line in `rulings.md`
(`<date> · discovery D4 · lock v<N> · ruled: locked · "<his words>"`)
and `.state.md` (`step: D5`, `locked: v<N>`). Commit the workstream
folder.

**After the lock the mock does not change.** A change he asks for
later is an amendment: a new version, the gate again on what it
touches, a new lock, and D5 re-derives only the journeys that changed.

## D5 — the derivation

Autonomous. Two dispatches in parallel:

- `journey-scribe (Sonnet 5.5, high)`: the locked `versions/v<N>.html`,
  `LOCK.json`, `frames/manifest.json`, `notes.md`, the templates
  ([journey.yaml](templates/journey.yaml),
  [stories.md](templates/stories.md)), the blueprint schema
  (`<kit>/blueprint/schema/discovery.md`, resolved), the path of
  `proto.mjs`, the language. It writes `journeys/*.yaml`,
  `stories.md` and `blueprint/stories.json`.
- `disc-author-prfaq (Sonnet 5.5, high)`: the same mock and notes, the
  template ([pr-faq.md](templates/pr-faq.md)), the schema, the
  language. It writes `pr-faq.md` (one page) and `blueprint/prfaq.json`.

Both briefs include, verbatim: *"The locked mock is the source. Where
the mock and the notes are silent, write the reading the mock most
directly supports, list it in the Inferred list, and do not write for
the other readings as well."*

When both return, run the mechanical check:

```
node proto.mjs trace 00-discovery/prototype/versions/v<N>.html 00-discovery/journeys 00-discovery/stories.md --notes 00-discovery/notes.md
```

Every failure goes back to the scribe in one message; rerun until it
passes. Then check by reading: every story names its journeys; the
PR-FAQ's "not building" matches the notes' Out blocks; the two JSON
files match their documents. The authors' Inferred lists are asked in
the D6 batch.

## D6 — the review: one round, then the delta

Autonomous. First cut the stories for the round (the stories never
travel inline):

```
node proto.mjs split 00-discovery/stories.md 00-discovery/reviews/r<N>/stories
```

Then run the `discovery-review` workflow by `scriptPath`, never by
name: `<kit>/workflows/discovery-review.js`, with `discoveryDir`,
`mock` (the locked `versions/v<N>.html`, absolute), `proto` (the
absolute path of `proto.mjs`), `round`, `mode`, `language` and
`storiesDir` (the split folder, absolute). The workflow reads the AC
ids from the split's `index.json` and gives each blind reader its
story file and the vocabulary file.

When the Workflow tool refuses the path (the kit is a symlink that
resolves outside the session's working directories), copy the script
into the workstream and run the copy, after checking it is the same
file:

```
mkdir -p <workstream>/_run && cp <kit>/workflows/discovery-review.js <workstream>/_run/
sha256sum <kit>/workflows/discovery-review.js <workstream>/_run/discovery-review.js
```

The two hashes must match; `_run/` is not committed. (A session started
with `--add-dir <the pipeline root>` needs no copy.)

The workflow's result arrives in an envelope (`summary`, `logs`,
`result`, …): the return is its `.result`.

**Round 1 is whole:** the acceptance and boundary lenses over the two
documents, and one `disc-blind-reader (Sonnet 5.5, low)` per story,
who walks the mock with that story only and marks every AC pass, fail
or cannot-judge. A blind `fail` means the derivation and the locked
mock disagree; `cannot-judge` means the AC does not say how to observe
its outcome. An AC marked `[build]` is not walked blind (the return
lists it under `skippedBuild`). Save the return (`.result`) as
`reviews/round-1.json`. A round the
workflow marks invalid is fixed at its cause and run again before
anything is judged.

**Judge.** You are the judge, by
[references/judging.md](references/judging.md): read it whole the
first time; rule every finding in `reviews.md` before any fix is sent.
Merge first. Then:

- owner `author` → the fix goes to the file's author (journey-scribe
  or disc-author-prfaq) in one batch each, applied without asking him;
- owner `user` → grouped **by decision**, one question per decision,
  **all in one batch** of question-tool calls (four per call), together
  with the authors' Inferred entries (the ones you would confirm are
  one question: "Confirm all" / "Confirm all except the ones I name");
  every answer is a line in `rulings.md`; a pattern is a line in
  `taste-notes.md`;
- **for the design** → recorded in `reviews.md`, never asked;
- **dismissed** → dies with the sentence or the frame that forecloses
  it.

An answer of his that changes behavior the mock shows is an amendment
(see D4), never a text-only fix: the stories never say something the
locked mock does not show.

**Round 2 is the delta**, automatic once the fixes are applied:
split again into `reviews/r2/stories`, `mode: "delta"`, `only`: the ids
of the stories that changed, and `verify`:
the round-1 sustained findings with their fixes, which the lenses
confirm closed. Judge it the same way. There is no round 3: what is
still sustained goes to the blueprint's review block as residue with
your reason, and he rules it at the approval.

## D7 — the report and the close

The blueprint is built, never edited (house rule). Write the files that
are yours: `blueprint/review.json` (rounds, his decisions, author
fixes, for-the-design, dismissed, residue, and `lock` from `LOCK.json`:
its `date` as `at`, his words, the override and gaps; from `reviews.md`
and `rulings.md`) and `blueprint/report.json`, the plain layer: one
sentence, three things to know, the flow in verbs, one sentence per
story, one per decision. Then build:

```
node <kit>/blueprint/build.mjs <workstream-dir>
```

It validates against the schema and refuses with the field named; fix
the data, never the HTML.

Then the stage report: follow
[claude/docs/stage-report.md](../../docs/stage-report.md) (video,
slides, blueprint). For discovery, the video **shows the mock being
used**: give `video-scribe (Sonnet 5.5, medium)` the locked journey
frames (`frames/journeys/J<n>.s<k>.png`, in journey order, each with
its step's `do` line) so he re-watches what he approved, and the mock's
fixture list (`meta.fixtures` from `proto.mjs model`): those names are
invented, not personal data. The slides carry the journeys, the rules,
what stays out and his decisions; give `slides-scribe (Sonnet 5.5,
high)` the path of the blueprint's strings file
(`<kit>/blueprint/strings.<language>.json`) so the deck names the
blueprint's tabs and sections by their real labels. In local mode the
report stays local (see Prerequisites).

Present the three layers and ask for approval. Approval is explicit;
silence or a loose "looks good" does not close the stage. He may send
adjustments one at a time: note each in a visible list and apply only
when he says "apply" (a behavior change is an amendment). On approval:
`.state.md` to `stage: design`, `telemetry.json` closed, commit the
workstream folder (push only on his word), and suggest `/clear` before
stage 2 (house rule). The close commit is the last act.

## Telemetry

`00-discovery/telemetry.json`, in the shape every stage shares
([claude/docs/telemetry.md](../../docs/telemetry.md)), filled as the
stage runs: a step row as each of D0–D7 ends (the interview and the
mock loop are where `hisMin` lives), the agents with their model and
effort, the review rounds and the findings by class (the classes
`judging.md` names). The counts only discovery has (versions
published, his question calls and questions, gate overrides, the
times of the first mock and of the lock) go in a `discovery` object
beside the shared fields. The close's harvester reads the file.

## How to write, in every file and every question

Say what you mean. Literal sentences, one idea each, concrete values,
his words in quotation marks where they decide something. No metaphor
where a literal phrase exists. Tables for parallel items, a flow block
for a sequence, prose for the one argument. Every agent named in a
message carries its model and effort in parentheses.

## Resuming

Everything is in files. Read `.state.md` (its step says where the
stage stopped, its `kit:` and `mode:`), then `notes.md` (Coverage map,
Journeys, Mock log, Open), then the newest `walks/v<N>.json`. If a mock
is published, read the verdicts of its version and the unanswered
comments before saying anything; in local mode, `walks/verdicts.json`. Continue from the step `.state.md` names, never from memory
of an earlier session.
