import { Link, MetaProvider, useTag } from 'caldaria-meta';
import {
  createComponent,
  createUniqueId,
  JSX,
  mergeProps,
} from 'solid-js';
import {
  renderToString,
  ssr,
  ssrHydrationKey,
} from 'solid-js/web';
import { Strategy } from '../client/create-island';

const ROOT = [
  '<ri-frame',
  ' rid="',
  '"><!--#-->',
  '<!--/--><ri-root>',
  '</ri-root><template>',
  '</template><script type="module">',
  '</script></ri-frame>',
];

const FRAGMENT = ['<ri-fragment', '>', '</ri-fragment>'];

interface ClientComp<P> {
  (props: P & { children: JSX.Element }): JSX.Element;
  src: string;
}

interface ClientProps<P> {
  Comp: ClientComp<P>;
  props: P;
  children: JSX.Element;
  hydratable: boolean;
  strategy?: Strategy;
  hasChildren?: boolean;
}

export default function Client<P>(props: ClientProps<P>) {
  const root = createUniqueId();
  const tags = useTag();

  const propsResult = JSON.stringify(props.props);
  const strategyResult = JSON.stringify(props.strategy);

  let fragment = '';

  return ssr(
    ROOT,
    ssrHydrationKey(),
    root,
    createComponent(Link, {
      rel: 'prefetch',
      as: 'script',
      href: props.Comp.src,
    }),
    props.hydratable
      ? renderToString(
        () => (
          createComponent(MetaProvider, {
            tags,
            get children() {
              if (props.hasChildren) {
                return createComponent(
                  props.Comp,
                  mergeProps(props.props, {
                    get children() {
                      const result = ssr(FRAGMENT, ssrHydrationKey(), props.children);
                      fragment = result.t;
                      return result;
                    },
                  }) as P & { children: JSX.Element },
                );
              }
              return createComponent(props.Comp, props.props as P & { children: JSX.Element });
            },
          })
        ),
        {
          renderId: root,
        },
      )
      : '',
    fragment,
    `import m from '${props.Comp.src}';m('${root}',${propsResult},${strategyResult},${String(props.hydratable)},${String(props.hasChildren)})`,
  );
}
