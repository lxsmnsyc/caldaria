import { Link, MetaProvider, useTag } from 'rigidity-meta';
import {
  createComponent,
  createUniqueId,
  JSX,
  mergeProps,
} from 'solid-js';
import {
  escape,
  renderToString,
  ssr,
  ssrHydrationKey,
} from 'solid-js/web';
import { Strategy } from '../client/create-island';

const ROOT = ['<ri-root', ' rid="', '">', '</ri-root>'];
const TEMPLATE = ['<template', ' data-ri="', '">', '</template>'];
const SCRIPT = ['<script', ' type="module">', '</script>'];
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

  return [
    createComponent(Link, {
      rel: 'prefetch',
      as: 'script',
      href: props.Comp.src,
    }),
    ssr(
      ROOT,
      ssrHydrationKey(),
      escape(root),
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
                        console.log(fragment);
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
    ),
    props.hasChildren && ssr(TEMPLATE, ssrHydrationKey(), escape(root), fragment),
    ssr(
      SCRIPT,
      ssrHydrationKey(),
      `import m from '${props.Comp.src}';m('${root}',${propsResult},${strategyResult},${String(props.hydratable)})`,
    ),
  ];
}
