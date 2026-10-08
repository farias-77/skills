// The film shell: fonts, theme, timing and the one composition a film renders on.
// Every coordinate is on a 1920x1080 canvas; the render scales it (720p by default).
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile, delayRender, continueRender} from 'remotion';

export const W = 1920;
export const H = 1080;

const FACES: [string, string, string, string][] = [
  ['Inter', 'InterTight-var.woff2', '100 900', 'normal'],
  ['Serif', 'InstrumentSerif-400.woff2', '400', 'normal'],
  ['Serif', 'InstrumentSerif-400i.woff2', '400', 'italic'],
  ['Mono', 'IBMPlexMono-400.woff2', '400', 'normal'],
  ['Mono', 'IBMPlexMono-500.woff2', '500', 'normal'],
  ['Mono', 'IBMPlexMono-600.woff2', '600', 'normal'],
  ['Plex', 'IBMPlexSans-400.woff2', '100 700', 'normal'],
  ['Big', 'BigShoulders-900.woff2', '100 900', 'normal'],
  ['BigSt', 'BigShouldersStencil-900.woff2', '100 900', 'normal'],
];
if (typeof document !== 'undefined') {
  const handle = delayRender('fonts');
  Promise.all(
    FACES.map(([fam, file, weight, style]) =>
      new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight, style}).load().then((ff) => (document.fonts as any).add(ff)),
    ),
  ).then(() => continueRender(handle));
}

export const F = {
  inter: 'Inter, sans-serif',
  serif: 'Serif, serif',
  mono: 'Mono, monospace',
  plex: 'Plex, sans-serif',
  big: 'Big, sans-serif',
  bigSt: 'BigSt, sans-serif',
};

export type Theme = {
  bg: string;
  panel: string;
  fg: string;
  mute: string;
  accent: string;
  onAccent: string;
  display: string;
  dispWeight: number;
  dispUpper?: boolean;
  dispLS?: string;
  body: string;
  mono: string;
  bgKind: 'grid' | 'dots' | 'plain' | 'rules' | 'scan';
  radius: number;
};

// Two starting points; a film may spread one and change anything.
export const THEMES: Record<'ink' | 'paper', Theme> = {
  ink: {bg: '#0B0B0C', panel: '#151517', fg: '#EDEDEF', mute: '#9A9AA2', accent: '#F2C14E', onAccent: '#0B0B0C', display: F.inter, dispWeight: 700, dispLS: '-0.03em', body: F.inter, mono: F.mono, bgKind: 'dots', radius: 14},
  paper: {bg: '#F4F4F1', panel: '#FBFBF9', fg: '#141414', mute: '#5F615C', accent: '#C8321C', onAccent: '#FBFBF9', display: F.big, dispWeight: 900, dispUpper: true, body: F.plex, mono: F.mono, bgKind: 'grid', radius: 4},
};

const ThemeCtx = createContext<Theme>(THEMES.ink);
export const useTheme = () => useContext(ThemeCtx);

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const useSec = () => {
  const {fps} = useVideoConfig();
  return useCurrentFrame() / fps;
};
/** eased progress 0..1 of an animation starting at `t0` seconds, lasting `d` */
export const prog = (sec: number, t0: number, d = 0.6) => ease(clamp01((sec - t0) / d));
export const lin = (sec: number, t0: number, d: number) => clamp01((sec - t0) / d);

export const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

export type Scene = {
  id: string;
  /** the small label in the top-left corner while the scene plays */
  label?: string;
  /** every phrase the viewer must read; the scene lasts at least 1 s per 4 words, never under 2.5 s */
  text: string;
  /** the choreography's length; the reading time wins when it is longer */
  secs?: number;
  render: () => React.ReactNode;
};

export type FilmDef = {
  title: string;
  theme?: Theme;
  fps?: number;
  /** the word in the top-right corner (the stage, the product) */
  stamp?: string;
  /** false hides the corner labels and the progress bar */
  chrome?: boolean;
  /** a music bed under assets/, licensed, faded out over the last 2 s */
  audio?: string;
  scenes: Scene[];
};
export const defineFilm = (f: FilmDef) => f;

export const sceneSecs = (s: Scene) => Math.max(2.5, words(s.text) / 4, s.secs ?? 0);
export const layoutScenes = (scenes: Scene[], fps: number) => {
  let at = 0;
  return scenes.map((s) => {
    const len = Math.round(sceneSecs(s) * fps);
    const o = {s, from: at, len};
    at += len;
    return o;
  });
};
export const totalFrames = (scenes: Scene[], fps: number) => layoutScenes(scenes, fps).reduce((a, x) => a + x.len, 0);

const Background: React.FC = () => {
  const t = useTheme();
  const base: React.CSSProperties = {background: t.bg};
  if (t.bgKind === 'grid') {
    base.backgroundImage = `linear-gradient(${rgba(t.fg, 0.07)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(t.fg, 0.07)} 1px, transparent 1px)`;
    base.backgroundSize = '60px 60px';
  }
  if (t.bgKind === 'dots') {
    base.backgroundImage = `radial-gradient(${rgba(t.fg, 0.14)} 2px, transparent 2.4px)`;
    base.backgroundSize = '48px 48px';
  }
  if (t.bgKind === 'rules') {
    base.backgroundImage = `linear-gradient(${rgba(t.fg, 0.08)} 1px, transparent 1px)`;
    base.backgroundSize = '100% 81px';
  }
  if (t.bgKind === 'scan') base.backgroundImage = `repeating-linear-gradient(0deg, ${rgba(t.fg, 0.035)} 0 1px, transparent 1px 6px)`;
  return <AbsoluteFill style={base} />;
};

const SceneFade: React.FC<{len: number; children: React.ReactNode}> = ({len, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 7, len - 6, len], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const Chrome: React.FC<{stamp?: string; label?: string; frac: number}> = ({stamp, label, frac}) => {
  const t = useTheme();
  return (
    <>
      {label ? (
        <div style={{position: 'absolute', left: 84, top: 45, fontFamily: t.mono, fontSize: 28, letterSpacing: 4, color: t.mute, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 18}}>
          <span style={{width: 15, height: 15, borderRadius: 15, background: t.accent, display: 'inline-block'}} />
          {label}
        </div>
      ) : null}
      {stamp ? (
        <div style={{position: 'absolute', right: 84, top: 36, fontFamily: t.display, fontWeight: t.dispWeight, fontSize: 48, color: t.accent, letterSpacing: t.dispLS, textTransform: t.dispUpper ? 'uppercase' : 'none'}}>{stamp}</div>
      ) : null}
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 7, width: W, background: rgba(t.fg, 0.08)}}>
        <div style={{height: 7, width: W * frac, background: t.accent}} />
      </div>
    </>
  );
};

export const Film: React.FC<{film: FilmDef}> = ({film}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = film.theme ?? THEMES.ink;
  const lay = layoutScenes(film.scenes, fps);
  const total = lay.reduce((a, x) => a + x.len, 0);
  const cur = lay.find((x) => f >= x.from && f < x.from + x.len) ?? lay[lay.length - 1];
  return (
    <ThemeCtx.Provider value={theme}>
      <AbsoluteFill style={{fontFamily: theme.body, color: theme.fg}}>
        <Background />
        {lay.map(({s, from, len}) => (
          <Sequence key={s.id} from={from} durationInFrames={len}>
            <SceneFade len={len}>{s.render()}</SceneFade>
          </Sequence>
        ))}
        {film.chrome === false ? null : <Chrome stamp={film.stamp} label={cur.s.label} frac={f / total} />}
        {film.audio ? <Audio src={staticFile(film.audio)} volume={(fr) => 0.6 * interpolate(fr, [0, 15, total - 2 * fps, total], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} /> : null}
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};

/** The root the kit registers for a film: one composition, id "film". */
export const FilmRoot: React.FC<{film: FilmDef}> = ({film}) => {
  const fps = film.fps ?? 30;
  const scenes = layoutScenes(film.scenes, fps).map(({s, from, len}) => ({id: s.id, from, len, text: s.text}));
  return <Composition id="film" component={(() => <Film film={film} />) as any} defaultProps={{scenes}} width={W} height={H} fps={fps} durationInFrames={Math.max(1, totalFrames(film.scenes, fps))} />;
};
