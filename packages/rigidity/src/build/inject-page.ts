import {
  SUPPORTED_PAGE_EXT,
} from '../constants';
import { pathExists } from '../utils/fs';
import getPOSIXPath from '../utils/get-posix-path';

export async function getCustomPage(
  pagesDirectory: string,
  page: string,
): Promise<string | undefined> {
  const path = await import('path');

  const result = await Promise.all(
    SUPPORTED_PAGE_EXT.map(async (ext) => {
      const app = path.join(
        pagesDirectory,
        `${page}${ext}`,
      );

      return {
        path: app,
        stat: await pathExists(app),
      };
    }),
  );
  for (let i = 0; i < result.length; i += 1) {
    if (result[i].stat) {
      return getPOSIXPath(result[i].path);
    }
  }

  return undefined;
}

export async function injectCustomPageImport(
  pagesDirectory: string,
  artifactDirectory: string,
  lines: string[],
  page: string,
): Promise<string | undefined> {
  const path = await import('path');
  const result = await getCustomPage(pagesDirectory, page);

  if (result) {
    const { name, dir, ext } = path.parse(result);
    const extensionless = path.join(dir, `${name}${ext}`);
    const importPath = path.relative(artifactDirectory, extensionless)
      .split(path.sep)
      .join(path.posix.sep);

    const literal = page.toUpperCase();
    lines.push(
      `import ${literal} from '${importPath}';`,
    );

    return literal;
  }
  return undefined;
}
