import {
  ParsedUrlQuery,
} from 'querystring';
import {
  addRoute,
  createRouterNode,
  RouterNode,
  RouterParams,
} from './router';

export type Params = RouterParams;
export type Query = ParsedUrlQuery;

export interface ServerSideContext<
  P extends Params = Params,
  Q extends Query = Query,
> {
  request: Request;
  params: P;
  query: Q;
}

export type APICallback = <
  P extends Params = Params,
  Q extends Query = Query,
>(ctx: ServerSideContext<P, Q>) => Response | Promise<Response>;

export interface APIRoute {
  path: string;
  call: APICallback;
}

export type APITree = RouterNode<APICallback>;

export default function createAPITree(routes: APIRoute[]): APITree {
  const root = createRouterNode<APICallback>('');

  for (let i = 0, len = routes.length; i < len; i += 1) {
    const route = routes[i];
    addRoute(root, route.path.split('/'), route.call);
  }

  return root;
}
