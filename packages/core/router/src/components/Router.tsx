import {
  JSX,
  createContext,
  useContext,
  createMemo,
  mergeProps,
  Show,
} from 'solid-js';
import {
  PageTree,
  RouterParams,
} from 'caldaria-shared';
import {
  matchRoute,
} from '../core/router';
import useLocation, {
  UseLocation,
  UseLocationOptions,
} from '../core/use-location';

export interface RouterInstance<P extends RouterParams = RouterParams> extends UseLocation {
  params: P;
}

const LocationContext = /* @__PURE__ */ createContext<UseLocation>();
const ParamsContext = /* @__PURE__ */ createContext<RouterParams>();

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
    <LocationContext.Provider value={location}>
      <Show when={matchedRoute()} fallback={props.fallback} keyed>
        {(route) => (
          <ParamsContext.Provider value={route.params}>
            <Show when={route.value} keyed>
              {(Comp) => <Comp />}
            </Show>
          </ParamsContext.Provider>
        )}
      </Show>
    </LocationContext.Provider>
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
