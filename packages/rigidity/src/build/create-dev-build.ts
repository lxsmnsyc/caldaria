import type ws from 'ws';
import type execa from 'execa';
import { BuildOptions } from 'rigidity/types';
import { BUILD_OUTPUT, BUILD_PATH } from 'rigidity/constants';
import createBuild from './create-build';
import { green, yellow } from '../utils/colors';

const DEFAULT_PORT = 12321;

export function useHotReload(
  protocol: string,
  host: string,
): void {
  const socket = new WebSocket(`${protocol}://${host}:${DEFAULT_PORT}`);

  socket.addEventListener('open', () => {
    console.log('[rigidity] Connected.');
    socket.send(JSON.stringify({ type: 'connected' }));
  });

  socket.addEventListener('close', () => {
    console.log('[rigidity] Disconnected.');
  });

  socket.addEventListener('message', (event) => {
    console.log(event.data);
    console.log('[rigidity] Reloading');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });
}

export async function createDevBuild(
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

  server.listen(DEFAULT_PORT);

  const path = await import('path');

  const buildDirectory = options.directories?.build ?? BUILD_PATH;
  const outputDirectory = path.join(
    buildDirectory,
    BUILD_OUTPUT.server.output,
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
    }, 1000);
  }

  await runBuild(false);

  // Add watcher
  chokidar.watch(
    '.',
    {
      ignored: /\.rigidity/,
      persistent: true,
    },
  ).on('change', () => {
    runProcess();
  });
}
