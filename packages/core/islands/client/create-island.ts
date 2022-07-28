import { createComponent, JSX, mergeProps } from 'solid-js';
import { render, hydrate } from 'solid-js/web';
import type { OnInteractionOptions } from 'rigidity-scheduler/interaction';
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

interface InteractionStrategy {
  type: 'interaction';
  value: OnInteractionOptions;
}

interface ReadyStateStrategy {
  type: 'ready-state';
  value: DocumentReadyState;
}

export type Strategy =
  | LoadStrategy
  | MediaQueryStrategy
  | VisibilityStrategy
  | IdleStrategy
  | AnimationFrameStrategy
  | DelayStrategy
  | InteractionStrategy
  | ReadyStateStrategy;

export type IslandComponent<P> = P & {
  'client:load'?: boolean;
  'client:visible'?: boolean;
  'client:media'?: string;
  'client:only'?: boolean;
  'client:idle'?: boolean;
  'client:animation-frame'?: boolean;
  'client:delay'?: number;
  'client:interaction'?: OnInteractionOptions | boolean;
  'client:ready-state'?: DocumentReadyState;
};

export default function createIsland<P>(
  source: () => Promise<{ default: IslandComp<P> }>,
): Island<P> {
  return async (id, props, strategy, hydratable) => {
    const marker = getRoot(id);
    const renderCallback = async () => {
      const Comp = (await source()).default;
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
          (await import('rigidity-scheduler/media')).default(id, strategy.value, renderCallback);
          break;
        case 'load':
          (await import('rigidity-scheduler/load')).default(id, renderCallback);
          break;
        case 'visible':
          (await import('rigidity-scheduler/visible')).default(id, marker, renderCallback);
          break;
        case 'idle':
          (await import('rigidity-scheduler/idle')).default(id, renderCallback);
          break;
        case 'animation-frame':
          (await import('rigidity-scheduler/animation-frame')).default(id, renderCallback);
          break;
        case 'delay':
          (await import('rigidity-scheduler/delay')).default(id, strategy.value, renderCallback);
          break;
        case 'interaction':
          (await import('rigidity-scheduler/interaction')).default(id, strategy.value, marker, renderCallback);
          break;
        case 'ready-state':
          (await import('rigidity-scheduler/ready-state')).default(id, strategy.value, renderCallback);
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
