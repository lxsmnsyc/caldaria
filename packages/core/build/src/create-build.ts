import {
  BuildOptions,
} from 'rigidity-shared';
import generateESBuildDiagnostics from './create-esbuild-diagnostics';
import createClientBuild from './create-client-build';
import createServerBuild from './create-server-build';
import createIslandsBuild from './create-islands-build';

export default async function createBuild(options: BuildOptions): Promise<void> {
  const server = await createServerBuild(options);

  if (server.errors.length || server.warnings.length) {
    console.log('Server Build:');
    generateESBuildDiagnostics(false, server.errors);
    generateESBuildDiagnostics(true, server.warnings);
  }

  if (options.mode?.type === 'islands') {
    const islands = await createIslandsBuild(options);
    if (islands.errors.length || islands.warnings.length) {
      console.log('Client Build:');
      generateESBuildDiagnostics(false, islands.errors);
      generateESBuildDiagnostics(true, islands.warnings);
    }
  } else {
    const client = await createClientBuild(options);
    if (client.errors.length || client.warnings.length) {
      console.log('Client Build:');
      generateESBuildDiagnostics(false, client.errors);
      generateESBuildDiagnostics(true, client.warnings);
    }
  }
}
