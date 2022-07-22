import path from 'path';
import {
  DIRECTORY_ROOT,
} from 'rigidity/constants';
import getPOSIXPath from '../utils/get-posix-path';
import {
  getPageLiteral,
  getAPILiteral,
} from './literal';

function getPageOption(page: string, index: number): string {
  const extname = path.extname(page);
  const directory = path.dirname(page);
  const filename = path.basename(page, extname);

  const extensionless = path.join(directory, filename);

  const output = `{
path: ${JSON.stringify(getPOSIXPath(path.join('/', extensionless)))},
component: ${getPageLiteral(index)},
}`;
  if (filename === DIRECTORY_ROOT) {
    return `{
path: ${JSON.stringify(getPOSIXPath(path.join('/', directory)))},
component: ${getPageLiteral(index)},
}, ${output}`;
  }

  return output;
}

function getAPIOption(
  page: string,
  index: number,
): string {
  const { name, dir } = path.parse(page);

  const extensionless = path.join(dir, name);

  const output = `{
path: ${JSON.stringify(getPOSIXPath(path.join('/', extensionless)))},
call: ${getAPILiteral(index)},
}`;

  // If the file is named "index", make sure to support trailing slash
  if (name === DIRECTORY_ROOT) {
    return `{
path: ${JSON.stringify(getPOSIXPath(path.join('/', dir)))},
call: API${getAPILiteral(index)},
}, ${output}`;
  }

  return output;
}

export function getPagesOptions(
  pages: string[],
): string {
  const pagesOptions = pages.map(getPageOption);

  return `[${pagesOptions.filter(Boolean).join(',\n')}]`;
}

export function getAPIOptions(
  endpoints: string[],
): string {
  const endpointOptions = endpoints.map(getAPIOption);

  return `[${endpointOptions.join(',\n')}]`;
}
