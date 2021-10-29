import { createContext, useContext } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';
import { HydrationScript } from 'solid-js/web';
import { DOCUMENT_MAIN_ROOT } from '../constants';

interface DocumentContextValue {
  html: string;
  head: JSX.Element[];
  tail: JSX.Element[];
  scriptURL: string;
  styleURL: string;
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
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {context?.head}
      {props.children}
      <link
        rel="preload"
        as="style"
        href={context?.styleURL ?? ''}
      />
      <link
        rel="stylesheet"
        href={context?.styleURL ?? ''}
      />
    </head>
  );
}

export function DocumentMain(): JSX.Element {
  const context = useContext(DocumentContext);

  return (
    <div
      id={DOCUMENT_MAIN_ROOT}
      innerHTML={context?.html ?? ''}
    />
  );
}

export interface DocumentTailProps {
  children?: JSX.Element;
}

export function DocumentTail(props: DocumentTailProps): JSX.Element {
  const context = useContext(DocumentContext);
  return (
    <>
      {props.children}
      {context?.tail}
    </>
  );
}

export function DocumentScript(): JSX.Element {
  const context = useContext(DocumentContext);

  return (
    <>
      <HydrationScript />
      <script
        type="module"
        src={context?.scriptURL ?? ''}
      />
    </>
  );
}

export function DocumentHtml(props: JSX.IntrinsicElements['html']): JSX.Element {
  return (
    <html
      {...props}
      lang={props.lang ?? 'en'}
    />
  );
}
export function DefaultDocument(): JSX.Element {
  return (
    <DocumentHtml>
      <DocumentHead>
        <DocumentScript />
      </DocumentHead>
      <body>
        <DocumentMain />
        <DocumentTail />
      </body>
    </DocumentHtml>
  );
}
