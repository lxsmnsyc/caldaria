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
  DOCUMENT_ERROR_DATA,
  DOCUMENT_MAIN_ROOT,
} from '../constants';
import createPageTree from '../router/core/create-page-tree';
import { GlobalRenderOptions } from '../types';
import { Router } from '../router';
import StatusCode from '../errors/StatusCode';
import DefaultApp from '../components/App';
import { getErrorPage } from './error-page';
import { MetaProvider } from '../meta';

interface ParsedErrorProps {
  statusCode: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export default function hydrateClient(
  options: GlobalRenderOptions,
  hydrate: (fn: () => JSX.Element, node: MountableElement) => void,
): void {
  const root = document.getElementById(DOCUMENT_MAIN_ROOT);

  if (!root) {
    throw new Error('Missing rigidity root');
  }

  const CustomAppPage = options.app ?? DefaultApp;
  const Custom500Page = getErrorPage(500, options);
  const CustomNotFound = getErrorPage(404, options);

  if (CustomAppPage.reportWebVitals) {
    getCLS(CustomAppPage.reportWebVitals);
    getFCP(CustomAppPage.reportWebVitals);
    getFID(CustomAppPage.reportWebVitals);
    getLCP(CustomAppPage.reportWebVitals);
    getTTFB(CustomAppPage.reportWebVitals);
  }

  const errorData = document.getElementById(DOCUMENT_ERROR_DATA);

  let Page: () => JSX.Element;

  if (errorData) {
    const encodedData = errorData.textContent;
    if (encodedData) {
      const parsedData = JSON.parse(encodedData) as ParsedErrorProps;
      let transformedError: Error | undefined;
      if (parsedData.error) {
        transformedError = new Error(parsedData.error.message);
        transformedError.name = parsedData.error.name;
        transformedError.stack = parsedData.error.stack;
      }
      Page = () => (
        Solid.createComponent(Custom500Page, {
          statusCode: parsedData.statusCode,
          error: transformedError,
        })
      );
    }
  } else {
    const routerTree = createPageTree(options.pages);
    Page = () => (
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
    );
  }

  hydrate(
    () => (
      Solid.createComponent(MetaProvider, {
        get children() {
          return (
            Solid.createComponent(Solid.ErrorBoundary, {
              fallback: (err) => (
                Solid.createComponent(Custom500Page, {
                  error: err,
                  statusCode: 500,
                })
              ),
              get children() {
                return (
                  Solid.createComponent(CustomAppPage, {
                    Component: Page,
                  })
                );
              },
            })
          );
        },
      })
    ),
    root,
  );
}
