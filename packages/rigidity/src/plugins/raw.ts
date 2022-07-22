import {
  Plugin,
} from 'esbuild';
import path from 'path';
import fs from 'fs/promises';

export default function rawPlugin(): Plugin {
  return {
    name: 'rigidity:raw',

    setup(build) {
      build.onResolve({
        filter: /\?raw$/,
      }, (args) => ({
        path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
        namespace: 'raw',
      }));
      build.onLoad({
        filter: /.*/,
        namespace: 'raw',
      }, async (args) => {
        const text = await fs.readFile(args.path, 'utf8');
        return {
          contents: text,
          loader: 'text',
        };
      });
    },
  };
}
