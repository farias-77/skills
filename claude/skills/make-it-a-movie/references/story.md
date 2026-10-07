# The story

A film is 6 to 14 scenes. The first two seconds are the hook: the
largest type of the film (140 px or more) says what this is as a plain
statement, and the film's protagonist (the object the viewer will
follow) is already on screen and moving at frame 0. Never open on an
empty frame, a lone line or a title that only fades in. The last scene
says what to remember, in three lines at most. In between comes the
order a newcomer needs, one idea per scene.

## For a reviewer (stage videos)

The general arc:

1. **Title.** What this is, and why it matters, in one line.
2. **The picture.** The whole thing in one `Flow`.
3. **How it works.** The main flow step by step: a `Traveler` along the
   arrows, or `Lines` that check off.
4. **What went wrong or could.** Risks and failures, shown as such.
5. **Decided for you.** One `DecisionCard` per decision taken in the
   reviewer's place, the alternative beside it.
6. **What needs you.** The questions only the reviewer can answer
   (`Choices`), or "nothing of yours here".
7. **End.** What to remember.

By stage, as `claude/docs/stage-report.md` sets it:

| Stage | The film |
|---|---|
| Discovery | the problem and the solution told through the user stories (60–90 s): who suffers, what they can do after, the rules that matter |
| Design | the proposal: one picture of the system, the main flow, the evolution path (v1 → v2 → v3 as a `Flow` that grows) |
| Plan | the graph assembling: the contract first, the entries side by side, the critical path hot, where the time goes (`Gantt`) |
| Execute | what was built, with real screens in motion (`Shot`, `Screen`), and the proofs |
| Release | main → staging → tag → production, the smokes and the watch, 30–45 s |

## For users (what is new)

The people who use the product, not the people who built it. No
services, no endpoints, no deploys, no ids, no "we refactored". Use their
words for their work.

**When a screen changed, make a tutorial:**

1. **Cold open, 3–6 s:** the feature's name over a `Shot` of the new
   screen drifting in.
2. **The need, 10–20 s:** what was hard before, in their words, with one
   number. A "before" shot only from a recording made before the merge;
   otherwise state the need in words, never over the new screen.
3. **One chapter per feature:** where it lives (`Settings › Rules`), then
   one action per step on the real screen (`Screen` or a `Shot` per step),
   each step captioned in 3–6 words ("2/4 · Choose the trigger"), the
   result held at least 1.3 s.
4. **Recap:** the features and where to find each.
5. **End card:** what to remember and where to ask.

**When only the backend changed, make a motion piece of the idea:** what
the person notices now ("your report arrives in a minute, not an hour"),
told with a `Flow` or `Numbers` and no architecture.

Length 30 s – 3 min; a one-label change is 30–45 s. Real screens come from staging or a test account with
synthetic data, never production. Real names never appear.

## Writing the words

- At most twelve words on screen per scene, the headline included.
- Short sentences, plain words. "Takes a lock so two requests never count
  twice", not the name of the function.
- One caption per idea. Words on screen never repeat a voice-over word
  for word (there is no voice-over by default).
- A label is at most 42 characters on a line, two lines at most.
