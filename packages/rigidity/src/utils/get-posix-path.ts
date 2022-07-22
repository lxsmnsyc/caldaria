import path from 'path';

export default function getPOSIXPath(file: string): string {
  return file.split(path.sep).join(path.posix.sep);
}
