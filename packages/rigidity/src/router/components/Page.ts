import {
  createComponent,
  createMemo,
  createResource,
  lazy,
  useContext,
} from 'solid-js';
import { isServer } from 'solid-js/web';
import { LazyPage, Page } from '../core/create-page-tree';
import DataContext from './Data';
import { useRouter } from './Router';

export default function createPage<T>(
  lazyComponent: () => Promise<{ default: Page<T> }>,
): LazyPage<T> {
  const PageComponent = lazy(lazyComponent);

  function Component() {
    const originalData = useContext(DataContext);
    const router = useRouter();
    const [data] = createResource(async () => {
      if (isServer) {
        return originalData;
      }
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
    });
  }

  Component.preload = async () => {
    const mod = await lazyComponent();
    return mod.default;
  };

  return Component;
}
