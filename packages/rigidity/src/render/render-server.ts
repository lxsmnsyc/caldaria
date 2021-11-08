import { createComponent, renderToStringAsync } from 'solid-js/web';
import { DefaultDocument, DocumentContext } from '../components/Document';
import { RenderResult, ErrorProps, GlobalRenderOptions } from '../types';
import { RenderAppOptions, renderApp } from './render-app';
import renderError from './render-error';

async function renderCore(
  globalOptions: GlobalRenderOptions,
  pageResult: RenderResult,
): Promise<string> {
  const DocumentComponent = globalOptions.document ?? DefaultDocument;

  const documentResult = await renderToStringAsync(() => (
    createComponent(DocumentContext.Provider, {
      value: pageResult,
      get children() {
        return (
          createComponent(DocumentComponent, {})
        );
      },
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
    errorProps: renderOptions,
  });
}

export async function renderServer(
  globalOptions: GlobalRenderOptions,
  renderOptions: RenderAppOptions,
): Promise<string> {
  return renderCore(globalOptions, {
    App: renderApp(
      globalOptions,
      renderOptions,
    ),
    tags: [],
  });
}
