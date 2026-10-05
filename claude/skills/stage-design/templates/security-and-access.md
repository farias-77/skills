# Security and access — <workstream>

<!--
  Written by its design-writer (Sonnet 5.5, high). Who can do what and
  where it is checked; another user's or scope's data; secrets;
  personal data. Only what this demand adds or changes.
-->

## Who can do what

| Actor | Action | Allowed when | Checked in | req |
|---|---|---|---|---|

## Another user's data

<!-- For each route and screen that reads or writes data scoped to a
     user, a team or a region: where the scope comes from (the token,
     never the body) and what a request outside it gets. -->

| Route or screen | Scope from | Outside the scope |
|---|---|---|

## Personal data

| Data | Stored where | Who sees it | Kept for | Never in |
|---|---|---|---|---|
| <e-mail> | <`invites.email`> | <admins of the workspace> | <until the invite is deleted> | logs, events, fixtures |

## Secrets

None. <or: secret · held by · read by>

## The floor this demand touches

- <the permission test, the auth-before-body rule, the concurrency rule: the case here>

## The implementer decides

- <one line each with its bound>

## References

- <the standards' security rules, path:line>
