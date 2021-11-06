import { createComponent, renderToStringAsync } from 'solid-js/web';
import { renderApp, RenderAppOptions } from '../components/App';
import { DefaultDocument, DocumentContext } from '../components/Document';
import { renderStaticError } from '../components/Error';
import { AppRenderResult, ErrorProps, GlobalRenderOptions } from '../types';

async function renderCore(
  globalOptions: GlobalRenderOptions,
  pageResult: AppRenderResult,
): Promise<string> {
  const DocumentComponent = globalOptions.document ?? DefaultDocument;

  console.log(pageResult);

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
  return renderCore(globalOptions, await renderStaticError(
    globalOptions,
    renderOptions,
  ));
}

export async function renderServer(
  globalOptions: GlobalRenderOptions,
  renderOptions: RenderAppOptions,
): Promise<string> {
  return renderCore(globalOptions, await renderApp(
    globalOptions,
    renderOptions,
  ));
}
