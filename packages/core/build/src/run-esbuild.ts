import {
  build,
  Plugin,
} from 'esbuild';
import {
  BuildContext,
  BuildOptions,
  ASSETS_URL,
} from 'rigidity-shared';
import resolveTSConfig from './resolve-tsconfig';
import solidPlugin from './plugins/solid';
import postcssPlugin from './plugins/postcss';
import rawPlugin from './plugins/raw';
import urlPlugin from './plugins/url';
import markdownPlugin from './plugins/markdown';
import islandsPlugin from './plugins/islands';
import progressPlugin from './plugins/progress';
import lessPlugin from './plugins/less';
import sassPlugin from './plugins/sass';
import stylusPlugin from './plugins/stylus';

interface BuildInput {
  prefix: string;
  entrypoints: string[],
  outputDirectory: string;
  onEntry?: (id: string, entry: string) => void,
  incremental?: boolean;
}

export default function runESBuild(
  input: BuildInput,
  context: BuildContext,
  options: BuildOptions,
) {
  const esbuildConfig = typeof options.esbuild === 'function'
    ? options.esbuild(context)
    : options.esbuild;
  const babelPluginsConfig = typeof options.babel?.plugins === 'function'
    ? options.babel.plugins(context)
    : options.babel?.plugins;
  const babelPresetsConfig = typeof options.babel?.presets === 'function'
    ? options.babel.presets(context)
    : options.babel?.presets;

  const initialPlugins: Plugin[] = [
    progressPlugin({
      prefix: input.prefix,
    }),
    postcssPlugin({
      dev: context.isDev,
    }),
    lessPlugin({
      dev: context.isDev,
    }),
    sassPlugin({
      dev: context.isDev,
    }),
    stylusPlugin({
      dev: context.isDev,
    }),
    rawPlugin(),
    urlPlugin(),
  ];

  if (options.mode?.type === 'islands' && context.isServer) {
    initialPlugins.push(
      islandsPlugin({
        generate: context.isServer ? 'ssr' : 'dom',
        babel: {
          plugins: babelPluginsConfig ?? [],
          presets: babelPresetsConfig ?? [],
        },
        dev: context.isDev,
        assets: options.paths?.assets ?? ASSETS_URL,
        onEntry: input.onEntry,
      }),
    );
  } else {
    initialPlugins.push(
      solidPlugin({
        generate: context.isServer ? 'ssr' : 'dom',
        babel: {
          plugins: babelPluginsConfig ?? [],
          presets: babelPresetsConfig ?? [],
        },
        dev: context.isDev,
      }),
      markdownPlugin({
        generate: context.isServer ? 'ssr' : 'dom',
        babel: {
          plugins: babelPluginsConfig ?? [],
          presets: babelPresetsConfig ?? [],
        },
        dev: context.isDev,
      }),
    );
  }

  return build({
    entryPoints: input.entrypoints,
    outdir: input.outputDirectory,
    bundle: true,
    minify: !context.isDev,
    sourcemap: context.isDev,
    format: context.isServer ? 'cjs' : 'esm',
    platform: context.isServer ? 'node' : 'browser',
    splitting: !context.isServer,
    target: esbuildConfig?.target,
    allowOverwrite: true,
    define: {
      ...(esbuildConfig?.define ?? {}),
      'process.env.NODE_ENV': JSON.stringify(context.isDev ? 'development' : 'production'),
      'import.meta.env.MODE': JSON.stringify(context.isDev ? 'development' : 'production'),
      'import.meta.env.DEV': JSON.stringify(context.isDev),
      'import.meta.env.PROD': JSON.stringify(!context.isDev),
    },
    publicPath: `${options.paths?.cdn ?? ''}/${options.paths?.assets ?? ASSETS_URL}`,
    conditions: [
      'solid',
      context.isDev && !context.isServer ? 'development' : 'production',
    ],
    jsx: 'preserve',
    plugins: [
      ...initialPlugins,
      ...(esbuildConfig?.plugins ?? []),
    ],
    external: esbuildConfig?.external,
    tsconfig: resolveTSConfig(esbuildConfig?.tsconfig),
    legalComments: 'none',
    incremental: input.incremental,
  });
}
