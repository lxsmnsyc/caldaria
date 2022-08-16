import {
  ErrorBoundary,
  JSX,
  Suspense,
} from 'solid-js';
import {
  DefaultApp,
  useDocumentContext,
} from 'caldaria-root';
import {
  MetaProvider,
} from 'caldaria-meta';
import {
  GlobalRenderOptions,
  ErrorProps,
} from 'caldaria-shared';
import getErrorPage from './error-page';

export default function renderError(
  global: GlobalRenderOptions,
  options: ErrorProps,
): () => JSX.Element {
  const CustomAppPage = global.root.App ?? DefaultApp;
  const CustomErrorPage = getErrorPage(options.statusCode, global);
  const Custom500Page = getErrorPage(500, global);
  return () => {
    const context = useDocumentContext('InternalErrorPage');
    return (
      <Suspense>
        <MetaProvider tags={context.tags}>
          <ErrorBoundary
            fallback={(err) => (
              <Custom500Page
                data={{
                  load: {
                    error: err,
                    statusCode: 500,
                  },
                  action: undefined,
                }}
                params={{}}
              />
            )}
          >
            <CustomAppPage>
              <CustomErrorPage
                data={{
                  load: {
                    error: options.error,
                    statusCode: options.statusCode,
                  },
                  action: undefined,
                }}
                params={{}}
              />
            </CustomAppPage>
          </ErrorBoundary>
        </MetaProvider>
      </Suspense>
      // createComponent(Suspense, {
      //   get children() {
      //     return (
      //       createComponent(MetaProvider, {
      //         tags: context.tags,
      //         get children() {
      //           return (
      //             createComponent(ErrorBoundary, {
      //               fallback: (err) => (
      //                 createComponent(Custom500Page, {
      //                   data: {
      //                     load: {
      //                       error: err,
      //                       statusCode: 500,
      //                     },
      //                     action: undefined,
      //                   },
      //                   params: {},
      //                 })
      //               ),
      //               get children() {
      //                 return (
      //                   createComponent(CustomAppPage, {
      //                     get children() {
      //                       return (
      //                         createComponent(CustomErrorPage, {
      //                           data: {
      //                             load: {
      //                               statusCode: options.statusCode,
      //                               error: options.error,
      //                             },
      //                             action: undefined,
      //                           },
      //                           params: {},
      //                         })
      //                       );
      //                     },
      //                   })
      //                 );
      //               },
      //             })
      //           );
      //         },
      //       })
      //     );
      //   },
      // })
    );
  };
}
