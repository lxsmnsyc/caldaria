import { JSX } from 'solid-js/jsx-runtime';
import { renderToStringAsync } from 'solid-js/web';
import { renderApp } from './components/App';
import { DefaultDocument, DocumentContext } from './components/Document';
import { getErrorPath, renderStaticError } from './components/Error';
import { STATIC_PATH } from './constants';
import { ErrorProps, GlobalRenderOptions } from './types';

export interface RenderBaseOptions {
  path: string;
  resourceID: string;
  entrypoint: string;
}

export interface PageOptions extends RenderBaseOptions {
  Component: () => JSX.Element;
}

async function renderInternal(
  global: GlobalRenderOptions,
  options: PageOptions,
): Promise<string> {
  const result = await renderApp(global, options);

  const flag = '<!DOCTYPE html>';

  const DocumentComponent = global.document ?? DefaultDocument;

  return flag + await renderToStringAsync(() => (
    <DocumentContext.Provider
      value={{
        ...result,
        scriptURL: `/${STATIC_PATH}/${options.resourceID}/${options.entrypoint}.js?version=${global.version}`,
        styleURL: `/${STATIC_PATH}/${options.resourceID}/${options.entrypoint}.css?version=${global.version}`,
      }}
    >
      <DocumentComponent />
    </DocumentContext.Provider>
  ));
}

export async function renderError(
  global: GlobalRenderOptions,
  options: ErrorProps,
): Promise<string> {
  const target = getErrorPath(options.statusCode, global);

  const result = await renderStaticError(global, options);

  const flag = '<!DOCTYPE html>';

  const DocumentComponent = global.document ?? DefaultDocument;

  return flag + await renderToStringAsync(() => (
    <DocumentContext.Provider
      value={{
        ...result,
        scriptURL: `/${STATIC_PATH}/${target}/${target}.js?version=${global.version}`,
        styleURL: `/${STATIC_PATH}/${target}/${target}.css?version=${global.version}`,
      }}
    >
      <DocumentComponent />
    </DocumentContext.Provider>
  ));
}

export async function render(
  global: GlobalRenderOptions,
  options: PageOptions,
): Promise<string> {
  return renderInternal(global, options);
}
