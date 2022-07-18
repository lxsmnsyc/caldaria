import {
  createComponent,
  ErrorBoundary,
  JSX,
  Suspense,
  useContext,
} from 'solid-js';
import DefaultApp from '../components/App';
import {
  DocumentContext,
} from '../components/Document';
import {
  MetaProvider,
} from '../meta';
import {
  GlobalRenderOptions,
  ErrorProps,
} from '../types';
import getErrorPage from './error-page';

export default function renderError(
  global: GlobalRenderOptions,
  options: ErrorProps,
): () => JSX.Element {
  const CustomAppPage = global.root.App ?? DefaultApp;
  const CustomErrorPage = getErrorPage(options.statusCode, global);
  const Custom500Page = getErrorPage(500, global);
  return () => {
    const context = useContext(DocumentContext);
    return (
      createComponent(Suspense, {
        get children() {
          return (
            createComponent(MetaProvider, {
              tags: context?.tags ?? [],
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
                              createComponent(CustomErrorPage, {
                                data: {
                                  load: {
                                    statusCode: options.statusCode,
                                    error: options.error,
                                  },
                                  action: undefined,
                                },
                                params: {},
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
      })
    );
  };
}
