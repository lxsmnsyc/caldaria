import { Plugin } from 'esbuild';

export default function rawPlugin(): Plugin {
  return {
    name: 'esbuild:raw',

    setup(build) {
      build.onResolve({ filter: /\?raw$/ }, async (args) => {
        const path = await import('path');
        return {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
          namespace: 'raw',
        };
      });
      build.onLoad({ filter: /.*/, namespace: 'raw' }, async (args) => {
        const fs = await import('fs/promises');
        const text = await fs.readFile(args.path, 'utf8');
        return {
          contents: text,
          loader: 'text',
        };
      });
    },
  };
}
