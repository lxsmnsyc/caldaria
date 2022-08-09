import {
  Plugin,
} from 'esbuild';
import fs from 'fs/promises';
import { resolvePath } from './utils/file-cache';

export default function rawPlugin(): Plugin {
  return {
    name: 'rigidity:raw',

    setup(build) {
      build.onResolve({
        filter: /\?raw$/,
      }, (args) => ({
        path: resolvePath(args),
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
