import { CaldariaRoot } from 'caldaria-shared';

export {
  default as DefaultApp,
} from './App';
export {
  DefaultDocument,
  DocumentHead,
  DocumentHeadProps,
  DocumentHtml,
  DocumentMain,
  DocumentScript,
  Root,
  RootProps,
  useDocumentContext,
} from './Document';
export {
  default as DefaultErrorComponent,
} from './Error';
export {
  MDXProvider,
  useMDX,
} from './Markdown';

export function createCaldariaRoot(options: CaldariaRoot): CaldariaRoot {
  return options;
}
