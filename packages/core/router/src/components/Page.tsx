import {
  createEffect,
  createResource,
  lazy,
} from 'solid-js';
import {
  Page,
  LazyPage,
} from 'caldaria-shared';
import { useDataContext } from './Data';
import { useRouter } from './Router';
import loadData from '../utils/load-data';

export default function createPage<L, A = undefined>(
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
  }

  Component.preload = async () => {
    const mod = await lazyComponent();
    return mod.default;
  };

  return Component;
}
