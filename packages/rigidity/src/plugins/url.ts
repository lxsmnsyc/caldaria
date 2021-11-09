import {
  Plugin,
} from 'esbuild';

export default function urlPlugin(): Plugin {
  return {
    name: 'esbuild:url',

    setup(build) {
      build.onResolve({ filter: /\?url$/ }, (args) => ({
        path: args.path.substring(0, args.path.length - 4),
        namespace: 'url',
      }));
      // images
      build.onResolve({ filter: /\.(jpe?g|png|gif|svg|ico|webp|avif)$/ }, (args) => ({
        path: args.path,
        namespace: 'url',
      }));
      // media
      build.onResolve({ filter: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/ }, (args) => ({
        path: args.path,
        namespace: 'url',
      }));
      // font
      build.onResolve({ filter: /\.(woff2?|eot|ttf|otf)$/ }, (args) => ({
        path: args.path,
        namespace: 'url',
      }));

      // Loader
      build.onLoad({ filter: /.*/, namespace: 'url' }, (args) => ({
        contents: args.path,
        loader: 'file',
      }));
    },
  };
}
