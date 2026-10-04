// The launch film: the stage, the scenes in order, the music bed, at 16:9;
// every scene lays itself out from useGrid().
import React from 'react';
import {AbsoluteFill, Sequence, Audio, staticFile, interpolate} from 'remotion';
import {Stage} from './look';
import {FootageScene} from './Footage';
import {HeroScene} from './Hero';
import {ChapterScene, StatementScene, NumbersScene, EndScene} from './cards';

const SCENES: Record<string, React.FC<any>> = {
  hero3d: HeroScene,
  chapter: ChapterScene,
  screen: FootageScene,
  step: FootageScene,
  statement: StatementScene,
  numbers: NumbersScene,
  end: EndScene,
};

export const Launch: React.FC<{story: any}> = ({story}) => {
  const starts: number[] = [];
  let t = 0;
  for (const s of story.scenes) {
    starts.push(t);
    t += s.frames;
  }
  const total = t;
  // the bed sits back under the tutorial, where the eye is reading
  const tutorial = story.scenes.map((s: any) => s.type === 'step');
  const music = story.music;
  const volume = (f: number) => {
    if (!music) return 0;
    let i = starts.length - 1;
    while (i > 0 && starts[i] > f) i--;
    const under = tutorial[i] ? 0.72 : 1;
    const fadeIn = interpolate(f, [0, 30], [0, 1], {extrapolateRight: 'clamp'});
    const fadeOut = interpolate(f, [total - 60, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return music.volume * under * fadeIn * fadeOut;
  };
  return (
    <AbsoluteFill>
      <Stage accent={story.accent} />
      {story.scenes.map((s: any, i: number) => {
        const Comp = SCENES[s.type];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={s.frames} name={`${i} ${s.type}`}>
            <Comp s={s} len={s.frames} story={story} next={story.scenes[i + 1]} />
          </Sequence>
        );
      })}
      {music ? <Audio src={staticFile(music.src)} volume={volume} /> : null}
    </AbsoluteFill>
  );
};
