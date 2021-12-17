import { Plugin } from 'esbuild';

async function compile(code: string): Promise<string> {
  const fromMarkdown = (await import('mdast-util-from-markdown'));
}

export default function remarkPlugin(): Plugin {
  return {
    name: 'rigidity:markdown',
    async setup(build) {
      const path = await import('path');
      const fs = await import('fs-extra');

      build.onResolve({
        filter: /\.(markdown|mdown|mkdn|mkd|md)$/,
      }, (args) => ({
        path: path.join(args.resolveDir, args.path),
        namespace: 'markdown',
      }));

      build.onLoad({
        filter: /.*/,
        namespace: 'markdown',
      }, async (args) => ({
        contents: await compile(await fs.readFile(args.path, 'utf-8')),
        resolveDir: path.dirname(args.path),
        loader: 'jsx',
      }));
    },
  };
}
