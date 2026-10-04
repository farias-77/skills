// `screen` and `step`: the recorded product inside one window, the camera
// following the clicks, the cursor and its ripples drawn in post, the step's
// caption synced to the recorded step. A step that picks up the footage where
// the previous scene left it is a cut inside one take: the window does not
// re-enter, only the caption changes.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Freeze, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {L, SANS, MONO, SERIF, rgba, ease, EXIT, LAND, CALM, useSpring, useGrid, Kicker, Rise, Fade, fitSize} from './look';
import {camera, cursorAt, Footage as FT} from './camera';

type P = {s: any; len: number; story: any; next?: any};

const Cursor: React.FC<{x: number; y: number; size: number; press: number}> = ({x, y, size, press}) => (
  <svg
    width={size}
    height={size * 1.5}
    viewBox="0 0 24 36"
    style={{position: 'absolute', left: x - size * 0.13, top: y - size * 0.08, transform: `scale(${1 - 0.14 * press})`, transformOrigin: '3px 3px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.35))', overflow: 'visible'}}
  >
    <path d="M3 2 L3 27 L9.2 21.4 L13.4 31.2 L17.6 29.4 L13.5 19.8 L21.6 19.6 Z" fill="#fff" stroke="#111" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

// The product window: footage, camera, cursor, ripples, the target ring.
const Window: React.FC<{s: any; story: any; len: number; enter: boolean; exit: boolean}> = ({s, story, len, enter, exit}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const g = useGrid();
  const sp = useSpring();
  const ft: FT = story.footage[s.footage];
  const accent = story.accent;
  const speed = s.speed || 1;
  // footage clock: plays the range at `speed`, then holds the last frame (the result) if the scene is longer
  const playFrames = Math.max(1, Math.floor(((s.toMs - s.fromMs) / 1000) * fps / speed) - 1);
  const local = Math.min(f, playFrames);
  const t = s.fromMs + (local / fps) * 1000 * speed;
  const startFrame = Math.round((s.fromMs / 1000) * fps);

  const {x: wx, y: wy, w, h} = g.win;
  const tilt = s.style === 'tilt';
  const cam = camera(ft, t, w, h, tilt ? 1 : s.zoom);

  // entrance and exit of the window itself
  const pin = enter ? sp(f, 0, LAND) : 1;
  const pout = exit ? ease(f, len - 12, len, 0, 1, EXIT) : 0;
  let frameT = `translateY(${(1 - pin) * 90 - pout * 30}px) scale(${0.955 + 0.045 * pin - 0.02 * pout})`;
  if (tilt) {
    // a slow drift toward the viewer: the hero shot breathes, it never spins
    const p = f / Math.max(1, len);
    frameT += ` perspective(2600px) rotateX(${9 - 4 * p}deg) rotateY(${-17 + 6 * p}deg) rotateZ(${2.2 - 1 * p}deg)`;
  }

  const cur = cursorAt(ft, t);
  const sx = cam.tx + cur.x * cam.scale;
  const sy = cam.ty + cur.y * cam.scale;
  const zoomed = cam.scale / cam.base;
  const csize = 30 * Math.sqrt(Math.max(1, zoomed));
  const ripples = ft.clicks.filter((c) => t >= c.t - 10 && t - c.t < 650);
  const pressing = ft.clicks.some((c) => t >= c.t && t - c.t < 140) ? 1 : 0;

  // the step's target, ringed as the action lands
  let ring: React.ReactNode = null;
  if (s.type === 'step' && s.rect) {
    const r = s.rect;
    // drawn on as the cursor arrives, gone once the click lands: it says "here", then the result speaks
    const on = Math.max(0, Math.min(1, (t - (s.actionMs - 450)) / 300));
    const off = Math.max(0, Math.min(1, (t - (s.actionMs + 250)) / 350));
    if (on > 0 && off < 1) {
      const pad = 7;
      const rx = cam.tx + (r.x - pad) * cam.scale;
      const ry = cam.ty + (r.y - pad) * cam.scale;
      const rw = (r.width + pad * 2) * cam.scale;
      const rh = (r.height + pad * 2) * cam.scale;
      const per = 2 * (rw + rh);
      ring = (
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={w} height={h}>
          <rect x={rx} y={ry} width={rw} height={rh} rx={12} fill="none" stroke={accent} strokeWidth={3.5} strokeDasharray={per} strokeDashoffset={per * (1 - EASE_OUT(on))} opacity={1 - off} />
        </svg>
      );
    }
  }

  const play = (
    <OffthreadVideo src={staticFile(ft.src)} trimBefore={startFrame} playbackRate={speed} muted style={{width: 1920, height: 1080}} />
  );

  return (
    <div style={{position: 'absolute', left: wx, top: wy, width: w, height: h, transform: frameT, opacity: Math.min(1, pin * 1.5) * (1 - pout * 0.9), transformOrigin: '50% 60%'}}>
      <div style={{position: 'absolute', inset: -1, borderRadius: 20, boxShadow: `0 50px 140px rgba(0,0,0,.6), 0 0 0 1px ${L.hair}`}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', background: '#000'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.scale})`}}>
          {f > playFrames ? <Freeze frame={playFrames}>{play}</Freeze> : play}
        </div>
        {ring}
        {ripples.map((c, i) => {
          const p = Math.max(0, (t - c.t) / 600);
          const rr = (10 + 46 * EASE_OUT(Math.min(1, p))) * Math.sqrt(zoomed);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: cam.tx + c.x * cam.scale - rr,
                top: cam.ty + c.y * cam.scale - rr,
                width: rr * 2,
                height: rr * 2,
                borderRadius: '50%',
                border: `3px solid ${accent}`,
                background: rgba(accent, 0.16 * (1 - p)),
                opacity: Math.max(0, 1 - p),
              }}
            />
          );
        })}
        <Cursor x={sx} y={sy} size={csize} press={pressing} />
      </div>
    </div>
  );
};

const EASE_OUT = (p: number) => 1 - Math.pow(1 - p, 3);

// The caption of a step: its number in the accent, the label, the detail.
const StepCaption: React.FC<{s: any; len: number; accent: string; swapOut: boolean}> = ({s, len, accent, swapOut}) => {
  const f = useCurrentFrame();
  const g = useGrid();
  const sp = useSpring();
  const p = sp(f, 4, CALM, 16);
  const o = 1 - ease(f, len - (swapOut ? 8 : 12), len, 0, 1, EXIT);
  const size = fitSize(s.label, 1100, 44, 34, 0.5);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: g.capY,
        display: 'flex',
        justifyContent: 'center',
        opacity: p * o,
        transform: `translateY(${(1 - p) * 22 - (1 - o) * 16}px)`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 22, maxWidth: g.safeW}}>
        <div
          style={{
            flex: 'none',
            width: size * 1.45,
            height: size * 1.45,
            borderRadius: '50%',
            background: accent,
            color: L.stage,
            fontFamily: MONO,
            fontWeight: 600,
            fontSize: size * 0.72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${0.6 + 0.4 * sp(f, 2, LAND)})`,
          }}
        >
          {s.n}
        </div>
        <div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: 1.15, color: L.ink, letterSpacing: -0.4}}>{s.label}</div>
          {s.detail ? <div style={{fontFamily: SANS, fontWeight: 450, fontSize: size * 0.66, color: L.ink2, marginTop: 6}}>{s.detail}</div> : null}
        </div>
      </div>
    </div>
  );
};

// The wayfinding over the window: which chapter, which step of how many.
const Hud: React.FC<{s: any; accent: string; enter: boolean}> = ({s, accent, enter}) => {
  const f = useCurrentFrame();
  const g = useGrid();
  const sp = useSpring();
  const p = enter ? sp(f, 6, CALM, 18) : 1;
  if (!s.chapter && !s.of) return null;
  const left = g.win.x;
  const right = g.W - g.win.x - g.win.w;
  return (
    <div style={{position: 'absolute', left, right, top: g.hudY, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: p}}>
      {s.chapter ? (
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14, whiteSpace: 'nowrap'}}>
          <span style={{fontFamily: MONO, fontWeight: 600, fontSize: 22, color: accent, letterSpacing: 2}}>{String(s.chapter.index).padStart(2, '0')}</span>
          <span style={{fontFamily: SANS, fontWeight: 500, fontSize: 24, color: L.ink2}}>{s.chapter.title}</span>
        </div>
      ) : (
        <span />
      )}
      {s.of ? (
        <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
          {Array.from({length: s.of}, (_, i) => {
            const done = i < s.n - 1;
            const now = i === s.n - 1;
            const grow = now ? sp(f, 4, CALM, 14) : 1;
            return (
              <div key={i} style={{width: 30, height: 5, borderRadius: 3, background: L.hair, overflow: 'hidden'}}>
                <div style={{width: `${(done ? 1 : now ? grow : 0) * 100}%`, height: '100%', background: done ? rgba(accent, 0.55) : accent}} />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

// A `screen` with a caption: the line under the window, or, tilted, the title beside it.
const ScreenText: React.FC<{s: any; len: number; accent: string}> = ({s, len, accent}) => {
  const g = useGrid();
  if (s.style === 'tilt' && (s.title || s.kicker)) {
    const top = 330;
    return (
      <div style={{position: 'absolute', left: g.mx, top, width: 640}}>
        <Fade at={6} out={len - 12}>
          <Kicker text={s.kicker} accent={accent} size={22} />
        </Fade>
        <Rise at={10} out={len - 12} style={{marginTop: 22}}>
          <div style={{fontFamily: SANS, fontWeight: 650, fontSize: 70, lineHeight: 1.02, letterSpacing: -2.2, color: L.ink}}>{s.title}</div>
        </Rise>
        {s.caption ? (
          <Fade at={18} out={len - 12} style={{marginTop: 22}}>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: L.ink2, lineHeight: 1.2}}>{s.caption}</div>
          </Fade>
        ) : null}
      </div>
    );
  }
  if (!s.caption) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: g.capY + 8, display: 'flex', justifyContent: 'center'}}>
      <Fade at={10} out={len - 12}>
        <div style={{fontFamily: SANS, fontWeight: 550, fontSize: 38, color: L.ink, letterSpacing: -0.3, maxWidth: g.safeW, textAlign: 'center'}}>{s.caption}</div>
      </Fade>
    </div>
  );
};

export const FootageScene: React.FC<P> = ({s, len, story, next}) => {
  const g = useGrid();
  const tilt = s.style === 'tilt';
  const enter = !s.continues;
  const nextContinues = !!(next && next.continues);
  // tilted hero shots sit to the right, the title beside them
  const shift = tilt ? {left: 400, top: 36, scale: 0.86} : null;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: shift ? `translate(${shift.left}px, ${shift.top}px) scale(${shift.scale})` : undefined}}>
        <Window s={s} story={story} len={len} enter={enter} exit={!nextContinues} />
      </div>
      {s.type === 'step' ? (
        <>
          <Hud s={s} accent={story.accent} enter={enter} />
          <StepCaption s={s} len={len} accent={story.accent} swapOut={nextContinues} />
        </>
      ) : (
        <>
          {!tilt ? <Hud s={{chapter: s.chapter}} accent={story.accent} enter={enter} /> : null}
          <ScreenText s={s} len={len} accent={story.accent} />
        </>
      )}
    </AbsoluteFill>
  );
};
