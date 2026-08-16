# Security — <wave>

<!--
  The fixed class sweep. MUST have: every one of the 13 classes with one
  of the three legal answers — covered (concrete mechanism, not a verb),
  risk accepted (reason AND compensation), or n/a (the why). A bare
  "n/a", a missing class, or "we validate input" without the mechanism
  is a hole the security reviewer will flag. The list is fixed and the
  same in every workstream.
-->

| # | Class | Answer | Detail |
|---|---|---|---|
| 1 | Authentication | covered / risk accepted / n/a | <mechanism · reason+compensation · why> |
| 2 | Authorization & tenant isolation | | |
| 3 | Injection (query, command, template) | | |
| 4 | XSS & output encoding | | |
| 5 | CSRF & unsafe state-changing GETs | | |
| 6 | SSRF & URL fetch from user input | | |
| 7 | Insecure direct object references | | |
| 8 | Secrets handling | | |
| 9 | Sensitive data exposure | | |
| 10 | Transport & crypto | | |
| 11 | Rate limiting & abuse | | |
| 12 | Supply chain | | |
| 13 | Auditability | | |

## The worst case, written out

<for each risk accepted: what the worst realistic abuse looks like, end to end>

## References

- <research file · URL · internal code path>
