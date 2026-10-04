// The typographic scenes of the launch mode: chapter (and its recap form),
// statement (the need, in the user's words), numbers, end. Type carries
// them; one accent; everything rises out of its line and leaves quicker
// than it came.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {L, SANS, SERIF, MONO, rgba, ease, EXIT, CALM, useSpring, useGrid, Kicker, Rise, Fade, fitSize} from './look';

type P = {s: any; len: number; story: any};

// A chapter card: the big index, the feature, where it lives in the app.
// With `items` it is the overview or the recap: the steps as a numbered list.
export const ChapterScene: React.FC<P> = ({s, len, story}) => {
  const f = useCurrentFrame();
  const g = useGrid();
  const sp = useSpring();
  const out = len - 12;
  const accent = story.accent;
  if (s.items) {
    const n = s.items.length;
    const rowH = Math.min(108, 620 / n);
    const top = Math.max(330, 600 - (n * rowH) / 2);
    const size = 44;
    return (
      <AbsoluteFill>
        <div style={{position: 'absolute', left: g.mx, top: top - 200, width: 1200}}>
          <Fade at={2} out={out}>
            <Kicker text={s.kicker} accent={accent} size={22} />
          </Fade>
          <Rise at={6} out={out} style={{marginTop: 22}}>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 84, letterSpacing: -3, color: L.ink, lineHeight: 1}}>{s.title}</div>
          </Rise>
        </div>
        {s.items.map((it: string, i: number) => {
          const at = 14 + i * 5;
          const line = sp(f, at, CALM, 24);
          return (
            <div key={i} style={{position: 'absolute', left: g.mx, top: top + i * rowH, width: 1300, height: rowH}}>
              <div style={{position: 'absolute', left: 0, top: 0, height: 1, width: `${line * 100}%`, background: L.hair, opacity: 1 - ease(f, out, out + 10, 0, 1, EXIT)}} />
              <Fade at={at + 2} out={out - 2 + i} dy={14} style={{display: 'flex', alignItems: 'center', height: rowH, gap: 34}}>
                <span style={{fontFamily: MONO, fontWeight: 600, fontSize: size * 0.62, color: accent, width: size * 1.3, letterSpacing: 1}}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{fontFamily: SANS, fontWeight: 550, fontSize: size, color: L.ink, letterSpacing: -0.6}}>{it}</span>
              </Fade>
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  const idx = String(s.index || 1).padStart(2, '0');
  const withPreview = !!(s.preview && s.preview.src);
  const titleSize = withPreview ? fitSize(s.title, 880, 136, 84, 0.5, 2) : fitSize(s.title, 1380, 136, 88, 0.5);
  const rule = sp(f, 20, CALM, 30);
  const base = 470;
  const crumbs = s.path ? s.path.split(/\s*[›>\/]\s*/).filter(Boolean) : [];
  const pv = withPreview;
  const pin = sp(f, 4, CALM, 34);
  const pout = ease(f, out, out + 12, 0, 1, EXIT);
  return (
    <AbsoluteFill>
      {pv ? (
        // the screen the chapter opens on, waiting at the right: the next cut lands on it
        <div
          style={{
            position: 'absolute',
            left: 1080,
            top: 200,
            width: 1280,
            height: 720,
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: `0 50px 140px rgba(0,0,0,.6), 0 0 0 1px ${L.hair}`,
            transform: `perspective(2400px) rotateY(${-24 + 6 * pin}deg) rotateX(4deg) translateX(${(1 - pin) * 160 + pout * 60}px)`,
            transformOrigin: '0% 50%',
            opacity: pin * (1 - pout) * 0.92,
          }}
        >
          <Img src={staticFile(s.preview.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${rgba('#0A0A0B', 0.55)}, ${rgba('#0A0A0B', 0)} 45%)`}} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: g.mx, top: base - 250}}>
        <Rise at={0} out={out}>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 230, lineHeight: 0.9, color: accent}}>{idx}</div>
        </Rise>
      </div>
      <div style={{position: 'absolute', left: g.mx, top: base, width: pv ? 900 : 1600}}>
        <Fade at={6} out={out}>
          <Kicker text={s.kicker} accent={accent} size={22} />
        </Fade>
        <Rise at={8} out={out} style={{marginTop: 26}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: titleSize, lineHeight: 1, letterSpacing: -titleSize * 0.038, color: L.ink}}>{s.title}</div>
        </Rise>
        <div style={{marginTop: 40, height: 2, width: 760 * rule, background: `linear-gradient(90deg, ${accent}, ${rgba(accent, 0)})`, opacity: 1 - ease(f, out, out + 10, 0, 1, EXIT)}} />
        {crumbs.length ? (
          <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginTop: 36}}>
            {crumbs.map((c: string, i: number) => (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <Fade at={22 + i * 4} out={out}>
                    <span style={{fontFamily: MONO, fontSize: 28, color: L.muted}}>›</span>
                  </Fade>
                ) : null}
                <Fade at={20 + i * 4} out={out} dy={10}>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontWeight: 500,
                      fontSize: 26,
                      color: i === crumbs.length - 1 ? L.ink : L.ink2,
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: `1px solid ${i === crumbs.length - 1 ? rgba(accent, 0.7) : L.hair}`,
                      background: i === crumbs.length - 1 ? rgba(accent, 0.1) : 'rgba(255,255,255,0.03)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c}
                  </span>
                </Fade>
              </React.Fragment>
            ))}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// The need, in the user's words: an editorial quote, word by word.
export const StatementScene: React.FC<P> = ({s, len, story}) => {
  const f = useCurrentFrame();
  const g = useGrid();
  const sp = useSpring();
  const out = len - 12;
  const n = [...s.text].length;
  const size = n <= 50 ? 104 : n <= 80 ? 88 : 76;
  const em = s.emphasis ? [s.text.indexOf(s.emphasis), s.text.indexOf(s.emphasis) + s.emphasis.length] : [-1, -1];
  let pos = 0;
  const words = s.text.split(' ').map((w: string, i: number) => {
    const start = pos;
    pos += w.length + 1;
    const inEm = start >= em[0] && start < em[1];
    const p = sp(f, 8 + i * 2.2, CALM, 16);
    const o = 1 - ease(f, out, out + 10, 0, 1, EXIT);
    return (
      <span key={i} style={{display: 'inline-block', opacity: p * o, transform: `translateY(${(1 - p) * 0.4}em)`, color: inEm ? story.accent : L.ink, fontStyle: inEm ? 'italic' : 'normal', marginRight: '0.24em'}}>
        {w}
      </span>
    );
  });
  const width = 1500;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 210, top: 0, bottom: 0, width, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <Fade at={0} out={out}>
          <Kicker text={s.kicker} accent={story.accent} size={22} />
        </Fade>
        <div style={{position: 'relative', marginTop: 40}}>
          <Fade at={2} out={out} style={{position: 'absolute', left: -size * 0.62, top: -size * 0.28}}>
            <span style={{fontFamily: SERIF, fontSize: size * 1.6, color: story.accent, lineHeight: 1}}>“</span>
          </Fade>
          <div style={{fontFamily: SERIF, fontSize: size, lineHeight: 1.12, letterSpacing: -0.5}}>{words}</div>
        </div>
        {s.cite ? (
          <Fade at={14 + s.text.split(' ').length * 2.2} out={out} style={{marginTop: 44}}>
            <span style={{fontFamily: MONO, fontWeight: 500, fontSize: 24, color: L.muted, letterSpacing: 1.5}}>— {s.cite}</span>
          </Fade>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// One to three numbers, counted up when they are plain integers.
export const NumbersScene: React.FC<P> = ({s, len, story}) => {
  const f = useCurrentFrame();
  const g = useGrid();
  const sp = useSpring();
  const out = len - 12;
  const n = s.items.length;
  const colW = Math.min(560, (g.W - 2 * g.mx) / n);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: g.mx, top: 230}}>
        <Fade at={0} out={out}>
          <Kicker text={s.kicker} accent={story.accent} size={22} />
        </Fade>
        {s.title ? (
          <Rise at={4} out={out} style={{marginTop: 22}}>
            <div style={{fontFamily: SANS, fontWeight: 650, fontSize: 64, letterSpacing: -2, color: L.ink}}>{s.title}</div>
          </Rise>
        ) : null}
      </div>
      {s.items.map((it: any, i: number) => {
        const at = 12 + i * 6;
        const p = sp(f, at, CALM, 40);
        const m = /^(\D*)(\d+)(\D*)$/.exec(it.value);
        const shown = m ? `${m[1]}${Math.round(Number(m[2]) * p)}${m[3]}` : it.value;
        const left = g.mx + i * colW;
        const top = 480;
        return (
          <div key={i} style={{position: 'absolute', left, top, width: colW - 40}}>
            <div style={{height: 2, width: `${sp(f, at - 4, CALM, 24) * 100}%`, background: i === 0 ? story.accent : L.hair}} />
            <Fade at={at} out={out} dy={20}>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 176, letterSpacing: -7, color: L.ink, fontVariantNumeric: 'tabular-nums', marginTop: 24, lineHeight: 1}}>{shown}</div>
              <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, color: L.ink2, marginTop: 18, lineHeight: 1.2}}>{it.label}</div>
            </Fade>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// The end card: what to remember, where to find it, and the release.
export const EndScene: React.FC<P> = ({s, len, story}) => {
  const f = useCurrentFrame();
  const g = useGrid();
  const sp = useSpring();
  const fade = 1 - ease(f, len - 16, len, 0, 1, EXIT);
  const size = 112;
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <div style={{position: 'absolute', left: g.mx, right: g.mx, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <Fade at={0}>
          <Kicker text={s.kicker} accent={story.accent} size={22} />
        </Fade>
        <div style={{marginTop: 34}}>
          {s.lines.map((l: string, i: number) => (
            <Rise key={i} at={6 + i * 6}>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 1.04, letterSpacing: -size * 0.035, color: i === s.lines.length - 1 && s.lines.length > 1 ? story.accent : L.ink}}>{l}</div>
            </Rise>
          ))}
        </div>
        <div style={{marginTop: 54, height: 2, width: 420 * sp(f, 16, CALM, 30), background: L.hair}} />
        {s.footer ? (
          <Fade at={22} style={{marginTop: 30}}>
            <span style={{fontFamily: MONO, fontWeight: 500, fontSize: 26, color: L.ink2, letterSpacing: 1}}>{s.footer}</span>
          </Fade>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
