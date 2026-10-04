# The templates — how to fill them

The generic pieces `/pipeline-setup` copies into a project. The session
reads this file before it applies one; nothing here is copied.

## Rules for every template

- **No code comments.** Many doctrines forbid comments in code, so the
  scripts ship without them: usage is printed by the code
  (`--help`), and the explanation lives in the tool's own document
  copied beside it (`local-ci.md`, `structure-check/README.md`). The
  only `#` lines kept are shebangs.
- **The guard is the exception.** `guard-irreversible.sh` and its test
  are the pipeline's files, copied verbatim and updated from the
  pipeline, so they keep their header. When the project's doctrine (or
  a linter) enforces a no-comment rule, that rule must exclude
  `.claude/hooks/`: the role-12 step adds the exclusion where the rule
  is written, in the same commit.
- **No placeholder survives.** Every `<…>` is replaced with what the
  audit found, or the line is deleted. A value not known yet is written
  as what it is (for example "not run: the gate needs a secret the
  station lacks"), never as a token to fill later. Step 4 greps for
  leftovers.
- **The project's language.** A document goes in the language its
  neighbours are written in (the feature maps, the doctrine); a script
  goes in the language the repo's own tooling uses, where its lint and
  formatting already apply. The templates are English and bash, Python
  and Node; translating them is part of applying them.

## golden-paths.md

The file the builder reads before it writes and the structure reviewer
measures a diff against. One section per kind of unit; each names ONE
exemplar that exists in the code at the audited sha and says what to
copy from it.

- **Fill it after the structure check is calibrated** (role 7): its
  size line quotes the p95/p99 that the calibration writes.
- **Pick the exemplar by a rule, and write the rule**: the most recent
  module that passes the gate with no structure warning; the one the
  doctrine cites; the one the team points new people at. Never the
  biggest.
- **Verify it at the audited sha**, not in a research note or another
  branch: `git ls-tree -r --name-only <sha> -- <path>` lists it, and
  `structure-check.sh --measure <repo> <sha> <path>...` exits 0 (no
  function or file over the calibrated p95). An exemplar over p95 is
  replaced by the next one the rule picks.
- Name files, not folders, when the kind is a file (an endpoint, a
  migration). Name the folder and its key files when the kind is a
  module.
- Say what to copy in one to five lines: the layering, the naming, the
  error handling, the test shape. A pointer and a reason, not a
  tutorial.
- A kind the codebase does not have yet: "none — the plan's foundation
  builds the first one in the doctrine's full shape".
- Keep it under ~150 lines. The weekly retro re-reads it; when an
  exemplar drifts, it is replaced.

Kinds a project usually has, to adapt or delete (shown for a Go and
TypeScript project):

| Kind | Exemplar shape | Copy |
|---|---|---|
| server module | `backend/internal/<module>/` — `module.go`, `app/<use_case>.go`, `domain/<rule>.go`, `http/<operation>.go`, `store/<repo>.go` | the module's only public API is its root; one file per use case; the domain is pure; errors wrapped with context |
| HTTP endpoint | `backend/internal/<module>/http/<operation>.go` | actor from the context → the use case → the generated response type |
| background job | a job file | idempotent by key, bounded retries, one log event per run |
| migration | `migrations/<nnnn>_<name>.sql` | expand only; the contract step ships in a later release |
| screen | `frontend/src/features/<feature>/` | the index is the only import point; route component → data hook → presentational components; every state rendered |
| component | `frontend/src/shared/ui/<Component>.tsx` | tokens only, no raw colors; props typed; one sample |
| tests, one per layer | unit, integration against a real database, browser journey | the actor logs in, steps by role and label, the side effect read back |

## verify-map.md

A section appended to each feature map (the file the doctrine names for
the feature). The QAs, the release smoke and the footage recorder
read it to reach and drive the feature without rediscovering the path.

- **Written in the feature maps' language**: the headings, the row
  labels and the state names are translated with the rest.
- Only maps whose feature has something built to drive get one; a map
  of a feature with no screen and no server effect yet is left as it is.
- Keep it to what a machine needs: where, who, the steps, what to read
  back. It is updated in the same diff that changes the feature.
- Every route, command and test it names exists at the sha.

## The cloud environment (role 20)

In the two scripts each placeholder sits on a no-op line (`: '<…>'`)
so the template passes `bash -n`; filling it replaces the whole line
with the commands. Four pieces, filled from what the audit found (the toolchain versions
the repository pins, its lockfiles, its stack-up command, the images
its compose file and its browser tool use):

| Template | Goes to | Fill |
|---|---|---|
| `cloud-setup.sh` | the doctrine's tooling folder (pasted into the environment's setup script) | `<toolchain-installs>`: only what the base image lacks or has at another version; `<marker-file>`: a file only this repository has; `<dependency-warmup>`: the lockfile installs (`go mod download`, `pnpm fetch`); `<image-warmup>`: the stack's pulls and builds; `<browser-install>`: the browser tool's install at its pinned version, or the pull of the pinned browser image |
| `cloud-session-start.sh` | `.claude/hooks/` | `<default-branch>`; `<dependency-install>`: the offline-first installs from the warm caches; `<stack-up>` and `<stack-env-summary>`: the doctrine's stack-up and env commands |
| `cloud-settings.json` | merged into `.claude/settings.json` (lists unioned, never overwritten) | the doctrine's commands in place of each `<…>` |
| `cloud-env.md` | beside the doctrine | the environment's fields, the env var names with their test-only values, the allowlist with a reason per host, the checks with their output |

Measure the setup script once, uncached: each step prints its elapsed
seconds. Over about five minutes the snapshot is not cached and every
session pays it; move the slowest step to the hook only if it is per
branch, otherwise trim it (fewer images, one browser). The pipeline is
vendored with it: `.claude/pipeline/` holds `workflows/`, `agents/` and
the `skills/pack-*` folders the agents read, copied from a tag of the
pipeline repository, with a `VERSION` file naming the tag and its sha.
