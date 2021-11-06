import {
  BuildOptions,
} from '../types';
import createClientBuild from './create-client-build';
import createServerBuild from './create-server-build';

export default async function createBuild(options: BuildOptions): Promise<void> {
  await Promise.all([
    createServerBuild(options, 'development'),
    createServerBuild(options, 'production'),
    createClientBuild(options, 'development'),
    createClientBuild(options, 'production'),
  ]);
}
