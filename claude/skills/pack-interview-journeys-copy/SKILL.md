---
name: pack-interview-journeys-copy
description: Interview, journeys, states, copy and acceptance criteria for a discovery that ends in a clickable prototype; read it before the first interview question and again before writing acceptance criteria.
user-invocable: false
---

# Pack: interview → journeys → copy → acceptance

## When this pack applies

Use it when a discovery ends in a clickable prototype. It covers four
steps: interviewing the user who owns the product decisions, turning
their answers into journeys and states, writing the copy in every locale
the product ships, and, once they lock the prototype, deriving use cases
and acceptance criteria (ACs) from it. Read it before the first
question and again before writing ACs.

The project's doctrine decides the locales, the copy-file layout, the
rule-ID scheme and the time zone that rules are computed in; this pack
gives the shape every one of them fills.

## Principles

1. **Recommend while you ask.** Your answer goes first: he rules faster
   on a proposal than on a blank page.
2. **Facts are yours; decisions are the user's.** When the code, the docs or
   `rulings.md` hold the answer, send a `scout (Sonnet 5.5, low)`
   instead of asking. Finding facts is the agent's job, never the
   user's.
3. **Ask about past specifics, never about future opinions.** Anchor
   every claim about users in the last real case. The Mom Test calls
   "would", "always" and "might" fluff.
4. **Start from the situation, not the persona.** A journey's trigger is
   a job situation ("When …"). In JTBD a job is progress in a
   circumstance, so step 1 must reproduce that circumstance
   (inference).
5. **Map first, then slice.** Lay the backbone out left to right, then
   cut the smallest slice that reaches the outcome. Patton calls a flat
   backlog "context-free mulch".
6. **Every state is a place.** Each (screen, state) pair needs a URL,
   real data and real copy. A state nobody can reach is a state nobody
   validates (inference).
7. **Copy is behavior.** Errors, empty states and labels are locked
   with everything else and asserted by key; the lock freezes the
   numbers and the copy.
8. **Write every locale together, each one native.** Translations run
   longer and have their own idiom; localization style guides ask for
   clarity and economy, not word-for-word translation.
9. **Derive ACs; never invent them.** Each AC cites one locked step and
   the rule it checks. An AC without a step is scope he never walked.
10. **THEN means what an outsider can observe.** The screen, the fake
    inbox, a row read back, a log event or an alarm, never a function
    call. Gherkin wants "observable output"; test only external
    behavior.

## The checklist

**Interview (`notes.md`, rules table)**
- [ ] I-1 Closed choices go through the question tool: the context in
  the question, one ask, your pick first, at most 4 per call. Open
  questions are asked in prose, one per turn.
- [ ] I-2 No question asks for a fact a scout could find.
- [ ] I-3 No claim about users rests on "always", "never", "would" or
  "might". Each has a named past case, or sits in Bets as unchecked.
- [ ] I-4 Every solution he proposed ("add CSV export") is recorded
  with the job behind it, laddered up to the business goal and no
  further.
- [ ] I-5 Every journey has a job story: When <situation>, I want to
  <motivation>, so I can <outcome>.
- [ ] I-6 There is a story map: activities form the backbone, tasks are
  verb phrases, and each release line names its outcome.
- [ ] I-7 Every number that encodes a rule (limit, cadence, threshold,
  expiry) has a rule ID, a value, a unit and a source.
- [ ] I-8 Every rule has at least one example ("the one where…") and
  the boundary examples of its number.
- [ ] I-9 Before v1 exists, every open question is either answered or
  marked with an "assumed" badge on its step.
- [ ] I-10 Each concept has one term and an *Avoid* list, and the
  prototype's labels use that term.

**Journeys and states (`journeys/*.yaml`, prototype)**
- [ ] J-1 Each journey has 1 actor, 1 trigger and 2–7 steps
  (inference). It ends in a named state that has an exit.
- [ ] J-2 Each step has `do / expect / effects / frame`. Forbidden
  effects are written out ("no second e-mail").
- [ ] J-3 Every rule ID appears in some journey's `rules:` and in at
  least one `expect` or `effects`.
- [ ] J-4 Each screen declares its states: ideal, empty (first use /
  cleared / no results), loading, partial and error. Each action
  declares idle, submitting, success, refused-by-rule and
  failed-dependency.
- [ ] J-5 Each bad-path category maps to a state, and that state maps
  to a journey or a debug-only frame. The categories are boundary
  input, repeat/concurrency, dependency failure and permission.
- [ ] J-6 Each screen's state is one discriminated value, not a set of
  booleans.
- [ ] J-7 Every frame has its own URL and is either visited by a
  journey or marked `debug-only`. No error state is a dead end.
- [ ] J-8 Fixtures use real names, real field names and boundary
  values. No lorem ipsum, "John Doe" or "Test 123".
- [ ] J-9 The backstage pane shows every step's side effects.

**Copy (copy files, prototype)**
- [ ] C-1 Every visible string is a key that exists in every shipped
  locale. The markup holds no literal strings.
- [ ] C-2 An error says what happened and what to do, plus the
  consequence if there is one, in 1–2 sentences. It sits next to its
  source, keeps the input, and contains no blame and no codes.
- [ ] C-3 A field error is one short sentence (Polaris recommends 2–3
  words) and never says "invalid" (or its equivalent in any locale).
  It appears on blur once the field has at least 1 character, or on
  submit, and clears when the value is fixed.
- [ ] C-4 Errors never appear in a toast or a modal. Modals are only
  for confirming destructive actions.
- [ ] C-5 An empty state has a title, a 1–2 sentence reason and one
  action of 1–2 words. First use, cleared and no results each get
  their own copy.
- [ ] C-6 Buttons are verb + noun in sentence case, with no articles.
  Done, Close, Cancel and OK alone are allowed only for those common
  actions. Each locale follows its own button convention (for example
  the infinitive in Romance languages, per their style guides).
- [ ] C-7 A confirmation appears only for an irreversible or costly
  action. The title is a verb + noun question, the body is one line of
  consequence, and the buttons name the outcome. Never "Are you
  sure?", Yes/No or OK.
- [ ] C-8 Each action has one verb across the product: never "Remove"
  here and "Delete" there. Text refers to controls by their label.
- [ ] C-9 The text addresses the reader directly ("you", or the
  locale's informal second person) or drops the pronoun. Never "the
  user", never gendered slash forms. Instructions are imperative
  ("Enter…").
- [ ] C-10 Results are in the present tense ("Order sent") and use
  numerals. A label of one sentence has no final period.
- [ ] C-11 Every frame renders in every shipped locale at 390 px with
  no truncation.

**Acceptance criteria (from the lock)**
- [ ] A-1 Every AC has an id `<journey>.<step>.<n>` and at least one
  rule ID, and both resolve in the lock.
- [ ] A-2 Every locked step that has an `expect` or `effects` has at
  least one AC, and every rule ID has at least one AC.
- [ ] A-3 GIVEN is the state before the step, with no user action.
  WHEN is exactly one event. THEN states one observable outcome per
  line.
- [ ] A-4 Each THEN says where it is observed: the screen (role +
  accessible name, or copy key), the inbox, a row read back, a log
  event or an alarm.
- [ ] A-5 Values are concrete: fixture names, numbers, and copy keys
  with every locale's string. No "quickly", no "correctly". A stranger
  can mark the AC pass or fail without asking.
- [ ] A-6 ACs are declarative: no selectors, no "click #submit". The
  wording survives a re-implementation.
- [ ] A-7 Each numeric rule has boundary ACs: at the limit, just below
  it and just above it.
- [ ] A-8 Effects that must not happen are stated: the count stays 1,
  no e-mail is sent, no row is written.

## Anti-patterns

- **Interview.**
  - A questionnaire dump: 20 questions in one message, answered in
    prose.
  - Pitch questions like "Would your users use bulk invite?", which
    always get a yes.
  - Fluff written down as fact ("managers always check this every
    morning") instead of "when did one last check it?".
  - Questions at the implementer's altitude, such as "show a
    confirmation dialog?".
  - Recording "Export CSV" without "so the accountant closes the month
    by day 5".
  - A flat list of stories with no backbone.
- **Journeys and states.**
  - A happy-path-only prototype.
  - `isLoading && !isError && hasData`.
  - "Something went wrong" with no retry, no way back and no kept
    input.
  - A spinner with no slow or timeout state behind it.
  - A single 15-step journey covering a whole activity.
  - A step that sends an e-mail while the backstage shows nothing.
- **Copy slop.**
  - "Oops! Something went wrong 😕", "Error 500", "Invalid input", "Are
    you sure?", [Yes] [No], [OK] on a destructive dialog, "Click here",
    "Submit" on every form, Title Case Buttons, "Please" everywhere.
  - The same slop translated: "an unexpected error occurred", "please
    try again later", "the user must…", gendered slash forms, two verbs
    for one action, Title Case copied from English into a locale that
    uses sentence case.
  - The second locale written a week after the first, so it no longer
    fits the button.
- **ACs.**
  - Unverifiable lines: "handles errors gracefully", "loads quickly".
  - UI scripts: "When I click #submit-btn and wait 2s".
  - Internals: "Then `sendEmail` is called once".
  - An AC that cites no step.
  - A 40-row Scenario Outline, Gojko Adzic's "illusion of precision".
  - A duplicate submit checked on screen but not in the inbox.

## Core recipes

**A grill round**
```
frontier = decisions whose prerequisites are settled
facts it needs → scout (Sonnet 5.5, low) in parallel; ask the rest now
question: context · quote or gap · why a wrong guess changes the build · one ask
options: ★ recommended (first, marked) · alternatives — each label is the answer itself
≤ 4 per call → recompute frontier → stop when empty → restate → he confirms
```

**Mom Test rewrites**
| Instead of | Ask |
|---|---|
| "Would managers want alerts?" | "The last time an account dropped, how did a manager find out, and how late?" |
| "Should we add bulk invite?" | "Walk me through the last time someone onboarded 10 people." |
| (he says "they always…") | "Tell me about the most recent one." |
| (he proposes a feature) | "What would that let them do that they can't today?" |

**State inventory**
```
screen invites-list: ideal | empty.first-use | empty.cleared | empty.no-results | loading | partial | error.load
action send-invite:  idle | submitting | success | refused.duplicate | refused.limit | failed.mail-down | forbidden
frame id = <screen>.<state>  →  ?frame=invites-list.empty.first-use&lang=<locale>&vp=phone
```

**AC derivation, one AC per step of every locked journey**
1. **GIVEN** is the end state of the previous step, or the journey's
   `given/data`. Write the state, not the clicks.
2. **WHEN** is the step's `do`, written declaratively.
3. **THEN** gets one line per `expect` key and one per `effects` key. A
   count that must stay the same gets a line too.
4. **Tags** are the step id plus the `rules:` this step exercises.
5. **Uncovered boundaries.** A boundary example no journey covers
   becomes an AC on a `debug-only` frame, tagged `frame:`, flagged to
   the conductor as not walked.
6. **Use cases** (inference), one per journey family: actor and job
   story → header; happy journey → main flow; each bad-path journey →
   an extension at the step where it branches.

Once the lock is set, AC ids never change.

The story map with example mapping, the journey-step YAML, the copy
formulas, the full AC example and the EARS mapping are in
[references/recipes.md](references/recipes.md). Test tags, copy linting
and the coverage script are in
[references/tooling.md](references/tooling.md); sources in
[references/sources.md](references/sources.md).
