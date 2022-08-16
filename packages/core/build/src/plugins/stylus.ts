import {
  Plugin,
  PluginBuild,
} from 'esbuild';
import path from 'path';
import fs from 'fs/promises';
import { log, red } from 'caldaria-shared';
import createLazyCSS from './utils/create-lazy-css';
import createStyleId from './utils/create-style-id';
import forkToCSSInJS from './utils/fork-to-css-in-js';
import buildCSSEntrypoint from './utils/build-css-entrypoint';
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

async function importStylus() {
  try {
    return (await import('stylus')).default;
  } catch (err) {
    log('stylus', red('You need to install `stylus` before using!'));
    throw err;
  }
}

interface LessPluginOptions {
  dev?: boolean;
}

async function processStylus(
  file: string,
  options: LessPluginOptions,
  build: PluginBuild,
  cache: FileCache,
): Promise<string> {
  if (isFileDirty(file)) {
    const source = await fs.readFile(file, 'utf8');

    const stylus = await importStylus();

    const instance = stylus(source)
      .set('filename', file);

    if (options.dev) {
      instance.set('sourcemap', {
        comment: true,
        inline: true,
        basePath: path.dirname(file),
      });
    }

    const result = await new Promise<string>((resolve, reject) => {
      instance.render((err, css) => {
        if (err) {
          reject(err);
        } else {
          resolve(css);
        }
      });
    });

    for (const dep of instance.deps()) {
      addDependency(file, dep);
      markCleanFile(dep);
    }

    const contents = await buildCSSEntrypoint(
      build,
      file,
      result,
    );

    await writeFileCache(cache, file, contents);

    return contents;
  }
  return readFileCache(cache, file);
}

export default function stylusPlugin(options: LessPluginOptions): Plugin {
  const cache = createFileCache('stylus');
  return {
    name: 'caldaria:stylus',
    setup(build) {
      const getStyleID = createStyleId('stylus');

      registerDependencyMarker(build, /\.styl(us)?(\?(raw|url))?/);

      build.onResolve({
        filter: /\.styl(us)?\?raw$/,
      }, (args) => (
        forkToCSSInJS('stylus-vanilla', args.kind, {
          path: resolvePath(args),
          namespace: 'stylus-raw',
        })
      ));
      build.onResolve({
        filter: /\.styl(us)?\?url$/,
      }, (args) => (
        forkToCSSInJS('stylus-vanilla', args.kind, {
          path: resolvePath(args),
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
        const result = await processStylus(args.path, options, build, cache);
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
        const result = await processStylus(args.path, options, build, cache);
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
        const result = await processStylus(args.path, options, build, cache);
        return {
          contents: result,
          loader: 'text',
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: 'stylus-url',
      }, async (args) => {
        const result = await processStylus(args.path, options, build, cache);
        return {
          contents: result,
          loader: 'file',
        };
      });
    },
  };
}
