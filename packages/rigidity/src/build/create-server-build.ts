import {
  BuildResult,
} from 'esbuild';
import {
  PAGES_PATH,
  API_PATH,
  BUILD_PATH,
  PUBLIC_PATH,
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
  getAPIImports,
  getPageImports,
} from './imports';
import {
  injectCustomPageImport,
} from './inject-page';
import {
  getAPIOptions,
  getPagesOptions,
} from './options';
import runESBuild from './run-esbuild';

export default async function createServerBuild(
  options: BuildOptions,
  environment: string,
): Promise<BuildResult> {
  const path = await import('path');
  const fs = await import('fs-extra');

  const pagesDirectory = options.directories?.pages ?? PAGES_PATH;
  const apiDirectory = options.directories?.api ?? API_PATH;
  const buildDirectory = options.directories?.build ?? BUILD_PATH;
  const publicDirectory = options.directories?.public ?? PUBLIC_PATH;

  const pages = await getPages(pagesDirectory);
  const apis = await getPages(apiDirectory);

  const outputDirectory = path.join(
    buildDirectory,
    environment,
    BUILD_OUTPUT.server.output,
  );

  await fs.remove(outputDirectory);

  const artifactDirectory = await getArtifactBaseDirectory(
    options,
    environment,
    'server',
  );

  // Create import header
  const lines = [
    'import { lazy } from "solid-js";',
    ...await getAPIImports(
      apiDirectory,
      artifactDirectory,
      apis,
    ),
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
import { createServer } from 'rigidity';
export default createServer({
  version: ${JSON.stringify(Date.now())},
  buildDir: ${JSON.stringify(path.join(buildDirectory, environment, 'client'))},
  publicDir: ${JSON.stringify(publicDirectory)},
  apiDir: ${JSON.stringify(apiDirectory)},
  ${appPage ? `app: ${appPage},` : '// app: undefined'}
  ${documentPage ? `document: ${documentPage},` : '// document: undefined'}
  ${errorPage ? `error: ${errorPage},` : '// error: undefined'}
  ${error404 ? `error404: ${error404},` : '// error404: undefined'}
  ${error500 ? `error500: ${error500},` : '// error500: undefined'}
  pages: ${await getPagesOptions(pages)},
  endpoints: ${await getAPIOptions(apis)},
});
    `,
  );

  const artifact = path.join(artifactDirectory, 'index.tsx');

  await fs.outputFile(
    artifact,
    lines.join('\n'),
  );

  const result = await runESBuild(
    artifact,
    outputDirectory,
    { isDev: environment !== 'production', isServer: true },
    options,
  );

  if (result.outputFiles) {
    await Promise.all(result.outputFiles.map((file) => (
      fs.outputFile(file.path, file.contents)
    )));
  }

  await fs.remove(artifact);
  await fs.remove(artifactDirectory);

  return result;
}
