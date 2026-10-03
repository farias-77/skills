# Interview, journeys, copy: recipes

Copyable patterns behind the checklist in [../SKILL.md](../SKILL.md).
Rule IDs, journey IDs and fixtures below are illustrations; the
project's doctrine fixes the real ID scheme.

## Story map + example mapping (25 min per story)

```
BACKBONE   Discover → Request sample → Get reply
TASKS      open page · fill form · submit · read e-mail
── slice 1 · outcome: "a visitor gets a sample within 1 working day" ──
RULE       LIMIT-05 one request per e-mail per day (in the business's time zone)
EXAMPLES   the one where she submits twice in 1 min · the one at 23:59 · the one in UPPER case
QUESTION   reset at midnight or 24 h later? → ask, or badge "assumed"
```

A map full of red cards (questions) means the story is not ready. A
map with many blue cards (rules) means the story should be split
(Wynne). The usual line is more than about 4 rules (inference).

## Journey step

```yaml
- id: s3
  do: submit again with the same name and e-mail
  expect: { status: copy.sample.limit, fields_kept: [name, email], submit: enabled }
  effects: { db: { sample_requests: { count: 1 } }, email: { inbox: requests, count: 1 } }
  frame: sample-form.rate-limited
```

## Copy formulas

| Slot | Shape | Example |
|---|---|---|
| Field error | what's needed | Enter an e-mail like name@company.com |
| Rule refusal | what's true + next | We already have your request. We'll reply by e-mail. |
| Dependency down | failed + kept + act | Couldn't send your request. Your data is still here; try again shortly. |
| Empty, first use | title · why · action | No invites yet · Invite people to work with you · [Invite person] |
| No results | title · action | No people match "Mar" · [Clear search] |
| Destructive confirm | verb + noun? · consequence · outcome buttons | Delete invite? · The link stops working now · [Cancel] [Delete] |
| Success / progress | present tense | Invite sent · Sending invite… |

Write each slot natively in every shipped locale, at the same time.
Per locale, follow that language's localization style guide (Microsoft
publishes one per language): distinguish "cannot" (a rule) from
"could not" (an attempt that failed), drop "an error occurred",
sentence-case errors, and keep the text gender-neutral with the
imperative or the infinitive.

## AC line

```
J03.s3.1 [LIMIT-05] GIVEN Marina Okafor already requested a sample today as marina.okafor@example.com
  WHEN she submits the sample form again with the same e-mail
  THEN the form shows copy.sample.limit ("We already have your request", plus every other locale's string)
  AND the name and e-mail fields keep her input
  AND sample_requests holds 1 row for marina.okafor@example.com (read back)
  AND the requests inbox holds 1 e-mail for her (fake mail provider)
```

## EARS mapping

If the project writes requirements in EARS, map WHILE to GIVEN, WHEN or
IF to WHEN, and SHALL to THEN. Each AC keeps one trigger and one or
more responses. Once the lock is set, AC ids never change.
