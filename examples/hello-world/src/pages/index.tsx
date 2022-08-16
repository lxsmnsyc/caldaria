/* @jsxImportSource solid-js */
import { Meta, Title } from 'caldaria/meta';
import { RouterLink } from 'caldaria/router';
import { JSX } from 'solid-js';

export default function Index(): JSX.Element {
  return (
    <div class="flex w-full h-screen items-center justify-center">
      <div class="p-4 rounded-lg bg-indigo-900 bg-opacity-25 flex flex-col space-y-4">
        <Title>Welcome to Caldaria Demo!</Title>
        <Meta name="description" content="This is a demo page for Caldaria" />
        <span class="text-2xl text-white font-sans">
          {'Welcome to '}
          <span class="bg-white bg-opacity-25 font-mono p-2 rounded m-1">Caldaria</span>
          !
        </span>
        <div class="flex flex-col space-y-1">
          <RouterLink href="/a" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page A</RouterLink>
          <RouterLink href="/b" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page B</RouterLink>
          <RouterLink href="/parameter/c" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page C</RouterLink>
          <RouterLink href="/parameter/d" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page D</RouterLink>
          <RouterLink href="/wildcard/e/f/g/h" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page E, F, G, H</RouterLink>
          <RouterLink href="/form" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to Form Example</RouterLink>
          <RouterLink href="/sfc" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to SFC Example</RouterLink>
          <RouterLink href="/example-md" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to Markdown Example</RouterLink>
        </div>
      </div>
    </div>
  );
}
