import { BuildOptions, PluginBuild } from 'esbuild';
import path from 'path';

export default async function buildCSSEntrypoint(
  instance: PluginBuild,
  defaultOptions: BuildOptions,
  sourcefile: string,
  contents: string,
) {
  return instance.esbuild.build({
    ...defaultOptions,
    incremental: undefined,
    entryPoints: undefined,
    sourcemap: 'inline',
    write: false,
    stdin: {
      contents,
      resolveDir: path.dirname(sourcefile),
      loader: 'css',
      sourcefile: path.basename(sourcefile),
    },
  });
}
