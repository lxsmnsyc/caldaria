export default async function resolveTSConfig(
  configPath?: string,
): Promise<string | undefined> {
  if (configPath == null) {
    return undefined;
  }
  const path = await import('path');
  return path.resolve(configPath);
}
