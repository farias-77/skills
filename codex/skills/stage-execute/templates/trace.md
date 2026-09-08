# Trace — <workstream> — wNN-<slug>

<!--
  One line per event, appended as it happens, never rewritten. The
  trace is what a resumed session reads first. Date and time, the
  story when there is one, the event, the pointer (sha, PR url,
  file). Nothing that is not in the trace happened.
-->

- <date time> · wave · opened · `feat/wNN-<repo>` from `<base>` @ `<sha>` · `feat/wNN-<repo2>` from `<base>` @ `<sha>`
- <date time> · N.k · builder spawned · effort <low|medium> · branch `feat/wNN-<repo>/<N.k>-<slug>`
- <date time> · N.k · built · <n> commits · <sha7>..<sha7> · tests <n>/<n> · coverage <n>%
- <date time> · N.k · round 1 · findings <n> (fidelity <n> · code <n> · proof <n> · security <n> · operations <n>) · sustained <n> · deferred <n> · dismissed <n> · unread <lens or none>
- <date time> · N.k · fix pass · <n> findings applied · <sha7>
- <date time> · N.k · round 2 · findings <n> · sustained <n> · deferred <n> · dismissed <n> · notes <n>
- <date time> · N.k · alpha · deploy <ok|red> · smoke `<folder>/` <n>/<n> · proof/<file>
- <date time> · N.k · PR <url> · CI <green|red · attempt n>
- <date time> · N.k · merged · <sha7> on `feat/wNN-<repo>`
- <date time> · N.k · improvement · <one line> · report.md
- <date time> · N.k · departure · <one line> · report.md
- <date time> · N.k · chosen · <what the documents did not say, and the choice> · report.md
- <date time> · wave · deploy · <repo> @ <sha7> · diff <empty|explained: …>
- <date time> · wave · smoke · <repo> <n>/<n> · proof/smoke-<repo>.txt
- <date time> · wave · proof · <the walk> · proof/<files>
- <date time> · wave · PR <url> per repo
- <date time> · wave · closed · state → <next wave | release>
- <date time> · stop · <the condition> · <what the user needs to decide>
