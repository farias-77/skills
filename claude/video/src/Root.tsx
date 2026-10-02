import React from 'react';
import {Composition} from 'remotion';
import {Story} from './Video';
import {normalize, FPS} from './storyboard.mjs';
import example from '../examples/example.json';

// One composition. Its length comes from the storyboard passed as props
// (render.sh passes --props=<run>/props.json); the Studio opens the example.
export const RemotionRoot: React.FC = () => (
  <Composition
    id="story"
    component={Story}
    fps={FPS}
    width={1920}
    height={1080}
    durationInFrames={FPS * 10}
    defaultProps={{story: example as any}}
    calculateMetadata={({props}) => {
      const {story} = normalize(props.story);
      return {durationInFrames: story.frames, props: {...props, normalized: story}};
    }}
  />
);
