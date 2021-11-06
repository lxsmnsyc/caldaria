import {
  JSX,
} from 'solid-js';
import {
  createContext,
  useContext,
  createMemo,
  Show,
  mergeProps,
} from '../../isomorphic';
import { createComponent } from '../../isomorphic-web';
import { Page, PageTree } from '../core/create-page-tree';
import {
  matchRoute,
  RouterParams,
  RouterResult,
} from '../core/router';
import useLocation, { UseLocation, UseLocationOptions } from '../core/use-location';

export interface RouterInstance<P extends RouterParams = RouterParams> extends UseLocation {
  params: P;
}

const LocationContext = createContext<UseLocation>();
const ParamsContext = createContext<RouterParams>();

export interface RouterProps {
  routes: PageTree;
  fallback?: JSX.Element;
  location?: UseLocationOptions;
}

export default function Router(
  props: RouterProps,
): JSX.Element {
  const location = useLocation(() => props.routes, props.location);

  const matchedRoute = createMemo(() => (
    matchRoute(props.routes, location.pathname)
  ));

  return (
    createComponent(LocationContext.Provider, {
      value: location,
      get children() {
        return createComponent(Show, {
          get when(): RouterResult<Page, RouterParams> | undefined {
            return matchedRoute();
          },
          get fallback() {
            return props.fallback;
          },
          children: (result: RouterResult<Page, RouterParams>) => (
            createComponent(ParamsContext.Provider, {
              get value() {
                return result.params;
              },
              get children() {
                return createComponent(Show, {
                  get when(): Page | undefined {
                    return result.value;
                  },
                  children: (Comp: Page) => createComponent(Comp, {}),
                });
              },
            })
          ),
        });
      },
    })
  );
}

export function useRouterUnsafe<P extends RouterParams>(): RouterInstance<P> | undefined {
  const location = useContext(LocationContext);
  const params = useContext(ParamsContext);
  if (location) {
    return mergeProps(location, {
      params: params as P,
    });
  }
  return undefined;
}

export function useRouter<P extends RouterParams>(): RouterInstance<P> {
  const router = useRouterUnsafe<P>();
  if (router) {
    return router;
  }
  throw new Error('useRouter must be used in a component within <Router>');
}
