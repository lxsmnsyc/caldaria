import path from 'path';
import {
  BuildResult,
} from 'esbuild';
import {
  PAGES_PATH,
  BUILD_PATH,
  BUILD_OUTPUT,
  ASSETS_URL,
  PUBLIC_URL,
  CUSTOM_ROOT,
  BuildOptions,
  DEFAULT_WS_PORT,
} from 'rigidity-shared';
import { outputFile, removeFile } from './fs';
import {
  getArtifactBaseDirectory,
} from './get-artifact-directory';
import getPages from './get-pages';
import {
  getPageImports,
} from './imports';
import {
  getCustomRoot,
} from './inject-page';
import {
  getPagesOptions,
} from './options';
import runESBuild from './run-esbuild';

function getOutputDirectory(options: BuildOptions) {
  const buildDirectory = options.directories?.build ?? BUILD_PATH;
  const outputDirectory = path.join(
    buildDirectory,
    BUILD_OUTPUT.client.output,
  );

  return outputDirectory;
}

export function getClientArtifactDirectory(options: BuildOptions) {
  return getArtifactBaseDirectory(
    options,
    'client',
  );
}

function getClientArtifact(options: BuildOptions) {
  const directory = getClientArtifactDirectory(options);
  return {
    directory,
    source: path.join(directory, 'index.tsx'),
  };
}

function createHydrateScript(
  options: BuildOptions,
  pages: string[],
  customRoot: string | undefined,
) {
  const lines: string[] = [
    `ws: ${options.dev?.ws ?? DEFAULT_WS_PORT}`,
    `env: '${options.env ?? 'production'}'`,
    `assetsUrl: ${JSON.stringify(options.paths?.assets ?? ASSETS_URL)}`,
    `publicUrl: ${JSON.stringify(options.paths?.public ?? PUBLIC_URL)}`,
    `pages: ${getPagesOptions(pages)}`,
  ];

  if (options.paths?.cdn) {
    lines.push(`cdn: '${options.paths?.cdn}'`);
  }
  if (customRoot) {
    lines.push(`root: ${customRoot}`);
  }

  return `hydrateClient({${lines.join(', ')}}, hydrate);`;
}

export async function generateClientArtifact(
  options: BuildOptions,
) {
  const pagesDirectory = options.directories?.pages ?? PAGES_PATH;

  const pages = await getPages(pagesDirectory);

  const outputDirectory = getOutputDirectory(options);

  await removeFile(outputDirectory);

  const artifact = getClientArtifact(options);

  // Create import header
  const lines = [
    'import { createClientPage } from "rigidity/router";',
    ...getPageImports(
      pagesDirectory,
      artifact.directory,
      pages,
      false,
    ),
  ];

  const customRoot = await getCustomRoot(
    artifact.directory,
    lines,
    options.paths?.root ?? CUSTOM_ROOT,
  );

  lines.push(
    "import { hydrate } from 'solid-js/web';",
    "import { hydrateClient } from 'rigidity/render-client';",
    createHydrateScript(options, pages, customRoot),
  );

  await outputFile(
    artifact.source,
    lines.join('\n'),
  );
}

export async function removeClientArtifact(
  options: BuildOptions,
) {
  const artifact = getClientArtifact(options);
  await removeFile(artifact.source);
  await removeFile(artifact.directory);
}

export async function buildClient(
  options: BuildOptions,
  incremental?: boolean,
) {
  const environment = options.env ?? 'production';
  const artifact = getClientArtifact(options);
  const outputDirectory = getOutputDirectory(options);
  const result = await runESBuild(
    {
      entrypoints: [artifact.source],
      outputDirectory,
      incremental,
      prefix: 'client',
    },
    { isDev: environment !== 'production', isServer: false },
    options,
  );

  return result;
}

export default async function createClientBuild(
  options: BuildOptions,
): Promise<BuildResult> {
  await generateClientArtifact(options);
  const result = await buildClient(options);
  await removeClientArtifact(options);
  return result;
}
