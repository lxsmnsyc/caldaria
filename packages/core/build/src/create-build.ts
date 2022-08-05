import {
  BuildOptions,
} from 'rigidity-shared';
import createClientBuild from './create-client-build';
import createServerBuild from './create-server-build';
import createIslandsBuild from './create-islands-build';
import runDiagnostics from './run-diagnostics';

export async function buildClient(options: BuildOptions) {
  if (options.mode?.type === 'islands') {
    const islands = await createIslandsBuild(options);
    runDiagnostics(islands);
    return islands;
  }
  const client = await createClientBuild(options);
  runDiagnostics(client);
  return client;
}

export async function buildServer(options: BuildOptions) {
  const server = await createServerBuild(options);

  runDiagnostics(server);

  return server;
}

export default async function createBuild(options: BuildOptions): Promise<void> {
  await buildServer(options);
  await buildClient(options);
}
