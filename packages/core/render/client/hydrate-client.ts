import {
  getCLS,
  getFCP,
  getFID,
  getLCP,
  getTTFB,
} from 'web-vitals';
import {
  createComponent,
  MountableElement,
} from 'solid-js/web';
import {
  JSX,
} from 'solid-js';
import {
  DOCUMENT_DATA,
  GlobalRenderOptions,
  RenderResult,
  log,
} from 'caldaria-shared';
import {
  createPageTree,
} from 'caldaria-router';
import {
  Root,
} from 'caldaria-root';
import renderApp from '../common/render-app';
import renderError from '../common/render-error';

interface HydrationData {
  data: any;
  isError: boolean;
}

export function useHotReload(
  port: number,
): void {
  const protocol = window.location.protocol === 'https' ? 'wss' : 'ws';
  const host = window.location.hostname;
  const socket = new WebSocket(`${protocol}://${host}:${port}`);

  socket.addEventListener('open', () => {
    log('hot-reload', 'Connected.');
    socket.send(JSON.stringify({ type: 'connected' }));
  });

  socket.addEventListener('close', () => {
    log('hot-reload', 'Disconnected.');
  });

  socket.addEventListener('message', () => {
    log('hot-reload', 'Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 200);
  });
}

export default function hydrateClient(
  options: GlobalRenderOptions,
  hydrate: (fn: () => JSX.Element, node: MountableElement) => void,
): void {
  if (options.env === 'development') {
    useHotReload(options.ws);
  }

  if (options.root.reportWebVitals) {
    getCLS(options.root.reportWebVitals);
    getFCP(options.root.reportWebVitals);
    getFID(options.root.reportWebVitals);
    getLCP(options.root.reportWebVitals);
    getTTFB(options.root.reportWebVitals);
  }

  const dataNode = document.getElementById(DOCUMENT_DATA);
  const data = dataNode?.textContent ? JSON.parse(dataNode?.textContent) as HydrationData : null;

  const routerTree = createPageTree(options.pages);
  const pageResult: RenderResult<any> = data && data.isError
    ? {
      isDev: options.env === 'development',
      assets: `${options.cdn ?? ''}/${options.assetsUrl}`,
      App: renderError(options, data.data),
      tags: [],
      data: data?.data,
      isError: true,
    }
    : {
      isDev: options.env === 'development',
      assets: `${options.cdn ?? ''}/${options.assetsUrl}`,
      App: renderApp(options, {
        pathname: window.location.pathname,
        search: window.location.search,
        routes: routerTree,
      }, data?.data.load, data?.data.action),
      tags: [],
      data: data?.data,
      isError: false,
    };

  hydrate(
    () => (
      createComponent(Root, {
        ...pageResult,
        document: options.root.Document,
      })
    ),
    document,
  );
}
