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
import buildCSSEntrypoint from './utils/build-css-entrypoint';
import {
  createFileCache,
  isFileDirty,
  readFileCache,
  registerDependencyMarker,
  resolvePath,
  writeFileCache,
} from './utils/file-cache';

interface PostCSSOptions {
  dev: boolean;
}

export default function postcssPlugin(
  options: PostCSSOptions,
): Plugin {
  const cache = createFileCache('postcss');
  return {
    name: 'caldaria:postcss',

    async setup(build) {
      const defaultOptions = build.initialOptions;

      const config = await postcssrc({
        env: options.dev ? 'development' : 'production',
      });

      const getStyleID = createStyleId('postcss');

      registerDependencyMarker(build, /\.module\.css(\?(url-only|url|raw))?$/);
      registerDependencyMarker(build, /\.css(\?(url|raw))?$/);

      build.onResolve({
        filter: /\.module\.css\?url-only$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: resolvePath(args),
          namespace: 'postcss-modules-url-only',
        })
      ));
      build.onResolve({
        filter: /\.module\.css\?url$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: resolvePath(args),
          namespace: 'postcss-modules-url',
        })
      ));
      build.onResolve({
        filter: /\.module\.css\?raw$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: resolvePath(args),
          namespace: 'postcss-modules-raw',
        })
      ));
      build.onResolve({
        filter: /\.module\.css$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: path.join(args.resolveDir, args.path),
          namespace: 'postcss-modules',
        })
      ));
      build.onResolve({
        filter: /\.css\?raw$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: resolvePath(args),
          namespace: 'postcss-raw',
        })
      ));
      build.onResolve({
        filter: /\.css\?url$/,
      }, (args) => (
        forkToCSSInJS('postcss-vanilla', args.kind, {
          path: resolvePath(args),
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
        if (isFileDirty(args.path)) {
          const source = await fs.readFile(args.path, 'utf8');

          const processor = postcss(config.plugins);
          const result = await processor.process(source, {
            ...config.options,
            from: path.basename(args.path),
            map: defaultOptions.sourcemap
              ? { inline: true }
              : false,
          });

          const contents = await buildCSSEntrypoint(
            build,
            args.path,
            result.css,
          );
          await writeFileCache(cache, args.path, contents);
          return contents;
        }
        return readFileCache(cache, args.path);
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

      interface PostCSSModuleResult {
        css: string;
        json: Record<string, string>
      }

      async function processPostCSSModules(
        args: OnLoadArgs,
      ) {
        if (isFileDirty(args.path)) {
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
            map: defaultOptions.sourcemap
              ? { inline: true }
              : false,
          });

          const css = await buildCSSEntrypoint(
            build,
            args.path,
            result.css,
          );

          const contents = {
            css,
            json: resultJSON,
          };

          await writeFileCache(cache, args.path, JSON.stringify(contents));
          return contents;
        }
        return JSON.parse(await readFileCache(cache, args.path)) as PostCSSModuleResult;
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
