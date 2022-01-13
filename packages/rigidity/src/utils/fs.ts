import { Abortable } from 'events';
import { Mode, ObjectEncodingOptions, OpenMode } from 'fs';
import { Stream } from 'stream';

export async function removeFile(filePath: string): Promise<void> {
  const fs = await import('fs/promises');
  return fs.rm(filePath, { recursive: true, force: true });
}

export async function fileExists(path: string): Promise<boolean> {
  const fs = await import('fs/promises');

  try {
    const stat = await fs.stat(path);

    return stat.isFile();
  } catch (error) {
    return false;
  }
}

export async function checkPath(pth: string) {
  const path = await import('path');
  if (process.platform === 'win32') {
    const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path.parse(pth).root, ''));

    if (pathHasInvalidWinCharacters) {
      const error = new Error(`Path contains invalid characters: ${pth}`);
      error.code = 'EINVAL';
      throw error;
    }
  }
}

export async function makeDir(dir: string, mode = 0o777) {
  const fs = await import('fs/promises');
  await checkPath(dir);
  return fs.mkdir(dir, {
    mode,
    recursive: true,
  });
}

export async function pathExists(filePath: string) {
  try {
    const fs = await import('fs/promises');
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function outputFile(
  file: string,
  data: string
    | NodeJS.ArrayBufferView
    | Iterable<string
    | NodeJS.ArrayBufferView>
    | AsyncIterable<string | NodeJS.ArrayBufferView>
    | Stream,
  encoding?:
      | (ObjectEncodingOptions & {
            mode?: Mode | undefined;
            flag?: OpenMode | undefined;
        } & Abortable)
      | BufferEncoding
      | null,
) {
  const path = await import('path');
  const fs = await import('fs/promises');

  const dir = path.dirname(file);
  if (!await pathExists(dir)) {
    await makeDir(dir);
  }
  return fs.writeFile(file, data, encoding);
}
