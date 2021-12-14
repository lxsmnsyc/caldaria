import {
  createComponent,
  renderToStringAsync,
} from 'solid-js/web';
import {
  Root,
} from '../components/Document';
import {
  RenderResult,
  ErrorProps,
  GlobalRenderOptions,
} from '../types';
import renderApp, { RenderAppOptions } from './render-app';
import renderError from './render-error';

async function renderCore<T>(
  globalOptions: GlobalRenderOptions,
  pageResult: RenderResult<T>,
): Promise<string> {
  const documentResult = await renderToStringAsync(() => (
    createComponent(Root, {
      ...pageResult,
      document: globalOptions.document,
    })
  ));

  return `<!DOCTYPE html>${documentResult}`;
}

export async function renderServerError(
  globalOptions: GlobalRenderOptions,
  renderOptions: ErrorProps,
): Promise<string> {
  return renderCore(globalOptions, {
    App: renderError(
      globalOptions,
      renderOptions,
    ),
    tags: [],
    data: renderOptions,
  });
}

export async function renderServer<T>(
  globalOptions: GlobalRenderOptions,
  renderOptions: RenderAppOptions,
  response?: T,
): Promise<string> {
  return renderCore(globalOptions, {
    App: renderApp(
      globalOptions,
      renderOptions,
      response,
    ),
    tags: [],
    data: response,
  });
}
