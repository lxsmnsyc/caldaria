import {
  OnLoadArgs,
  Plugin,
} from 'esbuild';
import path from 'path';
import fs from 'fs/promises';
import { log, map, red } from 'rigidity-shared';
import createLazyCSS from './utils/create-lazy-css';
import createStyleId from './utils/create-style-id';
import forkToCSSInJS from './utils/fork-to-css-in-js';
import buildCSSEntrypoint from './utils/build-css-entrypoint';
import createInlineSourceMap from './utils/create-inline-source-map';

interface SassPluginOptions {
  dev?: boolean;
}

export default function sassPlugin(options: SassPluginOptions): Plugin {
  return {
    name: 'rigidity:sass',
    setup(build) {
      const defaultOptions = build.initialOptions;
      const getStyleID = createStyleId('sass');

      build.onResolve({
        filter: /\.s[ac]ss\?raw$/,
      }, (args) => (
        forkToCSSInJS('sass-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
          namespace: 'sass-raw',
        })
      ));
      build.onResolve({
        filter: /\.s[ac]ss\?url$/,
      }, (args) => (
        forkToCSSInJS('sass-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
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

      async function processSass(args: OnLoadArgs): Promise<string> {
        let sass;
        try {
          sass = (await import('sass')).default;
        } catch (err) {
          log('sass', red('You need to install `sass` before using!'));
          throw err;
        }

        const source = await fs.readFile(args.path, 'utf8');
        const { css, sourceMap } = await sass.compileStringAsync(source, {
          url: new URL(args.path, 'file://'),
          sourceMap: options.dev,
          syntax: /\.sass/.test(path.basename(args.path)) ? 'indented' : 'scss',
        });

        // TODO Fix urls
        if (sourceMap) {
          const { sources, sourcesContent = [] } = sourceMap;
          await Promise.all(map(sources, async (item, index) => {
            const actualPath = decodeURI(item);
            sources[index] = path.relative(path.dirname(args.path), actualPath);
            sourcesContent[index] = await fs.readFile(actualPath, 'utf-8');
          }));
          sourceMap.sourcesContent = sourcesContent;
        }

        return buildCSSEntrypoint(
          build,
          defaultOptions,
          args.path,
          createInlineSourceMap(css, sourceMap, options.dev),
        );
      }

      build.onLoad({
        filter: /.*/,
        namespace: 'sass-vanilla',
      }, async (args) => {
        const result = await processSass(args);
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
        const result = await processSass(args);
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
        const result = await processSass(args);
        return {
          contents: result,
          loader: 'text',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'sass-url',
      }, async (args) => {
        const result = await processSass(args);
        return {
          contents: result,
          loader: 'file',
        };
      });
    },
  };
}
