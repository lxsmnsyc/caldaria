import * as babel from '@babel/core';
import { Plugin } from 'esbuild';
import path from 'path';
import fs from 'fs/promises';

import solid from 'babel-preset-solid';
import ts from '@babel/preset-typescript';
import solidSFC from 'babel-plugin-solid-sfc';
import {
  createFileCache,
  FileCache,
  isFileDirty,
  readFileCache,
  writeFileCache,
} from './utils/file-cache';

interface SolidBabelOption {
  plugins: babel.PluginItem[];
  presets: babel.PluginItem[];
}

interface SolidOptions {
  dev: boolean;
  generate: 'dom' | 'ssr';
  babel: SolidBabelOption;
}

async function transform(
  file: string,
  options: SolidOptions,
  cache: FileCache,
) {
  if (isFileDirty(file)) {
    const source = await fs.readFile(file, 'utf-8');

    const result = await babel.transformAsync(source, {
      presets: [
        [solid, { generate: options.generate, hydratable: true }],
        [ts],
        ...options.babel.presets,
      ],
      plugins: [
        [solidSFC, { dev: options.dev }],
        ...options.babel.plugins,
      ],
      filename: path.basename(file),
      sourceMaps: 'inline',
    });

    if (result) {
      const contents = result.code ?? '';
      await writeFileCache(cache, file, contents);
      return contents;
    }
    throw new Error('[caldaria:solid] Babel Transform returned null.');
  }
  return readFileCache(cache, file);
}

export default function solidPlugin(options: SolidOptions): Plugin {
  const cache = createFileCache(`solid-${options.generate}`);
  return {
    name: 'caldaria:solid',

    setup(build) {
      build.onLoad({
        filter: /\.(t|j)sx$/,
      }, async (args) => ({
        contents: await transform(args.path, options, cache),
        loader: 'js',
      }));
    },
  };
}
