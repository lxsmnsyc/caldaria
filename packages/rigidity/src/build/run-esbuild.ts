import {
  BuildOptions as ESBuildOption,
  BuildResult,
} from 'esbuild';
import resolveTSConfig from './resolve-tsconfig';
import {
  BuildContext,
  BuildOptions,
} from '../types';
import {
  ASSETS_URL,
} from '../constants';
import solidPlugin from '../plugins/solid';
import solidSFCPlugin from '../plugins/solid-sfc';
import postcssPlugin, { RecurseBuild } from '../plugins/postcss';
import rawPlugin from '../plugins/raw';
import urlPlugin from '../plugins/url';
import markdownPlugin from '../plugins/markdown';

function createOption(opt: ESBuildOption): ESBuildOption {
  return opt;
}

export default async function runESBuild(
  input: RecurseBuild,
  context: BuildContext,
  options: BuildOptions,
): Promise<BuildResult> {
  const esbuild = await import('esbuild');

  const esbuildConfig = typeof options.esbuild === 'function'
    ? options.esbuild(context)
    : options.esbuild;
  const babelPluginsConfig = typeof options.babel?.plugins === 'function'
    ? options.babel.plugins(context)
    : options.babel?.plugins;
  const babelPresetsConfig = typeof options.babel?.presets === 'function'
    ? options.babel.presets(context)
    : options.babel?.presets;

  const entry = input.recurse
    ? createOption({
      stdin: {
        contents: input.content,
        resolveDir: input.sourceDirectory,
        loader: 'css',
        sourcefile: input.filename,
      },
    })
    : createOption({
      entryPoints: [
        input.content,
      ],
    });

  let sourcemap: ESBuildOption['sourcemap'];

  if (context.isDev) {
    if (input.recurse) {
      sourcemap = 'inline';
    } else {
      sourcemap = true;
    }
  }

  return esbuild.build({
    ...entry,
    outdir: input.outputDirectory,
    bundle: true,
    minify: !context.isDev,
    sourcemap,
    format: context.isServer ? 'cjs' : 'esm',
    platform: context.isServer ? 'node' : 'browser',
    splitting: !context.isServer,
    target: esbuildConfig?.target,
    allowOverwrite: true,
    define: {
      ...(esbuildConfig?.define ?? {}),
      'process.env.NODE_ENV': JSON.stringify(context.isDev ? 'development' : 'production'),
    },
    publicPath: `${options.paths?.cdn ?? ''}/${options.paths?.assets ?? ASSETS_URL}`,
    conditions: [
      'solid',
      context.isDev && !context.isServer ? 'development' : 'production',
    ],
    plugins: [
      solidSFCPlugin({
        target: context.isServer ? 'ssr' : 'dom',
        hydratable: true,
        dev: context.isDev,
        babel: {
          plugins: babelPluginsConfig ?? [],
          presets: babelPresetsConfig ?? [],
        },
      }),
      solidPlugin({
        generate: context.isServer ? 'ssr' : 'dom',
        babel: {
          plugins: babelPluginsConfig ?? [],
          presets: babelPresetsConfig ?? [],
        },
        dev: context.isDev,
      }),
      postcssPlugin({
        dev: context.isDev,
        artifactDirectory: input.outputDirectory,
        recurseBuild(opts) {
          return runESBuild(opts, context, options);
        },
      }),
      rawPlugin(),
      urlPlugin(),
      markdownPlugin(),
      ...(esbuildConfig?.plugins ?? []),
    ],
    external: esbuildConfig?.external,
    tsconfig: await resolveTSConfig(esbuildConfig?.tsconfig),
    legalComments: 'none',
  });
}
