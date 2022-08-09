import { Plugin } from 'esbuild';
import { registerDependencyMarker } from './utils/file-cache';

export default function resolversPlugin(): Plugin {
  return {
    name: 'rigidity:resolvers',
    setup(build) {
      // JS/TS
      registerDependencyMarker(build, /\.[mc]?[jt]s$/);
      // JSON
      registerDependencyMarker(build, /\.json$/);
      // Text
      registerDependencyMarker(build, /\.txt$/);
    },
  };
}
