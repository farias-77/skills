# Launch video: sources

Public sources only. Secondary sources are marked. The capture and
render numbers marked "measured" were taken on the reference machine
described in recipes.md while this pack was written.

## Remotion (primary, https://www.remotion.dev/docs/)

- `composition`, `calculate-metadata`, `sequence`, `series` — composition API, metadata from props.
- `transitions/transitionseries`, `transitions/timings/springtiming` — presentations, the overlap rule.
- `spring`, `easing`, `interpolate` — spring defaults, `Easing.bezier`.
- `media/video`, `video-vs-offthreadvideo` — `@remotion/media` `<Video>` recommended.
- `captions`, `captions/displaying`, `install-whisper-cpp/transcribe` — caption types, pages, whisper models.
- `media/audio`, `media-utils` — per-frame `volume`, deprecations.
- `three`, `three-canvas`, `react-19`, `gl-options` — ThreeCanvas rules, R3F/three versions, `--gl`.
- `performance`, `config`, `encoding` — benchmark, CRF 18 default, slow CSS filters.
- https://www.remotion.dev/docs/license and https://www.remotion.pro/license — the four-person threshold, prices.

## Capture and zoom

- https://www.npmjs.com/package/playwright-core (1.63.0, `types.d.ts`) — the `Screencast` API, VP8 encoder arguments.
- https://playwright.dev/docs/api/class-screencast and https://playwright.dev/docs/release-notes — screencast since 1.59, `cursor` and timestamp since 1.61.
- https://chromedevtools.github.io/devtools-protocol/ — `Page.startScreencast`, `Animation.setPlaybackRate`.
- https://github.com/CapSoftware/Cap (`recording.rs`, `configuration.rs`, `zoom_spring.rs`) — auto-zoom 2.0, the 300/2500/2500 ms rules, ripple, keystrokes.
- https://github.com/ashrafchowdury/programatic-demo (`zoom.ts`, `camera.ts`; practitioner) — 1.18–1.74 levels, 550–1250 ms, the 1.5× sharpness rule.
- https://github.com/GJI9/reshoot and https://github.com/ThePatriczek/playwright-recast (practitioner) — the cursor from an event log; warns past 1.25× upscale.
- https://screen.studio/guide/auto-zoom and https://screen.studio/guide/animations — click-driven zoom, motion blur.
- https://docs.arcade.software (hotspots and spotlights) — a spotlight dims the rest; a close zoom blurs.

## Story, motion, captions

- Mayer, "Applying the Science of Learning", https://pressbooks.pub/learningenvironmentsdesign — modality, redundancy, signaling, segmenting.
- https://developer.apple.com/videos/play/wwdc2023/10158 — spring bounce 0 / 0.15 / ≤ 0.4.
- Android Material 3 `MotionTokens.kt` in https://cs.android.com/androidx — easing curves, duration tokens.
- Willenskomer, "UX in Motion Manifesto" (secondary) — easing, offset & delay.
- https://partnerhelp.netflixstudios.com (Timed Text Style Guide) — 42 characters, 20 cps, 2 lines, 5/6 s to 7 s.
- https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles — 160–180 wpm, 0.3 s per word, 68% width.
- https://moonb.io/blog/product-launch-video (secondary) — a 4:15 product walkthrough; launch lengths 0:30–4:47.
- https://timfrin.substack.com, "Linear's playbook" (secondary) — releases staged "much like an Apple keynote".
- https://linear.app/changelog — per-entry structure.

## Audio, licences, Blender

- https://ElevenLabs.io/docs (`convert-with-timestamps`) and https://ElevenLabs.io/pricing — alignment, the Starter commercial licence.
- https://developers.openai.com/api/docs/guides/text-to-speech — voices, languages, the AI disclosure.
- https://huggingface.co/hexgrad/Kokoro-82M (VOICES.md) and https://huggingface.co/rhasspy/piper-voices — voices per language.
- https://www.resemble.ai/learn/models/chatterbox-multilingual — MIT, 23 languages, watermark.
- https://help.suno.com/en/articles/2416769, https://pixabay.com/service/license-summary/, https://ElevenLabs.io/eleven-music-api — music terms.
- https://licenseorg.com (YouTube Audio Library guide; secondary) — scope limits.
- https://support.google.com/youtube/answer/1722171 — 8 Mbit/s for 1080p30.
- https://pypi.org/project/bpy and https://www.blender.org/download/releases/5-2/ — bpy 5.2.2 needs Python 3.13; 5.2 LTS.
- https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html — `-b -P -E -o -F -a --`.
- https://www.notebookcheck.net (i5-1135G7; secondary) — Classroom CPU median 1,254 s.
- https://blenderartists.org (EEVEE in docker; secondary) — EEVEE needs OpenGL/EGL under `-b`.
