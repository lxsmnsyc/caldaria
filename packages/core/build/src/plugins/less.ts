import {
  Plugin,
  PluginBuild,
} from 'esbuild';
import type { RawSourceMap } from 'source-map-js';
import path from 'path';
import fs from 'fs/promises';
import { log, map, red } from 'rigidity-shared';
import createLazyCSS from './utils/create-lazy-css';
import createStyleId from './utils/create-style-id';
import forkToCSSInJS from './utils/fork-to-css-in-js';
import buildCSSEntrypoint from './utils/build-css-entrypoint';
import createInlineSourceMap from './utils/create-inline-source-map';

interface LessPluginOptions {
  dev?: boolean;
}

async function processLess(
  file: string,
  options: LessPluginOptions,
  build: PluginBuild,
): Promise<string> {
  let less;
  try {
    less = (await import('less')).default;
  } catch (err) {
    log('less', red('You need to install `less` before using!'));
    throw err;
  }

  const source = await fs.readFile(file, 'utf8');

  const result = await less.render(source, {
    filename: path.basename(file),
    rootpath: path.dirname(file),
    sourceMap: options.dev ? {} : undefined,
  });

  let deserializedMap: RawSourceMap | undefined;

  if (result.map) {
    deserializedMap = JSON.parse(result.map) as RawSourceMap;
    const { sources, sourcesContent = [] } = deserializedMap;
    await Promise.all(map(sources, async (item, index) => {
      const resolved = path.join(path.dirname(file), item);
      sourcesContent[index] = await fs.readFile(resolved, 'utf-8');
    }));
    deserializedMap.sourcesContent = sourcesContent;
  }

  return buildCSSEntrypoint(
    build,
    file,
    createInlineSourceMap(result.css, deserializedMap, options.dev),
  );
}

export default function lessPlugin(options: LessPluginOptions): Plugin {
  return {
    name: 'rigidity:less',
    setup(build) {
      const getStyleID = createStyleId('less');

      build.onResolve({
        filter: /\.less\?raw$/,
      }, (args) => (
        forkToCSSInJS('less-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
          namespace: 'less-raw',
        })
      ));
      build.onResolve({
        filter: /\.less\?url$/,
      }, (args) => (
        forkToCSSInJS('less-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
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
        contents: await processLess(args.path, options, build),
        resolveDir: path.dirname(args.path),
        loader: 'css',
      }));
      build.onLoad({
        filter: /.*/,
        namespace: 'less',
      }, async (args) => {
        const result = await processLess(args.path, options, build);
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
        const result = await processLess(args.path, options, build);
        return {
          contents: result,
          loader: 'text',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'less-url',
      }, async (args) => {
        const result = await processLess(args.path, options, build);
        return {
          contents: result,
          loader: 'file',
        };
      });
    },
  };
}
