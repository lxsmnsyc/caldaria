import path from 'path';
import {
  DIRECTORY_ROOT, filter, map,
} from 'caldaria-shared';
import getPOSIXPath from './get-posix-path';
import {
  getPageLiteral,
  getAPILiteral,
} from './literal';

function getPageOption(page: string, index: number): string {
  const extname = path.extname(page);
  const directory = path.dirname(page);
  const filename = path.basename(page, extname);

  const extensionless = path.join(directory, filename);

  const output = `[${JSON.stringify(getPOSIXPath(path.join('/', extensionless)))},${getPageLiteral(index)}]`;
  if (filename === DIRECTORY_ROOT) {
    return `[${JSON.stringify(getPOSIXPath(path.join('/', directory)))},${getPageLiteral(index)}], ${output}`;
  }

  return output;
}

function getAPIOption(
  page: string,
  index: number,
): string {
  const { name, dir } = path.parse(page);

  const extensionless = path.join(dir, name);

  const output = `[${JSON.stringify(getPOSIXPath(path.join('/', extensionless)))},${getAPILiteral(index)}]`;

  // If the file is named "index", make sure to support trailing slash
  if (name === DIRECTORY_ROOT) {
    return `[${JSON.stringify(getPOSIXPath(path.join('/', dir)))},API${getAPILiteral(index)}], ${output}`;
  }

  return output;
}

export function getPagesOptions(
  pages: string[],
): string {
  const pagesOptions = map(pages, getPageOption);

  return `[${filter(pagesOptions, Boolean).join(',\n')}]`;
}

export function getAPIOptions(
  endpoints: string[],
): string {
  const endpointOptions = map(endpoints, getAPIOption);

  return `[${endpointOptions.join(',\n')}]`;
}
