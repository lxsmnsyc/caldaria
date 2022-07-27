import { createComponent, JSX, mergeProps } from 'solid-js';
import { render, hydrate } from 'solid-js/web';
import {
  onAnimationFrame,
  onDelay,
  onHover,
  onIdle,
  onLoad,
  onMedia,
  onVisible,
} from './scheduler';
import { getRoot, getFragment } from './nodes';
import processScript from './process-script';

type Island<P> = (
  id: string,
  props: P,
  strategy?: Strategy,
  hydratable?: boolean,
) => Promise<void>;
type IslandComp<P> = (props: P & { children?: JSX.Element }) => JSX.Element;

interface MediaQueryStrategy {
  type: 'media';
  value: string;
}

interface VisibilityStrategy {
  type: 'visible';
  value: string;
}

interface LoadStrategy {
  type: 'load';
  value?: undefined;
}

interface IdleStrategy {
  type: 'idle';
  value?: undefined;
}

interface AnimationFrameStrategy {
  type: 'animation-frame';
  value?: undefined;
}

interface DelayStrategy {
  type: 'delay';
  value: number;
}

interface HoverStrategy {
  type: 'hover';
  value: number;
}

export type Strategy =
  | LoadStrategy
  | MediaQueryStrategy
  | VisibilityStrategy
  | IdleStrategy
  | AnimationFrameStrategy
  | DelayStrategy
  | HoverStrategy;

export type IslandComponent<P> = P & {
  'client:load'?: boolean;
  'client:visible'?: boolean;
  'client:media'?: string;
  'client:only'?: boolean;
  'client:idle'?: boolean;
  'client:animation-frame'?: boolean;
  'client:delay'?: number;
  'client:hover'?: number | boolean;
};

export default function createIsland<P>(
  source: () => Promise<{ default: IslandComp<P> }>,
): Island<P> {
  return async (id, props, strategy, hydratable) => {
    const renderCallback = async () => {
      const Comp = (await source()).default;
      const marker = getRoot(id);
      const fragment = getFragment(id);
      const root = (fragment
        ? () => (
          createComponent(Comp, mergeProps(props, {
            get children() {
              const node = (fragment as HTMLTemplateElement).content.firstChild!;
              processScript(node);
              return node;
            },
          }) as P & { children?: JSX.Element })
        )
        : () => createComponent(Comp, props)
      );
      if (hydratable) {
        hydrate(root, marker, {
          renderId: id,
        });
      } else {
        render(root, marker);
      }
    };

    if (strategy) {
      switch (strategy.type) {
        case 'media':
          onMedia(id, strategy.value, renderCallback);
          break;
        case 'load':
          onLoad(id, renderCallback);
          break;
        case 'visible':
          onVisible(id, renderCallback);
          break;
        case 'idle':
          onIdle(id, renderCallback);
          break;
        case 'animation-frame':
          onAnimationFrame(id, renderCallback);
          break;
        case 'delay':
          onDelay(id, strategy.value, renderCallback);
          break;
        case 'hover':
          onHover(id, strategy.value, renderCallback);
          break;
        default:
          await renderCallback();
          break;
      }
    } else {
      await renderCallback();
    }
  };
}
