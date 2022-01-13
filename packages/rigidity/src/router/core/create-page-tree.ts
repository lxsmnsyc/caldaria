import {
  JSX,
} from 'solid-js';
import {
  addRoute,
  createRouterNode,
  RouterNode,
  RouterParams,
} from './router';

export interface PageProps<L, A = undefined, P extends RouterParams = RouterParams> {
  data?: {
    load: L;
    action: A;
  };
  params: P;
}

export interface Page<T, A = undefined, P extends RouterParams = RouterParams> {
  (props: PageProps<T, A, P>): JSX.Element;
  load?: (request: Request, params: P) => T | Promise<T>;
  actions?: Record<string, (request: Request, params: P) => Response | Promise<Response>>;
}

export interface LazyPage<T, A = undefined> {
  (): JSX.Element;
  preload: () => Promise<Page<T, A>>;
}

export interface PageRoute {
  path: string;
  component: LazyPage<any>;
}

export type PageTree = RouterNode<LazyPage<any>>;

export default function createPageTree(routes: PageRoute[]): PageTree {
  const root = createRouterNode<LazyPage<any>>('');

  for (let i = 0, len = routes.length; i < len; i += 1) {
    const route = routes[i];
    addRoute(root, route.path.split('/'), route.component);
  }

  return root;
}
