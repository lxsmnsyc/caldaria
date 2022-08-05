import path from 'path';
import {
  BuildResult,
} from 'esbuild';
import {
  PAGES_PATH,
  API_PATH,
  BUILD_PATH,
  PUBLIC_PATH,
  BUILD_OUTPUT,
  ASSETS_URL,
  PUBLIC_URL,
  CUSTOM_ROOT,
  BuildOptions,
} from 'rigidity-shared';
import { outputFile, removeFile } from './fs';
import {
  getArtifactBaseDirectory,
} from './get-artifact-directory';
import getPages from './get-pages';
import {
  getAPIImports,
  getPageImports,
} from './imports';
import {
  getCustomRoot,
} from './inject-page';
import {
  getAPIOptions,
  getPagesOptions,
} from './options';
import runESBuild from './run-esbuild';
import getPOSIXPath from './get-posix-path';

interface IslandManifest {
  name: string;
  content: string;
}

function generateIsland(
  options: BuildOptions,
  id: string,
  entry: string,
  files: IslandManifest[],
) {
  const artifactDirectory = getArtifactBaseDirectory(
    options,
    'client',
  );

  const artifact = path.join(artifactDirectory, `${id}.tsx`);

  const relativePath = getPOSIXPath(path.relative(artifactDirectory, entry));

  files.push({
    name: artifact,
    content: `import { createIsland } from 'rigidity/islands-client';export default createIsland(() => import('${relativePath}'));`,
  });
}

export default async function createServerBuild(
  options: BuildOptions,
): Promise<BuildResult> {
  const environment = options.env ?? 'production';
  const pagesDirectory = options.directories?.pages ?? PAGES_PATH;
  const apiDirectory = options.directories?.api ?? API_PATH;
  const buildDirectory = options.directories?.build ?? BUILD_PATH;
  const publicDirectory = options.directories?.public ?? PUBLIC_PATH;

  const pages = await getPages(pagesDirectory);
  const apis = await getPages(apiDirectory);

  const outputDirectory = path.join(
    buildDirectory,
    options.mode?.type === 'islands' ? 'islands' : BUILD_OUTPUT.server.output,
  );

  await removeFile(outputDirectory);

  const artifactDirectory = getArtifactBaseDirectory(
    options,
    'server',
  );

  // Create import header
  const lines = [
    'import { createServerPage } from "rigidity/router";',
    ...getAPIImports(
      apiDirectory,
      artifactDirectory,
      apis,
    ),
    ...getPageImports(
      pagesDirectory,
      artifactDirectory,
      pages,
      true,
    ),
  ];

  const customRoot = await getCustomRoot(
    artifactDirectory,
    lines,
    options.paths?.root ?? CUSTOM_ROOT,
  );

  const buildDir = options.mode?.type === 'islands' ? 'islands' : BUILD_OUTPUT.client.output;

  lines.push(options.adapter.generateScript(`{
    mode: ${options.mode?.type ? `'${options.mode.type}'` : 'undefined'},
    env: '${options.env ?? 'production'}',
    ssrMode: ${JSON.stringify(options.ssrMode ?? 'sync')},
    version: ${JSON.stringify(Date.now())},
    buildDir: ${JSON.stringify(path.join(buildDirectory, buildDir))},
    publicDir: ${JSON.stringify(publicDirectory)},
    apiDir: ${JSON.stringify(apiDirectory)},
    enableStaticFileServing: ${JSON.stringify(options.adapter.enableStaticFileServing)},
    cdn: ${options.paths?.cdn ? JSON.stringify(options.paths.cdn) : 'undefined'},
    assetsUrl: ${JSON.stringify(options.paths?.assets ?? ASSETS_URL)},
    publicUrl: ${JSON.stringify(options.paths?.public ?? PUBLIC_URL)},
    root: ${customRoot ?? 'undefined'},
    pages: ${getPagesOptions(pages)},
    endpoints: ${getAPIOptions(apis)},
  }`));

  const artifact = path.join(
    artifactDirectory,
    options.mode?.type === 'islands' ? 'server.tsx' : 'index.tsx',
  );

  await outputFile(
    artifact,
    lines.join('\n'),
  );

  const islands: IslandManifest[] = [];

  const result = await runESBuild(
    {
      entrypoints: [artifact],
      sourceDirectory: artifactDirectory,
      outputDirectory,
      onEntry: options.mode?.type === 'islands'
        ? (id, entry) => generateIsland(options, id, entry, islands)
        : undefined,
    },
    { isDev: environment !== 'production', isServer: true },
    options,
  );

  if (islands.length) {
    await Promise.all(islands.map((item) => outputFile(item.name, item.content)));
  }

  await removeFile(artifact);
  await removeFile(artifactDirectory);

  return result;
}
