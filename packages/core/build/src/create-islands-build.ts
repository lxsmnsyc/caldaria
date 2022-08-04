import path from 'path';
import {
  BuildResult,
} from 'esbuild';
import {
  BUILD_PATH,
  BUILD_OUTPUT,
  BuildOptions,
  DEFAULT_WS_PORT,
} from 'rigidity-shared';
import { outputFile, removeFile } from './fs';
import {
  getArtifactBaseDirectory,
} from './get-artifact-directory';
import runESBuild from './run-esbuild';
import traverseDirectory from './traverse-directory';

export default async function createIslandsBuild(
  options: BuildOptions,
): Promise<BuildResult> {
  const environment = options.env ?? 'production';
  const buildDirectory = options.directories?.build ?? BUILD_PATH;

  const outputDirectory = path.join(
    buildDirectory,
    'islands',
  );

  const artifactDirectory = getArtifactBaseDirectory(
    options,
    'client',
  );

  const artifacts = (await traverseDirectory(artifactDirectory))
    .map((item) => path.join(artifactDirectory, item));
  if (environment !== 'production') {
    const mainEntry = path.join(artifactDirectory, 'index.tsx');

    const lines = [];

    if (options.mode?.type === 'islands' && (options.mode.enableHybridRouting ?? true)) {
      lines.push('import { setupHybridRouter } from \'rigidity/islands-client\';');
      lines.push('setupHybridRouter();');
    }

    if (options.dev) {
      lines.push('import { useHotReload } from \'rigidity/render-client\';');
      lines.push(`useHotReload('${options.dev?.ws ?? DEFAULT_WS_PORT}')`);
    }

    await outputFile(mainEntry, lines.join('\n'));
    artifacts.push(mainEntry);
  }

  const result = await runESBuild(
    {
      entrypoints: artifacts,
      content: '',
      sourceDirectory: artifactDirectory,
      outputDirectory,
    },
    { isDev: environment !== 'production', isServer: false },
    options,
  );

  await removeFile(artifactDirectory);

  return result;
}
