import {
  createEffect,
  createResource,
  createUniqueId,
  lazy,
} from 'solid-js';
import {
  Page,
  LazyPage,
  PageProps,
} from 'caldaria-shared';
import { useDataContext } from './Data';
import { useRouter } from './Router';
import loadData from '../utils/load-data';

export function createServerPage<L, A = undefined>(
  PageComponent: Page<L, A>,
): LazyPage<L, A> {
  function MockLazy(props: PageProps<L, A>) {
    createUniqueId();
    return PageComponent(props);
  }

  function Component() {
    const ctx = useDataContext<L, A>();
    const router = useRouter();
    const [load] = createResource(
      () => !ctx.initial,
      async () => Promise.resolve(ctx.load),
      {
        initialValue: ctx.load,
      },
    );

    return (
      <MockLazy
        data={{
          load: load() as L,
          action: ctx.action,
        }}
        params={router.params}
      />
    );
    // return createComponent(MockLazy, {
    //   get data() {
    //     return {
    //       load: load() as L,
    //       action: ctx.action,
    //     };
    //   },
    //   params: router.params,
    // });
  }

  Component.preload = async () => {
    await Promise.resolve();
    return PageComponent;
  };

  return Component;
}

export function createClientPage<L, A = undefined>(
  lazyComponent: () => Promise<{ default: Page<L, A> }>,
): LazyPage<L, A> {
  const PageComponent = lazy(lazyComponent);

  function Component() {
    const ctx = useDataContext<L, A>();
    const router = useRouter();
    const [load] = createResource(
      () => !ctx.initial,
      async () => (
        loadData(router.pathname, router.search)
      ),
      {
        initialValue: ctx.load,
      },
    );

    createEffect(() => {
      ctx.initial = false;
    });
    return (
      <PageComponent
        data={{
          load: load() as L,
          action: ctx.action,
        }}
        params={router.params}
      />
    );

    // return createComponent(PageComponent, {
    //   get data() {
    //     return {
    //       load: load() as L,
    //       action: ctx.action,
    //     };
    //   },
    //   params: router.params,
    // });
  }

  Component.preload = async () => {
    const mod = await lazyComponent();
    return mod.default;
  };

  return Component;
}
