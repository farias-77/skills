# Interview, journeys, copy: tooling

Versions as published in October 2026; the project's doctrine pins
what it actually uses.

- **`@playwright/test` 1.63.0.**
  - Write one `test.step('J03.s3 …')` per journey step.
  - Tag tests with `{ tag: ['@J03', '@LIMIT-05'] }`, and run every test
    of one rule with `--grep @LIMIT-05`.
  - `toMatchAriaSnapshot` (1.49+) checks each frame's region.
- **`@axe-core/playwright` 4.13.0.** Catches buttons with no name and
  errors that are not tied to their field.
- **Vale 3.24.0.** Extract the copy strings with
  `jq -r '..|strings' copy/<locale>.json > <locale>.txt`, then run a
  banned-microcopy rule; add each locale's equivalents to `tokens`:
  ```yaml
  extends: existence
  message: "Banned microcopy: '%s'"
  level: error
  ignorecase: true
  tokens: ['are you sure', 'something went wrong', 'oops', 'invalid', 'click here',
           'the user', 'an unexpected error']
  ```
- **`eslint-plugin-i18next` 6.1.5.** The `no-literal-string` rule
  enforces C-1.
- **`i18next-parser` 9.4.0.** Reports keys missing from any locale.
- **`.feature` files only.** Parse them with `@cucumber/gherkin` 42.0.1
  and run them with `playwright-bdd` 9.2.1. `gherkin-lint` 4.2.4 has had
  no release since 2023-12, so use this coverage script instead. It
  needs python `yq` (jq syntax):
  ```bash
  for r in $(grep -oE '^\| [A-Z]+-[0-9]+' lock/spec.md | tr -d '| '); do
    n=$(grep -cE "\[[^]]*\b$r\b" acceptance.md)
    [ "$n" = 1 ] || echo "rule $r: $n ACs (one per rule)"; done
  ```
  A step with no AC is fine: one AC per rule and per behavior, never
  one per step.
