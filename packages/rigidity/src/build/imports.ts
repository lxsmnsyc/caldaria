import path from 'path';
import {
  getPageLiteral,
  getAPILiteral,
} from './literal';

// Generates import declarations
export function getPageImports(
  targetDirectory: string,
  artifactDirectory: string,
  pages: string[],
  isServer: boolean,
): string[] {
  return pages.map((page, index) => {
    const { name, dir, ext } = path.parse(page);

    const srcFile = path.join(targetDirectory, dir, `${name}${ext}`);

    // Transform path to POSIX
    const targetFile = path.relative(artifactDirectory, srcFile)
      .split(path.sep)
      .join(path.posix.sep);

    const literal = getPageLiteral(index);
    if (isServer) {
      return `import ${literal}Default from '${targetFile}';
const ${literal} = createServerPage(${literal}Default);`;
    }
    // Create lazy load declaration
    return `const ${literal} = createClientPage(() => import('${targetFile}'))`;
  });
}

export function getAPIImports(
  targetDirectory: string,
  artifactDirectory: string,
  endpoints: string[],
): string[] {
  return endpoints.map((endpoint, index) => {
    const { name, dir } = path.parse(endpoint);

    const srcFile = path.join(targetDirectory, dir, name);

    // Transform path to POSIX
    const targetFile = path.relative(artifactDirectory, srcFile)
      .split(path.sep)
      .join(path.posix.sep);

    // Declare import for api
    return `import ${getAPILiteral(index)} from '${targetFile}';`;
  });
}
