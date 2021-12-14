import {
  JSX,
} from 'solid-js';
import {
  addRoute,
  createRouterNode,
  RouterNode,
  RouterParams,
} from './router';

export interface PageProps<T, P extends RouterParams = RouterParams> {
  data?: T;
  params: P;
}

export interface Page<T, P extends RouterParams = RouterParams> {
  (props: PageProps<T, P>): JSX.Element;
  getData?: (request: Request, params: P) => T | Promise<T>;
}

export interface LazyPage<T> {
  (): JSX.Element;
  preload: () => Promise<Page<T>>;
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
