export default async function getPOSIXPath(file: string): Promise<string> {
  const path = await import('path');
  return file.split(path.sep).join(path.posix.sep);
}
