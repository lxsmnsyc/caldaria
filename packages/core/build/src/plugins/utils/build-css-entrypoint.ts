import { BuildOptions, PluginBuild } from 'esbuild';
import path from 'path';
import { outputFile } from '../../fs';

const decoder = new TextDecoder();

export default async function buildCSSEntrypoint(
  instance: PluginBuild,
  defaultOptions: BuildOptions,
  sourcefile: string,
  contents: string,
) {
  const output = await instance.esbuild.build({
    ...defaultOptions,
    incremental: undefined,
    entryPoints: undefined,
    sourcemap: defaultOptions.sourcemap ? 'inline' : undefined,
    write: false,
    stdin: {
      contents,
      resolveDir: path.dirname(sourcefile),
      loader: 'css',
      sourcefile: path.basename(sourcefile),
    },
  });

  const root = output.outputFiles.filter((item) => path.basename(item.path) === 'stdin.css');

  await Promise.all(output.outputFiles.map(async (item) => {
    if (path.basename(item.path) !== 'stdin.css') {
      await outputFile(item.path, item.contents);
    }
  }));

  return decoder.decode(root[0].contents);
}
