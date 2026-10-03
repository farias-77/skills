# Model selection: sources

Public sources only. Secondary sources are marked.

## Primary

- The `claude-api` skill bundled with Claude Code — model IDs, prices, the effort table, breaking changes, caching rules, migration notes.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5 — the Opus blocks, its quirks, multi-agent time signals.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5 — the Sonnet blocks; reviewer subagents at max; verification at low; JSON; mid-turn messages.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 and …/prompting-claude-sonnet-5 — blocks the 5.5 guides say still apply (scope, delegation, over-verification, review coverage, design options).
- https://platform.claude.com/docs/en/build-with-claude/effort — levels, defaults, per-message effort.
- https://platform.claude.com/docs/en/about-claude/models/choosing-a-model and https://platform.claude.com/docs/en/about-claude/models/overview — the selection matrix, latency classes, cache-read rates.
- https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence — SWE-bench Pro sweep, re-running failures, cache TTL and keep-alive, cache-breaker costs, advisor and orchestrator results.
- https://platform.claude.com/docs/en/about-claude/models/opus-5-5/whats-new, …/sonnet-5-5/whats-new and https://platform.claude.com/docs/en/about-claude/pricing.
- https://www.anthropic.com/claude-opus-5-5 and https://www.anthropic.com/claude-sonnet-5-5 — benchmark tables; per-effort chart data read from the page SVGs; tester quotes.
- Claude Opus 5.5 System Card and Claude Sonnet 5.5 System Card (https://www.anthropic.com/system-cards) — FrontierCode note, Terminal-Bench fallback rates, OSWorld figures, reward hacking on impossible tasks (§6.2.2), pasted-text injection (§6.5.1), multi-agent harnesses.
- https://claude.dev/blog — "Getting the most out of Opus 5.5", "Building with Claude Sonnet 5.5", "Using Claude Code: Spending your effort", "What a task costs on Opus 5.5": role guidance, effort rules of thumb, cache economics, "lookups, not code".
- https://code.claude.com/docs/en/sub-agents — frontmatter `model` and `effort`, inheritance.
- https://artificialanalysis.ai — leaderboard and release pages: per-effort index, cost, speed, time to first token, per-eval scores, and the Pareto-frontier remark on Sonnet 5.5 (https://x.com/i/status/2104640155843989864).

## Secondary

- https://www.coderabbit.ai/blog/sonnet-5-5-model-review and https://www.coderabbit.ai/blog/opus-5-5-model-review — code-review catches, precision, cost per review.
- https://thezvi.substack.com — "Claude Opus 5.5 Should Raise Your Ambitions": roundup of reports on taste, writing and max.
- https://simonwillison.net/2026/Sep/22/ — max overthinking.
- https://news.ycombinator.com/item?id=49881850 and https://news.ycombinator.com/item?id=49803892 — practitioner Sonnet-vs-Opus value reports, a review harness, line-number errors.
- https://ibragim.dev/leaderboard — saturated personal evals (Sonnet high $0.097, Opus low $0.117).
- https://launchvideo.io — film-as-code workflow and frame checks.
- https://github.com/vincentsch/explainroo — explainer-video tooling.
