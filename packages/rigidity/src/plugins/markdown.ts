import { Plugin } from 'esbuild';

export default function markdownPlugin(): Plugin {
  return {
    name: 'rigidity:markdown',
    async setup(build) {
      const path = await import('path');
      const fs = await import('fs/promises');
      const marked = await import('solid-marked');

      build.onResolve({
        filter: /\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)$/,
      }, (args) => ({
        path: path.join(args.resolveDir, args.path),
        namespace: 'markdown',
      }));

      build.onLoad({
        filter: /.*/,
        namespace: 'markdown',
      }, async (args) => {
        const file = await fs.readFile(args.path, 'utf-8');
        const result = await marked.compile(args.path, file);
        return {
          contents: result.code,
          resolveDir: path.dirname(args.path),
          loader: 'jsx',
        };
      });
    },
  };
}
