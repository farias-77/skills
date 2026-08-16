# Infra & cost — <wave>

<!--
  What exists after this ships, configured on purpose. MUST have: every
  resource with its exact configuration AND why it is the right one
  (timeouts, memory, retries+backoff, DLQ, encryption, removal policy —
  "default" is a choice that needs its why too); IAM permission by
  permission against the verbs the flows actually perform (no wildcards
  without a decision block); the cost table — fixed (exists at zero
  usage) and variable at current / 10x / 100x with the traffic
  assumptions written.
-->

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

## References

- <research file · URL · pricing pages>
