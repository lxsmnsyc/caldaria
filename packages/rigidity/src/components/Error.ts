import {
  getReasonPhrase,
} from 'http-status-codes';
import {
  JSX,
} from 'solid-js';
import {
  renderToStringAsync,
  ErrorBoundary,
  createComponent,
  Dynamic,
} from '../isomorphic-web';
import {
  MetaProvider,
  Style,
  Title,
} from '../meta';
import {
  CUSTOM_404,
  CUSTOM_500,
  CUSTOM_ERROR,
} from '../constants';
import {
  ErrorPage,
  ErrorProps,
  GlobalRenderOptions,
  AppRenderResult,
  TagDescription,
} from '../types';

const ERROR_ROOT_STYLE = {
  color: '#000',
  background: '#fff',
  fontFamily: '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ERROR_STATUS_CODE_STYLE = {
  fontSize: '1.5rem',
  lineHeight: '2rem',
  fontWeight: 'bold',
  marginRight: '2rem',
};

const ERROR_REASON_STYLE = {
  fontSize: '1.25rem',
  lineHeight: '1.75rem',
};

export function DefaultErrorComponent(props: ErrorProps): JSX.Element {
  return (
    createComponent(Dynamic, {
      style: ERROR_ROOT_STYLE,
      get children() {
        return [
          createComponent(Title, {
            get children() {
              return `${props.statusCode}: ${getReasonPhrase(props.statusCode)}`;
            },
          }),
          createComponent(Style, {
            get children() {
              return 'body { margin: 0 }';
            },
          }),
          createComponent(Dynamic, {
            component: 'span',
            style: ERROR_STATUS_CODE_STYLE,
            get children() {
              return props.statusCode;
            },
          }),
          createComponent(Dynamic, {
            component: 'span',
            style: ERROR_REASON_STYLE,
            get children() {
              return getReasonPhrase(props.statusCode);
            },
          }),
        ];
      },
    })
  );
}

export const DefaultErrorPage: ErrorPage = DefaultErrorComponent;

export function getErrorPage(
  statusCode: number,
  global: GlobalRenderOptions,
): ErrorPage {
  if (statusCode === 404 && global.error404) {
    return global.error404;
  }
  if (statusCode === 500 && global.error500) {
    return global.error500;
  }
  if (global.error) {
    return global.error;
  }
  return DefaultErrorPage;
}

export function getErrorPath(
  statusCode: number,
  global: GlobalRenderOptions,
): string {
  if (statusCode === 404 && global.error404) {
    return CUSTOM_404;
  }
  if (statusCode === 500 && global.error500) {
    return CUSTOM_500;
  }
  return CUSTOM_ERROR;
}

export async function renderStaticError(
  global: GlobalRenderOptions,
  options: ErrorProps,
): Promise<AppRenderResult> {
  const CustomErrorPage = getErrorPage(options.statusCode, global);

  const tags: TagDescription[] = [];

  const html = await renderToStringAsync(() => (
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
              return createComponent(CustomErrorPage, {
                statusCode: options.statusCode,
                error: options.error,
              });
            },
          })
        );
      },
    })
  ));

  return {
    html,
    tags,
    errorProps: options,
  };
}
