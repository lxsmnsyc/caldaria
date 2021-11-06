import { IPackageJson } from 'package-json-type';

export default async function readPackage(): Promise<IPackageJson> {
  const fs = await import('fs-extra');
  return fs.readJson('package.json') as IPackageJson;
}
