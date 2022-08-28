import {
  JSX,
  createContext,
  useContext,
} from 'solid-js';
import {
  // Dynamic,
  HydrationScript,
  // createComponent,
  useAssets,
} from 'solid-js/web';
import {
  DOCUMENT_DATA,
  DOCUMENT_MAIN_ROOT,
  RenderResult,
} from 'caldaria-shared';
import {
  renderTags,
} from 'caldaria-meta';

const DocumentContext = /* @__PURE__ */ (
  createContext<RenderResult<any>>()
);

export function useDocumentContext(componentName: string) {
  const context = useContext(DocumentContext);
  if (context) {
    return context;
  }
  throw new Error(`<${componentName}> must be used in a <Document> component`);
}

export interface DocumentHeadProps {
  children?: JSX.Element;
}

export function DocumentHead(props: DocumentHeadProps): JSX.Element {
  const context = useDocumentContext('DocumentHead');

  useAssets(() => renderTags(context.tags));

  return (
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>{'ri-root,ri-fragment,ri-frame{display:contents;}'}</style>
      {props.children}
    </head>
  );
}

export function DocumentMain(): JSX.Element {
  const context = useDocumentContext('DocumentMain');

  return (
    <div id={DOCUMENT_MAIN_ROOT}>
      <context.App />
    </div>
  );
}

export function DocumentScript(): JSX.Element {
  const context = useDocumentContext('DocumentScript');

  return (
    <>
      <HydrationScript />
      {context.mode !== 'islands' && (
        <script id={DOCUMENT_DATA} type="application/json">
          {JSON.stringify({
            data: context.data,
            isError: context.isError,
          })}
        </script>
      )}
      <script
        type="module"
        async
        src={`${context.assets}/index.js`}
      />
    </>
  );
}

export function DocumentHtml(props: JSX.IntrinsicElements['html']): JSX.Element {
  useDocumentContext('DocumentHtml');

  return (
    <html {...props} lang={props.lang ?? 'en'} />
  );
}
export function DefaultDocument(): JSX.Element {
  return (
    <DocumentHtml>
      <DocumentHead />
      <body>
        <DocumentMain />
        <DocumentScript />
      </body>
    </DocumentHtml>
  );
}

export interface RootProps extends RenderResult<any> {
  document?: () => JSX.Element;
}

export function Root(props: RootProps): JSX.Element {
  const DocumentComponent = props.document ?? DefaultDocument;
  return (
    <DocumentContext.Provider value={props}>
      <DocumentComponent />
    </DocumentContext.Provider>
  );
}
