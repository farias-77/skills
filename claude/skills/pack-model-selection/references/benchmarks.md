# Model selection: benchmarks

Transcriptions of the published numbers behind the pack. Costs are list
price per task. Competitor columns are kept as published, for context.

## Opus medium vs Sonnet high: where they cost the same

| Benchmark | Opus medium | Sonnet high | Verdict |
|---|---|---|---|
| AA-Briefcase (Anthropic) | $4.40 · 1642 | $3.96 · 1635 | Same cost; tie |
| GDPval-AA (AA) | $0.86 · 1588 | $0.80 · 1552 | Same cost; Opus +36 Elo |
| AA Intelligence Index | $1.34 · 51.2 | $1.12 · 46.8 | Opus +4.4 for +20% cost |
| HLE (AA) | $0.06 · 54.7 | $0.05 · 45.8 | Opus +9 |
| AutomationBench-AA | $0.64 · 61.2 | $0.35 · 59.4 | **Sonnet**; Sonnet xhigh scores 65.5 for $0.47 |
| FrontierCode | $0.80 · 54.6 | $0.42 · 49.4 | Opus costs 1.9×, scores +5.2 |
| CursorBench | $2.90 · 52.6 | $1.67 · 47.8 | Opus costs 1.7×, scores +4.8 |
| Terminal-Bench 4.0 (Anthropic) | $2.94 · 57.7 | $1.94 · 43.0 | Opus costs 1.5×, scores +14.7 |

- **Knowledge work:** the two cost the same, and Opus scores the same or better.
- **Coding:** the real same-cost pairs are different. Opus low matches Sonnet high in cost (FrontierCode $0.40 vs $0.42), and there Sonnet wins by 2.1. Opus medium matches Sonnet xhigh in cost, and there Opus is cheaper and as good or better.

## Sonnet 5.5 launch table

| Benchmark | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
|---|---|---|---|---|
| Terminal-Bench 4.0 | 70.6% | 10.3% | 66.4%¹ | — |
| FrontierCode 1.1 Main | 46.2% (max)² · 52.1% (xhigh) | 42.4% | 54.4% | 49.3% |
| CursorBench 4.0 | 55.5% | 34.1% | 57.8% | — |
| GDPval-AA v2.1³ | 1844 | 1449 | 1846 | 1487⁴ |
| AA-Briefcase v1.1³ | 1811 | 1359 | 1822 | 1483⁴ |
| HLE (with tools) | 64.5% | 54.9% | 67.7% | — |
| OSWorld 2.1 (partial) | 80.1% | 57.0% | 81.8% | — |
| Chartography (no tools) | 61.6% | 15.6% | 64.4% | 53.6%⁴ |

Footnotes:

1. Opus at xhigh, its highest score.
2. At max, Sonnet "more often ran Claude Code's code-review skill, which splits the review across many subagents", which led to timeouts or out-of-scope edits.
3. Run on a pre-release deployment with a structured-output bug.
4. GPT-6 Sol image bug.

## CursorBench 4.0: cost per task → score

| Effort | Sonnet 5.5 | Opus 5.5 | Sonnet 5 | GPT-5.6 Sol |
|---|---|---|---|---|
| low | $0.50 → 35.8 | $1.18 → 43.8 | $1.39 → 24.1 | $0.87 → 24.6 |
| medium | $0.70 → 39.2 | $2.90 → 52.6 | $2.31 → 28.0 | $1.77 → 31.1 |
| high | $1.67 → 47.8 | $3.97 → 56.0 | $3.48 → 30.8 | $2.85 → 35.8 |
| xhigh | $3.89 → 53.2 | $6.99 → 56.0 | $4.56 → 32.0 | $4.41 → 37.7 |
| max | $9.70 → 55.5 | $13.42 → 57.9 | $7.18 → 34.1 | $8.22 → 41.7 |

The Opus effort labels were inferred from cost order: five points, rising in cost. They are confirmed by the Low/Med/High/Xhigh/Max labels in Anthropic's own SVG on the Opus 5.5 page. The values come from that SVG and match the PNG read by eye to ±$0.1 and ±0.5 pt.

## Other per-effort curves (low / medium / high / xhigh / max)

- **FrontierCode (Anthropic SVG)**
  - Sonnet: $0.19 → 29.3 · $0.24 → 36.5 · $0.42 → 49.4 · $1.59 → 52.1 · $20.73 → 46.2.
  - Opus: $0.40 → 47.3 · $0.80 → 54.6 · $1.09 → 54.0 · $2.24 → 51.4 · $6.16 → 54.4.
- **Terminal-Bench 4.0 (Anthropic)**
  - Sonnet: $0.76 → 20.0 · $0.83 → 28.7 · $1.94 → 43.0 · $5.31 → 61.5 · $12.56 → 70.5.
  - Opus: $1.29 → 38.6 · $2.94 → 57.7 · $3.88 → 64.3 · $7.35 → 66.4 · $11.25 → 64.9.
- **Terminal-Bench 4.0 (AA harness)**
  - Sonnet: $1.84 → 20.7 · $2.25 → 29.8 · $3.06 → 43.9 · $8.87 → 57.1 · $18.76 → 63.6.
  - Opus: $2.08 → 31.3 · $4.04 → 52.5 · $5.12 → 56.6 · $8.78 → 59.6 · $13.11 → 59.6.
- **AA-Briefcase (Anthropic SVG)**
  - Sonnet: $0.87 → 1265 · $1.64 → 1461 · $3.96 → 1635 · $9.61 → 1746 · $29.16 → 1811.
  - Opus: $1.15 → 1285 · $4.40 → 1642 · $6.28 → 1704 · $12.27 → 1781 · $21.00 → 1823.
- **GDPval-AA (Anthropic SVG)**
  - Opus: $0.21 → 1224 · $0.86 → 1576 · $1.55 → 1690 · $4.21 → 1819 · $8.91 → 1845.
  - Sonnet (AA): $0.22 → 1179 · $0.33 → 1324 · $0.80 → 1552 · $2.46 → 1728 · $9.21 → 1840.
- **AA Intelligence Index v4.3.2.** Each entry is score, cost per task, output tok/s, time to first token.
  - Sonnet: 36 $0.42 100 1.3 s · 41 $0.59 107 1.2 s · 47 $1.12 105 12.2 s · 52 $2.75 104 32.5 s · 56 $7.67 140 444 s.
  - Opus: 42 $0.55 80 12.1 s · 51 $1.34 73 25.8 s · 54 $1.82 80 35.3 s · 56 $3.46 83 131 s · 58 $5.98 93 689 s.
- **AutomationBench-AA**
  - Sonnet: 49.4 · 54.9 · 59.4 · 65.5 · 71.8, for $0.27 · $0.29 · $0.35 · $0.47 · $1.14.
  - Opus: 52.9 · 61.2 · 63.2 · 65.0 · 69.5, for $0.49 · $0.64 · $0.70 · $0.88 · $1.43.
- **OSWorld 2.1 partial.** Read by eye from the system-card figures, ±$0.1 and ±1 pt.
  - Opus: ~$0.9 → 58.4 · $1.9 → 74.0 · $2.45 → 77.7 · $4.2 → 80.7 · $8.5 → 81.8.
  - Sonnet: seven unlabeled points, from ~$1.2 → 59.0 to $6.6 → 80.1; its curve sits below Opus at every cost.
- **SWE-bench Pro, Opus 5.5, against high** (cost page): medium scores −2.5 pts at 70% of the cost; low −8 pts at ⅓; xhigh +1.4 pts at 2.5×.
