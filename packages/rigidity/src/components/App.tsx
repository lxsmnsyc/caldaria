import { JSX } from 'solid-js/jsx-runtime';
import {
  Dynamic,
  renderToStringAsync,
  ErrorBoundary,
} from 'solid-js/web';
import { AppPage, AppRenderResult, GlobalRenderOptions } from '../types';
import { getErrorPage } from './Error';
import { HeadContext } from './Head';
import { TailContext } from './Tail';

export const DefaultApp: AppPage = {
  Component: (props) => (
    <Dynamic component={props.Component} />
  ),
};

export interface RenderAppOptions {
  Component: () => JSX.Element;
}

export async function renderApp(
  global: GlobalRenderOptions,
  options: RenderAppOptions,
): Promise<AppRenderResult> {
  const CustomAppPage = global.app ?? DefaultApp;
  const CustomErrorPage = getErrorPage(500, global);

  const head: JSX.Element[] = [];
  const tail: JSX.Element[] = [];

  const html = await renderToStringAsync(() => (
    <ErrorBoundary
      fallback={(error) => <CustomErrorPage.Component statusCode={500} error={error} />}
    >
      <HeadContext.Provider value={head}>
        <TailContext.Provider value={tail}>
          <CustomAppPage.Component
            Component={options.Component}
          />
        </TailContext.Provider>
      </HeadContext.Provider>
    </ErrorBoundary>
  ));

  return {
    html,
    head,
    tail,
  };
}
