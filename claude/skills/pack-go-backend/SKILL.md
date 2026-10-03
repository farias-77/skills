---
name: pack-go-backend
description: Senior-grade Go backend work; read it before writing, reviewing or testing any Go diff on a server (a use case, handler, query, consumer, CLI subcommand or test).
user-invocable: false
---

# Pack: Go backend

## When this pack applies

Any diff to a Go server: a use case, an HTTP handler, a SQL query, a
queue consumer, a CLI subcommand, or a test of any of them.

Precedence: the user's words, then the project's doctrine (its backend,
code and testing guides) and its golden paths, then this pack. The
doctrine names the packages that fill each role below (the single
database opener, the error package and its status mapper, the logger
constructor, the retry pause, the test stack); the golden paths name
the exemplar files to copy and fix the budgets and size thresholds.
Where this pack gives a number, it is a default for when the project is
silent.

## Principles

1. **Copy the golden path; don't design one.** *Why:* most sustained
   review findings are checkable against a checklist the builder
   already had (inference from review data).
2. **The commit is the line.** Before it: one transaction, decided on
   locked rows, no network. After it: nothing may fail the request or
   die with the caller.
3. **Every wait has a bound, and the bounds add up.** *Why:* a step
   added to a route can push its worst case past the server's write
   timeout or the platform's kill grace.
4. **Handle an error once.** Return it wrapped, or turn it into visible
   state plus an alarmed log; never both, never neither. *Why:* Uber,
   Google, Cheney.
5. **A log line is an API.** Alarms match `event`, `module` and fields
   by exact string.
6. **Logs carry ids and cause classes, never a person or a raw foreign
   error.** *Why:* decoder and driver errors echo row values.
7. **Every request arrives twice, at the same time.** *Why:* clients
   retry and queues deliver at least once.
8. **Dependencies are explicit**, wired in `cmd/`; no globals, no
   `init`, no DI container. *Why:* Bourgon.
9. **Interfaces are small and declared by the consumer.** *Why:* Go
   Code Review Comments.
10. **A test proves a rule by turning red when the rule is removed.**
    The database is never mocked.

## The checklist

**A · After the commit**
1. Every step after the transaction returns runs on
   `context.WithTimeout(context.WithoutCancel(ctx), d)`. Never the
   request `ctx`. Never `context.Background()`/`TODO()`, which drop
   `request_id`/`module`, and alarms filter on `module`.
2. A post-commit failure never answers non-2xx for the committed
   action. It becomes persisted visible state (e.g. `delivery =
   failed`) plus an ERROR event that an alarm reads.
3. State written before an external call reads as pending or unknown,
   never as success. A NULL shown as "sent" is a defect.
4. Worst case of the post-commit chain (attempts × per-try timeout +
   backoff + the write that records it) < the server's shutdown timeout
   < the platform's SIGTERM-to-SIGKILL grace (10 s on Cloud Run).
5. `http.Server.BaseContext` is `WithoutCancel(signal)`, never the
   signal context itself, and shutdown goes through `Shutdown(ctx)`.
6. No transaction stays open across a network call.

**B · Timeouts and budgets**
7. Every outbound call runs under a context deadline; every
   `http.Client` sets `Timeout`; no `http.Get` or `http.DefaultClient`
   (`noctx`).
8. The database is reached only through the project's single opener,
   which sets connect timeout, `statement_timeout` and `lock_timeout`.
   No second pool, no `pgx.Connect` in module code.
9. Adding a step to a route means recomputing its worst-case sum: below
   the request deadline for the request part and below the server's
   `WriteTimeout` in total. The PR states the sum.
10. Retries have bounded attempts and wait through an injected pause,
    never `time.Sleep`. Retry only classified transients (502/503/504,
    network, unknown outcome), never a 4xx. The retried call carries
    an idempotency key.
11. No mutex is held across I/O. A cache of remote data honors the
    source's TTL, backs off on refresh failure and logs that failure.

**C · Errors**
12. No `_ = err`, no log-and-continue, no `if err != nil { return nil }`
    (`nilerr`).
13. Wrap with `fmt.Errorf("verb the noun: %w", err)`: lowercase, no
    "failed to", `%w` last.
14. A branch that turns an error into a refusal or a quiet success
    (401, 404, 202, "refused") selects the expected error with
    `errors.Is`/`errors.As`. Every other error propagates or logs ERROR
    with a cause.
15. A refusal is a constructor of the project's error package, and the
    HTTP status is mapped in one place only. A new code goes into the
    error package, the mapper and the API contract in the same diff.
16. Keep `%w` through every layer so the HTTP layer still sees
    `context.Canceled` and answers 499 at INFO. A client hang-up must
    not page as a 500.
17. CLI subcommands exit non-zero when any step failed, including a
    side step of an "already in that state" run.

**D · Logs and alarms**
18. Log only through the injected `*slog.Logger` built by the project's
    logger constructor, which emits `event`/`severity`. No
    `slog.Default`, `log.Printf` or new handler.
19. Event names are snake_case constants
    (`eventSendFailed = "email_send_failed"`). Messages are never built
    with `Sprintf`.
20. When an alarm in the infrastructure code filters on an event, the
    diff keeps the event string, `module` and every filtered field
    identical at ERROR. A rename changes the alarm in the same diff. An
    integration test asserts `severity`, `module` and those fields.
21. Use the `…Context`/`LogAttrs(ctx, …)` methods with a
    request-derived ctx so `request_id`, `module` and `use_case` attach.
22. Every alarmed event carries a classified `cause` so the page says
    why ("log only actionable information").

**E · Personal data**
23. No e-mail, name, phone, IP, token, JWT or password in any log
    attribute, any error text that reaches a log, an event payload, a
    fixture or evidence. Ids are fine.
24. Never log `err.Error()` from a JSON or parameter decoder, a
    `*pgconn.PgError` (its `Detail` echoes row values such as a
    duplicate e-mail) or a provider response. Log the class instead:
    `reason`, `cause`, `provider_status`, the SQLSTATE.
25. Each failing-path integration test ends by asserting that no log
    line contains the test's personal values (email, name, IP).

**F · Concurrency and idempotency**
26. Decide inside the transaction on a locked row: `SELECT … FOR
    UPDATE`, a conditional `UPDATE … WHERE state = $expected
    RETURNING`, or `pg_advisory_xact_lock` for count-then-insert. Never
    decide on a read taken before the transaction, scope checks
    included (TOCTOU).
27. Repeating a request is a no-op: no audit row, no `updated_at` bump,
    the same 2xx answer.
28. Each invariant has a constraint, and its SQLSTATE plus constraint
    name maps to a typed refusal. Never match the error text.
29. An external effect whose outcome can be unknown carries an
    `Idempotency-Key` derived from a persisted id.
30. Concurrent repeats get a test through the real stack: N ≥ 2
    parallel calls released by a barrier (4–20 is typical). It asserts
    exactly one effect (rows, audit lines, e-mails) and the status mix.
    Never rerun to green.
31. A `go` statement has an owner that waits (`WaitGroup.Go`,
    `errgroup` with ctx) and a limit. No fire-and-forget in handlers.

**G · Shape**
32. The import fence holds: another module only through its public
    package, the application layer never imports its own transport or
    storage adapters, the domain stays pure (guard and `depguard`).
33. One use case per file (`app/<verb_noun>.go`), as a `Service`
    method `(ctx, actor, XRequest)`. Authorization comes first. Scope
    comes from the actor, never the client, and out-of-reach answers
    `NotFound`.
34. Clock, ids and randomness come injected; `time.Now` only in `cmd/`.
35. Function size stays within the golden paths' thresholds for
    cyclomatic complexity and length, for code and for tests.
36. No `//nolint` or `t.Skip`; generated code is never edited; a
    contract change starts in the API spec (e.g. `openapi.yaml`).
37. Every limit (validator max, timeout, constraint, guard) has a test
    that fails when it is removed. Test limits as literals (max,
    max+1), never the code's constant. Validators get a fuzz test with
    a committed corpus. Coverage meets the doctrine's bar.

## Anti-patterns

- **Speculative structure.** `Repository[T]`, `BaseService`,
  fx/wire/dig, `utils`/`common` packages, options or builder for a
  struct built once, an interface beside its only implementation,
  generated mocks.
- **"Async" e-mail.** `go s.send(context.Background(), …)`: the
  goroutine has no owner, SIGTERM kills it, and it loses `module`, so
  the alarm never matches.
- **Double handling.** `s.logger.Error(…); return err`: logged at every
  layer, counted twice by the alarm.
- **Wrap noise.** `"failed to x: failed to y: …"`,
  `errors.New(err.Error())`,
  `strings.Contains(err.Error(), "duplicate key")`.
- **Check-then-act.** Reading status before the transaction, then
  writing as if it still held.
- **Workaround as fix.** A sleep, a retry or a longer timeout to pass a
  race; a looser assert.
- **Leaky interior.** `panic` on bad input; `any`/`map[string]any` past
  the handler; `slog.Any("request", req)`.
- **SQL by hand.** `fmt.Sprintf` SQL, an ORM, edits to generated code.
- **Test slop.** testify, gomock or sqlmock (the database is never
  mocked, and a new dependency needs the doctrine's ruling); table
  cases with `if tc.wantErr` branches; asserting internal calls instead
  of state and effect; expected values computed with the code's own
  formula.

## Core recipes

- **The use-case shape:** authorize → `InTx` that decides on the locked
  row (conditional `UPDATE … RETURNING`; no match = stale-state
  refusal) and writes the audit row → wrap and return on error → after
  the commit, `deliver` on `WithTimeout(WithoutCancel(ctx), budget)`,
  which records the outcome as state and logs a classified ERROR on
  failure.
- **Work that must survive a hang-up but keep the request deadline:**
  drop cancellation, keep the deadline (`WithoutCancel` plus
  `WithDeadline` at the original deadline).
- **Locks in SQL:** conditional update with `RETURNING`;
  `pg_advisory_xact_lock(hashtextextended('<scope>:' || key, 0))` for
  count-then-insert.
- **Budget defaults (inference):** request deadline 10 s; read header /
  read 4 s; write just below the platform's request limit; shutdown
  below the kill grace; DB connect 5 s, statement 20 s; ≤ 3 retry
  attempts in ~5 s; body 1 MiB.
- **Tests:** external test package, fakes in one file, `t.Context()`,
  map cases with one `t.Run` each, `got … want` order; limits as
  literals; fuzz seeds for NUL, ZWSP/ZWJ, bidi `U+202E`, astral emoji
  and edge spaces, with the property "refused with the field named, or
  accepted and clean"; integration against a real Postgres cloned from
  a migrated template; concurrency through a barrier channel and a
  non-fatal sender.

The full code for each recipe (use case, SQL, alarmed event and its
test, fuzz and concurrency tests) is in
[references/recipes.md](references/recipes.md). Linters, versions and
Go release notes are in [references/tooling.md](references/tooling.md);
sources in [references/sources.md](references/sources.md).
