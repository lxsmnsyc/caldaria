import { APIRoute, APITree, APICallback } from 'caldaria-shared';
import {
  addRoute,
  createRouterNode,
} from './router';

export default function createAPITree(routes: APIRoute[]): APITree {
  const root = createRouterNode<APICallback>('');

  for (let i = 0, len = routes.length; i < len; i += 1) {
    const [path, call] = routes[i];
    addRoute(root, path.split('/'), call);
  }

  return root;
}
