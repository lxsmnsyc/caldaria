import { BUILD_OUTPUT, BUILD_PATH } from '../constants';
import { BuildOptions, BundleType } from '../types';

export async function getArtifactBaseDirectory(
  options: BuildOptions,
  environment: string,
  bundleType: BundleType,
): Promise<string> {
  const path = await import('path');
  return path.join(
    options.directories?.build ?? BUILD_PATH,
    environment,
    BUILD_OUTPUT[bundleType].temp,
  );
}

export default async function getArtifactDirectory(
  options: BuildOptions,
  environment: string,
  bundleType: BundleType,
  directory: string,
): Promise<string> {
  const path = await import('path');
  return /* @__PURE__ */ path.join(
    /* @__PURE__ */ await getArtifactBaseDirectory(
      options,
      environment,
      bundleType,
    ),
    directory,
  );
}
