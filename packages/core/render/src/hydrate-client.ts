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
} from 'rigidity-shared';
import {
  createPageTree,
} from 'rigidity-router';
import {
  Root,
} from 'rigidity-root';
import renderApp from './render-app';
import renderError from './render-error';

interface HydrationData {
  data: any;
  isError: boolean;
}

function useHotReload(
  protocol: string,
  host: string,
  port: number,
): void {
  const socket = new WebSocket(`${protocol}://${host}:${port}`);

  socket.addEventListener('open', () => {
    console.log('[rigidity] Connected.');
    socket.send(JSON.stringify({ type: 'connected' }));
  });

  socket.addEventListener('close', () => {
    console.log('[rigidity] Disconnected.');
  });

  socket.addEventListener('message', () => {
    console.log('[rigidity] Reloading');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });
}

export default function hydrateClient(
  options: GlobalRenderOptions,
  hydrate: (fn: () => JSX.Element, node: MountableElement) => void,
): void {
  if (options.env === 'development') {
    useHotReload(
      window.location.protocol === 'https' ? 'wss' : 'ws',
      window.location.hostname,
      options.ws,
    );
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
      assets: `${options.cdn ?? ''}/${options.assetsUrl}`,
      App: renderError(options, data.data),
      tags: [],
      data: data?.data,
      isError: true,
    }
    : {
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
