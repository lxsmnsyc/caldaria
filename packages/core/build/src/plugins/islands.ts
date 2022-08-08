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
      }, async (args) => {
        const source = await fs.readFile(args.path, { encoding: 'utf-8' });

        const { name, ext } = path.parse(args.path);
        const filename = name + ext;

        const result = await babel.transformAsync(source, {
          presets: [
            [solid, { generate: options.generate, hydratable: true }],
            [ts],
            ...options.babel.presets,
          ],
          plugins: [
            ...handler.getPlugins(args.path),
            [solidSFC, { dev: options.dev }],
            ...options.babel.plugins,
          ],
          filename,
          sourceMaps: 'inline',
        });

        if (result) {
          return { contents: result.code ?? '', loader: 'js' };
        }
        throw new Error('[rigidity:islands] Babel Transform returned null.');
      });
    },
  };
}
