import { PluginBuild } from 'esbuild';
import path from 'path';
import { filter, map } from 'rigidity-shared';
import { outputFile } from '../../fs';

const decoder = new TextDecoder();

export default async function buildCSSEntrypoint(
  instance: PluginBuild,
  sourcefile: string,
  contents: string,
) {
  const output = await instance.esbuild.build({
    ...instance.initialOptions,
    incremental: undefined,
    entryPoints: undefined,
    sourcemap: instance.initialOptions.sourcemap ? 'inline' : undefined,
    write: false,
    stdin: {
      contents,
      resolveDir: path.dirname(sourcefile),
      loader: 'css',
      sourcefile: path.basename(sourcefile),
    },
  });

  const root = filter(output.outputFiles, (item) => path.basename(item.path) === 'stdin.css');

  await Promise.all(map(output.outputFiles, async (item) => {
    if (path.basename(item.path) !== 'stdin.css') {
      await outputFile(item.path, item.contents);
    }
  }));

  return decoder.decode(root[0].contents);
}
