import {
  Plugin,
} from 'esbuild';
import { log, green } from 'rigidity-shared';

function getTime(base: [number, number]) {
  const result = process.hrtime(base);
  return (result[0] * 1000000000 + result[1]) / 1000000;
}

interface ProgressPluginOptions {
  prefix: string;
}

export default function progressPlugin(options: ProgressPluginOptions): Plugin {
  let top = true;
  return {
    name: 'rigidity:progress',
    setup(build) {
      let end: [number, number] | undefined;
      build.onStart(() => {
        if (top) {
          end = process.hrtime();
          top = false;
          log(options.prefix, 'Build started.');
        }
      });
      build.onEnd(() => {
        if (end) {
          top = true;
          log(options.prefix, `Built in ${green(`${getTime(end).toFixed(3)}ms`)}.`);
        }
      });
    },
  };
}
