import { renderApp, RenderAppOptions } from '../components/App';
import { DefaultDocument, DocumentContext } from '../components/Document';
import { renderStaticError } from '../components/Error';
import { STATIC_PATH } from '../constants';
import { createComponent, renderToStringAsync } from '../isomorphic-web';
import { AppRenderResult, ErrorProps, GlobalRenderOptions } from '../types';

async function renderCore(
  globalOptions: GlobalRenderOptions,
  pageResult: AppRenderResult,
  target: string,
): Promise<string> {
  const DocumentComponent = globalOptions.document ?? DefaultDocument;

  const documentResult = await renderToStringAsync(() => (
    createComponent(DocumentContext.Provider, {
      value: {
        ...pageResult,
        scriptURL: `/${STATIC_PATH}/${target}.js`,
      },
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
  ), 'index');
}

export async function renderServer(
  globalOptions: GlobalRenderOptions,
  renderOptions: RenderAppOptions,
): Promise<string> {
  return renderCore(globalOptions, await renderApp(
    globalOptions,
    renderOptions,
  ), 'index');
}
