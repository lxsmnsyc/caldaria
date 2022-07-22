import path from 'path';
import {
  SUPPORTED_PAGE_EXT,
} from 'rigidity/constants';
import traverseDirectory from '../traverse-directory';

export default async function getPages(dir: string): Promise<string[]> {
  return (await traverseDirectory(path.join(process.cwd(), dir)))
    .filter((file) => SUPPORTED_PAGE_EXT.includes(path.extname(file)));
}
