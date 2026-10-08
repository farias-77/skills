// Text and boxes that move in: everything here animates from the scene's own clock.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useTheme, useSec, prog, lin, ease, rgba, words, W} from './core';

export const Pop: React.FC<{at?: number; y?: number; d?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({at = 0, y = 33, d = 0.7, style, children}) => {
  const p = prog(useSec(), at, d);
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * y}px)`, ...style}}>{children}</div>;
};

export const Display: React.FC<{size?: number; color?: string; at?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({size = 120, color, at = 0, style, children}) => {
  const t = useTheme();
  return (
    <Pop at={at} style={{fontFamily: t.display, fontWeight: t.dispWeight, fontSize: size, lineHeight: 1.02, letterSpacing: t.dispLS, textTransform: t.dispUpper ? 'uppercase' : 'none', color: color ?? t.fg, ...style}}>
      {children}
    </Pop>
  );
};

export const Body: React.FC<{size?: number; color?: string; at?: number; weight?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({size = 51, color, at = 0, weight = 500, style, children}) => {
  const t = useTheme();
  return (
    <Pop at={at} style={{fontFamily: t.body, fontWeight: weight, fontSize: size, lineHeight: 1.22, color: color ?? t.fg, ...style}}>
      {children}
    </Pop>
  );
};

export const Mono: React.FC<{size?: number; color?: string; at?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({size = 33, color, at = 0, style, children}) => {
  const t = useTheme();
  return (
    <Pop at={at} style={{fontFamily: t.mono, fontWeight: 500, fontSize: size, color: color ?? t.mute, ...style}}>
      {children}
    </Pop>
  );
};

/** the one-line explanation at the foot of a scene */
export const Caption: React.FC<{at?: number; children: React.ReactNode}> = ({at = 0.2, children}) => {
  const t = useTheme();
  return (
    <div style={{position: 'absolute', left: 105, right: 105, bottom: 81}}>
      <Pop at={at}>
        <div style={{fontFamily: t.body, fontWeight: 600, fontSize: 51, lineHeight: 1.2, color: t.fg, borderLeft: `9px solid ${t.accent}`, paddingLeft: 33}}>{children}</div>
      </Pop>
    </div>
  );
};

/** the scene's headline, top-left under the chrome */
export const Head: React.FC<{at?: number; size?: number; children: React.ReactNode}> = ({at = 0, size = 93, children}) => (
  <div style={{position: 'absolute', left: 105, top: 117, right: 180}}>
    <Display at={at} size={size}>
      {children}
    </Display>
  </div>
);

export const Chip: React.FC<{at?: number; hot?: boolean; ghost?: boolean; size?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({at = 0, hot, ghost, size = 36, style, children}) => {
  const t = useTheme();
  return (
    <Pop at={at} d={0.5} y={18} style={{display: 'inline-block', ...style}}>
      <div
        style={{
          fontFamily: t.mono,
          fontWeight: 600,
          fontSize: size,
          padding: '12px 24px',
          borderRadius: t.radius,
          border: `3px solid ${hot ? t.accent : rgba(t.fg, 0.35)}`,
          background: hot ? t.accent : ghost ? 'transparent' : t.panel,
          color: hot ? t.onAccent : t.fg,
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </div>
    </Pop>
  );
};

export const Panel: React.FC<{x: number; y: number; w: number; h?: number; at?: number; hot?: boolean; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, w, h, at = 0, hot, style, children}) => {
  const t = useTheme();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
      <Pop at={at} style={{height: '100%'}}>
        <div style={{height: '100%', boxSizing: 'border-box', background: hot ? rgba(t.accent, 0.14) : t.panel, border: `3px solid ${hot ? t.accent : rgba(t.fg, 0.2)}`, borderRadius: t.radius, padding: 33, ...style}}>{children}</div>
      </Pop>
    </div>
  );
};

/** a check mark that draws itself */
export const Tick: React.FC<{at: number; size?: number; color?: string}> = ({at, size = 51, color}) => {
  const t = useTheme();
  const p = lin(useSec(), at, 0.35);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{flex: 'none'}}>
      <path d="M3 12.5 L9.5 19 L21 5.5" fill="none" stroke={color ?? t.accent} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};

/** lines that pop in one by one, with a drawn check when `check` */
export const Lines: React.FC<{items: string[]; at?: number; step?: number; size?: number; check?: boolean; x?: number; y?: number; w?: number; gap?: number}> = ({items, at = 0, step = 0.6, size = 54, check, x = 105, y = 255, w = 1650, gap = 33}) => {
  const t = useTheme();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, display: 'flex', flexDirection: 'column', gap}}>
      {items.map((it, i) => (
        <Pop key={i} at={at + i * step} style={{display: 'flex', alignItems: 'center', gap: 30}}>
          {check ? <Tick at={at + i * step + 0.25} size={size} /> : <div style={{width: 21, height: 21, background: t.accent, borderRadius: t.radius > 6 ? 21 : 3, flex: 'none'}} />}
          <div style={{fontFamily: t.body, fontWeight: 600, fontSize: size, lineHeight: 1.15}}>{it}</div>
        </Pop>
      ))}
    </div>
  );
};

/** a number that counts up to its value, eased */
export const Count: React.FC<{to: number; at?: number; d?: number; size?: number; decimals?: number; prefix?: string; suffix?: string; color?: string; locale?: string}> = ({to, at = 0, d = 1.2, size = 180, decimals = 0, prefix = '', suffix = '', color, locale = 'en-US'}) => {
  const t = useTheme();
  const s = useSec();
  const v = to * ease(lin(s, at, d));
  const txt = v.toLocaleString(locale, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  return (
    <div style={{fontFamily: t.display, fontWeight: t.dispWeight, fontSize: size, lineHeight: 1, letterSpacing: t.dispLS, color: color ?? t.accent, fontVariantNumeric: 'tabular-nums', opacity: prog(s, at, 0.3)}}>
      {prefix}
      {txt}
      {suffix}
    </div>
  );
};

/** a row of big numbers, each over its label */
export const Numbers: React.FC<{items: {value: number; label: string; prefix?: string; suffix?: string; decimals?: number}[]; at?: number; y?: number; locale?: string}> = ({items, at = 0.2, y = 380, locale}) => {
  const t = useTheme();
  const colW = (W - 210) / items.length;
  return (
    <AbsoluteFill>
      {items.map((it, i) => (
        <div key={i} style={{position: 'absolute', left: 105 + i * colW, top: y, width: colW - 40}}>
          <Count to={it.value} at={at + i * 0.35} prefix={it.prefix} suffix={it.suffix} decimals={it.decimals} locale={locale} />
          <Mono at={at + i * 0.35 + 0.3} size={33} style={{marginTop: 18}}>
            {it.label}
          </Mono>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------- cards ----------
export const TitleCard: React.FC<{kicker?: string; name: string; why?: string; deco?: React.ReactNode}> = ({kicker, name, why, deco}) => {
  const t = useTheme();
  return (
    <AbsoluteFill>
      {deco}
      {kicker ? (
        <div style={{position: 'absolute', left: 120, top: 195}}>
          <Display at={0.1} size={300} color={t.accent} style={{lineHeight: 0.9}}>
            {kicker}
          </Display>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 120, top: kicker ? 600 : 380, right: 120}}>
        <Display at={0.5} size={138}>
          {name}
        </Display>
        {why ? (
          <Body at={1.1} size={54} color={t.mute} style={{marginTop: 39, maxWidth: 1500}}>
            {why}
          </Body>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const Divider: React.FC<{big: string; small?: string}> = ({big, small}) => {
  const t = useTheme();
  const p = prog(useSec(), 0.1, 0.8);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 375}}>
        <div style={{height: 9, width: 330 * p, background: t.accent, marginBottom: 45}} />
        <Display at={0.2} size={195}>
          {big}
        </Display>
        {small ? (
          <Body at={0.6} size={57} color={t.mute} style={{marginTop: 27}}>
            {small}
          </Body>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{big?: string; title: string; line?: string}> = ({big, title, line}) => {
  const t = useTheme();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: big ? 255 : 400}}>
        {big ? (
          <Display at={0.1} size={300} color={t.accent} style={{lineHeight: 0.9}}>
            {big}
          </Display>
        ) : null}
        <Display at={0.4} size={93} style={{marginTop: 24}}>
          {title}
        </Display>
        {line ? (
          <Body at={0.8} size={48} color={t.mute} style={{marginTop: 27}}>
            {line}
          </Body>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** a decision against its alternative: what was picked, what else was on the table, what each means */
export const DecisionCard: React.FC<{kicker: string; picked: {label: string; text: string; then?: string; thenLabel?: string}; other: {label: string; text: string; then?: string; thenLabel?: string}}> = ({kicker, picked, other}) => {
  const t = useTheme();
  const ap = lin(useSec(), 1.2, 0.6);
  const colW = 780;
  const L = 105;
  const R = W - 105 - colW;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: L, top: 126}}>
        <Mono at={0} size={33} color={t.accent}>
          {kicker}
        </Mono>
      </div>
      <Panel x={L} y={210} w={colW} h={375} at={0.2} hot>
        <Mono size={28} color={t.accent}>
          {picked.label}
        </Mono>
        <div style={{fontFamily: t.body, fontWeight: 700, fontSize: 57, lineHeight: 1.12, marginTop: 18}}>{picked.text}</div>
      </Panel>
      <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={`M ${L + colW + 30} 397 L ${R - 30} 397`} stroke={t.accent} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ap} />
        <polygon points={`${R - 30},397 ${R - 54},382 ${R - 54},412`} fill={t.accent} opacity={ap > 0.95 ? 1 : 0} />
      </svg>
      <Panel x={R} y={210} w={colW} h={375} at={1.0}>
        <Mono size={28}>{other.label}</Mono>
        <div style={{fontFamily: t.body, fontWeight: 600, fontSize: 54, lineHeight: 1.12, marginTop: 18, color: rgba(t.fg, 0.9)}}>{other.text}</div>
      </Panel>
      {picked.then ? (
        <div style={{position: 'absolute', left: L, top: 637, width: colW}}>
          <Mono at={1.8} size={28} color={t.accent}>
            {picked.thenLabel ?? ''}
          </Mono>
          <Body at={1.9} size={45} weight={600} style={{marginTop: 9}}>
            {picked.then}
          </Body>
        </div>
      ) : null}
      {other.then ? (
        <div style={{position: 'absolute', left: R, top: 637, width: colW}}>
          <Mono at={2.4} size={28}>
            {other.thenLabel ?? ''}
          </Mono>
          <Body at={2.5} size={45} weight={600} style={{marginTop: 9, color: rgba(t.fg, 0.85)}}>
            {other.then}
          </Body>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** numbered questions with the recommendation first: what someone must choose */
export type Choice = {n: number | string; title: string; rec: string; alt?: string};
export const choiceText = (c: Choice) => `${c.title} ${c.rec} ${c.alt ?? ''}`;
export const Choices: React.FC<{items: Choice[]; recLabel: string; altLabel?: string}> = ({items, recLabel, altLabel = ''}) => {
  const t = useTheme();
  const rowH = items.length === 1 ? 450 : items.length === 2 ? 360 : 285;
  let at = 0.2;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 105, right: 105, top: 138, display: 'flex', flexDirection: 'column', gap: 27}}>
        {items.map((it) => {
          const start = at;
          at += Math.max(1.5, (words(choiceText(it)) / 4) * 0.85);
          return (
            <Pop key={String(it.n)} at={start} style={{display: 'flex', gap: 39, alignItems: 'flex-start', minHeight: rowH - 27}}>
              <div style={{flex: 'none', width: 138, height: 138, borderRadius: t.radius > 20 ? 69 : t.radius, background: t.accent, color: t.onAccent, fontFamily: t.display, fontWeight: t.dispWeight, fontSize: 84, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{it.n}</div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: t.mono, fontWeight: 600, fontSize: 31, color: t.mute, textTransform: 'uppercase', letterSpacing: 1.5}}>{it.title}</div>
                <div style={{fontFamily: t.body, fontWeight: 700, fontSize: items.length > 2 ? 50 : 57, lineHeight: 1.14, marginTop: 9}}>
                  <span style={{color: t.accent}}>{recLabel} </span>
                  {it.rec}
                </div>
                {it.alt ? <div style={{fontFamily: t.body, fontWeight: 500, fontSize: items.length > 2 ? 39 : 45, lineHeight: 1.15, marginTop: 12, color: t.mute}}>{altLabel} {it.alt}</div> : null}
              </div>
            </Pop>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
