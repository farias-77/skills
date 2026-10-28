# Backend craft (Go)

For `builder-backend (Opus 5.5, medium)`, and the `reviewer (Opus 5.5,
high)` when it reads a server diff. Precedence: the user's words, then
the project's standards and golden paths, then this file. Where this
file gives a number, it is a default for when the project is silent.

## Principles

1. **Copy the golden path; do not design one.**
2. **The commit is the line.** Before it: one transaction, decided on
   locked rows, no network. After it: nothing may fail the request.
3. **Every wait has a bound**, and the bounds add up below the server's
   write timeout and the platform's shutdown grace.
4. **Handle an error once.** Return it wrapped, or turn it into visible
   state plus an alarmed log; never both, never neither.
5. **A log line is an API.** Alarms match the event name and fields by
   exact string.
6. **Logs carry ids and cause classes**, never a person's data or a raw
   driver or decoder error (they echo row values).
7. **A request can arrive twice, at once.** Clients retry; queues
   deliver at least once.
8. **Dependencies are explicit**, wired in `cmd/`: no globals, no
   `init`, no DI container, no generic repository.
9. **Interfaces are small and declared by the consumer.**

## Checklist

**After the commit**
- Work after the transaction runs on
  `context.WithTimeout(context.WithoutCancel(ctx), d)`: never the
  request `ctx` (it dies with the caller), never `context.Background()`
  (it drops the request's log fields).
- A failure after the commit never answers non-2xx for the committed
  action: it becomes persisted visible state (`delivery = failed`) and
  an ERROR event an alarm reads.
- State written before an external call reads as pending, never as
  done. No transaction stays open across a network call.

**Bounds**
- Every outbound call has a deadline; every `http.Client` sets
  `Timeout`. The database is reached only through the project's single
  opener (it sets the statement and lock timeouts).
- Retries: bounded attempts, an injected pause (never `time.Sleep`),
  only on a classified transient, with an idempotency key.

**Errors**
- `fmt.Errorf("verb the noun: %w", err)`: lowercase, `%w` last, no
  "failed to". No `_ = err`, no log-and-continue.
- A refusal is a constructor of the project's error package; the HTTP
  status is mapped in one place. Expected errors are selected with
  `errors.Is` / `errors.As`, never by text.
- Keep `%w` through every layer so a client hang-up stays
  `context.Canceled` and never pages as a 500.

**Logs**
- Only the injected `*slog.Logger`, with the `…Context` methods so the
  request's fields attach. Event names are snake_case constants. An
  alarmed event carries a classified `cause`.
- Renaming an event the infrastructure's alarm filters on changes the
  alarm in the same diff.

**Data and concurrency**
- Decide inside the transaction on a locked row: a conditional
  `UPDATE … WHERE state = $expected RETURNING`, `SELECT … FOR UPDATE`,
  or an advisory transaction lock for count-then-insert. Never on a
  read taken before the transaction (scope checks included).
- An invariant an AC states ("only one", "once", money, ownership) has
  a database constraint, and its SQLSTATE plus constraint name maps to
  a typed refusal.
- Repeating a request is a no-op: no second row, no audit line, the
  same 2xx.
- A `go` statement has an owner that waits and a limit; no
  fire-and-forget in a handler.

**Shape**
- One use case per file, a `Service` method `(ctx, actor, Request)`;
  authorization first; scope from the actor, never from the client;
  out of reach answers not-found.
- Clock, ids and randomness injected; `time.Now` only in `cmd/`.
- Spec first: change the API spec, run the generator; generated code is
  never edited. SQL through the query generator, never `Sprintf`.
- Money in integer cents, time in UTC, business periods in the
  project's zone.

## Tests (within the testing rule in builders.md)

- Unit: an external test package, fakes in one file, `t.Context()`,
  cases in a map with one `t.Run` each, `got … want`.
- Integration: the real stack in process against a real database
  cloned from a migrated template; assert the status, the rows and the
  effect.
- Concurrency, only where the rule exists: N goroutines held on a
  `start` channel, released together, sending with a non-fatal sender;
  then exactly one effect in the database. Never rerun to green.
- The integration logger fails a test that logs a person's data: keep
  ids in logs.

## Anti-patterns

- Speculative structure: `Repository[T]`, `BaseService`, an interface
  beside its only implementation, options for a struct built once,
  `utils` packages.
- "Async" work as `go s.send(context.Background(), …)`: no owner, dies
  on shutdown, loses the log fields.
- Logging and returning the same error; matching error text.
- Check-then-act across the transaction boundary.
- A sleep, a retry or a longer timeout to pass a race; a looser assert.
- Mocks of the database; asserting internal calls instead of state.

## The use-case shape

```go
func (s *Service) CloseBatch(ctx context.Context, actor identity.Actor, req CloseBatchRequest) (Batch, error) {
	if !actor.Can(identity.CloseBatch) {
		return Batch{}, apperr.Forbidden()
	}
	var closed Batch
	err := s.store.InTx(ctx, func(tx pgx.Tx) error {
		batch, matched, err := s.store.WithTx(tx).CloseBatch(ctx, req.ID, req.ExpectedState, s.clock())
		switch {
		case err != nil:
			return err
		case !matched:
			return apperr.StaleState()
		}
		closed = batch
		return s.audit.Record(ctx, tx, auditBatchClosed(actor.ID, batch.ID))
	})
	if err != nil {
		return Batch{}, fmt.Errorf("close the batch: %w", err)
	}
	s.notify(ctx, closed.ID)
	return closed, nil
}
```

`notify` runs on `WithTimeout(WithoutCancel(ctx), budget)`, records the
outcome as state, and logs a classified ERROR on failure.
