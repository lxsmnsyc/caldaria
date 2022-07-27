import { JSX } from 'solid-js';
import { getHydrationKey, ssr } from 'solid-js/web';

const TEMPLATE = ['<style', '>rigidity-island, rigidity-fragment { display: contents }</style>'];

export default function IslandStyles(): JSX.Element {
  return ssr(TEMPLATE, getHydrationKey()) as unknown as JSX.Element;
}
