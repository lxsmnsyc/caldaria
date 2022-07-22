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
} from 'rigidity/constants';
import {
  createPageTree,
} from 'rigidity/router';
import {
  GlobalRenderOptions,
  RenderResult,
} from 'rigidity/types';
import {
  Root,
} from 'rigidity/root';
import { useHotReload } from 'rigidity/build';
import renderApp from './render-app';
import renderError from './render-error';

interface HydrationData {
  data: any;
  isError: boolean;
}

export default function hydrateClient(
  options: GlobalRenderOptions,
  hydrate: (fn: () => JSX.Element, node: MountableElement) => void,
): void {
  if (options.env === 'development') {
    useHotReload(
      window.location.protocol === 'https' ? 'wss' : 'ws',
      window.location.hostname,
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
