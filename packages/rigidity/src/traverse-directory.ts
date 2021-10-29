export default async function traverseDirectory(
  root: string,
  directory: string = root,
): Promise<string[]> {
  const fs = await import('fs-extra');
  const path = await import('path');

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
      files.map(recursiveTraverse),
    );

    return results.flat();
  } catch (err) {
    return [];
  }
}
