import { createComponent, Suspense } from 'solid-js';
import { renderToStringAsync } from 'solid-js/web';
import DefaultApp from '../components/App';
import StatusCode from '../errors/StatusCode';
import { MetaProvider } from '../meta';
import { Router } from '../router';
import { PageTree } from '../router/core/create-page-tree';
import { GlobalRenderOptions, AppRenderResult, TagDescription } from '../types';
import { getErrorPage } from './error-page';

export interface RenderAppOptions {
  pathname: string;
  search: string;
  routes: PageTree;
}

export async function renderApp(
  global: GlobalRenderOptions,
  options: RenderAppOptions,
): Promise<AppRenderResult> {
  const CustomAppPage = global.app ?? DefaultApp;
  const CustomNotFound = getErrorPage(404, global);

  const tags: TagDescription[] = [];

  const html = await renderToStringAsync(() => (
    createComponent(Suspense, {
      get children() {
        return (
          createComponent(MetaProvider, {
            tags,
            get children() {
              return (
                createComponent(CustomAppPage, {
                  Component: () => (
                    createComponent(Router, {
                      location: {
                        pathname: options.pathname,
                        search: options.search,
                      },
                      get fallback() {
                        return (
                          createComponent(CustomNotFound, {
                            statusCode: 404,
                            error: new StatusCode(404),
                          })
                        );
                      },
                      routes: options.routes,
                    })
                  ),
                })
              );
            },
          })
        );
      },
    })
  ));

  return {
    html,
    tags,
  };
}
