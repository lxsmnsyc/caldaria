import { APIRoute, APITree, APICallback } from 'rigidity-shared';
import {
  addRoute,
  createRouterNode,
} from './router';

export default function createAPITree(routes: APIRoute[]): APITree {
  const root = createRouterNode<APICallback>('');

  for (let i = 0, len = routes.length; i < len; i += 1) {
    const route = routes[i];
    addRoute(root, route.path.split('/'), route.call);
  }

  return root;
}
