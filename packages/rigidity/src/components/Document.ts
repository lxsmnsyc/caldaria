import {
  JSX,
  createContext,
  useContext,
} from 'solid-js';
import {
  Dynamic,
  HydrationScript,
  createComponent,
} from 'solid-js/web';
import { DOCUMENT_ERROR_DATA, DOCUMENT_MAIN_ROOT, STATIC_PATH } from '../constants';
import { AppRenderResult } from '../types';

export const DocumentContext = /* @__PURE__ */ (
  createContext<AppRenderResult>()
);

export interface DocumentHeadProps {
  children: JSX.Element;
}

export function DocumentHead(props: DocumentHeadProps): JSX.Element {
  const context = useContext(DocumentContext);
  return (
    createComponent(Dynamic, {
      component: 'head',
      get children() {
        return [
          createComponent(Dynamic, {
            component: 'meta',
            charset: 'UTF-8',
          }),
          createComponent(Dynamic, {
            component: 'meta',
            name: 'viewport',
            content: 'width=device-width, initial-scale=1',
          }),
          context?.tags.map((value) => (
            createComponent(Dynamic, {
              component: value.tag,
              ...value.props,
            })
          )),
          props.children,
        ];
      },
    })
  );
}

export function DocumentMain(): JSX.Element {
  const context = useContext(DocumentContext);

  return (
    createComponent(Dynamic, {
      component: 'div',
      id: DOCUMENT_MAIN_ROOT,
      children: context?.html ?? '',
    })
  );
}

export function DocumentScript(): JSX.Element {
  const context = useContext(DocumentContext);

  return [
    createComponent(Dynamic, { component: HydrationScript }),
    context?.errorProps && createComponent(Dynamic, {
      component: 'script',
      type: 'application/json',
      id: DOCUMENT_ERROR_DATA,
      children: JSON.stringify({
        statusCode: context.errorProps.statusCode,
        error: (
          context.errorProps.error
            ? {
              name: context.errorProps.error?.name,
              message: context.errorProps.error.message,
              stack: context.errorProps.error?.stack,
            }
            : undefined
        ),
      }),
    }),
    createComponent(Dynamic, {
      component: 'script',
      type: 'module',
      src: `/${STATIC_PATH}/index.js`,
    }),
  ];
}

export function DocumentHtml(props: JSX.IntrinsicElements['html']): JSX.Element {
  return (
    createComponent(Dynamic, {
      component: 'html',
      ...props,
      lang: props.lang ?? 'en',
    })
  );
}
export function DefaultDocument(): JSX.Element {
  return (
    createComponent(DocumentHtml, {
      get children() {
        return [
          createComponent(DocumentHead, {
            get children() {
              return (
                createComponent(DocumentScript, {})
              );
            },
          }),
          createComponent(Dynamic, {
            component: 'body',
            get children() {
              return (
                createComponent(DocumentMain, {})
              );
            },
          }),
        ];
      },
    })
  );
}
