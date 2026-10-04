---
name: pack-model-selection
description: Picking the model and effort for an agent or a session between Opus 5.5 and Sonnet 5.5, writing its prompt, and pricing a run; read it before setting or changing any agent's model or effort.
user-invocable: false
---

# Pack: model and effort selection (Opus 5.5, Sonnet 5.5)

## When this pack applies

Read it when you pick, review or change the `model:` / `effort:` of an
agent or a stage session, write an agent's prompt, or price a run.
Scope: `claude-opus-5-5` and `claude-sonnet-5-5` only. Costs are list
price per task, as published or read off the charts transcribed in
[references/benchmarks.md](references/benchmarks.md).

## Principles

1. **Price per finished task, never per token.** Opus at medium solves
   more for less than Sonnet at xhigh (CursorBench: $2.90 for 52.6 vs
   $3.89 for 53.2; FrontierCode: $0.80 for 54.6 vs $1.59 for 52.1).
2. **Above ~$1 per task, Opus 5.5 at a lower effort beats Sonnet 5.5 at
   a higher one.** Artificial Analysis rates Sonnet "off the Pareto
   frontier… at high effort levels it sits behind Opus 5.5".
3. **Sonnet 5.5 wins on three axes:** below Opus-low cost, latency, and
   API-orchestration work at xhigh or max. Time to first token at
   medium: Sonnet 1.2 s, Opus 25.8 s; speed 100–140 tok/s against
   73–93. AutomationBench-AA: Sonnet xhigh 65.5 for $0.47, Opus high
   63.2 for $0.70.
4. **Effort is the first lever; the model is the last.** "Raise effort
   before you change models". Levels are recalibrated on both models,
   so old settings don't carry over.
5. **Coding knee: medium for specified diffs, high for ambiguous or
   edge-case work.** xhigh and max rarely pay. Effort fixes missed edge
   cases, not a wrong approach.
6. **Knowledge deliverables do climb with effort on Opus.** GDPval
   1576 → 1690 → 1819 from medium to xhigh. The architect is the one
   place where high is the default.
7. **One model per conversation; vary effort per message.** Switching
   models drops the cache and the thinking blocks; per-message effort
   keeps the cache.
8. **Cached context costs the same on both ($0.20/M); output and
   uncached input cost 2× on Opus.** A long, cache-heavy session pays
   far less than 2× for Opus.
9. **Prompt less, specify more.** Say what "done" means and which stops
   you want; delete ritual instructions. A prompt audit cut a further
   9% of cost on top of the model change.
10. **Reviewers of different models catch different bugs.** Opus caught
    11 issues a baseline missed and missed 9 it caught; a second
    reviewer of the same model adds little.

## Decision table: role → model + effort

| Role | Pick | ≈ cost per task | Evidence |
|---|---|---|---|
| Interviewer / conductor (long human conversation) | Opus 5.5, medium; raise to high with `/effort` for turns that rule on findings | ~$4–7 per long session (inference: equal cache-read rates make Opus ~1.4×, not 2×) | Equal cost, Opus wins on knowledge work (GDPval-AA 1588 vs 1552), long context (AA-LCR 84 vs 78), facts (AA-Omniscience 40 vs 21); it "puts the most important information up front". |
| Prototype builder (HTML/JS UI with taste) | Opus 5.5, medium; `/effort low` for comment rounds | ~$1–3 per pass | Highest score "on graphics and polish"; leads CursorBench (ambiguous, multi-file) at every cost from $2.90 up. Low effort iterates fast. |
| Architect / design judgment | Opus 5.5, high | ~$1.5–6.3 | Opus "remains clearly stronger at complex, open-ended work requiring sustained judgment"; GDPval 1576 (medium) → 1690 (high). |
| Document critics | judgment: Opus 5.5, medium; checklist: Sonnet 5.5, medium; blind readers: Sonnet 5.5, low | $0.2–4.4 | Opus medium and Sonnet high cost the same and tie on AA-Briefcase (1642 vs 1635); Opus is more precise (67% vs 41%); Sonnet reads literally, the point of a blind reader. |
| Plan writer | Opus 5.5, medium | $0.86–4.40 | Same cost as Sonnet high, equal or better (GDPval +36 Elo, Briefcase tie); sequencing is judgment work. |
| Code builder (mergeable diffs) | Opus 5.5, medium; high on a gate failure or a brownfield bug | FrontierCode: $0.80 for 54.6%, the best of any model at any effort | FrontierCode peaks at Opus medium, then drops (high 54.0, xhigh 51.4): it penalizes out-of-scope edits. Sonnet's best is 52.1% at $1.59. |
| Gate / test runner | runs a scripted gate and reads logs: Sonnet 5.5, medium with the real-check block; debugs a broken environment: Opus 5.5, high | Sonnet ~$0.5–1; Opus high $3.88 | Move "reading logs and test output" to the smaller model. On terminal problem-solving Opus high is the knee: it beats Sonnet xhigh ($5.31, 61.5%) on cost and score (64.3%). |
| QA driving a browser | Opus 5.5, medium; high for long journeys | ~$1.9 | OSWorld 2.1: Opus beats Sonnet at every cost (~$1.9: 74.0 vs 68.6). Opus reads screenshots better (Chartography 64.4 vs 61.6). |
| Code reviewers (security, ops, structure) | Opus 5.5, medium; security: Opus 5.5, high | $0.5–1.3 per review (secondary) | Hardest 13 bugs: Opus caught 8 at 67% precision, Sonnet 6 at 41%. More effort pays on security work. |
| Scout (locate and quote) | Sonnet 5.5, low | < $0.4 | Move down to a smaller model "for lookups, not for writing code"; first token 1.3 s, ~100 tok/s, literal instruction following. |
| Storyboard and slides writer | Sonnet 5.5, high; Opus 5.5 medium at the same cost if drafts need more judgment | $0.8–4 | Sonnet "can follow slide templates to create decks that require minimal editing"; ties Opus medium at equal cost and runs 30%+ faster. |
| Launch-video director (Remotion / three.js code) | Opus 5.5, high; `/effort low` for tweaks | ~100k tokens per film ≈ $0.7 (secondary) | Highest score on graphics and polish; practitioners ship films as code with it; it reads its own frames well. |

## Where xhigh and max stop paying

Each cell: score, then the cost multiple against the level before it.

| | high → xhigh | xhigh → max |
|---|---|---|
| Opus FrontierCode | 54.0 → 51.4 (×2.1) | → 54.4 (×2.8) |
| Opus CursorBench | 56.0 → 56.0 (×1.8) | → 57.9 (×1.9) |
| Opus Terminal-Bench 4.0 | 64.3 → 66.4 (×1.9) | → 64.9 (×1.5) |
| Opus GDPval-AA | 1690 → 1819 (×2.7) | → 1845 (×2.1) |
| Sonnet FrontierCode | 49.4 → 52.1 (×3.8) | → 46.2 (×13) |
| Sonnet CursorBench | 47.8 → 53.2 (×2.3) | → 55.5 (×2.5) |
| Sonnet Terminal-Bench 4.0 | 43.0 → 61.5 (×2.7) | → 70.5 (×2.4) |

- **Opus coding:** stop at high (medium for diffs that must merge).
- **Opus xhigh** pays only on knowledge deliverables.
- **Sonnet max** pays only on Terminal-Bench and AutomationBench, at
  $12–19 per task.

## The checklist

**A · Frontmatter and config**
- A1. Every agent sets `model:` and an explicit `effort:`. Defaults
  differ: API medium on Opus, high on Sonnet; Claude Code medium on both.
- A2. No agent runs at `max`.
- A3. `xhigh` appears only on an unattended, checkable, edge-case-dense
  task, with the measured gain written beside it.
- A4. No Sonnet agent runs at high or above where Opus at low or medium
  fits the same budget. Exceptions (latency-bound, API-orchestration)
  are named.
- A5. Agents that write code to be merged run Opus at medium; high comes
  only from the escalation recipe below.
- A6. Lookup agents (scout, log readers, test-output readers) run Sonnet
  at low.
- A7. A subagent never inherits the session model by accident: a
  built-in exploration agent runs on the session model unless
  overridden.

**B · Prompts (both models)** — blocks are in
[references/prompt-blocks.md](references/prompt-blocks.md)
- B1. No "think carefully", "think step by step" or "think hard"; for
  less thinking, lower the effort.
- B2. No request to write out reasoning in the reply (it invites
  `reasoning_extraction` refusals); ask "Explain why you chose this in
  three sentences".
- B3. The task states the finish line ("Done means: …") and when to stop
  and ask.
- B4. Every agent has an explicit way out when blocked ("say what blocks
  you"); impossible tasks raise attempted reward hacks 3–6×.
- B5. Builders carry the scope block (c).
- B6. Reviewers ask for coverage at the finding stage with a concrete
  bar (block h); every finding quotes its line as `path:line` (a
  practitioner caught Opus 5.5 citing 4 of 5 line numbers wrong).
- B7. Frontend, prototype and video prompts name the specific patterns
  to avoid (block g); "avoid a generic look" is not enough.
- B8. Tool results go back in one user message, so the model keeps
  making parallel calls.

**C · Opus 5.5 prompts**
- C1. No "double-check", "verify twice" or "use a subagent to verify";
  Opus already self-verifies.
- C2. Unattended Opus agents carry the four-early-stops block (a) from
  the first request and keep the task list in a file.
- C3. The harness treats a text-only `end_turn` as a report, not done,
  and sends at most 2–3 automatic continuations.
- C4. Text the user pasted is wrapped in `<pasted_content id="…">`; Opus
  5.5 is "more likely than previous models to follow malicious
  instructions in text that a user pastes".
- C5. Delegating agents have a delegation rule (block k) or caps on
  spawn depth and concurrency.

**D · Sonnet 5.5 prompts**
- D1. No "minimize tool calls" or "only use tools when strictly
  necessary"; it follows them literally.
- D2. Coding or gate agents at low or medium carry the real-check block (d).
- D3. Agents at xhigh carry the no-reviewer-subagents block (e).
- D4. Research agents carry the search-first block (f).
- D5. A JSON-returning reasoning agent ends with "Think the problem
  through before you answer." and treats `stop_reason: max_tokens` as
  a failure.
- D6. User text never goes inside a `tool_result`; the harness adds no
  per-step countdowns after tool results.

**E · Cost and caching**
- E1. Effort changes inside a session use `/effort` or per-message
  effort, never a top-level change on the API.
- E2. Models change only at a session boundary (`/clear`), never
  mid-conversation.
- E3. `system` and `tools` stay fixed for the session; changes arrive as
  mid-conversation system messages.
- E4. Long loops read ≥ 80% of input from the cache (`/usage`); below
  that, hunt for the cache breaker.
- E5. Refusal fallback is on and every turn that fell back is logged
  (on Terminal-Bench, 2.5% of Opus requests were flagged, touching 10%
  of trials).

## Caching and effort switching

- **Rates.** Cache read $0.20/M on both; 5-min cache write $5 (Opus) vs
  $2.50 (Sonnet); output $20 vs $10.
- **A miss costs more on Opus.** On a 100k-token prefix a miss costs
  $0.50 against a $0.02 read: 25× on Opus, 12.5× on Sonnet.
- **Effort changes.** A top-level API effort change invalidates the
  cache. Per-message effort (beta) keeps it, on Opus and on Sonnet with
  adaptive thinking; Sonnet's `between_tools` forbids it. In Claude
  Code, `/effort` keeps the cache on an API key or a subscription and
  clears it on Bedrock, Google Cloud or a gateway.
- **Model switches.** The cache goes cold and the thinking blocks are
  dropped; neither in-scope model reads the other's.
- **Human pauses (TTL).** Claude Code on a subscription uses a 1-hour
  cache; an API key 5 min. On Opus, a `max_tokens: 0` keep-alive every
  4 min beats the 1-hour cache when only 1–2 turns in 20 follow a pause
  of up to ~30 min; otherwise use the 1-hour cache.
- **Fast mode** (Opus only, $8/$40): turn it on at the session start;
  the first fast request pays fast input on the whole conversation.

## Effort escalation for builders

```
attempt at medium ──► gate passes? ──yes──► done
                          │no
/effort high (cache kept) ──► one retry ──► still red? ──► park as INCONCLUSIVE
```

SWE-bench Pro: low plus re-running the failures at high solved ~97%
for $0.17; everything at high 95.3% for $0.29; starting at medium ~97%
for $0.24. Raise effort when "medium fixes one layer" (the handler, not
the second caller).

## Anti-patterns

- **"Sonnet at xhigh to save money."** CursorBench: Sonnet xhigh $3.89
  for 53.2, Opus high $3.97 for 56.0. Sonnet max on FrontierCode: $20.73
  for 46.2, worse than its own high at $0.42.
- **Builders at xhigh.** FrontierCode drops 54.6 → 51.4; above medium,
  Opus makes out-of-scope changes a merge rejects.
- **`max` anywhere.** Both models spent 128k thinking tokens on an SVG
  and never answered; time to first token at max is 689 s (Opus) and
  444 s (Sonnet); Sonnet max used ~193k output tokens per task.
- **Carrying old effort values.** Opus 5.5 thinks more than Opus 5 at
  the same level; Sonnet's levels are recalibrated.
- **"Be concise / think less" prompts instead of lowering effort.** From
  medium up Sonnet "thinks briefly before almost every reply, even a
  greeting", and prompting does not reliably stop it.
- **Ritual scaffolding.** Six-step procedures, scratchpad rules,
  verify-twice rules, "do not be lazy" lines, refusal steering, tool
  retry shims.
- **Two same-model reviewers on one diff.** They miss the same bugs.
- **An orchestrator with cheap workers for work that fits one context.**
  "The coordinator's model alone at lower effort came out ahead".
- **Mid-session changes.** An effort change plus an added tool raised a
  measured session from $0.81 to $0.95; make them at `/clear`.
- **A text-only end of turn treated as done** in an unattended run.

The Opus-medium-vs-Sonnet-high cost table and every per-effort curve
are in [references/benchmarks.md](references/benchmarks.md); API and
Claude Code settings and lint greps in
[references/tooling.md](references/tooling.md); sources in
[references/sources.md](references/sources.md).
