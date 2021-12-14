import {
  BuildResult,
} from 'esbuild';
import { adapters } from '..';
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
  ASSETS_URL,
  PUBLIC_URL,
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
): Promise<BuildResult> {
  const path = await import('path');
  const fs = await import('fs-extra');

  const environment = options.env ?? 'production';
  const pagesDirectory = options.directories?.pages ?? PAGES_PATH;
  const apiDirectory = options.directories?.api ?? API_PATH;
  const buildDirectory = options.directories?.build ?? BUILD_PATH;
  const publicDirectory = options.directories?.public ?? PUBLIC_PATH;

  const pages = await getPages(pagesDirectory);
  const apis = await getPages(apiDirectory);

  const outputDirectory = path.join(
    buildDirectory,
    BUILD_OUTPUT.server.output,
  );

  await fs.remove(outputDirectory);

  const artifactDirectory = await getArtifactBaseDirectory(
    options,
    'server',
  );

  // Create import header
  const lines = [
    'import { createServerPage } from "rigidity";',
    ...await getAPIImports(
      apiDirectory,
      artifactDirectory,
      apis,
    ),
    ...await getPageImports(
      pagesDirectory,
      artifactDirectory,
      pages,
      true,
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

  const adapter = adapters[options.adapter ?? 'http'];
  lines.push(adapter.generateScript(`{
    ssrMode: ${JSON.stringify(options.ssrMode ?? 'sync')},
    version: ${JSON.stringify(Date.now())},
    buildDir: ${JSON.stringify(path.join(buildDirectory, BUILD_OUTPUT.client.output))},
    publicDir: ${JSON.stringify(publicDirectory)},
    apiDir: ${JSON.stringify(apiDirectory)},
    enableStaticFileServing: ${JSON.stringify(adapter.enableStaticFileServing)},
    cdn: ${options.paths?.cdn ? JSON.stringify(options.paths.cdn) : 'undefined'},
    assetsUrl: ${JSON.stringify(options.paths?.assets ?? ASSETS_URL)},
    publicUrl: ${JSON.stringify(options.paths?.public ?? PUBLIC_URL)},
    app: ${appPage ?? 'undefined'},
    document: ${documentPage ?? 'undefined'},
    error: ${errorPage ?? 'undefined'},
    error500: ${error500 ?? 'undefined'},
    error404: ${error404 ?? 'undefined'},
    pages: ${await getPagesOptions(pages)},
    endpoints: ${await getAPIOptions(apis)},
  }`));

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
    { isDev: environment !== 'production', isServer: true },
    options,
  );

  await fs.remove(artifact);
  await fs.remove(artifactDirectory);

  return result;
}
