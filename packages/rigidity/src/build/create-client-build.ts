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
} from '../constants';
import {
  BuildOptions,
} from '../types';
import { outputFile, removeFile } from '../utils/fs';
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

export default async function createClientBuild(
  options: BuildOptions,
): Promise<BuildResult> {
  const path = await import('path');

  const environment = options.env ?? 'production';
  const pagesDirectory = options.directories?.pages ?? PAGES_PATH;
  const buildDirectory = options.directories?.build ?? BUILD_PATH;

  const pages = await getPages(pagesDirectory);

  const outputDirectory = path.join(
    buildDirectory,
    BUILD_OUTPUT.client.output,
  );

  await removeFile(outputDirectory);

  const artifactDirectory = await getArtifactBaseDirectory(
    options,
    'client',
  );

  // Create import header
  const lines = [
    'import { createClientPage } from "rigidity";',
    ...await getPageImports(
      pagesDirectory,
      artifactDirectory,
      pages,
      false,
    ),
  ];

  const customRoot = await getCustomRoot(
    artifactDirectory,
    lines,
    options.paths?.root ?? CUSTOM_ROOT,
  );

  lines.push(
    `
import { hydrate } from 'solid-js/web';
import { hydrateClient } from 'rigidity';
hydrateClient({
  cdn: ${options.paths?.cdn ? JSON.stringify(options.paths.cdn) : 'undefined'},
  assetsUrl: ${JSON.stringify(options.paths?.assets ?? ASSETS_URL)},
  publicUrl: ${JSON.stringify(options.paths?.public ?? PUBLIC_URL)},
  root: ${customRoot ?? 'undefined'},
  pages: ${await getPagesOptions(pages)},
}, hydrate);
    `,
  );

  const artifact = path.join(artifactDirectory, 'index.tsx');

  await outputFile(
    artifact,
    lines.join('\n'),
  );

  const result = await runESBuild(
    {
      content: artifact,
      sourceDirectory: artifactDirectory,
      outputDirectory,
    },
    { isDev: environment !== 'production', isServer: false },
    options,
  );

  await removeFile(artifact);
  await removeFile(artifactDirectory);

  return result;
}
