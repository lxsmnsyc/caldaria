import {
  OnResolveArgs,
  OnResolveResult,
  Plugin,
} from 'esbuild';
import path from 'path';
import fs from 'fs/promises';

export default function urlPlugin(): Plugin {
  return {
    name: 'rigidity:url',

    setup(build) {
      function normalizeResolve(args: OnResolveArgs): OnResolveResult {
        if (/^https?:\/\//.test(args.path)) {
          return {
            external: true,
          };
        }
        return {
          path: path.join(args.resolveDir, args.path),
          namespace: 'url',
        };
      }
      build.onResolve({ filter: /\?url$/ }, (args) => ({
        path: path.join(args.resolveDir, args.path.substring(0, args.path.length - 4)),
        namespace: 'url',
      }));
      // images
      build.onResolve({ filter: /\.(jpe?g|png|gif|svg|ico|webp|avif)$/ }, normalizeResolve);
      // media
      build.onResolve({ filter: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/ }, normalizeResolve);
      // font
      build.onResolve({ filter: /\.(woff2?|eot|ttf|otf)$/ }, normalizeResolve);

      // Loader
      build.onLoad({ filter: /.*/, namespace: 'url' }, async (args) => ({
        contents: await fs.readFile(args.path),
        loader: 'file',
      }));
    },
  };
}
