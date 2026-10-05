# Pre-flight · <workstream>

<!--
  Written by the conductor at P2. Only what needs HIM in person: a key or
  secret only he can mint, an account, a quota, a contract, DNS. Everything
  an agent can check (the gate commands, the stack, gh, the cloud
  environment, the guard canary) the conductor checks itself at plan and
  lists under "Checked at plan". "Nothing" is a complete pre-flight.
  Values he types are prompted (`read -s`), never written here.
  These comments never reach the file.
-->

**For him:** <n items, about n minutes · or: nothing>

## 1 · <the e-mail provider's sandbox key>

- **Why:** <E-04 sends the e-mail; without the key only the fake runs>
- **Do:** `! read -s KEY && printf %s "$KEY" | <command> && unset KEY`
- **Check:** `! <command that proves it without printing it>` → expect `<ok>`
- **Blocks:** <E-04 · the rest goes on>

## Checked at plan

| Check | Result |
|---|---|
| gate commands run on `main` | <✓ make check 48 s> |
| the stack comes up on `main` | <✓> |
| `gh` acts as the bot identity | <✓ bot-login> |
| the local-ci token is in place | <✓> |
| cloud environment for entries | <✓ ready · or: absent, entries run locally> |
| guard canary (`git push origin a:b` denied) | <✓ denied> |
