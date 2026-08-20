# e2e scenarios — <wave>

<!--
Authored by exec-conductor-alpha at the entry of the environment
phase; the round's runners execute EXACTLY what is written here.

Rules this template stands on:
- one section per user story of the WAVE (from waves.md + the
  stories); the section IS the runner's case list
- every case names its expected outcome — for errors, the exact code
  from the contract (the envelope's rule: status is the class, code
  is the reason)
- every premise validated against the design BEFORE it becomes a
  case: declared degradations belong in "By-design behaviors", never
  in a scope
- front stories are camera scopes: screens/states to capture, data
  assertions only
-->

## Scope: <story-slug> (<STORY-ID>)

**Setup:** <accounts, preconditions — pointers to the venture's test
configuration, never secret values. Everything created is prefixed
`e2e-` and deleted at the end.>

### Happy paths

- <case-name>: <the action, concretely — endpoint/payload/screen> ⇒
  <the observable outcome, including cross-endpoint state when the
  story implies it>

### Adverse paths

- <case>-malformed: <the bad input> ⇒ `422 <CODE_FROM_CONTRACT>`
- <case>-no-auth: <the call without/with wrong auth> ⇒ `401 <CODE>`
- <case>-cross-tenant: <tenant A touching tenant B's resource> ⇒ `403/404 <CODE>`
- <case>-replay: <the same mutation fired twice> ⇒ effect once, second
  response per the contract's idempotency story
- <case>-limits: <the boundary value / oversized payload> ⇒ <defined behavior>

## Scope: <next-story-slug> (<STORY-ID>)

<...>

## By-design behaviors (not bugs)

- <behavior that looks wrong but is a declared design decision, with
  the decision's location — the runners must not report these>
