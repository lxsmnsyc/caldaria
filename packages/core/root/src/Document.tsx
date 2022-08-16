import {
  JSX,
  createContext,
  useContext,
  createMemo,
} from 'solid-js';
import {
  // Dynamic,
  HydrationScript,
  // createComponent,
  ssr,
  Assets,
  NoHydration,
} from 'solid-js/web';
import {
  DOCUMENT_DATA,
  DOCUMENT_MAIN_ROOT,
  RenderResult,
} from 'rigidity-shared';
import {
  renderTags,
} from 'rigidity-meta';
import {
  IslandStyles,
} from 'rigidity-islands/server';

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
  return (
    <head $ServerOnly>
      <meta $ServerOnly charset="UTF-8" />
      <meta $ServerOnly name="viewport" content="width=device-width, initial-scale=1" />
      <Assets>{ssr(renderTags(context.tags)) as unknown as JSX.Element}</Assets>
      <IslandStyles />
      {props.children}
    </head>
  );
}

export function DocumentMain(): JSX.Element {
  const context = useDocumentContext('DocumentMain');

  return (
    <div $ServerOnly id={DOCUMENT_MAIN_ROOT}>
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
        <script id={DOCUMENT_DATA} type="application/json" $ServerOnly>
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
        $ServerOnly
      />
    </>
  );
}

export function DocumentHtml(props: JSX.IntrinsicElements['html']): JSX.Element {
  useDocumentContext('DocumentHtml');

  return (
    <html {...props} lang={props.lang ?? 'en'} $ServerOnly>
      {props.children}
    </html>
  );
}
export function DefaultDocument(): JSX.Element {
  return (
    <DocumentHtml>
      <DocumentHead>
        <DocumentScript />
      </DocumentHead>
      <body $ServerOnly>
        <DocumentMain />
      </body>
    </DocumentHtml>
  );
}

export interface RootProps extends RenderResult<any> {
  document?: () => JSX.Element;
}

interface HydrationBoundaryProps {
  shouldHydrate: boolean;
  children: JSX.Element;
}

function HydrationBoundary(props: HydrationBoundaryProps) {
  if (props.shouldHydrate) {
    return createMemo(() => props.children);
  }
  return <NoHydration>{props.children}</NoHydration>;
}

export function Root(props: RootProps): JSX.Element {
  const DocumentComponent = props.document ?? DefaultDocument;
  return (
    <HydrationBoundary shouldHydrate={props.mode !== 'islands'}>
      <DocumentContext.Provider value={props}>
        <DocumentComponent />
      </DocumentContext.Provider>
    </HydrationBoundary>
  );
}
