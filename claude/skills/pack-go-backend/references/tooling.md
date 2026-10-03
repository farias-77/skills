# Go backend: tooling

The project pins its own versions and owns its linter config; the
agent never edits the linter config in a feature diff. The list below
is the reference point when the doctrine is silent.

## Pinned tools (October 2026)

Pin tools with `go tool -modfile=tools/go.mod` so every machine runs
the same versions: golangci-lint v2.14.0, sqlc v1.31.1, oapi-codegen
v2.8.0, goose v3.28.0, govulncheck v1.8.0. Driver: pgx v5.11.0. The
project's verify command typically runs the guard, lint,
`go test -count=1` with combined `-coverprofile`, and govulncheck.

## Linters that enforce the checklist

| Linter | Checklist section |
|---|---|
| `errcheck`, `wrapcheck`, `nilerr` | C · Errors |
| `contextcheck`, `noctx` | B · Timeouts |
| `forbidigo` (`time.Now`, `fmt.Print*`) | G · Shape |
| `depguard` (domain is pure) | G · Shape |
| `exhaustive`, `gocognit` | G · Shape |
| `sloglint` (`static-msg`, `key-naming-case: snake`, `forbidden-keys: [event, severity]` so an attribute cannot collide with the mapped keys (inference), `context: scope`) | D · Logs |
| `errorlint`, `bodyclose`, `fatcontext` | C, B |

Run `go test -race ./...` locally on any diff that adds goroutines or
shared state (inference: many verify commands leave it out for speed).

## Go release notes worth knowing

- **Go 1.25:** `sync.WaitGroup.Go`; `testing/synctest` (virtual time,
  stdlib); cgroup-aware GOMAXPROCS in containers.
- **Go 1.26:** `errors.AsType`; `go fix` modernizers — never run them
  repo-wide in a feature diff.
- **Go 1.27:** `encoding/json` is backed by v2 and rejects duplicate
  names and invalid UTF-8; expect 422 at the boundary and test it
  (inference about generated decoders). A stdlib `uuid` arrives; do not
  migrate off `google/uuid` in passing.

## Test containers

testcontainers-go offers Snapshot/Restore built on Postgres template
databases. A project whose test stack already clones a migrated
template does not need it, and a new dependency goes through the
doctrine's ruling.
