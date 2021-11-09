import {
  BuildResult,
} from 'esbuild';
import resolveTSConfig from './resolve-tsconfig';
import {
  BuildContext,
  BuildOptions,
} from '../types';
import {
  STATIC_PATH,
} from '../constants';

export default async function runESBuild(
  artifact: string,
  outputDirectory: string,
  context: BuildContext,
  options: BuildOptions,
  enablePostCSS = true,
): Promise<BuildResult> {
  const path = await import('path');
  const esbuild = await import('esbuild');
  const solidPlugin = (await import('../plugins/solid')).default;
  const rawPlugin = (await import('../plugins/raw')).default;
  const urlPlugin = (await import('../plugins/url')).default;
  const postcssPlugin = (await import('../plugins/postcss')).default;

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
    format: context.isServer ? 'cjs' : 'esm',
    platform: context.isServer ? 'node' : 'browser',
    splitting: !context.isServer,
    target: esbuildConfig?.target,
    write: false,
    allowOverwrite: true,
    define: {
      ...(esbuildConfig?.define ?? {}),
      'process.env.NODE_ENV': JSON.stringify(context.isDev ? 'development' : 'production'),
    },
    publicPath: `/${STATIC_PATH}`,
    conditions: [
      'solid',
      // context.isDev ? 'development' : 'production',
    ],
    plugins: [
      solidPlugin({
        generate: context.isServer ? 'ssr' : 'dom',
        babel: {
          plugins: babelPluginsConfig ?? [],
          presets: babelPresetsConfig ?? [],
        },
        dev: context.isDev,
      }),
      ...(
        enablePostCSS
          ? [
            postcssPlugin({
              dev: context.isDev,
              artifactDirectory: path.dirname(artifact),
              recurseBuild(source, directory) {
                return runESBuild(source, directory, context, options, false);
              },
            }),
          ]
          : []
      ),
      rawPlugin(),
      urlPlugin(),
      ...(esbuildConfig?.plugins ?? []),
    ],
    external: esbuildConfig?.external,
    tsconfig: await resolveTSConfig(esbuildConfig?.tsconfig),
    legalComments: 'none',
  });
}
