import {
  Plugin,
} from 'esbuild';

export default function rawPlugin(): Plugin {
  return {
    name: 'esbuild:raw',

    async setup(build) {
      const path = await import('path');
      const fs = await import('fs/promises');
      build.onResolve({ filter: /\?raw$/ }, (args) => ({
        path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
        namespace: 'raw',
      }));
      build.onLoad({ filter: /.*/, namespace: 'raw' }, async (args) => {
        const text = await fs.readFile(args.path, 'utf8');
        return {
          contents: text,
          loader: 'text',
        };
      });
    },
  };
}
