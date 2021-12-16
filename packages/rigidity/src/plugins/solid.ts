import {
  Plugin,
} from 'esbuild';
import {
  PluginItem,
} from '@babel/core';

interface SolidBabelOption {
  plugins: PluginItem[];
  presets: PluginItem[];
}

interface SolidOptions {
  dev: boolean;
  generate?: 'dom' | 'ssr';
  babel: SolidBabelOption;
}

export default function solidPlugin(options: SolidOptions): Plugin {
  return {
    name: 'rigidity:solid',

    async setup(build) {
      const path = await import('path');
      const fs = await import('fs/promises');

      const babel = await import('@babel/core');

      const solid = (await import('babel-preset-solid')).default;
      const ts = (await import('@babel/preset-typescript')).default;
      const solidLabels = (await import('babel-plugin-solid-labels')).default;

      build.onLoad({ filter: /\.(t|j)sx$/ }, async (args) => {
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
            [solidLabels, { dev: options.dev }],
            ...options.babel.plugins,
          ],
          filename,
          sourceMaps: 'inline',
        });

        if (result) {
          return { contents: result.code ?? '', loader: 'js' };
        }
        throw new Error('[esbuild:solid] Babel Transform returned null.');
      });
    },
  };
}
