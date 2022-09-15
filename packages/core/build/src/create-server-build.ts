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
  map,
} from 'caldaria-shared';
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
import { getClientArtifactDirectory } from './create-client-build';

export interface IslandManifest {
  name: string;
  content: string;
}

function generateIsland(
  options: BuildOptions,
  id: string,
  entry: string,
  files: IslandManifest[],
) {
  const artifactDirectory = getClientArtifactDirectory(options);

  const artifact = path.join(artifactDirectory, `${id}.tsx`);

  const relativePath = getPOSIXPath(path.relative(artifactDirectory, entry));

  files.push({
    name: artifact,
    content: `import { createIsland } from 'caldaria/islands-client';export default createIsland(() => import('${relativePath}'));`,
  });
}

function getServerOutputDirectory(options: BuildOptions) {
  const buildDirectory = options.directories?.build ?? BUILD_PATH;
  return path.join(
    buildDirectory,
    options.mode?.type === 'islands' ? 'islands' : BUILD_OUTPUT.server.output,
  );
}

function getServerArtifact(options: BuildOptions) {
  const directory = getArtifactBaseDirectory(
    options,
    'server',
  );

  return {
    source: path.join(
      directory,
      options.mode?.type === 'islands' ? 'server.tsx' : 'index.tsx',
    ),
    directory,
  };
}

function createScript(
  options: BuildOptions,
  pages: string[],
  apis: string[],
  customRoot: string | undefined,
) {
  const buildDirectory = options.directories?.build ?? BUILD_PATH;
  const publicDirectory = options.directories?.public ?? PUBLIC_PATH;
  const apiDirectory = options.directories?.api ?? API_PATH;

  const buildDir = options.mode?.type === 'islands' ? 'islands' : BUILD_OUTPUT.client.output;

  const lines: string[] = [];
  lines.push(
    `env: '${options.env ?? 'production'}'`,
    `ssrMode: '${options.ssrMode ?? 'sync'}'`,
    `version: ${Date.now()}`,
    `buildDir: ${JSON.stringify(path.join(buildDirectory, buildDir))}`,
    `publicDir: ${JSON.stringify(publicDirectory)}`,
    `apiDir: ${JSON.stringify(apiDirectory)}`,
    `enableStaticFileServing: ${String(options.adapter.enableStaticFileServing)}`,
    `assetsUrl: ${JSON.stringify(options.paths?.assets ?? ASSETS_URL)}`,
    `publicUrl: ${JSON.stringify(options.paths?.public ?? PUBLIC_URL)}`,
    `pages: ${getPagesOptions(pages)}`,
    `endpoints: ${getAPIOptions(apis)}`,
  );
  if (options.mode?.type) {
    lines.push(`mode: '${options.mode.type}'`);
  }
  if (options.paths?.cdn) {
    lines.push(`cdn: '${options.paths.cdn}'`);
  }

  if (customRoot) {
    lines.push(`root: ${customRoot}`);
  }
  return options.adapter.generateScript(`{${lines.join(', ')}}`);
}

export async function generateServerArtifact(options: BuildOptions) {
  const pagesDirectory = options.directories?.pages ?? PAGES_PATH;
  const apiDirectory = options.directories?.api ?? API_PATH;

  const [pages, apis] = await Promise.all([
    getPages(pagesDirectory),
    getPages(apiDirectory),
  ]);

  const outputDirectory = getServerOutputDirectory(options);

  await removeFile(outputDirectory);

  const artifact = getServerArtifact(options);

  // Create import header
  const lines = [
    'import { createPage } from "caldaria/router";',
    ...getAPIImports(
      apiDirectory,
      artifact.directory,
      apis,
    ),
    ...getPageImports(
      pagesDirectory,
      artifact.directory,
      pages,
      true,
    ),
  ];

  const customRoot = await getCustomRoot(
    artifact.directory,
    lines,
    options.paths?.root ?? CUSTOM_ROOT,
  );

  lines.push(createScript(options, pages, apis, customRoot));

  await outputFile(
    artifact.source,
    lines.join('\n'),
  );
}

export async function generateIslands(islands: IslandManifest[]) {
  if (islands.length) {
    await Promise.all(
      map(
        islands,
        (item) => outputFile(item.name, item.content),
      ),
    );
  }
}

export async function removeServerArtifacts(options: BuildOptions) {
  const artifact = getServerArtifact(options);

  await removeFile(artifact.source);
  await removeFile(artifact.directory);
}

interface ServerBuildInput {
  incremental?: boolean;
  islands?: IslandManifest[];
}

export async function buildServer(
  options: BuildOptions,
  input: ServerBuildInput,
): Promise<BuildResult> {
  const environment = options.env ?? 'production';

  const artifact = getServerArtifact(options);
  const outputDirectory = getServerOutputDirectory(options);

  const isIslands = options.mode?.type === 'islands';

  const result = await runESBuild(
    {
      entrypoints: [artifact.source],
      outputDirectory,
      onEntry(id, entry) {
        if (isIslands && input.islands) {
          generateIsland(options, id, entry, input.islands);
        }
      },
      incremental: input.incremental,
      prefix: 'server',
    },
    { isDev: environment !== 'production', isServer: true },
    options,
  );

  return result;
}

export default async function createServerBuild(options: BuildOptions) {
  await generateServerArtifact(options);
  const islands: IslandManifest[] = [];
  const result = await buildServer(options, { islands });
  if (options.mode?.type === 'islands') {
    await generateIslands(islands);
  }
  await removeServerArtifacts(options);
  return result;
}
