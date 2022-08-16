import {
  BuildOptions,
} from 'caldaria-shared';
import createClientBuild from './create-client-build';
import createServerBuild from './create-server-build';
import createIslandsBuild from './create-islands-build';
import runDiagnostics from './run-diagnostics';

export default async function createBuild(options: BuildOptions): Promise<void> {
  const server = await createServerBuild(options);

  runDiagnostics(server);
  if (options.mode?.type === 'islands') {
    const islands = await createIslandsBuild(options);
    runDiagnostics(islands);
  } else {
    const client = await createClientBuild(options);
    runDiagnostics(client);
  }
}
