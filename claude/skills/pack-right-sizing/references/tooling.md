# Right-sizing: tooling

Mechanical checks for the checklist in [../SKILL.md](../SKILL.md).
Replace the `<…>` placeholders with the folders the project's doctrine
names.

- **Requirement trace (proposed, inference).** Every mechanism line in
  a design ends with `(req: <AC | doctrine#anchor | signal | door>)`.
  The gate lists the lines that lack one:
  `rg -n -i '\b(table|column|index|topic|job|sweeper|alarm|cap|flag|retry)\b' <design-docs>/*.md | rg -v 'req:'`
- **Retry on top of retry (C2):**
  `rg -n -i 'attempt|backoff|retry' <event-consumers> <job-entrypoints>`
  A hit inside a consumer or a job loop is a C2 candidate.
- **Infra delta.** In the infrastructure plan (for example `terraform
  plan`) of the roots the change touches, count the new monitoring and
  worker resources. Each needs a `req:`.
- **Fitness functions.** Use the ones the project already runs (an
  import guard, a dependency linter, a coverage gate, an IaC linter, a
  vulnerability scanner). Add one only for a quality a requirement
  names.
- **Reviewer calibration.** Tell lenses to "flag only gaps that affect
  correctness or the stated requirements". `/code-review` at `low` or
  `medium` effort returns fewer findings, all high-confidence. A
  `REVIEW.md` rule can suppress new nits after the first round.
