import {
  JSX,
} from 'solid-js';
import {
  createContext,
  useContext,
} from '../isomorphic';
import {
  Dynamic,
  HydrationScript,
  createComponent,
} from '../isomorphic-web';
import { DOCUMENT_MAIN_ROOT } from '../constants';
import { TagDescription } from '../types';

interface DocumentContextValue {
  html: string;
  tags: TagDescription[];
  scriptURL: string;
}

export const DocumentContext = /* @__PURE__ */ (
  createContext<DocumentContextValue>()
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
      innerHTML: context?.html ?? '',
    })
  );
}

export function DocumentScript(): JSX.Element {
  const context = useContext(DocumentContext);

  return [
    createComponent(Dynamic, { component: HydrationScript }),
    createComponent(Dynamic, {
      component: 'script',
      type: 'module',
      src: context?.scriptURL ?? '',
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
