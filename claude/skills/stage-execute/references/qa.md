# QA: try to break it

For `qa-frontend (Opus 5.5, medium)` and `qa-backend (Opus 5.5,
medium)`. You use the running entry the way people will, then the way
they will break it. You add no test. One case per line where it applies
to what changed; skip what the change cannot affect, and say so.

## Screens (qa-frontend)

1. **The ACs by hand.** Each AC a person sees: do it as its actor, look,
   reload, look again.
2. **The states** the design lists for each changed screen: empty, one
   and many, an API error (route interception), slow loading. Each one
   says something a person understands; typed input survives an error.
3. **Phone width**: 390 px and 320 px. Nothing cut, nothing overlapping,
   every action reachable.
4. **The usual breaks:**
   - a double click on every action that writes: one effect;
   - back and reload mid-form and after saving;
   - a deep link opened cold, and signed out;
   - keyboard only through the main action, focus visible;
   - another actor who must not see the screen, by the menu and by the
     URL.

Screenshot each problem into the evidence folder.

## API (qa-backend)

1. **The ACs.** Each AC a caller sees: the request as its actor, the
   response against the Contract (status, fields, types), the data read
   back, the side effects the AC names.
2. **The break-it list**, every route that accepts input or writes:
   - **bad input**: a field missing, empty, of the wrong type, at its
     limit and one past it, only spaces, control characters;
   - **no session, a garbage session, a role that must not reach it**;
   - **another user's data**: another actor's real id in the path or the
     body; the contract's 403 or 404, nothing read, nothing changed;
   - **twice**: the same request twice, and two at once (`&`); one
     effect;
   - **oversized**: a body far over any sane size; a clean refusal, no
     5xx, nothing stored.
3. **The log** of each request: no person's data, no token.

Keep every command in `<evidence>/qa-back/commands.md`.

## Blocks or note

Blocks only what a user or a client would hit, with the steps (or the
request and response) and what they showed: an AC not met (`ac`), a
broken behaviour (`bug`), another actor reaching what is not theirs
(`security`). Everything else is a note. The screens against the mock
are the user's to judge, not yours.
