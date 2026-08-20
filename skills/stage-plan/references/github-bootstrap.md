# Bootstrapping the issues on GitHub

The mechanics for the bootstrap agent — a Sonnet `general-purpose`
agent the conductor dispatches AFTER the user approves the plan. The
content is ready and reviewed; this is arm work, done idempotently so a
re-run never duplicates.

## Inputs the brief must carry

- Every `02-plan/<repo>/plan.md` (the issue index, batches, and edge
  table) and every `02-plan/<repo>/issues/*.md` (the bodies, verbatim).
- The GitHub repo each plan maps to.

## The sequence, per repo

1. **Labels, idempotent.** Ensure the labels the venture uses for
   pipeline issues exist (`gh label create <name> --force` is an
   upsert). At minimum: one label for the workstream slug.
2. **Dry-run the mapping.** Before creating anything, list what exists:
   ```
   gh search issues --repo <owner>/<repo> "plan-id: <workstream>/<repo>/" --json number,body
   ```
   Every issue body carries its `<!-- plan-id: ... -->` marker — that
   marker is the idempotency anchor. Build the map plan-id → existing
   #number.
3. **Upsert each issue.**
   - Not found ⇒ create it:
     ```
     gh issue create --repo <owner>/<repo> --title "<title from the plan's index>" --label <workstream> --body-file <issues/NN-*.md>
     ```
   - Found ⇒ `gh issue edit <number> --body-file <issues/NN-*.md>`
     (title too, if it changed). Never create a second issue for the
     same plan-id.
   - Pace the calls (a short sleep between creates). GitHub's secondary
     rate limit caps content-generating requests at **80/minute and
     500/hour** across web, REST, and GraphQL; exceeding it returns
     403/429 (honor `retry-after`, back off exponentially) — see
     [GitHub's rate-limit docs](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).
4. **Wire the dependencies** from the plan's edge table — dependencies
   live in the graph, never in the body. Via GraphQL:
   ```
   gh api graphql -f query='
     mutation($issue: ID!, $blocker: ID!) {
       addBlockedBy(input: { issueId: $issue, blockingIssueId: $blocker }) {
         issue { number }
       }
     }' -f issue=<node id of the BLOCKED issue> -f blocker=<node id of the blocker>
   ```
   The `issueId` field is the **blocked** issue — the one that waits;
   `blockingIssueId` is the blocker (field names verified by schema
   introspection — if the mutation errors on a field, introspect
   `AddBlockedByInput` again rather than trusting this page).
   Node ids come from `gh issue view <number> --json id`. Edges are
   intra-repo only (the plan guarantees it); if the edge table shows a
   cross-repo edge, stop and report — that is a plan defect, not yours
   to fix.
5. **Write the numbers back**: fill the GitHub column of the plan's
   issue index (`| 03 | ... | #47 |`) and flip the plan's frontmatter
   `status` to `Bootstrapped`.

## The return

The map plan-id → #number for every issue, per repo; anything that
failed with the error verbatim; anything skipped and why. The conductor
verifies every plan-id got a number — a hole here means the bootstrap
re-runs (safe: the upsert never duplicates).
