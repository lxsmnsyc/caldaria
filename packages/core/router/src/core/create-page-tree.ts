import { LazyPage, PageRoute, PageTree } from 'caldaria-shared';
import {
  addRoute,
  createRouterNode,
} from './router';

export default function createPageTree(routes: PageRoute[]): PageTree {
  const root = createRouterNode<LazyPage<any>>('');

  for (let i = 0, len = routes.length; i < len; i += 1) {
    const [path, component] = routes[i];
    addRoute(root, path.split('/'), component);
  }

  return root;
}
