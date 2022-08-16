import path from 'path';
import {
  BUILD_OUTPUT,
  BUILD_PATH,
  BuildOptions,
  BundleType,
} from 'caldaria-shared';

export function getArtifactBaseDirectory(
  options: BuildOptions,
  bundleType: BundleType,
): string {
  return path.join(
    options.directories?.build ?? BUILD_PATH,
    BUILD_OUTPUT[bundleType].temp,
  );
}

export default function getArtifactDirectory(
  options: BuildOptions,
  bundleType: BundleType,
  directory: string,
): string {
  return path.join(
    getArtifactBaseDirectory(
      options,
      bundleType,
    ),
    directory,
  );
}
