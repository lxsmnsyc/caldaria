import { Suspense } from 'solid-js';
import {
  renderToStringAsync,
  ErrorBoundary,
  createComponent,
} from 'solid-js/web';
import StatusCode from '../errors/StatusCode';
import { MetaProvider } from '../meta';
import { Router } from '../router';
import { PageTree } from '../router/core/create-page-tree';
import {
  AppPage,
  AppRenderResult,
  GlobalRenderOptions,
  TagDescription,
} from '../types';
import {
  getErrorPage,
} from './Error';

export const DefaultApp: AppPage = (props) => (
  createComponent(props.Component, {})
);

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
  const CustomErrorPage = getErrorPage(500, global);
  const CustomNotFound = getErrorPage(404, global);

  const tags: TagDescription[] = [];

  const html = await renderToStringAsync(() => (
    createComponent(Suspense, {
      get children() {
        return (
          createComponent(ErrorBoundary, {
            fallback: (error) => (
              createComponent(CustomErrorPage, {
                statusCode: 500,
                error,
              })
            ),
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
        );
      },
    })
  ));

  return {
    html,
    tags,
  };
}
