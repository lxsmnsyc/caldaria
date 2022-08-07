import path from 'path';
import fs from 'fs/promises';
import { map } from 'rigidity-shared';

export default async function traverseDirectory(
  root: string,
  directory: string = root,
): Promise<string[]> {
  try {
    const files = await fs.readdir(directory);

    const recursiveTraverse = async (file: string) => {
      const fullPath = path.join(directory, file);

      if ((await fs.lstat(fullPath)).isDirectory()) {
        return traverseDirectory(root, fullPath);
      }
      return path.relative(root, fullPath);
    };

    const results = await Promise.all(
      map(files, recursiveTraverse),
    );

    return results.flat();
  } catch (err) {
    return [];
  }
}
