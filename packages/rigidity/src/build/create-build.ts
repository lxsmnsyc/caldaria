import {
  BuildOptions,
} from '../types';
import generateESBuildDiagnostics from '../utils/create-esbuild-diagnostics';
import createClientBuild from './create-client-build';
import createServerBuild from './create-server-build';

export default async function createBuild(options: BuildOptions): Promise<void> {
  const [server, client] = await Promise.all([
    createServerBuild(options),
    createClientBuild(options),
  ]);

  if (server.errors.length || server.warnings.length) {
    console.log('Server Build:');
    generateESBuildDiagnostics(false, server.errors);
    generateESBuildDiagnostics(true, server.warnings);
  }

  if (client.errors.length || client.warnings.length) {
    console.log('Client Build:');
    generateESBuildDiagnostics(false, client.errors);
    generateESBuildDiagnostics(true, client.warnings);
  }
}
