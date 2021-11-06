import {
  getCLS,
  getFCP,
  getFID,
  getLCP,
  getTTFB,
} from 'web-vitals';
import * as Solid from 'solid-js';
import { MountableElement } from 'solid-js/web';
import { JSX } from 'solid-js/jsx-runtime';
import {
  DOCUMENT_MAIN_ROOT,
} from '../constants';
import createPageTree from '../router/core/create-page-tree';
import { GlobalRenderOptions } from '../types';
import { Router } from '../router';
import StatusCode from '../errors/StatusCode';
import { DefaultApp } from '../components/App';
import { getErrorPage } from '../components/Error';

export default function hydrateClient(
  options: GlobalRenderOptions,
  hydrate: (fn: () => JSX.Element, node: MountableElement) => void,
): void {
  const root = document.getElementById(DOCUMENT_MAIN_ROOT);

  if (!root) {
    throw new Error('Missing rigidity root');
  }

  const CustomAppPage = options.app ?? DefaultApp;
  const CustomErrorPage = getErrorPage(500, options);
  const CustomNotFound = getErrorPage(404, options);

  if (CustomAppPage.reportWebVitals) {
    getCLS(CustomAppPage.reportWebVitals);
    getFCP(CustomAppPage.reportWebVitals);
    getFID(CustomAppPage.reportWebVitals);
    getLCP(CustomAppPage.reportWebVitals);
    getTTFB(CustomAppPage.reportWebVitals);
  }

  const routerTree = createPageTree(options.pages);

  hydrate(
    () => (
      Solid.createComponent(Solid.ErrorBoundary, {
        fallback: (err) => (
          Solid.createComponent(CustomErrorPage, {
            error: err,
            statusCode: 500,
          })
        ),
        get children() {
          return (
            Solid.createComponent(CustomAppPage, {
              Component: () => (
                Solid.createComponent(Router, {
                  routes: routerTree,
                  get fallback() {
                    return (
                      Solid.createComponent(CustomNotFound, {
                        error: new StatusCode(404),
                        statusCode: 404,
                      })
                    );
                  },
                })
              ),
            })
          );
        },
      })
    ),
    root,
  );
}
