import {
  Plugin,
} from 'esbuild';
import fs from 'fs/promises';
import { registerDependencyMarker, resolvePath } from './utils/file-cache';

export default function urlPlugin(): Plugin {
  return {
    name: 'caldaria:url',

    setup(build) {
      build.onResolve({ filter: /^https?:\/\// }, () => ({
        external: true,
      }));

      registerDependencyMarker(build, /\?url$/);
      registerDependencyMarker(build, /\.(jpe?g|png|gif|svg|ico|webp|avif)$/);
      registerDependencyMarker(build, /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/);
      registerDependencyMarker(build, /\.(woff2?|eot|ttf|otf)$/);

      build.onResolve({ filter: /\?url$/ }, (args) => ({
        path: resolvePath(args),
        namespace: 'url',
      }));
      // images
      build.onResolve({ filter: /\.(jpe?g|png|gif|svg|ico|webp|avif)$/ }, (args) => ({
        path: resolvePath(args),
        namespace: 'url',
      }));
      // media
      build.onResolve({ filter: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/ }, (args) => ({
        path: resolvePath(args),
        namespace: 'url',
      }));
      // font
      build.onResolve({ filter: /\.(woff2?|eot|ttf|otf)$/ }, (args) => ({
        path: resolvePath(args),
        namespace: 'url',
      }));

      // Loader
      build.onLoad({ filter: /.*/, namespace: 'url' }, async (args) => ({
        contents: await fs.readFile(args.path),
        loader: 'file',
      }));
    },
  };
}
