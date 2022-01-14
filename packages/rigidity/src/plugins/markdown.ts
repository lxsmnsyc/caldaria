import { PluginItem } from '@babel/core';
import { Plugin } from 'esbuild';

interface SolidBabelOption {
  plugins: PluginItem[];
  presets: PluginItem[];
}

interface SolidOptions {
  dev: boolean;
  generate?: 'dom' | 'ssr';
  babel: SolidBabelOption;
}

export default function markdownPlugin(options: SolidOptions): Plugin {
  return {
    name: 'rigidity:markdown',
    async setup(build) {
      const path = await import('path');
      const fs = await import('fs/promises');
      const marked = await import('solid-marked');

      const babel = await import('@babel/core');

      const solid = (await import('babel-preset-solid')).default;
      const ts = (await import('@babel/preset-typescript')).default;
      const solidLabels = (await import('babel-plugin-solid-labels')).default;

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
        const markdownResult = await marked.compile('rigidity', args.path, file);

        const babelResult = await babel.transformAsync(markdownResult.code, {
          presets: [
            [solid, { generate: options.generate, hydratable: true }],
            [ts],
            ...options.babel.presets,
          ],
          plugins: [
            [solidLabels, { dev: options.dev }],
            ...options.babel.plugins,
          ],
          filename: args.path,
          sourceMaps: 'inline',
          inputSourceMap: markdownResult.map,
        });

        return {
          contents: babelResult?.code ?? '',
          resolveDir: path.dirname(args.path),
          loader: 'jsx',
        };
      });
    },
  };
}
