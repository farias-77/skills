import {Config} from '@remotion/cli/config';
// The machine is shared: render.sh also passes --concurrency=2 and runs under nice.
Config.setVideoImageFormat('jpeg');
Config.setConcurrency(2);
