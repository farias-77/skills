# The Codex chair

Stage 4 (Execute) runs in [Codex](https://developers.openai.com/codex)
with GPT-6 Astra conducting. This tree is what that chair needs:

```
codex/
├── skills/stage-execute/   the skill: SKILL.md (a router) + references/ + templates/
├── agents/                 the project agents: exec-builder, five exec-lens-*, exec-scout
└── config.toml             the project config block: conductor model and effort, thread limit
```

## Installing into a project

```bash
# the skill, where Codex discovers skills
ln -s ~/skills/codex/skills/stage-execute ~/.codex/skills/stage-execute

# the agents and the standards, where the project's Codex sessions read them
cd <your-project>/.codex
ln -s ~/skills/codex/agents agents
ln -s ~/skills/docs docs
cp ~/skills/codex/config.toml config.toml   # or merge the [agents] block into yours
```

The project's `AGENTS.md` points at the engineering doctrine and at
`.codex/docs/standards/`; each repo's `CLAUDE.md` (or `AGENTS.md`)
names its commands. Nothing project-specific lives in this tree.

## Starting a wave

Open a Codex session in the project and type:

```
$stage-execute <workstream-slug>
```

The skill reads the workstream's `.state.md`, takes the wave it names
and runs to the last wave, or to a stop condition. A second session
with the same line resumes from the trace and the PRs.
