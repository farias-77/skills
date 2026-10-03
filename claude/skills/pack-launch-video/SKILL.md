---
name: pack-launch-video
description: Launch and tutorial videos made in code (Playwright capture, Remotion, three.js, optional Blender); read it before storyboarding, capturing, editing or reviewing the end-of-release video of a product with screens.
user-invocable: false
---

# Pack: launch and tutorial video in code

## When this pack applies

The end-of-release video for a web app with screens, shown to the
people who work with it and to its users: explain the need, show what
was built, teach every new feature step by step, look its best. It
covers Playwright capture, Remotion 4 (React 19), `@remotion/three`,
narration, captions and music. It is not for the pipeline's short
review videos, which follow the video kit's own schema.

Precedence: the user's words, then the project's doctrine (its brand,
fonts, tokens, the language of the video, its legal line on synthetic
voices and on audio licences), then this pack.

## Principles

1. **Real product footage, never mockups.** Drive the real app with
   Playwright on seeded data. *Why:* the tutorial has to match what
   users will click, and people keep asking for features that already
   exist.
2. **One action per shot.** Each step is a single click or typed value,
   with a zoom and a 3–6-word label. *Why:* Mayer's segmenting
   (d=0.70) and signaling (d=0.46).
3. **Narration or labels, never the same words twice.** Narration beats
   printed text (modality, d=0.72); narration repeated on screen hurts
   (redundancy, d=0.86). Burn in short labels; full captions go in a
   sidecar `.srt`.
4. **Data drives timing.** Step lengths come from the action log and the
   narration clips, never from hand-typed frames. *Why:* a
   per-release component with frame constants grows past a thousand
   lines and cannot be re-timed.
5. **Springs without bounce by default.** `damping: 200`; at most a
   small bounce (Apple's ~0.15) when an object lands. *Why:* Apple
   WWDC23: "When you're not sure, use a spring with bounce 0"; values
   above about 0.4 "feel too exaggerated".
6. **Stage one thing at a time.** One moving focus per moment; dim or
   zoom the rest (Disney's staging; Willenskomer's offset & delay).
   *Why:* two motions split attention.
7. **The camera serves legibility.** Zoom at most 1.5× on 1080p
   footage; higher only on a 4K source. *Why:* above about 1.5× a 1080p
   source stops holding up.
8. **Draw overlays in post, never in the page.** Cursor, ripples,
   callouts and chapter cards are vector layers in Remotion. *Why:*
   Playwright's `showActions`/`showChapter` bake raster into the
   footage, beyond re-timing.
9. **Licensed or generated audio only, with the receipt on file.**
   *Why:* a free-plan Suno track is non-commercial and Suno owns it;
   YouTube Audio Library's standard licence is scoped to YouTube.
10. **Proof frames before the full render.** Stills per scene, then a
    chapter range, then the master. *Why:* a full render on a laptop
    costs tens of min.

## The checklist

**Story**
1. The opening 30 s states the need in the user's words, backed by one
   real number or one "before" shot.
2. Every feature in the release notes has its own tutorial chapter. A
   feature without a chapter is listed as cut, with the reason.
3. Each chapter opens on where the feature lives (`Settings › Rules ›
   New`) and closes on a recap card that lists its steps.
4. One action per step, and each step shows the result for ≥ 1.3 s
   before the next one starts.
5. The end card carries the path in the app, the docs link, the release
   name and date. If any voice is synthetic, it also carries an
   "AI-generated narration" line in the video's language.

**Picture**
6. Master is 1920×1080, 30 fps, H.264 `yuv420p`, `+faststart`. The 4K
   source applies only to shots that zoom past 1.5×.
7. No zoom above 1.5× on a 1080p source. Spot-check the zoomed stills:
   text edges are crisp, never smeared.
8. The zoomed frame never shows past the footage's edge (translation is
   clamped).
9. Zoom-in and zoom-out each take 550–1250 ms; at most one zoom change
   per 3 s (secondary source).
10. A vector cursor is drawn in post on an eased path, with a ~0.6 s
    ripple per click.
11. No baked-in Playwright overlays (`showActions` cursor or dot,
    `showChapter`) in the final footage.
12. Seeded demo data only (no real names, emails, tokens); dates frozen
    with `page.clock`.
13. The product's own fonts, loaded locally (`staticFile`); body text
    ≥ 36 px at 1080p (inference).
14. Transitions are fade or slide, 10–20 frames. Never flip, clockWipe
    or iris between UI shots.
15. Springs use `damping: 200` unless a landing object earns a small
    bounce. Nothing moves linearly except progress bars and time
    counters.

**Text and captions**
16. Burned-in labels: ≤ 42 characters per line, ≤ 2 lines, centred at
    the bottom, inside the 68%-width zone.
17. Each label stays on screen ≥ 0.3 s per word, ≥ 0.83 s and ≤ 7 s.
    Reading speed ≤ 20 characters/s.
18. Lines break at natural points, never between article and noun or
    between first and last name.
19. A sidecar `.srt` is exported from the same caption data
    (`serializeSrt`) and checked against the narration.

**Sound**
20. Narration, when present, is one clip per step, and the step's
    length is at least the clip plus 0.6 s.
21. Music ducks under the voice via a per-frame `volume` callback
    (~0.18 under voice, ~0.6 alone) and fades over the last 2 s.
22. Every audio file has a line in `credits.md`: source URL, licence,
    plan and date.
23. The render keeps the audio. A review-video profile that strips it
    (`-an`) is not the launch profile.

**Build**
24. Timing lives in data (`steps.json`, `narration.json`); components
    hold no hard-coded scene start frames.
25. Stills of every scene were reviewed before the full render, and one
    chapter was rendered with `--frames`.
26. Renders take the shared render lock (`flock`) and run under `nice`.
27. Remotion licence checked: four or more people operating Remotion
    need a Company License.
28. Total length is between 2:30 and 6:00; each feature chapter is
    45–90 s (inference).

## Anti-patterns

- **Template slop.** Gradient blobs, glassmorphism, a "whoosh" on every
  cut, emoji, short-form word-pop captions on a tutorial, 3D text
  spinning for no reason.
- **The zoom carousel.** A zoom per click; 2× punches on 1080p (blurry
  text); ping-pong zooms on clicks < 2.5 s apart that should merge.
- **Teleport cursor.** A Playwright `mouse.move` with `steps: 1`, or no
  cursor at all, so the viewer cannot see what was clicked.
- **Mockup tutorial.** Design-tool frames or hand-drawn UI in the "how
  to" chapter. Users click what they saw.
- **Karaoke redundancy.** The full narration typed on screen as large
  text, word by word.
- **Bespoke monolith.** One huge composition file with frame constants
  per release.
- **The fake 4K screencast.** A bigger `recordVideo.size` with emulated
  `deviceScaleFactor` only pads grey around 1080p (measured);
  `recordVideo` itself is VP8, 1 Mbit/s, 25 fps.
- **Overbuilt 3D.** Glass `transmission` materials, HDRI downloads at
  render time, or Blender installed for a logo that three.js extrudes
  in 40 lines.
- **Unlicensed audio.** A free-plan Suno track, YouTube Audio Library
  music on the company site, a voice clone of a colleague.

## Core recipes

**Storyboard (launch + tutorial, about 3–5 min)**

```
0:00 COLD OPEN     3–6 s    3D title or kinetic type: release name. Music only.
0:06 THE NEED      15–25 s  The pain in the user's words + one number + the "before" footage.
                            Problem → reveal (keynote pattern).
0:30 WHAT WE BUILT 15–25 s  One-sentence promise, then 3–4 hero shots of the new features,
                            cut to music, no voice (real UI, ambient sound, sharp type).
0:55 TUTORIAL      n × 45–90 s, one chapter per feature:
       chapter card  2–3 s   feature name + where it lives (Settings › Rules)
       step k        4–8 s   wide 0.6 s → zoom to target → action → result held ≥1.3 s
                             label "2/4 · Choose the trigger" (≤42 chars)
       recap card    3–4 s   the steps as a numbered list (signaling)
END-2 RECAP        10–15 s  Grid of the features with the path to each + docs link.
END   END CARD     4–6 s    Release, date, where to ask, AI-voice disclosure.
```

The source of truth is one `release-video.json`:
`{release, lang, need:{quote, number}, features:[{name, path,
steps:[{label, action, selector, narration?}]}]}`. One Playwright script
reads it and writes the footage plus an action log; the Remotion
composition reads what that script writes.

**Key numbers**
- Capture: `page.screencast` at 1920×1080 delivers 28–32 fps on repaint
  (measured); glide the mouse with `steps ≥ 20` so hover states fire;
  log each click's rect on the frame clock.
- 4K close-ups: `--force-device-scale-factor=2` with `viewport: null`
  gives true 3840×2160 at ~8 fps; slow CSS with CDP
  `Animation.setPlaybackRate(0.25)` and play back at 4×. CSS-driven UI
  only: JS timers are not slowed.
- Zoom segments from clicks: pre-roll 300 ms, post-roll 2500 ms, merge
  when the next click starts within 2500 ms; level 1.18–1.5× on 1080p,
  up to 2× on a 4K source; spring in over ~22 frames (≈ 730 ms) at
  `damping: 200`.
- Cursor: `Easing.bezier(0.2, 0.2, 0.15, 1)` between logged points, arrow
  at ~1.4× system size, click ripple 10→56 px, opacity 1→0, over 0.6 s.
- Step length = `max(action span + 1.3 s, narration clip + 0.6 s)`,
  computed in `calculateMetadata`.
- Music: 0.18 under voice, 0.6 alone, eased over 8 frames; master
  normalized to −16 LUFS, −1.5 dBTP (inference: a web target).
- Encode: `--codec=h264 --crf=18`, AAC 192 kbit/s, `+faststart`; share
  copy about 8 Mbit/s at 1080p30.
- Review loop: stills (~1 min) → one chapter (`--frames`, 10–15 min) →
  the master once, queued on the lock.

The capture script, the camera function, the caption code, the 3D
title, the motion table, narration and music options with their
licences, the measured render budget and the Blender verdict are in
[references/recipes.md](references/recipes.md). Versions, licences of
the tools and the mechanical checks are in
[references/tooling.md](references/tooling.md); sources in
[references/sources.md](references/sources.md).
