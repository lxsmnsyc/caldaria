import * as babel from '@babel/core';
import { Plugin } from 'esbuild';
import path from 'path';
import fs from 'fs/promises';

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

async function transform(
  filepath: string,
  options: SolidOptions,
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
      [solidSFC, { dev: options.dev }],
      ...options.babel.plugins,
    ],
    filename,
    sourceMaps: 'inline',
  });

  if (result) {
    return result.code ?? '';
  }
  throw new Error('[rigidity:solid] Babel Transform returned null.');
}

export default function solidPlugin(options: SolidOptions): Plugin {
  return {
    name: 'rigidity:solid',

    setup(build) {
      build.onLoad({
        filter: /\.(t|j)sx$/,
      }, async (args) => ({
        contents: await transform(args.path, options),
        loader: 'js',
      }));
    },
  };
}
