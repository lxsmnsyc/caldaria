import {
  JSX,
  createContext,
  useContext,
} from 'solid-js';
import {
  Dynamic,
  HydrationScript,
  createComponent,
  ssr,
  Assets,
} from 'solid-js/web';
import {
  DOCUMENT_DATA,
  DOCUMENT_MAIN_ROOT,
  RenderResult,
} from 'rigidity-shared';
import {
  renderTags,
} from 'rigidity-meta';

export const DocumentContext = /* @__PURE__ */ (
  createContext<RenderResult<any>>()
);

export interface DocumentHeadProps {
  children?: JSX.Element;
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
          createComponent(Assets, {
            get children() {
              return ssr(renderTags(context?.tags ?? [])) as unknown as JSX.Element;
            },
          }),
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
      get children() {
        return createComponent(Dynamic, {
          component: context?.App,
        });
      },
    })
  );
}

export function DocumentScript(): JSX.Element {
  const context = useContext(DocumentContext);

  return [
    createComponent(Dynamic, { component: HydrationScript }),
    createComponent(Dynamic, {
      component: 'script',
      type: 'application/json',
      id: DOCUMENT_DATA,
      children: JSON.stringify({
        data: context?.data,
        isError: context?.isError,
      }),
    }),
    createComponent(Dynamic, {
      component: 'script',
      type: 'module',
      async: true,
      src: `${context?.assets ?? ''}/index.js`,
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

export interface RootProps extends RenderResult<any> {
  document?: () => JSX.Element;
}

export function Root(props: RootProps): JSX.Element {
  return (
    createComponent(DocumentContext.Provider, {
      value: props,
      get children() {
        return createComponent(props.document ?? DefaultDocument, {});
      },
    })
  );
}
