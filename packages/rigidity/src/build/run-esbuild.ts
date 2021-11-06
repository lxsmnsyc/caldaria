import { BuildResult } from 'esbuild';
import resolveTSConfig from './resolve-tsconfig';
import { BuildContext, BuildOptions } from '../types';
import readPackage from './read-package';

export default async function runESBuild(
  artifact: string,
  outputDirectory: string,
  context: BuildContext,
  options: BuildOptions,
): Promise<BuildResult> {
  const esbuild = await import('esbuild');
  const solidPlugin = (await import('../plugins/solid')).default;
  const pkg = await readPackage();

  const esbuildConfig = typeof options.esbuild === 'function'
    ? options.esbuild(context)
    : options.esbuild;
  const babelPluginsConfig = typeof options.babel?.plugins === 'function'
    ? options.babel.plugins(context)
    : options.babel?.plugins;
  const babelPresetsConfig = typeof options.babel?.presets === 'function'
    ? options.babel.presets(context)
    : options.babel?.presets;

  return esbuild.build({
    entryPoints: [
      artifact,
    ],
    outdir: outputDirectory,
    bundle: true,
    minify: !context.isDev,
    sourcemap: context.isDev,
    format: !context.isServer || pkg.type === 'module' ? 'esm' : 'cjs',
    platform: context.isServer ? 'node' : 'browser',
    splitting: !context.isServer,
    target: esbuildConfig?.target,
    define: {
      ...(esbuildConfig?.define ?? {}),
      'process.env.NODE_ENV': JSON.stringify(context.isDev ? 'development' : 'production'),
      RIGIDITY_SERVER: JSON.stringify(context.isServer || null),
    },
    conditions: ['solid'],
    plugins: [
      solidPlugin({
        generate: context.isServer ? 'ssr' : 'dom',
        babel: {
          plugins: babelPluginsConfig ?? [],
          presets: babelPresetsConfig ?? [],
        },
        dev: context.isDev,
      }),
      ...(esbuildConfig?.plugins ?? []),
    ],
    external: esbuildConfig?.external,
    tsconfig: await resolveTSConfig(esbuildConfig?.tsconfig),
    legalComments: 'none',
  });
}
