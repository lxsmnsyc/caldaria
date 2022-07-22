import { RigidityRoot } from 'rigidity/types';

export {
  default as DefaultApp,
} from './App';
export {
  DefaultDocument,
  DocumentContext,
  DocumentHead,
  DocumentHeadProps,
  DocumentHtml,
  DocumentMain,
  DocumentScript,
  Root,
  RootProps,
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
