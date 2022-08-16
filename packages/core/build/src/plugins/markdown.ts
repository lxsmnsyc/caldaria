import * as babel from '@babel/core';
import { Plugin } from 'esbuild';
import path from 'path';
import fs from 'fs/promises';
import * as marked from 'solid-marked';

import islands from 'caldaria-islands/babel';
import solid from 'babel-preset-solid';
import ts from '@babel/preset-typescript';
import solidSFC from 'babel-plugin-solid-sfc';
import {
  createFileCache,
  FileCache,
  isFileDirty,
  readFileCache,
  registerDependencyMarker,
  writeFileCache,
} from './utils/file-cache';

interface MarkdownBabelOption {
  plugins: babel.PluginItem[];
  presets: babel.PluginItem[];
}

interface MarkdownOptions {
  dev: boolean;
  generate: 'dom' | 'ssr';
  babel: MarkdownBabelOption;
  islands: boolean;
}

async function transform(
  file: string,
  options: MarkdownOptions,
  cache: FileCache,
) {
  if (isFileDirty(file)) {
    const source = await fs.readFile(file, 'utf-8');

    const markdownResult = await marked.compile('caldaria/root', file, source, {
      noDynamicComponents: 'only-mdx',
    });

    const babelResult = await babel.transformAsync(markdownResult.code, {
      presets: [
        [solid, { generate: options.generate, hydratable: true }],
        [ts],
        ...options.babel.presets,
      ],
      plugins: [
        ...(options.islands ? [[islands]] : []),
        [solidSFC, { dev: options.dev }],
        ...options.babel.plugins,
      ],
      filename: path.basename(file),
      sourceMaps: 'inline',
      inputSourceMap: markdownResult.map,
    });

    if (babelResult) {
      const contents = babelResult.code ?? '';
      await writeFileCache(cache, file, contents);
      return contents;
    }
    throw new Error('[caldaria:markdown] Babel Transform returned null.');
  }
  return readFileCache(cache, file);
}

export default function markdownPlugin(options: MarkdownOptions): Plugin {
  const cache = createFileCache(`markdown-${options.generate}`);

  return {
    name: 'caldaria:markdown',
    setup(build) {
      registerDependencyMarker(build, /\.(md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron)$/);

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
        contents: await transform(args.path, options, cache),
        resolveDir: path.dirname(args.path),
        loader: 'jsx',
      }));
    },
  };
}
