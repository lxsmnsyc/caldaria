// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="env.d.ts" />

import { RigidityRoot } from './types';

export {
  DocumentHead,
  DocumentHeadProps,
  DocumentHtml,
  DocumentMain,
  DocumentScript,
} from './components/Document';
export {
  useMDX,
  MDXProvider,
} from './components/Markdown';
export {
  default as createBuild,
} from './build/create-build';
export {
  createDevBuild,
} from './build/create-dev-build';
export {
  RouterInstance,
  useRouter,
  RouterLink,
  RouterParams,
  RouterProps,
  RouterLinkProps,
  createClientPage,
  createServerPage,
  Form,
  FormEncoding,
  FormMethod,
  FormProps,
  APICallback,
  ServerSideContext,
  Page,
  PageProps,
} from './router';
export {
  Meta,
  Title,
  Link,
  Base,
  Style,
} from './meta';
export {
  default as hydrateClient,
} from './render/hydrate-client';
export {
  default as renderStyle,
} from './render/render-style';
export {
  default as createServer,
} from './server';
export {
  Adapter,
  App,
  AppProps,
  BabelBuildOptions,
  BuildContext,
  BuildOptions,
  BundleType,
  DirectoryOptions,
  ErrorPage,
  ErrorProps,
  PathOptions,
  SSRMode,
  ServerFunction,
  WebVitalsMetric,
  RigidityRoot,
} from './types';

export function createRigidityRoot(options: RigidityRoot): RigidityRoot {
  return options;
}
