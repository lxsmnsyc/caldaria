import path from 'path';
import {
  filter,
  SUPPORTED_PAGE_EXT,
} from 'rigidity-shared';
import traverseDirectory from './traverse-directory';

export default async function getPages(dir: string): Promise<string[]> {
  return filter(
    await traverseDirectory(path.join(process.cwd(), dir)),
    (file) => SUPPORTED_PAGE_EXT.has(path.extname(file)),
  );
}
