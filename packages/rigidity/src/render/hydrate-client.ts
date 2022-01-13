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
} from 'solid-js/jsx-runtime';
import {
  DOCUMENT_DATA,
} from '../constants';
import createPageTree from '../router/core/create-page-tree';
import {
  GlobalRenderOptions, RenderResult,
} from '../types';
import DefaultApp from '../components/App';
import {
  Root,
} from '../components/Document';
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
  const CustomAppPage = options.app ?? DefaultApp;

  if (CustomAppPage.reportWebVitals) {
    getCLS(CustomAppPage.reportWebVitals);
    getFCP(CustomAppPage.reportWebVitals);
    getFID(CustomAppPage.reportWebVitals);
    getLCP(CustomAppPage.reportWebVitals);
    getTTFB(CustomAppPage.reportWebVitals);
  }

  const dataNode = document.getElementById(DOCUMENT_DATA);
  const data = dataNode?.textContent ? JSON.parse(dataNode?.textContent) as HydrationData : null;

  const routerTree = createPageTree(options.pages);
  const pageResult: RenderResult<any> = data && data.isError
    ? {
      assets: options.assetsUrl,
      App: renderError(options, data.data),
      tags: [],
      data: data?.data,
      isError: true,
    }
    : {
      assets: options.assetsUrl,
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
        document: options.document,
      })
    ),
    document,
  );
}
