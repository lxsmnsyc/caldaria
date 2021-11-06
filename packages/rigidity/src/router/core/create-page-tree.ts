import {
  JSX,
} from 'solid-js';
import { addRoute, createRouterNode, RouterNode } from './router';

export interface Page {
  (): JSX.Element;
  preload?: () => (void | Promise<Page>);
}

export interface PageRoute {
  path: string;
  component: Page;
}

export type PageTree = RouterNode<Page>;

export default function createPageTree(routes: PageRoute[]): PageTree {
  const root = createRouterNode<Page>('');

  for (let i = 0, len = routes.length; i < len; i += 1) {
    const route = routes[i];
    addRoute(root, route.path.split('/'), route.component);
  }

  return root;
}
