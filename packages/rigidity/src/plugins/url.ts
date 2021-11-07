import { Plugin } from 'esbuild';

export default function urlPlugin(): Plugin {
  return {
    name: 'esbuild:url',

    setup(build) {
      build.onResolve({ filter: /\?url$/ }, (args) => ({
        path: args.path.substring(0, args.path.length - 4),
        namespace: 'url',
      }));
      build.onLoad({ filter: /.*/, namespace: 'url' }, (args) => ({
        contents: args.path,
        loader: 'file',
      }));
    },
  };
}
