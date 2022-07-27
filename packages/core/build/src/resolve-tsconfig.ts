import path from 'path';

export default function resolveTSConfig(
  configPath?: string,
): string | undefined {
  if (configPath == null) {
    return undefined;
  }
  return path.resolve(configPath);
}
