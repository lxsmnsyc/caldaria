import {
  OnLoadArgs,
  Plugin,
} from 'esbuild';
import path from 'path';
import fs from 'fs/promises';
import { log, red } from 'rigidity-shared';
import createLazyCSS from './utils/create-lazy-css';
import createStyleId from './utils/create-style-id';
import forkToCSSInJS from './utils/fork-to-css-in-js';
import { outputFile } from '../fs';
import buildCSSEntrypoint from './utils/build-css-entrypoint';

interface LessPluginOptions {
  dev?: boolean;
}

export default function lessPlugin(options: LessPluginOptions): Plugin {
  return {
    name: 'rigidity:less',
    setup(build) {
      const defaultOptions = build.initialOptions;
      const getStyleID = createStyleId('less');
      const decoder = new TextDecoder();

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

      async function processLess(args: OnLoadArgs): Promise<string> {
        let less;
        try {
          less = (await import('less')).default;
        } catch (err) {
          log('less', red('You need to install `less` before using!'));
          throw err;
        }

        const source = await fs.readFile(args.path, 'utf8');
        const result = await less.render(source, {
          filename: path.basename(args.path),
          rootpath: path.dirname(args.path),
          sourceMap: options.dev ? {
            sourceMapFileInline: true,
          } : undefined,
        });

        const output = await buildCSSEntrypoint(
          build,
          defaultOptions,
          args.path,
          result.css,
        );

        const root = output.outputFiles.filter((item) => path.basename(item.path) === 'stdin.css');

        await Promise.all(output.outputFiles.filter(async (item) => {
          if (path.basename(item.path) !== 'stdin.css') {
            await outputFile(item.path, item.contents);
          }
        }));

        return decoder.decode(root[0].contents);
      }

      build.onLoad({
        filter: /.*/,
        namespace: 'less-vanilla',
      }, async (args) => {
        const result = await processLess(args);
        return {
          contents: result,
          resolveDir: path.dirname(args.path),
          loader: 'css',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'less',
      }, async (args) => {
        const result = await processLess(args);
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
        const result = await processLess(args);
        return {
          contents: result,
          loader: 'text',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'less-url',
      }, async (args) => {
        const result = await processLess(args);
        return {
          contents: result,
          loader: 'file',
        };
      });
    },
  };
}
