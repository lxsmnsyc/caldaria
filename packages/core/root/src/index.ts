import { RigidityRoot } from 'rigidity-shared';

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

export function createRigidityRoot(options: RigidityRoot): RigidityRoot {
  return options;
}
