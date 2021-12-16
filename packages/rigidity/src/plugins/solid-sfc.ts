import { Plugin } from 'esbuild';
import { TransformOptions } from 'solid-sfc';

export interface Options extends Omit<TransformOptions, 'filename' | 'sourcemap'> {
  //
}

export default function solidSFCPlugin(options?: Options): Plugin {
  return {
    name: 'rigidity:solid-sfc',
    async setup(build) {
      const path = await import('path');
      const fs = await import('fs/promises');
      const solidSFC = (await import('solid-sfc')).default;

      build.onResolve({ filter: /.solid$/ }, (args) => ({
        namespace: 'solid-sfc',
        path: path.join(args.resolveDir, args.path),
      }));

      build.onLoad({ filter: /.*/, namespace: 'solid-sfc' }, async (args) => {
        const result = await solidSFC(await fs.readFile(args.path, { encoding: 'utf-8' }), {
          filename: args.path,
          target: options?.target,
          babel: options?.babel,
          dev: options?.dev,
          sourcemap: options?.dev ? 'inline' : false,
        });
        return {
          resolveDir: path.dirname(args.path),
          contents: result.code,
          loader: options?.target === 'preserve' ? 'jsx' : 'js',
        };
      });
    },
  };
}
