import React from 'react';
import {Sequence} from 'remotion';
import {defineFilm} from '@kit/motion';
import film from './film';

// One still per beat of film.tsx. Fill BEATS with [scene id, beat start in the scene (s), beat length (s)].
// `film.mjs stills contact-film.tsx stills/` shoots each scene at 70% of 2.5 s (1.75 s), so each beat is shifted to land there.
const BEATS: [string, number, number][] = [];
const FRAC = 0.78;
const FPS = 24;
const scenes = BEATS.map(([id, t0, len], i) => {
  const sc = (film as any).scenes.find((s: any) => s.id === id);
  const off = Math.round((t0 + len * FRAC - 1.75) * FPS);
  return {id: `b${String(i + 1).padStart(2, '0')}`, text: 'x', secs: 2.5, render: () => <Sequence from={-off}>{sc.render()}</Sequence>};
});
export default defineFilm({title: 'contact', theme: (film as any).theme, fps: FPS, scenes, chrome: false});
