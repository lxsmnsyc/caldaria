import * as babel from '@babel/core';
import { Plugin } from 'esbuild';
import path from 'path';
import fs from 'fs/promises';
import * as marked from 'solid-marked';

import solid from 'babel-preset-solid';
import ts from '@babel/preset-typescript';
import solidSFC from 'babel-plugin-solid-sfc';

interface SolidBabelOption {
  plugins: babel.PluginItem[];
  presets: babel.PluginItem[];
}

interface SolidOptions {
  dev: boolean;
  generate?: 'dom' | 'ssr';
  babel: SolidBabelOption;
}

export default function markdownPlugin(options: SolidOptions): Plugin {
  return {
    name: 'rigidity:markdown',
    setup(build) {
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
        const markdownResult = await marked.compile('rigidity/root', args.path, file);

        const babelResult = await babel.transformAsync(markdownResult.code, {
          presets: [
            [solid, { generate: options.generate, hydratable: true }],
            [ts],
            ...options.babel.presets,
          ],
          plugins: [
            [solidSFC, { dev: options.dev }],
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
