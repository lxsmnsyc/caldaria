import { createComponent, JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export default function IslandStyles(): JSX.Element {
  return createComponent(Dynamic, {
    component: 'style',
    children: 'rigidity-island, rigidity-fragment { display: contents }',
  });
}
