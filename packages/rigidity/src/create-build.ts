import * as esbuild from 'esbuild';
import { API_PATH, BUILD_OUTPUT, BUILD_PATH, DIRECTORY_ROOT, PAGES_PATH, RESERVED_PAGES } from './constants';
import { getArtifactBaseDirectory } from './get-artifact-directory';
import getPages from './get-pages';
import getPOSIXPath from './get-posix-path';
import { BuildOptions } from './types';

function getAPILiteral(index: number) {
  return `API${index}`;
}

function getPageLiteral(index: number) {
  return `Page${index}`;
}

async function getPageImports(
  targetDirectory: string,
  artifactDirectory: string,
  pages: string[],
): Promise<string[]> {
  const path = await import('path');

  return pages.map((page, index) => {
    const { name, dir } = path.parse(page);

    const srcFile = path.join(targetDirectory, dir, name);

    const targetFile = path.relative(artifactDirectory, srcFile)
      .split(path.sep)
      .join(path.posix.sep);

    const extensionless = path.join(dir, name);

    if (RESERVED_PAGES.includes(extensionless)) {
      return '';
    }
    return `const ${getPageLiteral(index)} = lazy(() => import('${targetFile}'))`;
  });
}

async function getAPIImports(
  targetDirectory: string,
  artifactDirectory: string,
  endpoints: string[],
): Promise<string[]> {
  const path = await import('path');
  return endpoints.map((endpoint, index) => {
    const { name, dir } = path.parse(endpoint);

    const srcFile = path.join(targetDirectory, dir, name);

    const targetFile = path.relative(artifactDirectory, srcFile)
      .split(path.sep)
      .join(path.posix.sep);

    return `import ${getAPILiteral(index)} from '${targetFile}';`;
  });
}

async function getAPIOption(
  page: string,
  index: number,
): Promise<string> {
  const path = await import('path');

  const { name, dir } = path.parse(page);

  const extensionless = path.join(dir, name);

  const output = `{
path: ${JSON.stringify(await getPOSIXPath(path.join('/', extensionless)))},
call: ${getAPILiteral(index)},
}`;
  if (name === DIRECTORY_ROOT) {
    return `{
path: ${JSON.stringify(await getPOSIXPath(path.join('/', dir)))},
call: API${getAPILiteral(index)},
}, ${output}`;
  }

  return output;
}

async function buildClientBundle(
  options: BuildOptions,
  environment: string,
): Promise<void> {
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
    ...await getPageImports(
      pagesDirectory,
      artifactDirectory,
      pages,
    ),
  ];

  const artifact = path.join(artifactDirectory, 'index.tsx');

  await fs.outputFile(
    artifact,
    lines.join('\n'),
  );
}

async function buildServerBundle(
  options: BuildOptions,
  environment: string,
): Promise<void> {
  const path = await import('path');
  const fs = await import('fs-extra');

  const pagesDirectory = options.directories?.pages ?? PAGES_PATH;
  const apiDirectory = options.directories?.api ?? API_PATH;
  const buildDirectory = options.directories?.build ?? BUILD_PATH;

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

  const artifact = path.join(artifactDirectory, 'index.tsx');

  await fs.outputFile(
    artifact,
    lines.join('\n'),
  );
}

export default async function createBuild(options: BuildOptions): Promise<void> {
  await Promise.all([
    buildServerBundle(options, 'development'),
    buildClientBundle(options, 'development'),
    buildServerBundle(options, 'production'),
    buildClientBundle(options, 'production'),
  ]);
}
