import {
  createComponent,
  ErrorBoundary,
  JSX,
  Suspense,
} from 'solid-js';
import {
  DefaultApp,
  useDocumentContext,
} from 'rigidity-root';
import {
  MetaProvider,
} from 'rigidity-meta';
import {
  Router,
  DataProvider,
} from 'rigidity-router';
import {
  GlobalRenderOptions,
  PageTree,
  StatusCode,
} from 'rigidity-shared';
import getErrorPage from './error-page';

export interface RenderAppOptions {
  pathname: string;
  search: string;
  routes: PageTree;
}

export default function renderApp<L, A = undefined>(
  global: GlobalRenderOptions,
  options: RenderAppOptions,
  loadData?: L,
  actionData?: A,
): () => JSX.Element {
  const CustomAppPage = global.root.App ?? DefaultApp;
  const Custom500Page = getErrorPage(500, global);
  const CustomNotFound = getErrorPage(404, global);

  return () => {
    const context = useDocumentContext('InternalApp');
    return (
      createComponent(DataProvider, {
        load: loadData,
        action: actionData,
        get children() {
          return createComponent(Suspense, {
            get children() {
              return (
                createComponent(MetaProvider, {
                  tags: context.tags,
                  get children() {
                    return (
                      createComponent(ErrorBoundary, {
                        fallback: (err) => (
                          createComponent(Custom500Page, {
                            data: {
                              load: {
                                error: err,
                                statusCode: 500,
                              },
                              action: undefined,
                            },
                            params: {},
                          })
                        ),
                        get children() {
                          return (
                            createComponent(CustomAppPage, {
                              get children() {
                                return (
                                  createComponent(Router, {
                                    location: {
                                      pathname: options.pathname,
                                      search: options.search,
                                    },
                                    get fallback() {
                                      return (
                                        createComponent(CustomNotFound, {
                                          data: {
                                            load: {
                                              statusCode: 404,
                                              error: new StatusCode(404),
                                            },
                                            action: undefined,
                                          },
                                          params: {},
                                        })
                                      );
                                    },
                                    routes: options.routes,
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
              );
            },
          });
        },
      })
    );
  };
}
