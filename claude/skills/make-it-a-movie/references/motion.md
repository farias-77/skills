# The motion library

`import {...} from '@kit/motion'`. A film default-exports
`defineFilm({title, theme?, fps?, stamp?, chrome?, audio?, scenes})`.
Every coordinate is on a 1920×1080 canvas; the render scales it.

## A scene

```tsx
{
  id: 'flow',                 // unique; also the still's file name
  label: 'How it works',      // the small corner label while it plays
  text: 'An order goes in, a worker charges it',  // every word the viewer must read
  secs: 6,                    // the choreography's length; the reading time wins when longer
  render: () => (<>...</>),
}
```

The scene lasts `max(2.5 s, words(text) / 4, secs)`. Put in `text` every
word that is on screen, or the scene ends before it can be read. Inside a
scene, `at` is seconds from the scene's start.

## The parts

| Part | What it does | Key props |
|---|---|---|
| `TitleCard` | big kicker, the name, one line why | `kicker?`, `name`, `why?`, `deco?` |
| `Head` | the scene's headline, top-left | `at`, `size` |
| `Caption` | the one-line explanation at the foot | `at` |
| `Display`, `Body`, `Mono` | text that rises in | `at`, `size`, `color` |
| `Lines` | items that pop in one by one, optional drawn check | `items`, `check`, `step`, `x`, `y` |
| `Chip`, `Panel` | a tag; a box at (x, y, w, h) | `hot`, `ghost`, `at` |
| `Count`, `Numbers` | a number that counts up; a row of them with labels | `to`/`items`, `prefix`, `suffix`, `decimals`, `locale` |
| `Flow` | boxes that scale in, arrows that draw themselves | `nodes` (x, y = centre, `at`, `hot`, `ghost`), `edges` (`a`, `b`, `at`, `label`, `curve`, `dash`, `hot`) |
| `Traveler` | a dot that travels from one point to another | `from`, `to`, `at`, `d` |
| `Gantt` | a timeline of bars growing from their start | `rows` (`label`, `s`, `e`, `at`, `hot`, `dim`, `tag`), `max`, `ticks` |
| `Bars` | horizontal bars growing to their value | `items` (`label`, `value`, `hot`, `tag`) |
| `DecisionCard` | the pick against the alternative, an arrow between | `kicker`, `picked`, `other` (each `label`, `text`, `then?`, `thenLabel?`) |
| `Choices` | numbered questions, the recommendation first | `items`, `recLabel`, `altLabel` |
| `Divider`, `EndCard` | a section break; the last card | `big`, `small` / `title`, `line` |
| `Screen` | recorded footage in a window, the camera on the clicks, the cursor drawn | `footage`, `fromMs`, `toMs`, `speed`, `zoom` |
| `Shot` | a screenshot drifting toward a target, a ring drawn on it | `src`, `focus`, `zoom`, `ring` |

## Your own motion

Anything the parts do not cover, write with the same clock:

```tsx
import {useSec, prog, lin, ease, useTheme, rgba} from '@kit/motion';

const Fill: React.FC<{at: number; pct: number}> = ({at, pct}) => {
  const t = useTheme();
  const p = prog(useSec(), at, 1.2);            // eased 0..1 from `at`, over 1.2 s
  return (
    <div style={{position: 'absolute', left: 105, top: 520, width: 1710, height: 40, borderRadius: 20, background: rgba(t.fg, 0.1)}}>
      <div style={{width: `${pct * p}%`, height: '100%', borderRadius: 20, background: t.accent}} />
    </div>
  );
};
```

- Animate only from the frame (`useSec`, `useCurrentFrame`); never from
  `Date`, timers or CSS animations, which do not render frame by frame.
- `prog` eases out (`bezier(.16, 1, .3, 1)`); `lin` is linear, for
  progress bars and clocks.
- Springs: `spring({frame, fps, config: {damping: 200}})` from `remotion`,
  no bounce. A small bounce (damping ~14) only when something lands.

## Timing that reads

| Use | Value |
|---|---|
| an element in | 0.5–0.8 s, ease out |
| stagger between siblings | 0.25–0.6 s |
| an arrow drawing | 0.5–0.6 s |
| hold after the last item lands | at least 45% of the scene |
| a zoom on footage | 0.7–1.2 s in, at most one zoom change per 3 s |
| scene fade | built in (7 frames in, 6 out) |

## Themes

```tsx
import {THEMES, F} from '@kit/motion';
const theme = {...THEMES.ink, accent: '#F2C14E', display: F.serif, dispWeight: 400};
```

Fields: `bg`, `panel`, `fg`, `mute`, `accent`, `onAccent`, `display`,
`dispWeight`, `dispUpper?`, `dispLS?`, `body`, `mono`, `bgKind`
(`grid`, `dots`, `plain`, `rules`, `scan`), `radius`. Fonts: `F.inter`,
`F.serif` (Instrument Serif), `F.plex`, `F.mono`, `F.big` (Big Shoulders),
`F.bigSt`.

## Music

`audio: 'assets/bed.mp3'` plays under the whole film at 0.6 and fades
out over the last 2 s. Use only licensed music, with its source and licence
in your return. Stage videos have no music.
