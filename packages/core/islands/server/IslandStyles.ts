import { JSX } from 'solid-js';
import { escape, ssr, ssrHydrationKey } from 'solid-js/web';

const STYLE = ['<style', '>', '</style>'];
const CONTENT = escape('rigidity-island, rigidity-fragment { display: contents }');

export default function IslandStyles(): JSX.Element {
  return ssr(STYLE, ssrHydrationKey(), CONTENT) as unknown as JSX.Element;
}
