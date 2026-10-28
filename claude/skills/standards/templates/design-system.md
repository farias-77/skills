# Design system · <project>

<!-- Read by discovery's mock builder, the frontend builder, the reviewer
of a screen diff, and every builder of a report, explainer, deck or video.
Seeded by the `standards` skill, which fills the `<project …>` columns from
the project's exported tokens and shared components. The project owns this
file and changes it only by pull request. Ids are never reused: a dropped
rule keeps its id with `(retired YYYY-MM-DD: <why>)`. The
`Design System - <project>` page renders this file and the tokens. -->

This is the one look of <project>: the product's screens, its e-mails, the
pipeline's reports and mocks, the slides and the videos all take their
values from here. A value that is not a token below, or a component that is
not in the inventory, is a finding.

## Foundations

The default values are the kit's starting look: monochrome, one sans and
one mono family, status colors only for status. Where the `<project token>`
column is filled, the project's token and its value win.

### Color

| Role | Token | Light | Dark | `<project token>` |
|---|---|---|---|---|
| Page ground | `bg` | `#fbfbfb` | `#09090a` | |
| Surface (cards, inputs, dialogs) | `surface` | `#ffffff` | `#0e0e10` | |
| Surface, one step up (headers, hover) | `surface-2` | `#f7f7f8` | `#131316` | |
| Surface, two steps up (selected, pressed) | `surface-3` | `#f0f0f2` | `#1a1a1e` | |
| Line | `line` | `#ececef` | `#1e1e22` | |
| Line, strong (input borders) | `line-strong` | `#dcdce0` | `#2a2a2f` | |
| Text, primary | `ink-1` | `#111113` | `#ededef` | |
| Text, secondary | `ink-2` | `#52525a` | `#a1a1a8` | |
| Text, quiet (meta, placeholders) | `ink-3` | `#6b6b72` | `#85858c` | |
| Primary action fill | `primary` | `#111113` | `#ededef` | |
| Text on primary | `on-primary` | `#ffffff` | `#09090a` | |
| Focus outline | `focus` | `#111113` | `#ededef` | |
| Focus ring | `ring` | `rgba(17,17,19,.12)` | `rgba(237,237,239,.18)` | |
| Status: done, healthy | `ok` | `#16a34a` | `#22c55e` | |
| Status: needs attention | `warn` | `#ca8a04` | `#eab308` | |
| Status: failed, blocked, destructive | `bad` | `#dc2626` | `#ef4444` | |
| Status: not started, unknown | `idle` | `#a1a1a8` | `#6b6b72` | |
| Status as text (4.5:1) | `ok-ink` · `warn-ink` | `#15803d` · `#a16207` | `#22c55e` · `#eab308` | |
| Status tints (badge, banner, row) | `ok-tint` · `warn-tint` · `bad-tint` | `.10` · `.12` · `.08` of the status | `.12` of the status | |
| Overlay behind a dialog | `scrim` | `rgba(17,17,19,.40)` | `rgba(0,0,0,.60)` | |

- **DS-1** · Every color in code, e-mail, page, slide and video comes from a token in this table; a literal color outside the token files is a finding. *Why:* one token change then reaches every surface.
- **DS-2** · The base is monochrome: grounds, lines, text and the primary action use the neutral roles, and hue appears only for status (and for `primary` when the project fills it with a brand color). *Why:* when color is rare, it means something.
- **DS-3** · Color never carries meaning alone: every status color comes with a label or an icon. *Why:* color-blind readers and grayscale prints lose it.
- **DS-4** · The status map is fixed: `ok` is done or healthy, `warn` needs attention, `bad` failed, blocked or destructive, `idle` not started or unknown; no other hue marks a status. *Why:* the same color means the same thing on every surface.
- **DS-5** · Status text uses `ok-ink`, `warn-ink` or `bad`; the `ok`, `warn` and `idle` fills mark only dots, icons and bars. *Why:* green and yellow text on a light ground fall under 4.5:1.
- **DS-6** · A tint is only the background of a status element, with that status's text or icon on top. *Why:* a tint alone is decoration.
- **DS-7** · Every role has a light and a dark value; the theme follows the system, and a stored choice (`data-theme="light"` or `"dark"`) overrides it. *Why:* a reader in either theme gets a correct screen.

### Type

| Step | Token | Size / line height | Weight | Use | `<project token>` |
|---|---|---|---|---|---|
| Extra small | `text-xs` | 12 / 16 px | 500 | labels, badges, table meta | |
| Small | `text-sm` | 14 / 20 px | 400 | app body, table cells, controls | |
| Medium | `text-md` | 16 / 24 px | 400 | public-page and e-mail body, inputs on phone | |
| Large | `text-lg` | 20 / 28 px | 600 | section titles | |
| Extra large | `text-xl` | 24 / 32 px | 600 | page titles | |
| Display | `text-2xl` | 32 / 40 px | 600 | one key number, a public page's title | |

| Family | Token | Default stack | `<project token>` |
|---|---|---|---|
| Sans | `font-sans` | `'Geist', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` | |
| Mono | `font-mono` | `'Geist Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace` | |

- **DS-8** · A surface uses at most two families: `font-sans` for all text and `font-mono` only for code, ids, hashes and keys. *Why:* a third face reads as a different product.
- **DS-9** · A screen uses at most six sizes, each a step of the scale, and only the weights 400, 500 and 600. *Why:* hierarchy comes from few, clear steps.
- **DS-10** · Body text is at least 14 px in the app and at least 16 px on a public page and in an e-mail; an input is at least 16 px on phone. *Why:* smaller text strains, and phones zoom into a smaller input.
- **DS-11** · Numbers compared in a column use tabular figures and align right. *Why:* digits line up and the eye compares them at once.

### Space, radius, elevation

| Token | `space-1` | `space-2` | `space-3` | `space-4` | `space-5` | `space-6` | `space-8` | `space-10` | `space-12` | `space-16` |
|---|---|---|---|---|---|---|---|---|---|---|
| Default | 4 px | 8 px | 12 px | 16 px | 20 px | 24 px | 32 px | 40 px | 48 px | 64 px |
| `<project token>` | | | | | | | | | | |

| Radius | `r-chip` | `r-control` | `r-card` | `r-full` |
|---|---|---|---|---|
| Default | 5 px | 6 px | 10 px | 9999 px |
| Use | badges, tags | buttons, inputs, menu items | cards, menus, dialogs, drawers | avatars, switches, dots |
| `<project token>` | | | | |

| Level | Token | Light | Dark | Use | `<project token>` |
|---|---|---|---|---|---|
| 0 | none | none | none | everything in the page's flow | |
| 1 | `shadow-1` | `0 1px 2px rgba(17,17,19,.06), 0 4px 12px rgba(17,17,19,.08)` | `0 0 0 1px var(--line-strong), 0 4px 12px rgba(0,0,0,.5)` | menus, popovers, select lists, tooltips | |
| 2 | `shadow-2` | `0 12px 32px rgba(17,17,19,.16)` | `0 0 0 1px var(--line-strong), 0 12px 32px rgba(0,0,0,.6)` | dialogs, drawers, toasts | |

- **DS-12** · Every margin, padding and gap is a step of the space scale; no 5, 7, 10 or 15 px. *Why:* a shared rhythm makes screens line up with each other.
- **DS-13** · The page gutter is 16 px on phone, 24 px on tablet and 32 px on desktop. *Why:* content never touches the edge, and widths stay predictable.
- **DS-14** · Each component kind has one radius from the radius table, as its Use column names. *Why:* mixed corners look like parts of different products.
- **DS-15** · A floating object takes the shadow of its level in the elevation table; nothing in the page's flow has a shadow. *Why:* a shadow says "this floats above", and only that.

### Motion, breakpoints, layers

| Motion | `dur-instant` | `dur-press` | `dur-menu` | `dur-modal` | `ease-out` | `ease-in-out` |
|---|---|---|---|---|---|---|
| Default | 0 ms | 120 ms | 180 ms | 220 ms | `cubic-bezier(.2, .8, .2, 1)` | `cubic-bezier(.4, 0, .2, 1)` |
| Use | hover, nav items, rows, tabs, toggles | press feedback | menus, popovers, tooltips | dialogs, drawers, toasts | anything that enters | anything that moves within the page |
| `<project token>` | | | | | | |

| Breakpoint | `bp-phone` | `bp-tablet` | `bp-desktop` | `bp-wide` |
|---|---|---|---|---|
| From | 320 px | 640 px | 1024 px | 1440 px |
| Layout | one column; navigation behind a menu button | one or two columns | side navigation visible | content stops at its max width |
| `<project token>` | | | | |

| Layer | `z-base` | `z-sticky` | `z-menu` | `z-drawer` | `z-dialog` | `z-toast` | `z-tooltip` |
|---|---|---|---|---|---|---|---|
| Default | 0 | 10 | 100 | 200 | 300 (with its scrim) | 400 | 500 |
| `<project token>` | | | | | | | |

- **DS-16** · In the product, an animation lasts at most 300 ms, moves only `transform` and `opacity`, and never uses `transition: all`. *Why:* longer or layout-moving animation feels slow and janks.
- **DS-17** · Layout changes only at the four breakpoints of the table. *Why:* every screen then has the same few widths to check.
- **DS-18** · A `z-index` is always a layer token. *Why:* a stray 9999 puts a menu above its dialog.

### Iconography

| Icon | `icon-sm` | `icon-md` | `icon-lg` | `icon-set` |
|---|---|---|---|---|
| Default | 16 px | 20 px | 24 px | one outline set, 1.5 px stroke |
| Use | inline with 14 px text, table cells, badges | buttons, inputs, menu items | navigation, empty states | every icon |
| `<project token>` | | | | `<project icon set>` |

- **DS-19** · Every icon comes from the one icon set, at a size of the table, colored with `currentColor`; an emoji is never an icon. *Why:* mixed sets and emoji look borrowed.
- **DS-20** · An icon stands beside a text label; an icon alone is only for close, search, menu and more, and carries an accessible name. *Why:* most icons are guesses without their word.

## Components

The base states are default, hover, focus-visible, active and disabled. The
`<project component path>` column names the project's one implementation.

| Component | States it must have | `<project component path>` |
|---|---|---|
| Button | base, loading | |
| Link | default, hover, focus-visible, active | |
| Input | base, filled, read-only, error | |
| Select | base, open, error | |
| Checkbox, radio, switch | base, checked, indeterminate (checkbox), error | |
| Textarea | base, filled, error, near its length limit | |
| Form field (label, help, error) | default, error, optional marker | |
| Dialog | open, submitting, error | |
| Drawer | open, submitting, error | |
| Menu | open, item highlighted, item disabled, item destructive | |
| Tabs | base, selected | |
| Table | loading, empty, error, sorted, row selected | |
| List | loading, empty, error, item selected | |
| Card | static; base when the whole card is one link | |
| Badge, status | ok, warn, bad, idle, neutral | |
| Toast | ok, bad, info, with one optional action | |
| Banner | info, warn, bad, dismissible when not blocking | |
| Empty state | first use, no results, cleared | |
| Skeleton, loading | region skeleton, spinner inside a control | |
| Pagination | base, current page, first and last disabled | |
| Avatar | image, initials fallback, loading | |
| Tooltip | shown on hover, shown on focus, hidden on Esc | |
| Navigation | base, current item, collapsed on phone | |

- **DS-21** · Every component has each state its row names; a missing state is a finding. *Why:* the missing state is the one a person meets on a bad day.
- **DS-22** · A screen uses the component at the path column; a one-off variant of a listed component is a finding, and a new component adds a row here in the same diff. *Why:* two buttons that differ by 2 px become ten.
- **DS-23** · A region (a form, a dialog, a page header) has at most one primary button. *Why:* two primaries mean no primary.
- **DS-24** · A button label is a verb and an object ("Save changes", "Send invite"), never "Submit", "OK" or "Yes". *Why:* the label says what will happen.
- **DS-25** · A target is at least 44 × 44 px on phone and at least 24 × 24 px on desktop. *Why:* thumbs and tremors miss smaller ones.
- **DS-26** · A loading button keeps its width, shows a spinner and stays disabled until the request settles. *Why:* nothing jumps, and nothing sends twice.
- **DS-27** · A link navigates and a button acts: no click handler navigates from a non-link, and no link only acts. *Why:* new tab, back and screen readers depend on the difference.
- **DS-28** · A disabled primary action says why in a help line next to it. *Why:* a dead button with no reason is a dead end.
- **DS-29** · A dialog has a title, keeps Tab inside, closes on Esc, returns focus to the control that opened it, and never opens another dialog. *Why:* a keyboard user can always get in and out.
- **DS-30** · A card is either one link as a whole or a container of its own controls, never both. *Why:* nested targets misfire and confuse screen readers.
- **DS-31** · A toast confirms an action the person just took and stays at least 5 s, pausing on hover and focus; an error that needs action is never only a toast. *Why:* a toast vanishes, and the fix must not vanish with it.
- **DS-32** · A tooltip only names or hints; it holds no action and nothing a person must read to finish the task. *Why:* touch screens have no hover.
- **DS-33** · A region that loads for more than 300 ms shows a skeleton in the shape and size of its content; a spinner appears only inside a control. *Why:* nothing moves when the data lands.

## Patterns

**Forms**
- **DS-34** · A field validates when it loses focus and on submit; once its error shows, it re-checks on each keystroke so the error clears as soon as it is fixed. *Why:* no error shouts while the person is still typing.
- **DS-35** · An error sits directly under its field, and the field is marked invalid and linked to it. *Why:* the reader sees and hears the error where the fix is.
- **DS-36** · A failed submit, including a server error, keeps everything that was typed. *Why:* retyping a form is the fastest way to lose a person.
- **DS-37** · After a failed submit, focus moves to the first broken field, or to the submit button when no field is at fault. *Why:* the keyboard user lands on the fix.
- **DS-38** · A submit cannot send twice: a synchronous in-flight guard plus a disabled button while in flight, proved by two clicks in one task recording one request. *Why:* a disabled state alone commits too late to stop a double click.
- **DS-39** · Every field has a visible label, the right input type, input mode and autocomplete; a placeholder is never the label. *Why:* the label must survive typing, and phones show the right keyboard.
- **DS-40** · A server validation answer maps back onto its fields. *Why:* the person fixes the field, not a banner.

**Lists and tables**
- **DS-41** · Every list and table is built and checked with 0, 1, many and 1,284 rows, and with the worst case: the longest name, a missing optional field, the largest number. *Why:* the happy-path fixture hides every overflow.
- **DS-42** · Long text wraps or truncates with the full value reachable; ids and e-mail addresses wrap anywhere. *Why:* a cut id is useless, and an unbroken one pushes the layout.
- **DS-43** · A list longer than one page paginates or loads more, and shows the total ("1,284 results"). *Why:* the reader knows how much is there.

**Loading, empty, error**
- **DS-44** · Every region that shows data has four states: loading, empty, error with a retry, and data. *Why:* each is reached in production.
- **DS-45** · An empty state says what is missing, when data will appear, and offers the one action that fixes it. *Why:* an empty screen is a first step, not a dead end.
- **DS-46** · A refused permission says who can grant it. *Why:* the reader knows whom to ask.

**Notifications and feedback**
- **DS-47** · Every action shows its result where the person is looking: the changed row, the new item, or a toast when the effect is out of view. *Why:* an action with no answer gets repeated.
- **DS-48** · The weight of a message matches its scope: inline for one field, a banner for the page or the account, a dialog only for a choice that blocks. *Why:* a dialog for a small thing teaches people to dismiss dialogs.

**Navigation and URL state**
- **DS-49** · Filter, sort, tab, page and the selected item live in the URL, so reload and back return the same view. *Why:* views can be shared and survive a refresh.
- **DS-50** · After an action, focus lands on its result: the new item, the next field, or the control that opened the closed dialog. *Why:* focus on `<body>` loses the keyboard user.
- **DS-51** · Leaving a page with unsent edits asks to keep or discard them. *Why:* a wrong click must not erase work.

**Destructive actions**
- **DS-52** · A destructive action offers Undo when it can be reversed; otherwise a dialog names the object and the consequence, and its button repeats the verb in `bad` ("Delete 3 invoices"). *Why:* the person confirms what will happen, not "OK".
- **DS-53** · An irreversible action on a whole account or workspace asks the person to type its name. *Why:* a reflex click cannot pass.

**Dates, numbers, money**
- **DS-54** · Numbers, dates, times, money (always with its currency) and plurals go through the platform's `Intl` formatters in the reader's locale; nothing is built by string joining. *Why:* separators, order, currency and plurals differ by language.
- **DS-55** · A time under 7 days old shows as relative ("3 h ago"), an older one as a date; a deadline names its time zone. *Why:* recent is felt in hours, old in dates, and deadlines cross zones.

## Content

The voice is plain, direct and calm: short sentences, the reader as
"you", no jokes in errors, no blame. Write each language natively, never
word for word from another.

- **DS-56** · Every title, button, label and menu item is in sentence case. *Why:* one casing reads as one voice.
- **DS-57** · No copy says "Oops", "Something went wrong", "Are you sure?", "invalid", "Click here" or "the user". *Why:* each says nothing the reader can use.
- **DS-58** · An error message says what happened and how to fix it, in at most two sentences; a support code may follow, never stand alone. *Why:* the reader needs the next step, not the fault.
- **DS-59** · A count uses the language's plural forms ("1 invoice", "2 invoices"), never "invoice(s)". *Why:* "(s)" reads as a machine.
- **DS-60** · Every visible string lives in the per-language copy modules; a component holds no literal text. *Why:* a missing translation shows up as a missing key, not as mixed languages.
- **DS-61** · One concept has one name, from the project's vocabulary, across screens, e-mails, reports and videos. *Why:* two names make readers think there are two things.

## Surfaces

### The app

- **DS-62** · Every screen sits in the same app shell (header, navigation, page title), and its one `h1` matches its navigation label. *Why:* the reader always knows where they are.
- **DS-63** · A screen is designed at 390 px and 1280 px, and both widths are shown in its pull request. *Why:* phone and desktop each break in their own way.

### Transactional e-mails

- **DS-64** · An e-mail is one column at most 600 px wide, laid out with tables and inline styles, with no script and no external stylesheet. *Why:* mail clients strip everything else.
- **DS-65** · Every HTML e-mail has a plain-text part with the same content and links. *Why:* some clients and readers show only text.
- **DS-66** · An e-mail has one action: one button that is a real link, with the same URL also as text. *Why:* one e-mail, one thing to do.
- **DS-67** · An e-mail puts no text in images, and its logo has a transparent ground with a version that reads on dark. *Why:* clients invert colors in dark mode and block images.
- **DS-68** · An e-mail uses the light token values and the sans family's stack. *Why:* the e-mail looks like the product that sent it.

### Reports, explainers and mocks

The pipeline's own pages about the product follow this system: one look from the mock to the release.

- **DS-69** · A report, explainer or mock page links the project's tokens file and takes every color, family and radius from it, never a copied value. *Why:* the pages change when the tokens change.
- **DS-70** · A page is monochrome, uses the status colors only for status, and is correct in light and dark. *Why:* the same reading rules as the product.
- **DS-71** · A page framed by the report has no theme button and no outer gutter of its own. *Why:* the report frame sets both.

### Slides

- **DS-72** · A deck keeps one ground (the light or the dark token set) on every slide, the tokens' two families, and a five-step scale (default 120 · 76 · 48 · 32 · 24 px at 1920 × 1080). *Why:* a deck reads as one object.
- **DS-73** · A slide's one accent is `ink-1`, or a status color when the slide is about that status. *Why:* the accent points at the one thing that matters.
- **DS-74** · A slide holds one idea and at most 30 words of body text. *Why:* the audience reads or listens, not both.

### Videos

- **DS-75** · A video takes one token theme for the whole film, the status colors as its only accent, and the tokens' families (or the closest local face, named in its style guide). *Why:* the film looks like the product it explains.
- **DS-76** · Each scene has at most one accent, on the one thing that matters in it. *Why:* after every move, the viewer knows where to look.
- **DS-77** · On-screen text is at least 36 px at 1080p and stays inside a 5 % safe margin. *Why:* phones and players crop and shrink.
- **DS-78** · A video has no logo sting, bouncing or spinning text, word-by-word captions, or whoosh on every cut. *Why:* template effects hide the content.

The 300 ms limit is for the product; a video's motion follows its own
style guide.

## Accessibility

- **DS-79** · A native element (`button`, `a`, `label`, `input`, `dialog`, `nav`, `main`, `table`) is used before any ARIA role, and ARIA only fills what no element does. *Why:* native elements bring keyboard and names for free.
- **DS-80** · Text has a contrast of at least 4.5:1, large text (24 px, or 19 px bold) at least 3:1, and input borders, icons and the focus outline at least 3:1, in both themes. *Why:* low vision and bright screens.
- **DS-81** · Every interactive element shows a 2 px `focus` outline with a 2 px offset on keyboard focus; no outline is removed without this replacement. *Why:* a keyboard user must see where they are.
- **DS-82** · Focus order follows the visual order, and no `tabindex` is above 0. *Why:* the keyboard path matches what the eye reads.
- **DS-83** · Everything a pointer can do, the keyboard can do: Enter and Space activate, arrows move in menus and tabs, Esc closes; nothing works only by hover or drag. *Why:* keyboard, switch and voice users use the same paths.
- **DS-84** · Every control has an accessible name that starts with its visible label; an image that informs has alt text, and a decorative one has empty alt. *Why:* voice users say what they see, and screen readers read what is there.
- **DS-85** · A result or a toast is announced politely, and a blocking error assertively. *Why:* a screen reader hears what a sighted reader sees change.
- **DS-86** · A page has one `main`, one `h1`, and headings in order with no level skipped. *Why:* screen readers move by landmarks and headings.
- **DS-87** · Under `prefers-reduced-motion: reduce`, only opacity changes remain. *Why:* motion makes some readers sick.
- **DS-88** · At 200 % zoom, no text is cut and no control is hidden. *Why:* many readers zoom.
- **DS-89** · The automated accessibility check reports no serious or critical violation on any screen a journey visits. *Why:* the machine catches the common misses for free.

## Taste

The rules that make it feel good. Check a screen in grayscale first: if
the hierarchy holds without color, it holds.

- **DS-90** · Each region has one strongest element; secondary content is quieter by size, weight or `ink-2` and `ink-3`, never by a new hue. *Why:* hierarchy comes from what you de-emphasize.
- **DS-91** · Frequent actions do not animate: hover, navigation items, rows, tabs and toggles change at once; only rare or spatial changes (a dialog, a drawer, a menu) animate. *Why:* animation on every click feels slow by the tenth.
- **DS-92** · No card sits inside a card. *Why:* nested boxes add lines and no meaning.
- **DS-93** · A border goes only around a separate object (a card, a menu, an input) and a shadow only under a floating one; inside one object, content is grouped by space first and a divider line second. *Why:* every extra line is noise.
- **DS-94** · No page scrolls sideways at 320 px; only a table, code or a chart scrolls inside its own box. *Why:* sideways scroll hides content on the narrowest phones.
- **DS-95** · No surface uses decorative gradients, glass cards, an accent stripe on every card, or everything centered. *Why:* these are template looks, not this product's.
