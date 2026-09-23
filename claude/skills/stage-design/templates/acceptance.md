# Acceptance — <workstream>

<!--
  The executable acceptance SPEC — frozen with contracts.md, one line
  per case. Stage 4 turns each line into a test in the layer the
  doctrine's testing standard assigns (unit, integration, browser
  journey, a case against a deployed environment); transcription is
  mechanical by construction, so every column must be exact. The assert
  never diverges: implementation proving it wrong is a declared design
  amendment, never a silent test edit. MUST have: per endpoint, the
  success case plus one per declared error (the contracts lens audits
  the mirror against contracts.md); every mutation's side effect checked
  directly in the store, never via a read endpoint; every screen state
  the stories imply; every case cleans up what it created.
-->

## <area> — <resource or screen>

| Case | Layer | Given / request | Expect | Side effect (store) | Cleanup |
|---|---|---|---|---|---|
| `create-<x>-ok` | integration | <valid payload, the fixture fields> | <status + body fields> | <item exists, the fields that must match> | delete created item |
| `create-<x>-no-auth` | integration | no token | <the doctrine's unauthenticated response> | none | — |
| `create-<x>-invalid` | integration | <the invalid shape> | <status + error code> | nothing written | — |

## The implementer decides

<!-- The latitude the user granted for this document (notes.md)
     plus what transcription left open on purpose. One line each.
     Never a hard class. -->
