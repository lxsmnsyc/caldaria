import {
  Plugin,
  PluginBuild,
} from 'esbuild';
import type { RawSourceMap } from 'source-map-js';
import path from 'path';
import fs from 'fs/promises';
import { log, map, red } from 'caldaria-shared';
import createLazyCSS from './utils/create-lazy-css';
import createStyleId from './utils/create-style-id';
import forkToCSSInJS from './utils/fork-to-css-in-js';
import buildCSSEntrypoint from './utils/build-css-entrypoint';
import createInlineSourceMap from './utils/create-inline-source-map';
import {
  createFileCache,
  FileCache,
  isFileDirty,
  readFileCache,
  writeFileCache,
  registerDependencyMarker,
  addDependency,
  markCleanFile,
  resolvePath,
} from './utils/file-cache';

interface LessPluginOptions {
  dev?: boolean;
}

async function importLess() {
  try {
    return (await import('less')).default;
  } catch (err) {
    log('less', red('You need to install `less` before using!'));
    throw err;
  }
}

async function processLess(
  file: string,
  options: LessPluginOptions,
  build: PluginBuild,
  cache: FileCache,
): Promise<string> {
  if (isFileDirty(file)) {
    const less = await importLess();

    const source = await fs.readFile(file, 'utf8');

    const root = path.dirname(file);

    const result = await less.render(source, {
      filename: path.basename(file),
      paths: [
        root,
      ],
      sourceMap: options.dev ? {} : undefined,
    });

    let deserializedMap: RawSourceMap | undefined;

    for (const item of result.imports) {
      addDependency(file, item);
      markCleanFile(item);
    }

    if (result.map) {
      deserializedMap = JSON.parse(result.map) as RawSourceMap;
      const { sources, sourcesContent = [] } = deserializedMap;
      await Promise.all(map(sources, async (item, index) => {
        if (item === path.basename(file)) {
          sourcesContent[index] = source;
        } else {
          const resolved = path.relative(root, item);
          sources[index] = resolved;
          sourcesContent[index] = await fs.readFile(item, 'utf-8');
        }
      }));
      deserializedMap.sourcesContent = sourcesContent;
    }

    const contents = await buildCSSEntrypoint(
      build,
      file,
      createInlineSourceMap(result.css, deserializedMap, options.dev),
    );
    await writeFileCache(cache, file, contents);
    return contents;
  }

  return readFileCache(cache, file);
}

export default function lessPlugin(options: LessPluginOptions): Plugin {
  const cache = createFileCache('less');
  return {
    name: 'caldaria:less',
    setup(build) {
      const getStyleID = createStyleId('less');

      registerDependencyMarker(build, /\.less(\?(raw|url))?$/);

      build.onResolve({
        filter: /\.less\?raw$/,
      }, (args) => (
        forkToCSSInJS('less-vanilla', args.kind, {
          path: resolvePath(args),
          namespace: 'less-raw',
        })
      ));
      build.onResolve({
        filter: /\.less\?url$/,
      }, (args) => (
        forkToCSSInJS('less-vanilla', args.kind, {
          path: resolvePath(args),
          namespace: 'less-url',
        })
      ));
      build.onResolve({
        filter: /\.less$/,
      }, (args) => (
        forkToCSSInJS('less-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path),
          namespace: 'less',
        })
      ));

      build.onLoad({
        filter: /.*/,
        namespace: 'less-vanilla',
      }, async (args) => ({
        contents: await processLess(args.path, options, build, cache),
        resolveDir: path.dirname(args.path),
        loader: 'css',
      }));
      build.onLoad({
        filter: /.*/,
        namespace: 'less',
      }, async (args) => {
        const result = await processLess(args.path, options, build, cache);
        return {
          contents: createLazyCSS(getStyleID(args.path), result, {}),
          resolveDir: path.dirname(args.path),
          loader: 'js',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'less-raw',
      }, async (args) => {
        const result = await processLess(args.path, options, build, cache);
        return {
          contents: result,
          loader: 'text',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'less-url',
      }, async (args) => {
        const result = await processLess(args.path, options, build, cache);
        return {
          contents: result,
          loader: 'file',
        };
      });
    },
  };
}
