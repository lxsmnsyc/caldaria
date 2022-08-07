import path from 'path';
import {
  map,
  SUPPORTED_PAGE_EXT,
} from 'rigidity-shared';
import { pathExists } from './fs';
import getPOSIXPath from './get-posix-path';

async function getCustomRootPath(
  rootPath: string,
): Promise<string | undefined> {
  const result = await Promise.all(
    map(
      [...SUPPORTED_PAGE_EXT],
      async (ext) => {
        const app = path.join(
          `${rootPath}${ext}`,
        );

        return {
          path: app,
          stat: await pathExists(app),
        };
      },
    ),
  );
  for (let i = 0; i < result.length; i += 1) {
    if (result[i].stat) {
      return getPOSIXPath(result[i].path);
    }
  }

  return undefined;
}

export async function getCustomRoot(
  artifactDirectory: string,
  lines: string[],
  rootPath: string,
): Promise<string | undefined> {
  const result = await getCustomRootPath(rootPath);

  if (result) {
    const { name, dir, ext } = path.parse(result);
    const extensionless = path.join(dir, `${name}${ext}`);
    const importPath = getPOSIXPath(path.relative(artifactDirectory, extensionless));

    lines.push(
      `import CustomRoot from '${importPath}';`,
    );

    return 'CustomRoot';
  }
  return undefined;
}

export async function getCustomPage(
  pagesDirectory: string,
  page: string,
): Promise<string | undefined> {
  const result = await Promise.all(
    map(
      [...SUPPORTED_PAGE_EXT],
      async (ext) => {
        const app = path.join(
          pagesDirectory,
          `${page}${ext}`,
        );

        return {
          path: app,
          stat: await pathExists(app),
        };
      },
    ),
  );
  for (let i = 0; i < result.length; i += 1) {
    if (result[i].stat) {
      return getPOSIXPath(result[i].path);
    }
  }

  return undefined;
}
