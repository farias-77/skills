# Plan review · <workstream>

<!--
  Written by the conductor from 02-plan/reviews/round-1.json, the rulings
  before any fix leaves. These comments never reach the file.
-->

## Round 1 · <date> · run <id>

**Checker before:** `<✓ graph holds · width n · depth n>` · findings <n> · dropped <n> · unread <briefs or none>

| Id | Source | Brief | Finding | Ruling | Owner | Why |
|---|---|---|---|---|---|---|
| <P1> | plan-reviewer · edge | E-02 | <the false edge to E-01> | sustained | planner | <a factory seeds the order> |
| <P2> | blind-judge · diverge | E-04 | <"archived" read two ways> | sustained | writer | <screens.md: hidden for everyone> |
| <P3> | blind-judge · undecidable | E-02 | <the list's size> | decided in his place | writer | <the 200 most recent, by date: conservative, reversible> |
| <P4> | plan-reviewer · buildable | E-05 | <…> | dismissed | — | <the sentence that settles it, quoted> |

## Applied and verified

| Id | What changed | Read at |
|---|---|---|
| <P1> | <edge dropped> | `plan.graph.json:<line>` · checker `<line>` |

**Checker after:** `<✓ … with --briefs>`
