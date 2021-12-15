import {
  createComponent,
  createEffect,
  createResource,
  createUniqueId,
  lazy,
  useContext,
} from 'solid-js';
import { LazyPage, Page, PageProps } from '../core/create-page-tree';
import loadData from '../utils/load-data';
import DataContext from './Data';
import { useRouter } from './Router';

export function createServerPage<T>(
  PageComponent: Page<T>,
): LazyPage<T> {
  function MockLazy(props: PageProps<T>) {
    createUniqueId();
    return PageComponent(props);
  }

  function Component() {
    const ctx = useContext(DataContext);
    const router = useRouter();
    const [data] = createResource(
      () => !ctx?.initial,
      async () => Promise.resolve(ctx?.data),
      {
        initialValue: ctx?.data,
      },
    );

    return createComponent(MockLazy, {
      get data() {
        return data();
      },
      params: router.params,
    });
  }

  Component.preload = async () => {
    await Promise.resolve();
    return PageComponent;
  };

  return Component;
}

export function createClientPage<T>(
  lazyComponent: () => Promise<{ default: Page<T> }>,
): LazyPage<T> {
  const PageComponent = lazy(lazyComponent);

  function Component() {
    const ctx = useContext(DataContext);
    const router = useRouter();
    const [data] = createResource(
      () => !ctx?.initial,
      async () => (
        loadData(router.pathname, router.search)
      ), {
        initialValue: ctx?.data,
      },
    );

    createEffect(() => {
      if (ctx) {
        ctx.initial = false;
      }
    });

    return createComponent(PageComponent, {
      get data() {
        return data();
      },
      params: router.params,
    });
  }

  Component.preload = async () => {
    const mod = await lazyComponent();
    return mod.default;
  };

  return Component;
}
