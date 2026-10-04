# Pre-flight — <workstream>

<!--
  Written by THE CONDUCTOR (Opus 5.5, high) at P4. Stage 4 opens by
  showing this file once; he hands every item over in one sitting, and
  from "play" on he is called only at the end.

  Only what needs him IN PERSON: a key or a secret only he can mint, an
  account or a plan only he can open, DNS, a quota or a billing limit, a
  third-party contract or approval, a text only he can write. Nothing
  an agent can do with the access it already has. Nothing that is a
  decision: decisions were taken at plan, conservatively, and sit in
  plan.md "Decided in his place".

  Every item carries:
  - why: the node it unblocks and what breaks without it;
  - do: a ready `!` command he pastes in the Claude Code prompt (the `!`
    runs it in his shell), or the exact console path when no command
    exists; values he types are prompted for (`read -s`), never written
    here; never a real secret in this file;
  - check: a `!` command that proves it is done without printing the
    secret (exit 0 / "ok");
  - blocks: the nodes stage 4 parks while it is missing (the rest go on).

  "Nothing" is a complete pre-flight.

  These comments are instructions to you: none of them reaches
  preflight.md (the plan's checker refuses an HTML comment).
-->

**Items:** <n> · **Time for him:** <about n minutes> · **Blocks if missing:** <F | E-04 | nothing>

## 1 · <the e-mail provider's API key, for alpha>

- **Why:** <E-04 sends the ready e-mail through the provider; without the key its integration check has only the fake, and alpha cannot send>
- **Do:**
  ```
  ! read -s KEY && printf %s "$KEY" | gcloud secrets create <provider>-api-key --project <project> --data-file=- && unset KEY
  ```
- **Check:**
  ```
  ! gcloud secrets versions describe latest --secret <provider>-api-key --project <project> --format='value(state)'
  ```
  expect `ENABLED`
- **Blocks:** <E-04>

## 2 · <a sandbox account at the maps provider>

- **Why:** <E-06's contract suite runs against the provider's sandbox; the fake covers every other node>
- **Do:** <console path, when no command exists: provider console → Developers → Sandbox → create key; then:>
  ```
  ! read -s KEY && printf %s "$KEY" > ~/.config/<project>/maps-sandbox.key && chmod 600 ~/.config/<project>/maps-sandbox.key && unset KEY
  ```
- **Check:**
  ```
  ! test -s ~/.config/<project>/maps-sandbox.key && echo ok
  ```
  expect `ok`
- **Blocks:** <E-06>

<!-- What only the release needs (production DNS, a production key) is
     the release's pre-flight, not this one. -->

## All checks at once

```
! <check 1> && <check 2> && echo "pre-flight ok"
```
