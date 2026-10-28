# Security · <project>

<!-- Read by the design, execute and release stages: the design's security lens and the reviewer cite its ids, QA tries the running change against it. Seeded by the `standards` skill from the kit's template; the project owns it and changes it only by pull request. Rule ids are never reused: a dropped rule keeps its id with "(retired YYYY-MM-DD: <why>)". -->

What stops the wrong person from reading or changing data, and what keeps personal data and secrets from leaking. A control here answers a real actor or a real incident; one for a risk nobody has is cut, never added.

## Access and scope

- **SEC-1** · Every route and every screen action names its actor and its permission, and the use case checks the permission first, before it reads or writes anything; a control hidden in the UI is never the check. *Why:* the API is reachable without the UI.
- **SEC-2** · The scope of data (a user, team, unit, account or region) comes from the verified actor's session or token, never from the body, the query or the path. *Why:* anything the client sends, the client can change.
- **SEC-3** · A resource outside the actor's scope answers 404, the same as one that does not exist, with nothing read or written. *Why:* a 403 confirms the resource exists.
- **SEC-4** · Authentication runs before the body is read or parsed. *Why:* an anonymous caller must not reach the parser.
- **SEC-5** · A route requires authentication unless it is on the public list (`<path>`). *Why:* a new route is closed by default.
- **SEC-6** · A query that selects scoped data by an id from the request filters by the actor's scope in the same query (`WHERE id = $1 AND <scope column> = $actorScope`). *Why:* a check in a separate read races and is easy to forget.
- **SEC-7** · A session cookie is `HttpOnly`, `Secure` and `SameSite=Lax` or stricter; a state-changing request authenticated by cookie is protected against cross-site requests; a session expires after `<idle timeout>` and is invalidated at logout and at a password or role change. *Why:* a stolen or forged session is the whole account.
- **SEC-8** · A change to another person's data or to a role writes an audit record (actor, action, target, time) in the same transaction as the change. *Why:* who did what is answerable after the fact.

## Personal data

Personal data is anything that identifies a person: a name (a real person's name counts), an e-mail, a phone, an address, a document number, an IP, a precise location, a photo, free text the person wrote.

- **SEC-9** · Personal data never appears in a log, an analytics or event payload, an error message, a fixture, a seed, a test's output, a screenshot or a video; they carry the person's id. *Why:* those copies are kept longer and read by more people than the database.
- **SEC-10** · Each kind of personal data stored is listed in `<data inventory path>` with why it is kept, who can see it and how long it is kept (removed at the end as ARC-15 says), and a new field of personal data updates the list in the same pull request. *Why:* data nobody listed is data nobody deletes.
- **SEC-11** · A person's request to delete their data is carried out within 30 days across every store the inventory lists, by `<the deletion job or procedure>`. *Why:* the person's right does not wait for the retention to end.
- **SEC-12** · A response returns only the personal fields its actor may see, selected field by field; a whole row or object is never serialized as the response. *Why:* a new column must not leak by default.
- **SEC-13** · Every connection that carries personal data or a credential uses TLS, and every store of personal data has encryption at rest switched on in the infrastructure code. *Why:* a copied disk or a sniffed network reads nothing.

## Secrets and identities

Each service's own identity with the least role is ARC-12; the agents' identities are OPS-39 and OPS-40.

- **SEC-14** · Every secret lives in the secret manager (`<secret manager>`) with its readers named, and nowhere else: not in the repo, an image, a config file, a CI variable set by hand or a fixture. *Why:* one place to grant, audit and rotate.
- **SEC-15** · A secret never appears in a log, an error, a URL or a response, and the configuration object masks it when printed. *Why:* a printed secret is a leaked secret.
- **SEC-16** · A grant, role or policy a diff adds covers only the actions and resources the change uses; no wildcard on actions or resources. *Why:* a wider grant is the blast radius of the next bug.
- **SEC-17** · The agents' permission settings (`.claude/settings.json` in every directory a session opens) allow the daily commands, ask for anything that reaches production, and deny reading the GitHub, cloud and CI credentials and editing the settings. *Why:* the stages run with no person between the gates.
- **SEC-18** · A secret that reached git, a log, a ticket or a chat is rotated first, then removed. *Why:* removing it from history does not remove the copies.
- **SEC-19** · The secret scan (`<secret scan command>`) runs in the whole gate (TST-56), and a finding is fixed, never allow-listed without the owner's approval. *Why:* a committed secret is caught before it merges.

## Input and injection

- **SEC-20** · Every input from outside the process (a body, query, path, header, file, message, webhook or third-party response) is parsed at the edge against a schema into a typed value: unknown fields refused, strings trimmed and length-bounded; the code behind the edge takes only typed values. *Why:* one parser per input, and no raw input deeper in.
- **SEC-21** · Input reaches a query, a shell, a header or a log line only as a parameter: SQL through bound parameters or the query generator, a process launched with an argument list, never a string built from input. *Why:* string building is injection.
- **SEC-22** · Output is encoded for where it goes: HTML only through the framework's escaping, never inserted as raw HTML; e-mail templates the same; a CSV cell that starts with `=`, `+`, `-` or `@` is prefixed with `'`. *Why:* input shown as markup runs as code.
- **SEC-23** · A request body has a size limit at the edge (default 1 MB; an upload route sets its own), and a larger body answers 413 before it is parsed. *Why:* an oversized body costs memory before any rule runs.
- **SEC-24** · An uploaded file is checked by its content (not its name or declared type) and its size, stored under a generated name outside anything served as code, and served as an attachment unless it is an allowed image type. *Why:* an uploaded file is input that persists.
- **SEC-25** · A request to a URL taken from input goes only to a host on the allow list (`<path>`), never to a private or link-local address. *Why:* the server must not fetch its own internals for a caller.
- **SEC-26** · A redirect target taken from input is a relative path or a host on the allow list. *Why:* an open redirect lends the domain to phishing.
- **SEC-27** · A webhook is accepted only with a valid signature checked over the raw body and a timestamp less than 5 minutes old. *Why:* anyone can post to a public URL, and an old request can be replayed.

## Abuse and repeats

Repeats are covered by the engineering rules: the idempotency key (ENG-43), the constraint for an invariant (ENG-47), the idempotent consumer (ENG-60); the concurrency proof is TST-21. This section adds the attacker's view.

- **SEC-28** · A route that can be abused (sign-in, sign-up, a reset, an invite, a message or e-mail sent, an export, a search, anything that costs money) has exactly one cap, keyed by the actor, or by IP and target account when anonymous, answering 429 with `Retry-After`. *Why:* one cap stops the abuse; a second on a route with no traffic is cost with no reader.
- **SEC-29** · Sign-in, sign-up and password reset answer the same way for an account that exists and one that does not. *Why:* a different answer lists the accounts.
- **SEC-30** · A token sent by e-mail or link (a reset, an invite, a sign-in link) is single-use, expires (default 1 hour; an invite 7 days) and is stored only as a hash. *Why:* a link sits in inboxes and logs long after it was sent.
- **SEC-31** · A password is stored only as a hash from a slow algorithm (`<argon2id or bcrypt>`), and is never logged or returned. *Why:* a leaked table must not give back the passwords.

## The floor

The security tests that may never disappear, wherever the rule they guard exists. TST-36 to TST-38 say how they are tagged and kept. The project adds a case here when a review or an incident finds a class of hole.

- **SEC-32** · Every permission or scope rule has an API test in which an actor of another scope is refused and nothing is written. *Why:* scope is the hole that leaks one customer's data to another.
- **SEC-33** · One test lists every route and fails when one answers anything but 401 to a request with no session and a malformed body, unless the route is on the public list (SEC-5). *Why:* a new unauthenticated route, or a parser before authentication, fails the gate on the day it is added.
- **SEC-34** · The test that reproduces a fixed security hole (TST-10) joins the floor. *Why:* a hole fixed once must stay fixed.
- **SEC-35** · Every "only once" rule (a repeated request, two at once, a repeated confirmation) has a concurrency test through the real stack (TST-21). *Why:* a repeat is how a credit, a payout or a vote is doubled.

## Dependencies and supply chain

How a dependency is chosen is ARC-5, ARC-18, ENG-65 and ENG-66; these rules are its risk.

- **SEC-36** · A new dependency comes from the language's official registry, has a release in the last 12 months, and carries a licence on the project's list (`<allowed licences>`). *Why:* an abandoned or wrongly licensed package is a debt that comes due.
- **SEC-37** · The dependency audit (`<audit command>`) runs in the whole gate (TST-56) and fails on a high or critical advisory unless the exceptions register names it with a reason and a review date. *Why:* a known hole is fixed or consciously accepted, never ignored.
- **SEC-38** · Install-time scripts of dependencies are disabled where the package manager allows it, except for those on `<allow list>`. *Why:* an install script runs with the developer's and the CI's credentials.
- **SEC-39** · Container base images and CI actions are pinned by digest or commit SHA, never by a moving tag. *Why:* a moved tag changes what runs without a diff.
