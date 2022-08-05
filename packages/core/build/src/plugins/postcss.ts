import {
  OnLoadArgs,
  Plugin,
} from 'esbuild';
import path from 'path';
import fs from 'fs/promises';
import postcss from 'postcss';
import postcssrc from 'postcss-load-config';
import PostcssModulesPlugin from 'postcss-modules';
import createLazyCSS from './utils/create-lazy-css';
import forkToCSSInJS from './utils/fork-to-css-in-js';
import createRawCSSModule from './utils/create-raw-css-module';
import createURLCSSModule from './utils/create-url-css-module';
import createStyleId from './utils/create-style-id';
import { outputFile, removeFile } from '../fs';
import buildCSSEntrypoint from './utils/build-css-entrypoint';

interface PostCSSOptions {
  dev: boolean;
}

export default function postcssPlugin(
  options: PostCSSOptions,
): Plugin {
  return {
    name: 'rigidity:postcss',

    async setup(build) {
      const defaultOptions = build.initialOptions;

      const config = await postcssrc({
        env: options.dev ? 'development' : 'production',
      });

      const getStyleID = createStyleId('postcss');
      const decoder = new TextDecoder();

      build.onResolve({
        filter: /\.module\.css\?url-only$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 9)),
          namespace: 'postcss-modules-url-only',
        })
      ));
      build.onResolve({
        filter: /\.module\.css\?url$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
          namespace: 'postcss-modules-url',
        })
      ));
      build.onResolve({
        filter: /\.module\.css\?raw$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
          namespace: 'postcss-modules-raw',
        })
      ));
      build.onResolve({
        filter: /\.module\.css$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
          namespace: 'postcss-modules',
        })
      ));
      build.onResolve({
        filter: /\.css\?raw$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
          namespace: 'postcss-raw',
        })
      ));
      build.onResolve({
        filter: /\.css\?url$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
          namespace: 'postcss-url',
        })
      ));
      build.onResolve({
        filter: /\.css$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path),
          namespace: 'postcss',
        })
      ));

      async function processPostCSS(args: OnLoadArgs): Promise<string> {
        const source = await fs.readFile(args.path, 'utf8');

        const processor = postcss(config.plugins);
        const result = await processor.process(source, {
          ...config.options,
          from: args.path,
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
        namespace: 'postcss-vanilla',
      }, async (args) => {
        const result = await processPostCSS(args);
        return {
          contents: result,
          resolveDir: path.dirname(args.path),
          loader: 'css',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'postcss',
      }, async (args) => {
        const result = await processPostCSS(args);
        return {
          contents: createLazyCSS(getStyleID(args.path), result, {}),
          resolveDir: path.dirname(args.path),
          loader: 'js',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'postcss-raw',
      }, async (args) => {
        const result = await processPostCSS(args);
        return {
          contents: result,
          loader: 'text',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'postcss-url',
      }, async (args) => {
        const result = await processPostCSS(args);
        return {
          contents: result,
          loader: 'file',
        };
      });

      async function processPostCSSModules(args: OnLoadArgs) {
        const source = await fs.readFile(args.path, 'utf8');

        const processor = postcss(config.plugins);
        let resultJSON: Record<string, string> = {};
        processor.use(PostcssModulesPlugin({
          getJSON(_filename, json) {
            resultJSON = json;
          },
        }));
        const result = await processor.process(source, {
          ...config.options,
          from: args.path,
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

        return {
          css: decoder.decode(root[0].contents),
          json: resultJSON,
        };
      }

      build.onLoad({
        filter: /.*/,
        namespace: 'postcss-modules',
      }, async (args) => {
        const { css, json } = await processPostCSSModules(args);

        return {
          contents: createLazyCSS(getStyleID(args.path), css, json),
          resolveDir: path.dirname(args.path),
          loader: 'js',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'postcss-modules-raw',
      }, async (args) => {
        const { css, json } = await processPostCSSModules(args);

        return {
          contents: createRawCSSModule(css, json),
          resolveDir: path.dirname(args.path),
          loader: 'js',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'postcss-modules-url',
      }, async (args) => {
        const { json } = await processPostCSSModules(args);

        const { dir, base } = path.parse(args.path);

        return {
          contents: createURLCSSModule(`./${base}`, json),
          resolveDir: dir,
          loader: 'js',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'postcss-modules-url-only',
      }, async (args) => {
        const { css } = await processPostCSSModules(args);

        return {
          contents: css,
          loader: 'file',
        };
      });
    },
  };
}
