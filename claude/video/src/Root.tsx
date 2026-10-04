import React from 'react';
import {Composition} from 'remotion';
import {Story} from './Video';
import {Launch} from './launch/Launch';
import {normalize, FPS} from './storyboard.mjs';
import example from '../examples/example.json';

// `story` renders the stage-review storyboards (render.sh). `launch` renders a
// `"mode": "launch"` storyboard at 16:9 (render-launch.sh). Every length comes from the storyboard passed as props.
const meta = ({props}: any) => {
  const {story} = normalize(props.story);
  return {durationInFrames: story.frames, props: {...props, normalized: story}};
};
const LaunchFilm: React.FC<{story: any; normalized?: any}> = ({normalized}) => {
  if (normalized.mode !== 'launch') throw new Error('the launch composition renders a storyboard with "mode": "launch"');
  return <Launch story={normalized} />;
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="story" component={Story} fps={FPS} width={1920} height={1080} durationInFrames={FPS * 10} defaultProps={{story: example as any}} calculateMetadata={meta} />
    <Composition id="launch" component={LaunchFilm} fps={FPS} width={1920} height={1080} durationInFrames={FPS * 10} defaultProps={{story: example as any}} calculateMetadata={meta} />
  </>
);
