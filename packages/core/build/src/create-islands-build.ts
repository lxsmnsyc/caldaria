import path from 'path';
import {
  BuildResult,
} from 'esbuild';
import {
  BUILD_PATH,
  BuildOptions,
  DEFAULT_WS_PORT,
  map,
} from 'caldaria-shared';
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

  const artifacts = map(
    await traverseDirectory(artifactDirectory),
    (item) => path.join(artifactDirectory, item),
  );
  const mainEntry = path.join(artifactDirectory, 'index.tsx');

  const lines = [];

  if (options.mode?.type === 'islands' && (options.mode.enableHybridRouting ?? true)) {
    lines.push('import { setupHybridRouter } from \'caldaria/islands-client\';');
    lines.push('setupHybridRouter();');
  }

  if (environment !== 'production') {
    lines.push('import { useHotReload } from \'caldaria/render-client\';');
    lines.push(`useHotReload('${options.dev?.ws ?? DEFAULT_WS_PORT}')`);
  }

  if (lines.length) {
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
      prefix: 'islands',
    },
    { isDev: environment !== 'production', isServer: false },
    options,
  );

  if (environment !== 'production') {
    await removeIslandArtifacts(options);
  }

  return result;
}
