import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, Bands, Badge, Cite, SceneFade, RoughFilter} from './look';
import {SCENES} from './scenes';

// `story` is the normalized storyboard (see storyboard.mjs): every scene
// carries its length in frames.
export const Story: React.FC<{story: any; normalized?: any}> = ({normalized}) => {
  const story = normalized;
  const starts: number[] = [];
  let t = 0;
  for (const s of story.scenes) {
    starts.push(t);
    t += s.frames;
  }
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <RoughFilter />
      {story.scenes.map((s: any, i: number) => {
        const Comp = SCENES[s.type];
        const dark = s.type === 'end';
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={s.frames} name={`${i} ${s.type}`}>
            <SceneFade len={s.frames} dark={dark}>
              <Comp s={s} len={s.frames} />
              <Badge text={s.badge} />
              <Cite text={s.cite} dark={dark} />
            </SceneFade>
          </Sequence>
        );
      })}
      <Bands cuts={starts.slice(1)} stamp={story.stamp} />
    </AbsoluteFill>
  );
};
