import { RESERVED_PAGES, DIRECTORY_ROOT } from '../constants';
import getPOSIXPath from '../utils/get-posix-path';
import { getPageLiteral, getAPILiteral } from './literal';

async function getPageOption(page: string, index: number): Promise<string> {
  const path = await import('path');
  const extname = path.extname(page);
  const directory = path.dirname(page);
  const filename = path.basename(page, extname);

  const extensionless = path.join(directory, filename);

  if (RESERVED_PAGES.includes(extensionless)) {
    return '';
  }

  const output = `{
path: ${JSON.stringify(await getPOSIXPath(path.join('/', extensionless)))},
component: ${getPageLiteral(index)},
}`;
  if (filename === DIRECTORY_ROOT) {
    return `{
path: ${JSON.stringify(await getPOSIXPath(path.join('/', directory)))},
component: ${getPageLiteral(index)},
}, ${output}`;
  }

  return output;
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

  // If the file is named "index", make sure to support trailing slash
  if (name === DIRECTORY_ROOT) {
    return `{
path: ${JSON.stringify(await getPOSIXPath(path.join('/', dir)))},
call: API${getAPILiteral(index)},
}, ${output}`;
  }

  return output;
}

export async function getPagesOptions(
  pages: string[],
): Promise<string> {
  const pagesOptions: string[] = await Promise.all(pages.map(getPageOption));

  return `[${pagesOptions.filter(Boolean).join(',\n')}]`;
}

export async function getAPIOptions(
  endpoints: string[],
): Promise<string> {
  const endpointOptions: string[] = await Promise.all(
    endpoints.map(getAPIOption),
  );

  return `[${endpointOptions.join(',\n')}]`;
}
