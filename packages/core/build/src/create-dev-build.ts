import type ws from 'ws';
import type execa from 'execa';
import path from 'path';
import {
  BuildOptions,
  BUILD_OUTPUT,
  BUILD_PATH,
  DEFAULT_WS_PORT,
  green,
  log,
  yellow,
} from 'rigidity-shared';
import {
  buildServer,
  generateIslands,
  generateServerArtifact,
  IslandManifest,
} from './create-server-build';
import { buildClient, generateClientArtifact } from './create-client-build';
import createIslandsBuild from './create-islands-build';
import { clearDirty, markFile, unmountFile } from './plugins/utils/file-cache';

function debounce(callback: () => void, timeout = 200) {
  let debounced: NodeJS.Timeout | undefined;
  return () => {
    if (debounced) {
      clearTimeout(debounced);
    }
    debounced = setTimeout(callback, timeout);
  };
}

function escapeRegex(string: string) {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

async function getProcess(
  options: BuildOptions,
  reload: () => void,
) {
  const execa = await import('execa');

  const buildDirectory = options.directories?.build ?? BUILD_PATH;
  const outputDirectory = path.join(
    buildDirectory,
    options.mode?.type === 'islands' ? 'islands/server' : BUILD_OUTPUT.server.output,
  );

  function runServer() {
    const instance = execa.node(
      outputDirectory,
    );
    instance.stdout?.pipe(process.stdout);
    return instance;
  }

  let instance: execa.ExecaChildProcess<string> | undefined;

  let building = false;

  if (options.mode?.type === 'islands') {
    const islands: IslandManifest[] = [];

    await generateServerArtifact(options);
    const server = await buildServer(options, {
      incremental: true,
      islands,
    });

    const runBuild = async (restarting: boolean) => {
      building = true;
      if (instance) {
        instance.cancel();
      }
      if (restarting) {
        log('dev-server', yellow('Restarting...'));
      }
      if (restarting) {
        await generateServerArtifact(options);
        await server.rebuild?.();
      }
      await generateIslands(islands);
      await createIslandsBuild(options);
      instance = runServer();
      if (restarting) {
        log('dev-server', green('Restarted!'));
        reload();
      }
      clearDirty();
      building = false;
    };

    const runProcess = debounce(() => {
      if (!building) {
        void runBuild(true);
      }
    });

    await runBuild(false);

    return runProcess;
  }
  await generateServerArtifact(options);
  await generateClientArtifact(options);
  const server = await buildServer(options, {
    incremental: true,
  });
  const client = await buildClient(options, true);

  const runBuild = async (restarting: boolean) => {
    building = true;
    if (instance) {
      instance.cancel();
    }
    if (restarting) {
      log('dev-server', yellow('Restarting...'));
    }
    if (restarting) {
      await generateServerArtifact(options);
      await generateClientArtifact(options);
      await server.rebuild?.();
      await client.rebuild?.();
    }
    instance = runServer();
    if (restarting) {
      log('dev-server', green('Restarted!'));
      reload();
    }
    clearDirty();
    building = false;
  };

  const runProcess = debounce(() => {
    if (!building) {
      void runBuild(true);
    }
  });

  await runBuild(false);

  return runProcess;
}

export default async function createDevBuild(
  options: BuildOptions,
) {
  const ws = await import('ws');
  const http = await import('http');
  const chokidar = await import('chokidar');

  const clients: Set<ws.WebSocket> = new Set();

  const proxy = http.createServer();
  const wss = new ws.WebSocketServer(
    { server: proxy },
  );

  wss.on('connection', (socket) => {
    clients.add(socket);

    socket.on('close', () => {
      clients.delete(socket);
    });
  });

  proxy.listen(DEFAULT_WS_PORT);

  const pattern = escapeRegex(options.directories?.build ?? BUILD_PATH);

  const runProcess = await getProcess(options, () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const client of clients.keys()) {
      client.send('update');
    }
  });

  log('dev-server', green('Started.'));

  const cwd = process.cwd();
  // Add watcher
  chokidar.watch(
    '.',
    {
      ignored: new RegExp(pattern),
      persistent: true,
    },
  ).on('change', (file) => {
    markFile(path.join(cwd, file));
    runProcess();
  }).on('unlink', (file) => {
    unmountFile(path.join(cwd, file));
  });
}
