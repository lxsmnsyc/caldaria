import * as babel from '@babel/core';
import { Plugin } from 'esbuild';
import path from 'path';
import fs from 'fs/promises';
import * as marked from 'solid-marked';

import solid from 'babel-preset-solid';
import ts from '@babel/preset-typescript';
import solidSFC from 'babel-plugin-solid-sfc';

interface MarkdownBabelOption {
  plugins: babel.PluginItem[];
  presets: babel.PluginItem[];
}

interface MarkdownOptions {
  dev: boolean;
  generate?: 'dom' | 'ssr';
  babel: MarkdownBabelOption;
}

async function transform(
  filepath: string,
  options: MarkdownOptions,
) {
  const file = await fs.readFile(filepath, 'utf-8');

  const markdownResult = await marked.compile('rigidity/root', filepath, file);

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
    filename: filepath,
    sourceMaps: 'inline',
    inputSourceMap: markdownResult.map,
  });

  if (babelResult) {
    return babelResult.code ?? '';
  }
  throw new Error('[rigidity:markdown] Babel Transform returned null.');
}

export default function markdownPlugin(options: MarkdownOptions): Plugin {
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
      }, async (args) => ({
        contents: await transform(args.path, options),
        resolveDir: path.dirname(args.path),
        loader: 'jsx',
      }));
    },
  };
}
