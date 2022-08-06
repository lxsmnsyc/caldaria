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
import buildCSSEntrypoint from './utils/build-css-entrypoint';

async function renderStylus(
  filePath: string,
  sourcemap?: boolean,
) {
  let stylus;
  try {
    stylus = (await import('stylus')).default;
  } catch (err) {
    log('stylus', red('You need to install `stylus` before using!'));
    throw err;
  }

  const source = await fs.readFile(filePath, 'utf8');
  const instance = stylus(source)
    .set('filename', filePath);

  if (sourcemap) {
    instance.set('sourcemap', {
      comment: true,
      inline: true,
      basePath: path.dirname(filePath),
    });
  }

  return new Promise<string>((resolve, reject) => {
    instance.render((err, css) => {
      if (err) {
        reject(err);
      } else {
        resolve(css);
      }
    });
  });
}

interface LessPluginOptions {
  dev?: boolean;
}

export default function stylusPlugin(options: LessPluginOptions): Plugin {
  return {
    name: 'rigidity:stylus',
    setup(build) {
      const defaultOptions = build.initialOptions;
      const getStyleID = createStyleId('stylus');

      build.onResolve({
        filter: /\.styl(us)?\?raw$/,
      }, (args) => (
        forkToCSSInJS('stylus-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
          namespace: 'stylus-raw',
        })
      ));
      build.onResolve({
        filter: /\.styl(us)?\?url$/,
      }, (args) => (
        forkToCSSInJS('stylus-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
          namespace: 'stylus-url',
        })
      ));
      build.onResolve({
        filter: /\.styl(us)?$/,
      }, (args) => (
        forkToCSSInJS('stylus-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path),
          namespace: 'stylus',
        })
      ));

      async function processLess(args: OnLoadArgs): Promise<string> {
        const result = await renderStylus(args.path, options.dev);

        return buildCSSEntrypoint(
          build,
          defaultOptions,
          args.path,
          result,
        );
      }

      build.onLoad({
        filter: /.*/,
        namespace: 'stylus-vanilla',
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
        namespace: 'stylus',
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
        namespace: 'stylus-raw',
      }, async (args) => {
        const result = await processLess(args);
        return {
          contents: result,
          loader: 'text',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'stylus-url',
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
