# Infra & cost — <workstream>

<!--
  What exists after this ships, configured on purpose. MUST have: every
  resource with its exact configuration AND why it is the right one
  (timeouts, memory, retries+backoff, DLQ, encryption, removal policy —
  "default" is a choice that needs its why too); IAM permission by
  permission against the verbs the flows actually perform (no wildcards
  without a decision block); the cost table — fixed (exists at zero
  usage) and variable at current / 10x / 100x with the traffic
  assumptions written. A resource the tier pick of sizing.md does not
  call for is not here; a new resource where a primitive the project
  already runs would carry it names why it does not (req: …).
-->

## Size and evolution

<!-- the header block, from templates/doc-header.md: compute, integrations, ops (resources). Every
     mechanism line below ends with `(req: …)` (references/design-docs.md). -->

## Resources

### <resource name> (<type>)

- **Config:** <the settings that matter, each with its why>
- **Removal policy:** <what happens to the data if this is destroyed>
- **Price note:** <what drives its cost>

## IAM

| Principal | Permission | Justified by |
|---|---|---|
| <who> | <action on resource — exact, no wildcards without a decision> | <the flow that performs it> |

## Cost

Assumptions: <the traffic numbers these tables stand on>

| Fixed (exists at zero usage) | US$/mo |
|---|---|
| <resource> | |
| **Total** | |

| Variable | current | 10× | 100× |
|---|---|---|---|
| <driver> | | | |

## The implementer decides

<!-- The latitude: what the picked tier's file leaves open, plus
     what transcription left open on purpose. One line each.
     Never a hard class. -->

- <item>

## References

- <research file · URL · pricing pages>
