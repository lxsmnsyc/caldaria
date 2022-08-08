import * as babel from '@babel/core';
import { Plugin } from 'esbuild';
import path from 'path';
import fs from 'fs/promises';

import solid from 'babel-preset-solid';
import ts from '@babel/preset-typescript';
import solidSFC from 'babel-plugin-solid-sfc';
import IslandsHandler from './utils/islands-handler';

interface SolidBabelOption {
  plugins: babel.PluginItem[];
  presets: babel.PluginItem[];
}

interface IslandsOptions {
  dev: boolean;
  generate?: 'dom' | 'ssr';
  assets: string;
  babel: SolidBabelOption;
  onEntry?: (id: string, entry: string) => void;
}

async function transformIsland(
  filepath: string,
  options: IslandsOptions,
  handler: IslandsHandler,
) {
  const source = await fs.readFile(filepath, { encoding: 'utf-8' });

  const { name, ext } = path.parse(filepath);
  const filename = name + ext;

  const result = await babel.transformAsync(source, {
    presets: [
      [solid, { generate: options.generate, hydratable: true }],
      [ts],
      ...options.babel.presets,
    ],
    plugins: [
      ...handler.getPlugins(filepath),
      [solidSFC, { dev: options.dev }],
      ...options.babel.plugins,
    ],
    filename,
    sourceMaps: 'inline',
  });

  if (result) {
    return result.code ?? '';
  }
  throw new Error('[rigidity:islands] Babel Transform returned null.');
}

export default function islandsPlugin(options: IslandsOptions): Plugin {
  const handler = new IslandsHandler({
    onEntry: options.onEntry,
    assets: options.assets,
    generate: options.generate,
    prefix: 'solid',
    extension: '[tj]sx?',
  });

  return {
    name: 'rigidity:islands',

    setup(build) {
      build.onLoad({
        filter: /\.[tj]sx?$/,
      }, async (args) => ({
        contents: await transformIsland(args.path, options, handler),
        loader: 'js',
      }));
    },
  };
}
