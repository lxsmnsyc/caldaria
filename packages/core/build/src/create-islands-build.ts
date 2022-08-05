import path from 'path';
import {
  BuildResult,
} from 'esbuild';
import {
  BUILD_PATH,
  BuildOptions,
  DEFAULT_WS_PORT,
} from 'rigidity-shared';
import { outputFile, removeFile } from './fs';
import {
  getArtifactBaseDirectory,
} from './get-artifact-directory';
import runESBuild from './run-esbuild';
import traverseDirectory from './traverse-directory';

function getOutputDirectory(options: BuildOptions) {
  const buildDirectory = options.directories?.build ?? BUILD_PATH;

  return path.join(
    buildDirectory,
    'islands',
  );
}

function getArtifactDirectory(options: BuildOptions) {
  return getArtifactBaseDirectory(
    options,
    'client',
  );
}

async function generateIslandsArtifact(options: BuildOptions) {
  const environment = options.env ?? 'production';

  const artifactDirectory = getArtifactDirectory(options);

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

  return artifacts;
}

async function removeIslandArtifacts(options: BuildOptions) {
  await removeFile(getArtifactDirectory(options));
}

export default async function createIslandsBuild(
  options: BuildOptions,
): Promise<BuildResult> {
  const environment = options.env ?? 'production';
  const artifacts = await generateIslandsArtifact(options);
  const outputDirectory = getOutputDirectory(options);

  const result = await runESBuild(
    {
      entrypoints: artifacts,
      outputDirectory,
    },
    { isDev: environment !== 'production', isServer: false },
    options,
  );

  await removeIslandArtifacts(options);

  return result;
}
