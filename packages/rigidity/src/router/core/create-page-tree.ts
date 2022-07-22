import { LazyPage, PageRoute, PageTree } from '../../types';
import {
  addRoute,
  createRouterNode,
} from './router';

export default function createPageTree(routes: PageRoute[]): PageTree {
  const root = createRouterNode<LazyPage<any>>('');

  for (let i = 0, len = routes.length; i < len; i += 1) {
    const route = routes[i];
    addRoute(root, route.path.split('/'), route.component);
  }

  return root;
}
