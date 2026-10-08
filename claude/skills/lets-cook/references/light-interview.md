# The light interview

Five minutes, not a discovery. The goal is to know enough to pick the
route and, on the short route, to build the right thing the first time.

## The razor

Ask only what, guessed wrong, throws the build away. Everything else:
assume it, write it under "Assumed" in the brief, and let him see it
when he uses the app. A wrong guess costs one adjustment; a needless
question costs his attention.

| Ask | Assume |
|---|---|
| who it is for, when two kinds of user would see it differently | the wording of a label |
| what must not break | the date format, the sort order |
| how he will know it worked, when it is not obvious | an empty state ("never", "no items yet") |
| a number that encodes a business rule (a limit, a deadline) | a page size, a timeout |

## The shape

1. **Restate** the idea in one to three lines, in his words.
2. **What changes, for whom, how he will know it worked, what must not
   break.** Only the parts the scouts and his sentence did not answer.
3. Never an obvious question. Never a question the code or the scouts
   already answered, or a fact a short run would show (a timing, a
   library's behaviour): run it.

## Hotfix

Ask, in one call when the scouts have not answered it:

1. What is broken, and since when (a version, an hour)?
2. Who is blocked right now?
3. "Can I ship without you checking staging?" Asked once, here, so the
   `/goal` never waits on him at night. His answer goes in the `/goal`.

The session reads the production logs itself, with the read-only
identity: one `gcloud logging read` command, its output quoted in the
brief as the evidence of the bug. The scout never calls the cloud.

## When it grows

If a question's answer brings a scheduled job, an email to real
people, new data or a new screen, the route becomes full: say so in one
line and load `stage-discovery` with what he said as Confirmed.
