import {
  Plugin,
  PluginBuild,
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
  source: string,
  sourcemap?: boolean,
) {
  let stylus;
  try {
    stylus = (await import('stylus')).default;
  } catch (err) {
    log('stylus', red('You need to install `stylus` before using!'));
    throw err;
  }

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

async function processStylus(
  file: string,
  options: LessPluginOptions,
  build: PluginBuild,
): Promise<string> {
  const source = await fs.readFile(file, 'utf8');

  const result = await renderStylus(file, source, options.dev);

  return buildCSSEntrypoint(
    build,
    file,
    result,
  );
}

export default function stylusPlugin(options: LessPluginOptions): Plugin {
  return {
    name: 'rigidity:stylus',
    setup(build) {
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

      build.onLoad({
        filter: /.*/,
        namespace: 'stylus-vanilla',
      }, async (args) => {
        const result = await processStylus(args.path, options, build);
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
        const result = await processStylus(args.path, options, build);
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
        const result = await processStylus(args.path, options, build);
        return {
          contents: result,
          loader: 'text',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'stylus-url',
      }, async (args) => {
        const result = await processStylus(args.path, options, build);
        return {
          contents: result,
          loader: 'file',
        };
      });
    },
  };
}
