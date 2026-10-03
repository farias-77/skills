# Acceptance — <workstream>

<!--
  The executable acceptance SPEC: the locked journeys turned into test
  cases, plus the contract cases the journeys do not walk. Frozen with
  contracts.md. Stage 3 copies the cases into the briefs; stage 4 turns
  each into a test in the layer the doctrine's testing standard assigns
  (unit, integration, browser journey, a case against a deployed
  environment). Transcription is mechanical by construction, so every
  column is exact. The assert never diverges: implementation proving it
  wrong is a declared design amendment, never a silent test edit.

  MUST have:
  - the header block (templates/doc-header.md) for the part `tests`;
  - every step of every journey in 00-discovery/journeys/*.yaml
    mapped to a case: the expected state is the step's frame, the side
    effects are the step's side effects, checked directly in the store
    (never through a read endpoint);
  - per endpoint: the success case plus one per declared error that the
    sizing pick keeps (the contracts lens audits the mirror);
  - every case cleans up what it created;
  - every case beyond the doctrine's floor names the failure it proves
    (req: …); a case that proves nothing another case does not is cut.
-->

## Size and evolution

<!-- the header block, from templates/doc-header.md, part `tests` -->

## Journeys

### J<n> — <journey name> (covers S-00N)

| Case | Step | Layer | Given / action | Expect (state · frame) | Side effect (store) | Cleanup |
|---|---|---|---|---|---|---|
| `J<n>.s1.1` | s1 | browser journey | <the step's action, the fixture> | <the state · `prototype/frames/<file>`> | <the row, e-mail or event the step promises> | <delete what was created> |

## Contract cases

### <area> — <resource>

| Case | Layer | Given / request | Expect | Side effect (store) | Cleanup |
|---|---|---|---|---|---|
| `create-<x>-ok` | integration | <valid payload, the fixture fields> | <status + body fields> | <item exists, the fields that must match> | delete created item |
| `create-<x>-no-auth` | integration | no token | <the doctrine's unauthenticated response> | none | — |
| `create-<x>-invalid` | integration | <the invalid shape> | <status + error code> | nothing written | — |

## The implementer decides

<!-- Latitude, one line each: request bodies, fixtures, execution
     order. Never which cases exist or what each proves. -->

- <item>

## References

- <journeys/*.yaml · the doctrine's testing standard, path:line>
