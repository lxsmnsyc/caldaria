import {
  getCLS,
  getFCP,
  getFID,
  getLCP,
  getTTFB,
} from 'web-vitals';
import { createComponent, MountableElement } from 'solid-js/web';
import { JSX } from 'solid-js/jsx-runtime';
import {
  DOCUMENT_ERROR_DATA,
} from '../constants';
import createPageTree from '../router/core/create-page-tree';
import { GlobalRenderOptions, RenderResult } from '../types';
import DefaultApp from '../components/App';
import {
  DocumentContext,
  DefaultDocument,
} from '../components/Document';
import { renderApp } from './render-app';
import renderError from './render-error';

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
  const DocumentComponent = options.document ?? DefaultDocument;
  const CustomAppPage = options.app ?? DefaultApp;

  if (CustomAppPage.reportWebVitals) {
    getCLS(CustomAppPage.reportWebVitals);
    getFCP(CustomAppPage.reportWebVitals);
    getFID(CustomAppPage.reportWebVitals);
    getLCP(CustomAppPage.reportWebVitals);
    getTTFB(CustomAppPage.reportWebVitals);
  }

  const errorData = document.getElementById(DOCUMENT_ERROR_DATA);

  let pageResult: RenderResult;

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
      const errorProps = {
        statusCode: parsedData.statusCode,
        error: transformedError,
      };
      pageResult = {
        App: renderError(options, errorProps),
        tags: [],
        errorProps,
      };
    }
  } else {
    const routerTree = createPageTree(options.pages);
    pageResult = {
      App: renderApp(options, {
        pathname: window.location.pathname,
        search: window.location.search,
        routes: routerTree,
      }),
      tags: [],
    };
  }

  hydrate(
    () => (
      createComponent(DocumentContext.Provider, {
        value: pageResult,
        get children() {
          return (
            createComponent(DocumentComponent, {})
          );
        },
      })
    ),
    document,
  );
}
