import {
  createComponent,
  createResource,
  createUniqueId,
  lazy,
  useContext,
} from 'solid-js';
import { LazyPage, Page, PageProps } from '../core/create-page-tree';
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
    const originalData = useContext(DataContext);
    const router = useRouter();
    const [data] = createResource(async () => Promise.resolve(originalData), {
      initialValue: originalData,
    });

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
    const originalData = useContext(DataContext);
    const router = useRouter();
    const [data] = createResource(async () => {
      const response = await fetch(`${router.pathname}${router.search}`, {
        headers: {
          'X-Rigidity-Method': 'GET',
        },
      });
      return response.json();
    }, {
      initialValue: originalData,
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
