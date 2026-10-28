# Testing · <project>

<!-- Read by the design, plan and execute stages: the builders write proofs by it, QA tries the running change by it, the reviewer cites its ids. Seeded by the `standards` skill from the kit's template; the project owns it and changes it only by pull request. Rule ids are never reused: a dropped rule keeps its id with "(retired YYYY-MM-DD: <why>)". -->

What proves what in this project, and how the gates run. Test what a user or an attacker would notice: each behaviour has one primary proof, at the cheapest layer that really proves it.

## The layers

| Layer | Proves | Not for |
|---|---|---|
| unit, server | a rule, a limit, a scope, a transition | SQL, HTTP |
| unit, frontend | pure logic: a format, a displayed calculation, a language, a theme | what needs a screen |
| integration (API in process, a real database) | SQL, permission, scope, idempotency, concurrency | what the user sees |
| component (DOM runner, the API mocked from the contract's types) | a screen's states: forms, dialogs, errors (a 500, a 429), what each role sees | layout, canvas, navigation, reload |
| browser, no backend | layout, canvas, first paint, server-rendered or no-JS pages | the API |
| journey (browser and the whole stack) | one flow: action → result → reload → still there | the limits of a rule, a screen's states |

- **TST-1** · Each behaviour has one primary proof, at the cheapest layer in the table that fails when the behaviour breaks. *Why:* a cheaper layer runs faster and fails closer to the cause.
- **TST-2** · A new journey test says, in its pull request, why no cheaper layer fails on the same bug. *Why:* journeys are the slowest and flakiest layer; each one has to earn its place.
- **TST-3** · A behaviour is proved once: the limit in a unit test, the wiring in one journey per flow, never the same assertion again at another layer. *Why:* three proofs of one thing triple the cost of every change to it.
- **TST-4** · A matrix (language, theme, role, tier) is rows of one table-driven test at the cheapest layer, and runs in the browser only when the AC is about that dimension. *Why:* the dimension is a value, not a new flow.
- **TST-5** · A test that already owns the behaviour is extended, not duplicated. *Why:* two tests of one behaviour drift apart and both get maintained.

## What a proof asserts

A new proof is seen failing for the right reason before it passes. No new test beats a bad one.

- **TST-6** · Each AC has the proof of its success case and of each failure case it implies, each at its cheapest layer; a test exists for a decision of the behaviour, never to cover a line. *Why:* a proof that does not fail when the AC breaks proves nothing.
- **TST-7** · A test asserts state and effect (the response, the rows, the message sent, what the screen shows), never markup structure or that an internal function was called. *Why:* a refactor that keeps the behaviour keeps the tests green.
- **TST-8** · An expected value is a literal, never computed with the code's own formula. *Why:* the same formula on both sides agrees with itself when it is wrong.
- **TST-9** · A test that would still pass if every function it imports returned `undefined` (a weak assert alone, only mocks, only an absence, its own setup asserted, a fixture asserting a fixture) is rewritten or deleted. *Why:* it gives confidence it has not earned.
- **TST-10** · A bug fix comes with the test that reproduces the bug, failing without the fix. *Why:* the bug cannot come back unseen.
- **TST-11** · Copy (a label, a message) is asserted only when the AC is about the copy. *Why:* copy changes often and is not behaviour.
- **TST-12** · A test body is linear: no `if` or loop inside a test; a table generates the tests when only the data varies. *Why:* a test with branches needs its own test.
- **TST-13** · No screenshot or recorded failure kept for the record, no mutation scaffolding, no test that pins a stub, and fuzz or property tests only for a public decoder or under TST-14. *Why:* these cost upkeep and catch nothing a proof by TST-6 misses.
- **TST-14** · A "never" AC (an invariant: "a total is never negative", "two units never share an item") may take one property-based test, with a fixed seed, as its only proof, replacing its example tests, using a library the stack already has. *Why:* an invariant is a property; a fixed seed keeps it deterministic.

## Determinism

- **TST-15** · Time, ids and randomness come from the injected clock, generator and source (ENG-2), fixed by each test. *Why:* a test that reads the real clock fails at midnight or on the last day of a month.
- **TST-16** · No sleep: every wait has a deadline and an observable condition. *Why:* a sleep is too short on a slow machine and wasted on a fast one.
- **TST-17** · Each test creates its own data and passes in any order and in parallel with every other test. *Why:* shared data makes one test's failure another test's flake.
- **TST-18** · A test reaches no network outside the test stack; a third-party API is replaced by a fake at the integration's one client (ARC-16), built from the provider's documented contract. *Why:* the provider's outage is not our red build.

## The database and the stack

- **TST-19** · The database is never mocked: SQL, permission, scope, idempotency and concurrency are proved against the production database engine, migrated by the real migrations. *Why:* a mocked database agrees with whatever the code assumes.
- **TST-20** · Each integration test runs on its own database or schema, cloned from a migrated template (`<how the project does it>`). *Why:* isolation without paying for a migration per test.
- **TST-21** · A concurrency proof releases N requests together through the real stack and asserts exactly one effect in the database; it is never rerun to green. *Why:* a race shows only when the requests truly overlap.
- **TST-22** · A component test mocks the API from the contract's generated types, never from shapes written by hand. *Why:* a contract change breaks the mock at compile time.

## Journeys

- **TST-23** · One journey per flow: act, see the result, reload, see it still there. *Why:* the reload proves it was stored, not only shown.
- **TST-24** · A journey finds elements by role and accessible name, with names from the string modules; no CSS or XPath selector, no forced click, no fixed wait, no raised timeout. *Why:* it then fails only when a person could not do it either.
- **TST-25** · A journey asserts with conditions that wait on an observable state (visible, URL, focused) and compares with literals. *Why:* the runner waits as long as needed and no longer.
- **TST-26** · Each journey creates its own data through the fixtures and runs the accessibility check (`<axe fixture>`) on every page it visits, held to DS-89. *Why:* accessibility is checked where people actually go.
- **TST-27** · A journey runs at one primary width and is tagged for phone width only when the behaviour depends on the width. *Why:* a second width doubles the slowest suite.
- **TST-28** · A journey that writes nothing, or writes only as a test actor into its own data, is tagged read-only; only read-only journeys run against staging and production, as the smoke. *Why:* the smoke must never change real data.

## Test actors and fixtures

- **TST-29** · The stack provides one test actor per role the permissions distinguish (`<stack command>` prints them), and a test acts as the actor its AC names, never as an admin to save setup. *Why:* an admin passes checks the real actor fails.
- **TST-30** · Every scope rule has a second actor in another scope (another team, unit or account). *Why:* a refusal cannot be proved without someone to refuse.
- **TST-31** · Fixtures are built by named builders in `<fixtures path>` whose defaults are valid, and a test overrides only the fields it is about. *Why:* the test shows what matters and survives a new required field.
- **TST-32** · Fixture data is invented (SEC-9) and realistic, including the worst case: a long name, 0, 1 and many, a missing optional field, unicode; e-mails on reserved domains (`example.com`, `.test`); never "John Doe", "Test 123" or lorem ipsum. *Why:* bland data hides the layout and parsing bugs real data shows.
- **TST-33** · A journey run against staging or production acts as a synthetic actor (OPS-5), never as a real person's account. *Why:* a test must never act on a real person's data.

## Flaky tests

A test that fails without a code change is a bug, in the test or in the code.

- **TST-34** · A flaky test is fixed at its cause (shared data, a missing wait condition, a clock not injected, a real race) in its own pull request, and the gate stays red until it is. *Why:* a flake hidden today is the race in production tomorrow.
- **TST-35** · The runner's retry is off (`retries: 0`); a red test outside the diff runs once more only to tell a flake from a break, and a flake is then fixed by TST-34; a failing test is never rerun to green, skipped, quarantined or given a longer timeout. *Why:* one rerun names the flake; anything more turns a real failure into noise.

## The floor

The floor is the set of security tests that may never disappear; SEC-32 to SEC-35 list the cases. This section is how they are kept.

- **TST-36** · Every floor case is a test tagged `<floor tag>`. *Why:* the floor command finds them by tag.
- **TST-37** · `<floor command> base=<ref>` fails when a floor test present at the base is gone, unless the exceptions register (`<path>`) names it with the reason and the approval; it runs in the whole gate. *Why:* a deleted security test is caught by a machine, not by memory.
- **TST-38** · The floor's tests and the exceptions register are gate paths listed in `CODEOWNERS`. *Why:* removing a floor case needs a person's approval.

## What QA tries

QA uses the running change the way people will, then the way they will break it, and adds no test. Each case below is tried wherever the change can reach it; the QA record names what was skipped and why. A case that finds a bug gets its proof at the cheapest layer (TST-1).

**Screens**

- **TST-39** · Every AC a person sees is done on the running app as its actor, looked at, reloaded and looked at again, together with at least one failure case it implies. *Why:* the hands-on finds what the proofs assumed.
- **TST-40** · Every changed screen is tried in each state its design lists (DS-44: loading, empty, error with a retry, data, plus one and many), and after a failed submit, as DS-36 says. *Why:* the unhappy states are where screens break.
- **TST-41** · Every changed screen is tried at 390 px and 320 px: nothing cut, nothing overlapping, every action reachable. *Why:* phones are where layouts fail first.
- **TST-42** · Every action that writes is double-clicked and has one effect; its proof is two clicks inside one task with exactly one request recorded. *Why:* a native double-click event does not reproduce two fast clicks.
- **TST-43** · Every changed flow is tried with back and reload mid-form and after saving, with a deep link opened cold and signed out, and with the keyboard alone through the main action, focus visible. *Why:* people navigate in ways the happy path does not.
- **TST-44** · A screen another actor must not see is tried as that actor, by the menu and by the URL. *Why:* hiding the link does not close the route.
- **TST-45** · Every changed form field is tried empty, at 300 characters, with unicode, with leading and trailing spaces, and with literal special characters (`<b>`, `'`, `%`). *Why:* real input is messier than test input.
- **TST-46** · Every number shown in two places (a total, a badge, a count, a list's length, a date) agrees on both screens and after a reload. *Why:* two sources for one number drift.

**API**

- **TST-47** · Every AC a caller sees is sent as its actor and checked against the contract (status, fields, types), the data read back and the side effects the AC names, together with at least one failure case with nothing written. *Why:* the contract is what clients rely on.
- **TST-48** · Every changed route that accepts input is tried with a field missing, empty, of the wrong type, at its limit and one past it, only spaces, and control characters: a 400 or 422, nothing written. *Why:* bad input must be refused, never stored.
- **TST-49** · Every changed route is tried with no session, a garbage session and a role that must not reach it, and is refused as SEC-1 and SEC-4 say. *Why:* authentication is checked by trying to get around it.
- **TST-50** · Every changed route that takes an id is tried with another actor's real id in the path and in the body: the answer SEC-3 names, nothing read, nothing changed. *Why:* this is the most common data leak.
- **TST-51** · Every changed route that writes is tried with the same request twice and with two at once: one effect (ENG-43, ENG-56). *Why:* clients retry and users double-click.
- **TST-52** · Every changed route that accepts a body is tried with a body far over any sane size: the refusal SEC-23 names, no 5xx, nothing stored. *Why:* an oversized body is the cheapest attack.
- **TST-53** · The log lines of every request tried are read: no person's data and no token (ENG-28). *Why:* a leak in a log is found by reading the log.

## The gates

- **TST-54** · The fast check (`<fast check command>`) runs lint, types, the house lint and the unit tests with no containers in about a minute, and passes before every push. *Why:* the builder loops on it dozens of times.
- **TST-55** · The entry gate (`<affected tests command> base=<ref>`) runs the fast check plus the tests of what the diff touched and of what depends on it, chosen from the import graph with a whole-suite fallback, in under 5 minutes. *Why:* every change pays for its own tests, not for the whole suite.
- **TST-56** · The whole gate (`<whole gate command>`) runs every lint, the contract and generated-code checks, every suite at every width, coverage, the builds, the infrastructure and dependency scans, the journeys and the floor, in a clean worktree; `main` merges only on its green status, posted by `<signoff command>`. *Why:* this command is the gate; nothing hosted replaces it.
- **TST-57** · Coverage is measured by function: every new or changed function runs in at least one test; this is a floor, not a target, and no test is written only to raise it. *Why:* untested code is visible, and coverage is never mistaken for proof.
- **TST-58** · To pass, the code or the test's cause is fixed; an assert is never loosened, a baseline or threshold never raised, a lint, coverage or gate target never changed, and a failing test never deleted without its replacement named. *Why:* a gate loosened to pass stops guarding anything.
