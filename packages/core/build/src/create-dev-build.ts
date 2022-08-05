import type ws from 'ws';
import type execa from 'execa';
import {
  BuildOptions,
  BUILD_OUTPUT,
  BUILD_PATH,
  DEFAULT_WS_PORT,
  green,
  yellow,
} from 'rigidity-shared';
import createBuild from './create-build';

function escapeRegex(string: string) {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export default async function createDevBuild(
  options: BuildOptions,
) {
  const ws = await import('ws');
  const http = await import('http');
  const chokidar = await import('chokidar');
  const execa = await import('execa');

  const clients: Set<ws.WebSocket> = new Set();

  const server = http.createServer();
  const wss = new ws.WebSocketServer(
    { server },
  );

  wss.on('connection', (socket) => {
    clients.add(socket);

    socket.on('close', () => {
      clients.delete(socket);
    });
  });

  server.listen(DEFAULT_WS_PORT);

  const path = await import('path');

  const buildDirectory = options.directories?.build ?? BUILD_PATH;
  const outputDirectory = path.join(
    buildDirectory,
    options.mode?.type === 'islands' ? 'islands/server' : BUILD_OUTPUT.server.output,
  );

  let debounced: NodeJS.Timeout | undefined;

  function runServer() {
    const instance = execa.node(
      outputDirectory,
    );
    instance.stdout?.pipe(process.stdout);
    return instance;
  }

  let instance: execa.ExecaChildProcess<string> | undefined;

  async function runBuild(restarting: boolean) {
    await createBuild(options);
    if (instance) {
      instance.cancel();
    }
    if (restarting) {
      console.log(yellow('Restarting...'));
    }
    // eslint-disable-next-line import/no-dynamic-require, global-require
    instance = runServer();
    if (restarting) {
      console.log(green('Restarted!'));
      // eslint-disable-next-line no-restricted-syntax
      for (const client of clients.keys()) {
        client.send('update');
      }
    }
  }

  function runProcess() {
    if (debounced) {
      clearTimeout(debounced);
    }
    debounced = setTimeout(() => {
      runBuild(true).catch(() => {
        // no-op
      });
    }, 200);
  }

  await runBuild(false);

  const pattern = escapeRegex(options.directories?.build ?? BUILD_PATH);

  // Add watcher
  chokidar.watch(
    '.',
    {
      ignored: pattern,
      persistent: true,
    },
  ).on('change', () => {
    runProcess();
  });
}
