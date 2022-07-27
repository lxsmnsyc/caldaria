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

const ROOT = ['<rigidity-island', ' data-ri="', '">', '</rigidity-island>'];
const TEMPLATE = ['<template', ' data-ri="', '">', '</template>'];
const SCRIPT = ['<script', ' type="module">', '</script>'];
const FRAGMENT = ['<rigidity-fragment', '>', '</rigidity-fragment>'];

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
}

export default function Client<P>(props: ClientProps<P>) {
  const root = createUniqueId();

  const propsResult = JSON.stringify(props.props);
  const strategyResult = JSON.stringify(props.strategy);

  return [
    ssr(
      ROOT,
      ssrHydrationKey(),
      escape(root),
      props.hydratable
        ? renderToString(
          () => (
            createComponent(
              props.Comp,
              mergeProps(props.props, {
                get children() {
                  return ssr(FRAGMENT, ssrHydrationKey(), props.children) as unknown as JSX.Element;
                },
              }) as P & { children: JSX.Element },
            )
          ),
          {
            renderId: root,
          },
        )
        : '',
    ),
    ssr(TEMPLATE, ssrHydrationKey(), escape(root), renderToString(
      () => (
        ssr(FRAGMENT, ssrHydrationKey(), props.children)
      ),
      {
        renderId: root,
      },
    )),
    ssr(
      SCRIPT,
      ssrHydrationKey(),
      `import m from '${props.Comp.src}';m('${root}',${propsResult},${strategyResult},${String(props.hydratable)})`,
    ),
  ];
}
