import { SUPPORTED_PAGE_EXT } from './constants';
import traverseDirectory from './traverse-directory';

export default async function getPages(dir: string): Promise<string[]> {
  const path = await import('path');
  return (await traverseDirectory(path.join(process.cwd(), dir)))
    .filter((file) => {
      const extension = path.extname(file);
      return SUPPORTED_PAGE_EXT.includes(extension);
    });
}
