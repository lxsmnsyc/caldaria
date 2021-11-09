import {
  BuildResult,
} from 'esbuild';
import {
  PAGES_PATH,
  BUILD_PATH,
  BUILD_OUTPUT,
  CUSTOM_APP,
  CUSTOM_DOCUMENT,
  CUSTOM_404,
  CUSTOM_500,
  CUSTOM_ERROR,
} from '../constants';
import {
  BuildOptions,
} from '../types';
import {
  getArtifactBaseDirectory,
} from './get-artifact-directory';
import getPages from './get-pages';
import {
  getPageImports,
} from './imports';
import {
  injectCustomPageImport,
} from './inject-page';
import {
  getPagesOptions,
} from './options';
import runESBuild from './run-esbuild';

export default async function createClientBuild(
  options: BuildOptions,
  environment: string,
): Promise<BuildResult> {
  const path = await import('path');
  const fs = await import('fs-extra');

  const pagesDirectory = options.directories?.pages ?? PAGES_PATH;
  const buildDirectory = options.directories?.build ?? BUILD_PATH;

  const pages = await getPages(pagesDirectory);

  const outputDirectory = path.join(
    buildDirectory,
    environment,
    BUILD_OUTPUT.client.output,
  );

  await fs.remove(outputDirectory);

  const artifactDirectory = await getArtifactBaseDirectory(
    options,
    environment,
    'client',
  );

  // Create import header
  const lines = [
    'import { lazy } from "solid-js";',
    ...await getPageImports(
      pagesDirectory,
      artifactDirectory,
      pages,
    ),
  ];

  const appPage = await injectCustomPageImport(
    pagesDirectory,
    artifactDirectory,
    lines,
    CUSTOM_APP,
  );
  const documentPage = await injectCustomPageImport(
    pagesDirectory,
    artifactDirectory,
    lines,
    CUSTOM_DOCUMENT,
  );
  const error404 = await injectCustomPageImport(
    pagesDirectory,
    artifactDirectory,
    lines,
    CUSTOM_404,
  );
  const error500 = await injectCustomPageImport(
    pagesDirectory,
    artifactDirectory,
    lines,
    CUSTOM_500,
  );
  const errorPage = await injectCustomPageImport(
    pagesDirectory,
    artifactDirectory,
    lines,
    CUSTOM_ERROR,
  );

  lines.push(
    `
import { hydrate } from 'solid-js/web';
import { hydrateClient } from 'rigidity';
hydrateClient({
  ${appPage ? `app: ${appPage},` : '// app: undefined'}
  ${documentPage ? `document: ${documentPage},` : '// document: undefined'}
  ${errorPage ? `error: ${errorPage},` : '// error: undefined'}
  ${error404 ? `error404: ${error404},` : '// error404: undefined'}
  ${error500 ? `error500: ${error500},` : '// error500: undefined'}
  pages: ${await getPagesOptions(pages)},
}, hydrate);
    `,
  );

  const artifact = path.join(artifactDirectory, 'index.tsx');

  await fs.outputFile(
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

  await fs.remove(artifact);
  await fs.remove(artifactDirectory);

  return result;
}
