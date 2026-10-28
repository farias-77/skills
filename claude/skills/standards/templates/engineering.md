# Engineering · <project>

<!-- Read by the design and execute stages: the builders follow it, the reviewer cites its ids. Seeded by the `standards` skill from the kit's template; the project owns it and changes it only by pull request. Rule ids are never reused: a dropped rule keeps its id with "(retired YYYY-MM-DD: <why>)". -->

How code is written in this project, in every language it uses. Each rule is checked on the diff; the stack's own rules (the last section) extend this file and never relax it.

## Structure and modules

The next contributor is often an agent that sees only the files it opened and copies the nearest example. The structure makes the right example the nearest one. The module map, the import fences, the owner of each fact and the golden paths live in `architecture.md` (ARC-1 to ARC-9, ARC-14, ARC-16).

- **ENG-1** · Dependencies are passed in explicitly and wired in one place (`<the composition root>`): no global mutable state, no import-time side effects, no service locator or DI container. *Why:* what a function uses is visible in its signature, and a test can replace it.
- **ENG-2** · The clock, id generation and randomness are injected; the system clock and random source are read only at the wiring point. *Why:* tests are deterministic (TST-15) and time-dependent rules are provable.
- **ENG-3** · A use case is one function in its own file that takes the context, the verified actor and one request value, and returns a result or a typed error. *Why:* one shape makes every use case readable and testable without the transport.
- **ENG-4** · A handler only decodes, calls one use case and encodes; business rules live in the use case. *Why:* a rule in a handler escapes the unit layer and is copied by the next handler.
- **ENG-5** · Every abstraction, interface, parameter and layer has a consumer in the diff or the codebase (a helper or a knob: ARC-20); no generic repository, base class, `utils` or `common` module. *Why:* structure built for a guessed need is paid for on every read.
- **ENG-6** · An interface is declared by the code that consumes it, and only when a second implementation or a test fake exists. *Why:* an interface beside its only implementation is indirection with no reader.

## Naming

- **ENG-7** · Names use the domain's words as the feature map (`features/<domain>.md`) writes them, and one concept has one name across code, API, database and copy keys. *Why:* a translation kept in someone's head is where bugs hide.
- **ENG-8** · A function is a verb and an object (`closeBatch`, `close_batch`), a boolean reads as a question (`isClosed`, `hasAccess`), and a collection is plural. *Why:* the call site reads as a sentence.
- **ENG-9** · A number whose type does not carry its unit has the unit in its name: `timeoutMs`, `sizeBytes`, `amountMinor`. *Why:* a unit mismatch compiles and runs.
- **ENG-10** · Generic names (`data`, `info`, `item`, `manager`, `helper`, `util`, `tmp`) and abbreviations outside the domain's glossary are replaced by the name of what the value is. *Why:* a generic name forces a reader to open the definition.
- **ENG-11** · Database tables and columns are `snake_case`, tables plural; API fields use one case across the whole API (`<camelCase or snake_case>`). *Why:* one convention per surface ends the guessing.

## Errors

An error is returned to the caller or turned into visible state. Never both, never neither.

- **ENG-12** · An error is handled once: returned with context, or turned into visible state plus one log line (ENG-26); never logged and returned, never swallowed. *Why:* a twice-handled error logs twice and a swallowed one hides the failure.
- **ENG-13** · Context added to an error names the action in lowercase ("close the batch: …"), keeps the original cause attached, and never says "failed to" or "error". *Why:* the wrapped chain reads as one sentence and keeps the cause for matching.
- **ENG-14** · An expected failure is a typed value from the project's error module (`<path>`): not found, forbidden, conflict, invalid, stale state, rate limited; code selects it by type or code, never by message text. *Why:* a message changes; a type is a contract.
- **ENG-15** · The mapping from error type to HTTP status and API error code lives in one place (`<path>`). *Why:* two mappings drift into two answers for one failure.
- **ENG-16** · An unexpected error answers 500 with the error envelope (ENG-42) and the request id; the response never carries a stack trace, a query, a driver message or a file path. *Why:* internals help an attacker and confuse a user.
- **ENG-17** · A cancelled request or a client that hung up stays a cancellation through every layer and is never reported as a 500 or an ERROR. *Why:* hang-ups would page someone for nothing.
- **ENG-18** · A failure after the request has answered (a job, a consumer, a step after the commit) becomes persisted visible state (`status = failed`) and one ERROR line an existing alarm catches. *Why:* no failure ends silently.
- **ENG-19** · A failure after the commit never answers non-2xx for the action that committed. *Why:* the client would retry what already happened.

## Logs and observability

A log line is an API: alarms, metrics and the production watch read it by exact name and field. Changing an event is changing a contract: an alarmed event is renamed only with its alarm (OPS-31).

- **ENG-20** · Logs are structured, one JSON object per line on stdout, written only through the one logger the wiring point creates (`<logger>`); no print statements, no second logger. *Why:* every line is machine-readable and carries the same base fields.
- **ENG-21** · Every line carries `ts` (UTC, RFC 3339 with milliseconds), `level`, `event`, `service`, `env` and `version` (the build's commit). *Why:* any line can be placed in time, in a deploy and in a service.
- **ENG-22** · Inside a request, job or consumer, every line also carries `request_id` and `trace_id`, plus `actor_id` when there is an actor; they attach from the context through the logger, never typed at each call. *Why:* one id finds every line of one request, and a hand-typed field is the one that gets forgotten.
- **ENG-23** · An event name is `<module>.<subject>_<past-tense verb>` in lowercase snake case (`billing.invoice_sent`, `billing.invoice_send_failed`), declared once as a constant in `<events file>`. *Why:* a stable, searchable name is what an alarm and a metric match.
- **ENG-24** · The message is the event name; variable values go in fields and are never interpolated into the message. *Why:* search, metrics and alarms match exact strings.
- **ENG-25** · Levels: ERROR only for a failure someone must act on; WARN for a handled degradation (a retry used, a fallback taken, a cap hit); INFO for a change of domain state; DEBUG is off in production; a 4xx answer is never WARN or ERROR. *Why:* a level is a promise about who must look.
- **ENG-26** · A handled error writes exactly one line, at the layer that handles it. *Why:* one failure counts once in metrics and alarms.
- **ENG-27** · An ERROR or WARN line carries `cause`, one class from the closed list in `<path>` (`timeout`, `unavailable`, `rate_limited`, `rejected`, `invalid_response`, `conflict`, `bug`, `crash`), and the typed error's name, never the raw text of a driver, decoder or third-party error. *Why:* a class can be alarmed on, and raw errors echo row values and tokens.
- **ENG-28** · Log fields hold ids, enums, counts, durations and cause classes; a person's data and secrets never enter a log (SEC-9, SEC-15). *Why:* logs are copied, kept and read by more people than the database.
- **ENG-29** · The edge writes one access line per request: method, route template, status, `duration_ms`, `request_id`; never the body, the query string or the headers. *Why:* query strings and headers carry tokens.
- **ENG-30** · Every outbound call ends in one outcome event carrying the dependency's name and `duration_ms`. *Why:* a slow or failing dependency is visible without a debugger.
- **ENG-31** · A new ERROR event is caught by an existing alarm or adds one, declared as OPS-29 says; an alarm per data event is never added. *Why:* an ERROR nobody is told about is a silent failure, and an alarm per row is noise.
- **ENG-32** · A metric is derived from a log event (a count or a duration field of a named event) in `<metrics path>`; a metric emitted from code only where the event volume makes logs too costly, with the reason in the pull request. *Why:* one source of truth for what happened.
- **ENG-33** · Trace context (W3C `traceparent`) is read on every inbound request and message and sent on every outbound call and message; a job or consumer continues the trace of the request that enqueued it. *Why:* one trace follows the work across processes.

## Configuration and secrets

- **ENG-34** · Configuration is read from the environment once at startup into one typed, validated object; the process refuses to start on a missing or invalid value. *Why:* a bad deploy fails at start, not at the first request.
- **ENG-35** · Code reads configuration only from the object passed to it, never from the environment directly. *Why:* every setting has one reader and a test can set it.
- **ENG-36** · Every setting is listed in `<.env.example or config doc>` with its meaning, its default and whether it is a secret; a default exists only when it is safe in production. *Why:* a new environment is set up from one file.
- **ENG-37** · Environments differ only by configuration; no code branches on the environment's name. *Why:* staging then runs the production path.

Secrets are configuration with stricter rules: SEC-14 to SEC-19. Feature flags follow `operations.md`.

## API design

The API spec (`<spec path>`) is the contract. Every error answers one envelope:

```json
{ "error": { "code": "batch_already_closed", "message": "<for a developer, never shown as is>", "request_id": "<id>", "fields": [ { "field": "email", "code": "invalid_format" } ] } }
```

- **ENG-38** · The spec changes first, in the same pull request as the code; generated code is regenerated, never edited by hand. *Why:* the spec and the server never disagree.
- **ENG-39** · A path names resources as plural nouns (`/orders/{orderId}/items`); a state change that is not a field update is a `POST` to a named action under the resource (`POST /orders/{orderId}/cancel`). *Why:* one shape for every route.
- **ENG-40** · `GET` never changes state; `PUT` replaces, `PATCH` changes the fields sent, `DELETE` removes, `POST` creates or runs an action. *Why:* caches, retries and clients rely on the method's meaning.
- **ENG-41** · Status codes: 200 with a body, 201 created with `Location`, 202 accepted for later work, 204 no body, 400 malformed, 401 not authenticated, 403 not allowed on a resource the actor may see, 404 absent or out of scope (SEC-3), 409 conflict or stale state, 413 too large (SEC-23), 422 a rule refuses, 429 capped with `Retry-After`, 500 unexpected, 503 a dependency down. *Why:* a client decides retry or not from the status alone.
- **ENG-42** · Every non-2xx answer is the envelope above; `code` is a stable snake_case string listed in the spec, never renamed or reused, and clients branch on `code`, never on `message`. *Why:* a code is a contract; a message is copy.
- **ENG-43** · A `POST` that creates something or causes an external effect accepts an `Idempotency-Key` header: the same key with the same body returns the stored first response, with another body answers 409 `idempotency_key_reused`; keys are kept at least 24 hours. *Why:* a client retry after a timeout must not do it twice.
- **ENG-44** · A list is paginated by an opaque cursor (`?cursor=…&limit=…`, default 50, maximum 200, `next_cursor` null at the end) over a stable sort that ends on a unique key. *Why:* an offset skips and repeats rows while data changes.
- **ENG-45** · The API changes by addition: a field, an endpoint or an enum value is added; a field is never removed, renamed or changed in meaning while a client uses it; a breaking change is a new endpoint, and the old one stays until its last client moved. *Why:* clients deploy on their own schedule.
- **ENG-46** · Clients ignore fields they do not know and handle an enum value they do not know as a named fallback. *Why:* addition on the server never breaks a client.

## Data and migrations

Schema changes expand → backfill → contract across releases, named by timestamp and forward only: OPS-19 to OPS-23. One fact has one owner and no copy: ARC-6.

- **ENG-47** · Every invariant an AC or a rule states ("only one", "once", ownership, a balance never negative, a valid state) has a database constraint, and its violation maps by constraint name to a typed refusal (ENG-14). *Why:* code checks race; a constraint does not.
- **ENG-48** · A migration is never edited after merge; a fix is a new migration. *Why:* every environment runs the same history.
- **ENG-49** · A migration sets a lock timeout (`<default>`) and changes a table that holds data only with the non-blocking forms OPS-19 lists. *Why:* a blocking lock stops production traffic.
- **ENG-50** · Money is an integer count of minor units with its ISO 4217 currency code, in storage, in the API and in code; never a float. *Why:* floats lose cents.
- **ENG-51** · Time is stored and sent in UTC (RFC 3339 with `Z` in the API); a business period (a day, a month) is computed in `<the project's time zone>`, in one function. *Why:* local time breaks twice a year and across zones.
- **ENG-52** · Nothing is deleted or deactivated on incomplete data: a sync or sweep that removes rows first proves it read the whole source without an error. *Why:* a partial read would delete what still exists.
- **ENG-53** · Data that cannot be rebuilt (the raw source received, the record of an acceptance or a consent) is kept as received. *Why:* it cannot be asked for again.

## Concurrency and bounds

A request can arrive twice, and at the same time: clients retry and queues deliver at least once. Every wait has a bound.

- **ENG-54** · Every outbound call has a deadline (default 5 s), and the deadlines of one request add up below its own timeout, which stays below the server's write timeout and the platform's shutdown grace. *Why:* an unbounded wait holds a worker and hides the failure.
- **ENG-55** · The database is reached only through the project's one opener (`<path>`), which sets the statement and lock timeouts. *Why:* one place bounds every query.
- **ENG-56** · A decision that depends on current state is taken inside the transaction on a locked or conditional row (`UPDATE … WHERE state = <expected>`, a row lock, an advisory lock for count-then-insert), never on a value read before it. *Why:* check-then-act across the boundary is a race.
- **ENG-57** · No transaction stays open across a network call, and state written before an external call reads as pending, never as done. *Why:* a held transaction blocks others, and a "done" before the call lies when it fails.
- **ENG-58** · One retry layer per path: retries only on a classified transient (`timeout`, `unavailable`, `rate_limited`), at most 3 attempts, exponential backoff with jitter through an injected pause, and an idempotency key on a write. *Why:* three layers of four attempts make 64 calls.
- **ENG-59** · An external effect whose outcome can be unknown (a payment, a message sent) carries an idempotency key to the provider, or is reconciled before it repeats. *Why:* a timeout does not mean it did not happen.
- **ENG-60** · Every at-least-once consumer is idempotent by the event id or a natural key, recorded in the same transaction as its effect. *Why:* a redelivered message must not act twice.
- **ENG-61** · No fire-and-forget: background work has an owner that waits for it on shutdown and a limit on how many run at once; an effect with no human to redo it is written as a durable job or outbox row in the same commit. *Why:* detached work dies on deploy, loses its log fields and survives no restart.
- **ENG-62** · Work after the commit runs with its own deadline, detached from the request's cancellation but keeping its log fields and trace. *Why:* the caller hanging up must not cancel committed work.
- **ENG-63** · Every queue, pool, batch, page and in-memory collection that grows with input has a maximum size. *Why:* an unbounded buffer turns load into an outage.
- **ENG-64** · On shutdown the process stops accepting work, finishes what is in flight within the platform's grace, then exits. *Why:* a deploy must not drop requests.

## Dependencies

A second library for a job already covered is not added (ARC-5), and a new one enters with its line in the design (ARC-18).

- **ENG-65** · The lockfile is committed, and it changes in the same commit as the manifest. *Why:* every build installs the same code.
- **ENG-66** · Dependency updates go in their own pull requests, apart from behaviour changes. *Why:* a regression is traced to one cause.

Licences, vulnerabilities and sources of dependencies: SEC-36 to SEC-39.

## Comments and docs

The urge to comment is usually a rename, an extraction or a type, and a constraint worth explaining is usually a test.

- **ENG-67** · A comment says why (a constraint, a trade-off, a link to the incident or the ruling), never what the next line does. *Why:* the code already says what; only the why is lost.
- **ENG-68** · No commented-out code, and a `TODO` carries an issue link (`TODO(<issue>)`). *Why:* git keeps the old code; an unlinked TODO is never done.
- **ENG-69** · A lint suppression or a type escape carries, on the same line, the rule it suppresses and the reason, and only where the stack pack allows it. *Why:* an unexplained suppression hides a real finding.
- **ENG-70** · The feature map (`features/<domain>.md`) changes in the same pull request as the behaviour it describes (`architecture.md`: ARC-21). *Why:* the next reader trusts the map.

## Git and review

- **ENG-71** · A commit is one logical change that passes the fast check, with an imperative subject of at most 72 characters that says what changes ("Refuse a second close of a batch"). *Why:* history reads as a list of changes and every commit can be reverted alone.
- **ENG-72** · A shared branch is never force-pushed, and takes its base by a merge, never by a rebase of commits others have pulled (`main` itself: OPS-6). *Why:* a rewritten shared history breaks everyone's copy.
- **ENG-73** · A pull request says what it changes, why, how it was proved (its tests and one line of the change tried once), and what was decided where the brief was silent. *Why:* the reviewer judges the decision, not only the code.
- **ENG-74** · A mechanical edit across many files ships with the script that made it, in the same commit. *Why:* the reviewer reads the script instead of every file.
- **ENG-75** · A pull request that touches a path `CODEOWNERS` names is merged only with that owner's approval. *Why:* the files that decide green are where a gate gets loosened.
- **ENG-76** · A blocking review comment cites a rule id from this book or a reproduction; a preference is a non-blocking note. *Why:* review converges when blocks have a basis.

## Stack packs

The stack's rules extend this file: `<the project's stack section or pack>`. A pack adds the language's specifics (the error idiom, the logger, the test helpers, the lint set) and never relaxes a rule here; where a pack line and this file disagree, this file wins until a pull request changes one of them.
