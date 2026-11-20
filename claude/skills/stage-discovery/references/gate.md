# The gate

Stop 7. He approves on one page. Nothing goes to stage 2 before his
yes, and his yes covers what he saw: a page that changed after he
read it is read again.

## The page

`discovery/page/index.html`, built by the script from the stage
files, published as `Report - <workstream>`. He skims it: what is
his comes first, then the screen, and every list after it starts
folded, so the first look is a map and not a wall of text.

| Order | Section | From |
|---|---|---|
| 1 | a short title, the demand under it, the counts | `discovery/page.json` (`title`, `demand`, `status`, `minutes`) |
| 2 | what he decides | `page.json` `youDecide`: the review's findings that are his |
| 3 | the screen: the guided mock under one thin bar (the tour, the state, full screen) | `mock/mock.html` |
| 3 | or, with no screen, the cases | `page.json` `cases`: before, action, after, the ids each proves |
| 4 | what was decided for him: the costly ones open, the rest folded by theme | the stories' Assumptions with their sources; `page.json` `groups` |
| 5 | the stories, folded; each opens on its criteria | `stories.md` |
| 6 | what is not being built | `not-building.md` |

`title` is the change in eight words or fewer, with no counts
("Archive a project instead of deleting it"). `demand` is one or two
short sentences a stranger understands, with the number that matters
in it ("Managers invite people by e-mail, 10 a day."). `groups` sorts
the assumptions into three to five themes he would name himself ("Who
can do what", "The words on screen"), each with the assumption ids it
holds; an assumption in no group shows under "Other". Full screen is
the screen as the product opens it, at the size of the window, under
the same thin bar. The
page is in simplified English
(`<kit>/references/artifact-writing.md`); the screen's copy is in the
product's languages.

```
node <discovery.mjs> page <workstream>          builds; highlights what differs from the version he last read
node <discovery.mjs> page <workstream> --read   records the current build as the version he read
```

Run `--read` each time he has reacted to a published version, right
before the next build. The highlight then shows exactly the diff from
what he last read, and resets every round.

This page is the stage's whole report: the Discovery tab of
`Report - <workstream>`. The stage builds no Explainer and asks no
Video or Deck question; the house rule on those pieces starts at the
next stage.

Before each publish: `node <discovery.mjs> check <workstream>` and
`gitleaks dir <workstream>` are clean. Publish with the `Artifact`
tool to the workstream's one link (the first publish creates it;
write its URL in `.state.md` as `page:`). To let him comment on
elements, load the `artifact-capabilities` skill and declare
comments on the first publish. Look at the page yourself before the
link goes out: `discovery.mjs shots`. With a screen it pictures every
state and tour stop into `mock/shots/`; with none, the page at 1280
and 390 into `discovery/page/shots/`.

The same page serves the mock rounds at stop 5: it is built as soon
as the mock exists, with `status: "screen in review"`.

## Before the gate: what is his

Each decision that is his (the review's, or a costly assumption you
would rather he saw) is one question through the question tool, one
at a time, in the shape of [interview.md](interview.md). Each answer:
the notes (`said`), a line in `rulings.md`, and the `discovery-story-writer`
for the stories it touches. When the last one is answered, `check`,
rebuild, publish. At the gate itself nothing is open.

## The gate message

The gate template of [messages.md](messages.md), with the link on his
clipboard and printed, and the 🔴 line. It ends the turn: he opens
the page, walks it, and answers in the chat in his own words. There
is no magic word. A reply that could be read either way gets one
question back.

- **He says yes.** Go to "After his yes".
- **He adjusts wording or the page.** Fix it, rebuild, tell him what
  changed in one line; the yes he gave to the rest stands.
- **He adjusts behavior** (a rule, a number, scope, a journey). That
  is an amendment:

  1. his words into the notes as `said`;
  2. the `discovery-story-writer`, amend mode, for the stories it touches;
  3. with a screen: one round to the `discovery-mock-designer` and `shots`;
  4. `check`; one `discovery-finding-verifier` pass on the diff
     ([review.md](review.md), the second pass);
  5. `page --read` (he read the last version), `page`, publish;
  6. one short message: what changed, the link, and the same
     question. When the screen changed, his yes to this message is
     also the screen's lock: `lock` with those words, then the
     close. A screen is never locked on words he said before he saw
     it.

Assumptions he did not mention stay `assumed`: his yes approves the
page, and the page lists them as decided for him. One he rejects is
an amendment.

## After his yes

```
node <discovery.mjs> freeze <workstream>
```

It runs the gate check (Open empty, the screen locked, every id
resolved) and records every id. From here an id is never removed or
renumbered; `check` fails when one disappears.

Then, in order:

1. `rulings.md`: the approval, with his words.
2. `.state.md`: `--set stage=design`, and the state line for the
   close.
3. With a `tracker:` line, `notion-tracker close discovery <url>`.
4. Remove what the stage left behind: `discovery/review/stories/`,
   `discovery/review/fixes/`, `discovery/review/before.json`,
   anything still running. The pictures stay (`mock/shots/`, or
   `discovery/page/shots/` with no screen): they are what he approved
   and what the lock rests on.
5. Commit the workstream folder when the designs root is a git
   repository (push on his word); when it is not, say so in the close
   message.
6. The approved template: the next play on his clipboard and printed.

```
/clear
/stage-design <slug>
```

The stage ends there. Nothing starts stage 2 but his typing the play.

## What stage 2 receives

| It gets | Where |
|---|---|
| stories and criteria with frozen ids | `stories.md`, `discovery/ids.json` |
| the locked screen | `mock/mock.html`, `mock/LOCK.json` |
| example values per rule | the Rules table's Examples, the criteria |
| every assumption with its source | the stories' Assumptions |
| the technical questions that are not his | the stories' "For the design" |
| what is left out, and why | `not-building.md` |
