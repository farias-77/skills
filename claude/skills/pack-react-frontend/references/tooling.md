# React frontend: tooling

Versions as published on the npm registry in October 2026. The
project's doctrine pins the versions it actually uses; pin them exact
in `package.json`.

| Package | Version |
|---|---|
| react | 19.3.0 |
| @tanstack/react-router | 1.170.x |
| @tanstack/react-start | 1.168.60 |
| @tanstack/react-query | 5.103.2 |
| openapi-react-query | 0.5.4 |
| react-hook-form | 7.88.0 |
| zod | 4.6.5 |
| tailwindcss | 4.3.3 |
| vite | 8.3.1 |
| @playwright/test | 1.63.0 |
| @axe-core/playwright | 4.13.0 (tags wcag2a/aa, wcag21a/aa, wcag22aa) |
| @lhci/cli | 0.15.1 |
| typescript | 5.9.3 (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |

## Lint

- typescript-eslint 8.70.1 `strictTypeChecked`, with
  `consistent-type-assertions: never`;
- eslint-plugin-react-hooks 7.1.1;
- eslint-plugin-jsx-a11y 6.10.2, `strict`;
- eslint-plugin-boundaries 7.2.0 (feature imports only through the
  feature's `index.ts`);
- eslint-plugin-check-file 3.3.2: PascalCase `.tsx`, camelCase `.ts`,
  kebab-case folders;
- eslint-comments `no-use`, with `noInlineConfig`.

Protect the lint config with code owners. Never loosen it to get a file
through.

## Verification, by role

The project's doctrine names the command for each role (see the
pipeline's project contract).

| Role | What it checks |
|---|---|
| The fast check | tsc, eslint, prettier |
| Contract regeneration | regenerates the typed client from the API schema; a diff means the contract drifted |
| One journey | runs one spec on the built stack |
| Affected tests | the specs touched by the diff |
| The structure check | NLOC, CCN, clone percentage, boundaries, new deps, comments, base vs head |
| Lighthouse (public pages) | mobile Core Web Vitals |

Mutation proof means reverting the rule in a throwaway worktree, running
the journey, and saving the red output as evidence.
