# The project contract — what the pipeline expects from a codebase

The pipeline is generic. It does not know the stack, the layout or the
taste of the company that uses it: every agent reads them from the
consuming project. This file is the contract between the two sides.
Agents and skills refer to the roles named here, never to a specific
language, framework, command or folder.

## The doctrine

The consuming project's `CLAUDE.md` names its **engineering doctrine**:
a folder of documents that is the bar every builder writes to and every
reviewer measures against. The doctrine covers, in whatever files it
chooses (its index says which):

| Role | What it fixes |
|---|---|
| **architecture** | where code runs, the modules and how they talk, what the shape grows into |
| **backend** | how a server-side feature is organized: modules, layers, persistence, contracts, jobs |
| **frontend** | how a screen is organized: routes, features, state, components, and the visual direction |
| **code** | the rules of the diff, including what the guard rejects mechanically and what a workaround is |
| **testing** | the test layers, what each proves, the coverage bar, the rules of a good test |
| **local development** | the commands below and how a stack is isolated per worktree |

## The commands

The doctrine's local-development document names one command per role.
Agents run the command the doctrine names; the examples in agent
prompts are illustrations, never the rule.

| Role | What it does |
|---|---|
| **the gate** | everything the CI runs, locally, identical: guard, lint, contract checks, all tests, coverage, builds, journeys. Exit 0 or not |
| **the fast check** | the loop while coding: lint and the tests of what was touched |
| **stack up / env / down** | an isolated local stack for this worktree: bring it up, print its URLs and test actors, remove only it |
| **focused tests** | the tests of one module or one spec, with their arguments |

## The layout the stages rely on

- **Sides.** The doctrine names which folders are the server side and
  which are the screen side. Builders stay in their side; the gate
  attributes a failure to the side whose folder it is in.
- **Shared files.** The doctrine names the files every feature would
  otherwise edit (schema migrations, the API contract and its
  generated code, the module registry). The plan's foundation owns
  them; an entry never edits them.
- **Feature maps.** The doctrine names where the documentation of each
  feature lives. A builder updates it for what its entry changed.
- **Actors.** The local stack provides test actors for every role the
  product's permissions distinguish; QA and journeys use them.
