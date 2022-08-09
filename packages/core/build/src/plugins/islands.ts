import * as babel from '@babel/core';
import { Plugin } from 'esbuild';
import path from 'path';
import fs from 'fs/promises';

import solid from 'babel-preset-solid';
import ts from '@babel/preset-typescript';
import solidSFC from 'babel-plugin-solid-sfc';
import IslandsHandler from './utils/islands-handler';
import {
  registerDependencyMarker,
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

interface IslandsOptions {
  dev: boolean;
  generate: 'dom' | 'ssr';
  assets: string;
  babel: SolidBabelOption;
  onEntry?: (id: string, entry: string) => void;
}

async function transformIsland(
  file: string,
  options: IslandsOptions,
  handler: IslandsHandler,
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
        ...handler.getPlugins(file),
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
    throw new Error('[rigidity:islands] Babel Transform returned null.');
  }
  return readFileCache(cache, file);
}

export default function islandsPlugin(options: IslandsOptions): Plugin {
  const handler = new IslandsHandler({
    onEntry: options.onEntry,
    assets: options.assets,
    generate: options.generate,
    prefix: 'solid',
    extension: '[tj]sx',
  });

  const cache = createFileCache(`islands-${options.generate}`);

  return {
    name: 'rigidity:islands',

    setup(build) {
      registerDependencyMarker(build, /\.[tj]sx$/);

      build.onLoad({
        filter: /\.[tj]sx$/,
      }, async (args) => ({
        contents: await transformIsland(args.path, options, handler, cache),
        loader: 'js',
      }));
    },
  };
}
