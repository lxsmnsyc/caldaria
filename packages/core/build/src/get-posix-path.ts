import path from 'path';

export default function getPOSIXPath(file: string): string {
  return file.replaceAll(path.sep, path.posix.sep);
}
