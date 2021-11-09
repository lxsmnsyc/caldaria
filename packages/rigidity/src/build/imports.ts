import {
  RESERVED_PAGES,
} from '../constants';
import {
  getPageLiteral,
  getAPILiteral,
} from './literal';

// Generates import declarations
export async function getPageImports(
  targetDirectory: string,
  artifactDirectory: string,
  pages: string[],
): Promise<string[]> {
  const path = await import('path');

  return pages.map((page, index) => {
    const { name, dir } = path.parse(page);

    const srcFile = path.join(targetDirectory, dir, name);

    // Transform path to POSIX
    const targetFile = path.relative(artifactDirectory, srcFile)
      .split(path.sep)
      .join(path.posix.sep);

    const extensionless = path.join(dir, name);

    // Do not lazy load reserved pages as they are always available
    if (RESERVED_PAGES.includes(extensionless)) {
      return '';
    }
    // Create lazy load declaration
    return `const ${getPageLiteral(index)} = lazy(() => import('${targetFile}'))`;
  });
}

export async function getAPIImports(
  targetDirectory: string,
  artifactDirectory: string,
  endpoints: string[],
): Promise<string[]> {
  const path = await import('path');

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
