# Acceptance — <wave>

<!--
  The executable acceptance SPEC — frozen with contracts.md, one line
  per case. The exec transcribes each line into <repo>/smoke/ (the
  testing standard §3 owns the file shape); transcription is mechanical
  by construction, so every column must be exact. The assert never
  diverges: implementation proving it wrong is a declared design
  amendment, never a silent test edit. MUST have: per endpoint, the
  success case plus one per declared error (the contracts lens audits
  the mirror against contracts.md); every mutation's side effect
  checked DIRECTLY in the store (lib/db.sh), never via a read endpoint;
  every case cleans up what it created. Case names follow smoke.1:
  <method>-<behavior>[-<expected-result>].
-->

## <repo> — <resource>

| Case | Request | Expect | Side effect (store) | Cleanup |
|---|---|---|---|---|
| `post-create-<x>-201` | `POST /<x>` <valid payload, the fixture fields> | 201 + <envelope fields> | <item exists, the fields that must match> | delete created item |
| `post-create-<x>-no-auth-401` | no token | 401 `UNAUTHORIZED` envelope | none | — |
| `post-create-<x>-invalid-422` | <the invalid shape> | 422 `<CODE>` envelope | nothing written | — |

## References

- `contracts.md` — the bridge every assert derives from
