import {
  BUILD_OUTPUT,
  BUILD_PATH,
} from '../constants';
import {
  BuildOptions,
  BundleType,
} from '../types';

export async function getArtifactBaseDirectory(
  options: BuildOptions,
  bundleType: BundleType,
): Promise<string> {
  const path = await import('path');
  return path.join(
    options.directories?.build ?? BUILD_PATH,
    BUILD_OUTPUT[bundleType].temp,
  );
}

export default async function getArtifactDirectory(
  options: BuildOptions,
  bundleType: BundleType,
  directory: string,
): Promise<string> {
  const path = await import('path');
  return path.join(
    await getArtifactBaseDirectory(
      options,
      bundleType,
    ),
    directory,
  );
}
