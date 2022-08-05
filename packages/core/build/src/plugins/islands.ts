import * as babel from '@babel/core';
import { Plugin } from 'esbuild';
import path from 'path';
import fs from 'fs/promises';

import islands from 'rigidity-islands/babel';
import solid from 'babel-preset-solid';
import ts from '@babel/preset-typescript';
import solidSFC from 'babel-plugin-solid-sfc';

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
  const entries = new Map<string, string>();
  const filenames = new Map<string, string>();

  function createEntry(entry: string): string {
    const result = entries.get(entry);
    if (result) {
      return result;
    }
    const id = `${entries.size}`;
    entries.set(entry, id);
    options.onEntry?.(id, entry);
    return id;
  }

  function getFilename(pth: string) {
    const filename = filenames.get(pth);

    if (filename) {
      return filename;
    }

    const entry = createEntry(pth);
    const newFilename = `/${options.assets}/${entry}.js`;
    filenames.set(pth, newFilename);
    return newFilename;
  }

  function getInitialPlugins(
    pth: string,
  ) {
    if (options.generate !== 'ssr') {
      return [];
    }
    if (/\.client\.[tj]sx?$/.test(pth)) {
      return [[islands, { source: getFilename(pth) }]];
    }
    return [[islands]];
  }

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
            ...getInitialPlugins(args.path),
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
