# Freeze — <workstream>

<!--
  The only lock of stage 4. One line per stack that takes no merge
  right now. The MASTER writes a line for a walk and for a shadow
  suite; a WORKER writes one for its own whole suite only when its
  lane shares the stack with another lane. Whoever writes a line
  removes it and sends the `unfrozen` line. A worker reads this file
  before every merge; a stack listed here means: keep building the
  next row on top, merge later. Coding, reviewing and opening PRs
  never freeze.
-->

| Stack | Why | Since (UTC) | By |
|---|---|---|---|
