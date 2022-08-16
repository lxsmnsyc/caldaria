import {
  Plugin,
  PluginBuild,
} from 'esbuild';
import path from 'path';
import { forEach, log, red } from 'caldaria-shared';
import createLazyCSS from './utils/create-lazy-css';
import createStyleId from './utils/create-style-id';
import forkToCSSInJS from './utils/fork-to-css-in-js';
import buildCSSEntrypoint from './utils/build-css-entrypoint';
import createInlineSourceMap from './utils/create-inline-source-map';
import {
  addDependency,
  createFileCache,
  FileCache,
  isFileDirty,
  markCleanFile,
  readFileCache,
  registerDependencyMarker,
  resolvePath,
  writeFileCache,
} from './utils/file-cache';

async function importSass() {
  try {
    return (await import('sass')).default;
  } catch (err) {
    log('sass', red('You need to install `sass` before using!'));
    throw err;
  }
}

interface SassPluginOptions {
  dev?: boolean;
}

async function processSass(
  file: string,
  options: SassPluginOptions,
  build: PluginBuild,
  cache: FileCache,
): Promise<string> {
  if (isFileDirty(file)) {
    const sass = await importSass();

    const { css, sourceMap, loadedUrls } = await sass.compileAsync(file, {
      sourceMap: options.dev,
      sourceMapIncludeSources: true,
    });

    for (const url of loadedUrls) {
      const target = url.pathname.substring(1);
      addDependency(file, target);
      markCleanFile(target);
    }

    // TODO Fix urls
    if (sourceMap) {
      const { sources } = sourceMap;
      forEach(sources, (item, index) => {
        const url = new URL(item, 'file://');
        const actualPath = url.pathname.substring(1);
        sources[index] = path.relative(path.dirname(file), actualPath);
      });
    }

    const contents = await buildCSSEntrypoint(
      build,
      file,
      createInlineSourceMap(css, sourceMap, options.dev),
    );

    await writeFileCache(cache, file, contents);

    return contents;
  }
  return readFileCache(cache, file);
}

export default function sassPlugin(options: SassPluginOptions): Plugin {
  const cache = createFileCache('sass');
  return {
    name: 'caldaria:sass',
    setup(build) {
      const getStyleID = createStyleId('sass');

      registerDependencyMarker(build, /\.s[ac]ss(\?(raw|url))?/);

      build.onResolve({
        filter: /\.s[ac]ss\?raw$/,
      }, (args) => (
        forkToCSSInJS('sass-vanilla', args.kind, {
          path: resolvePath(args),
          namespace: 'sass-raw',
        })
      ));
      build.onResolve({
        filter: /\.s[ac]ss\?url$/,
      }, (args) => (
        forkToCSSInJS('sass-vanilla', args.kind, {
          path: resolvePath(args),
          namespace: 'sass-url',
        })
      ));
      build.onResolve({
        filter: /\.s[ac]ss$/,
      }, (args) => (
        forkToCSSInJS('sass-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path),
          namespace: 'sass',
        })
      ));

      build.onLoad({
        filter: /.*/,
        namespace: 'sass-vanilla',
      }, async (args) => {
        const result = await processSass(args.path, options, build, cache);
        return {
          contents: result,
          resolveDir: path.dirname(args.path),
          loader: 'css',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'sass',
      }, async (args) => {
        const result = await processSass(args.path, options, build, cache);
        return {
          contents: createLazyCSS(getStyleID(args.path), result, {}),
          resolveDir: path.dirname(args.path),
          loader: 'js',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'sass-raw',
      }, async (args) => {
        const result = await processSass(args.path, options, build, cache);
        return {
          contents: result,
          loader: 'text',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'sass-url',
      }, async (args) => {
        const result = await processSass(args.path, options, build, cache);
        return {
          contents: result,
          loader: 'file',
        };
      });
    },
  };
}
