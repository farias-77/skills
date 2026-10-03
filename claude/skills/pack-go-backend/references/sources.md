# Go backend: sources

Public sources only. Secondary sources are marked.

- https://go.dev/doc/effective_go — naming, error strings naming their origin, panic only at init.
- https://go.dev/wiki/CodeReviewComments — ctx first and never in a struct, consumer-owned interfaces, goroutine lifetimes, got/want order.
- https://github.com/uber-go/guide/blob/master/style.md — handle errors once, no "failed to", no fire-and-forget goroutines, no mutable globals or init, table tests without branching.
- https://google.github.io/styleguide/go/best-practices — `%w` at the end, don't log what you return, no util packages.
- https://go.dev/blog/go1.13-errors — wrapping makes an error part of the API; `errors.Is` over `==`.
- https://pkg.go.dev/context — `WithoutCancel` keeps values and drops deadline and cancellation (1.21); `*Cause` variants.
- https://pkg.go.dev/log/slog — `LogValuer` redaction, `ReplaceAttr`, `LogAttrs`, `…Context` methods.
- https://docs.cloud.google.com/run/docs/container-contract — SIGTERM, then SIGKILL after 10 s.
- https://docs.cloud.google.com/run/docs/logging — `severity` lifted out of `jsonPayload`; other fields stay in `jsonPayload`.
- https://blog.cloudflare.com/the-complete-guide-to-golang-net-http-timeouts/ (secondary) — server and client timeout semantics; `http.Get` has no timeout.
- https://www.postgresql.org/docs/current/runtime-config-client.html — `statement_timeout`, `lock_timeout`, `idle_in_transaction_session_timeout`, `transaction_timeout`.
- https://www.postgresql.org/docs/current/explicit-locking.html — `FOR UPDATE` semantics; transaction-level advisory locks.
- https://brandur.org/idempotency-keys (practitioner) — atomic phases, foreign state mutations, keys under a unique index.
- https://docs.sqlc.dev/en/latest/howto/transactions.html — the `WithTx` shape.
- https://pkg.go.dev/github.com/jackc/pgx/v5 — `BeginFunc` commits on nil and rolls back on error; no auto-rollback on ctx cancel.
- https://go.dev/doc/security/fuzz/ — fuzz target rules, `testdata/fuzz` corpus, determinism.
- https://go.dev/wiki/TableDrivenTests — map cases, `t.Run` names, `Errorf` vs `Fatalf`.
- https://golang.testcontainers.org/modules/postgres/ — Snapshot/Restore built on template databases.
- https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html — what never to log; log-injection sanitizing.
- https://github.com/go-simpler/sloglint and https://golangci-lint.run/docs/linters/configuration/ — the linter options in tooling.md.
- https://go.dev/doc/go1.25, https://go.dev/doc/go1.26, https://go.dev/doc/go1.27 — version features in tooling.md.
- https://dave.cheney.net/practical-go/presentations/qcon-china.html — name packages for what they provide, handle errors once, know when a goroutine stops, leave concurrency to the caller.
- https://peter.bourgon.org/go-best-practices-2016/ and https://peter.bourgon.org/blog/2017/06/09/theory-of-modern-go.html — explicit dependencies, loggers as dependencies, no package globals, small interfaces, actionable logs.
