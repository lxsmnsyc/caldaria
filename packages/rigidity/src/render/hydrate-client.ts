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
  GlobalRenderOptions,
} from '../types';
import DefaultApp from '../components/App';
import {
  Root,
} from '../components/Document';
import renderApp from './render-app';

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
  const data = dataNode?.textContent ? JSON.parse(dataNode?.textContent) : null;

  const routerTree = createPageTree(options.pages);
  const pageResult = {
    App: renderApp(options, {
      pathname: window.location.pathname,
      search: window.location.search,
      routes: routerTree,
    }, data),
    tags: [],
    data,
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
