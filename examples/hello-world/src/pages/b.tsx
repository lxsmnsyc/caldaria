/* @jsxImportSource solid-js */
import { Meta, Title } from 'rigidity/meta';
import { RouterLink } from 'rigidity/router';
import { JSX } from 'solid-js';

export default function B(): JSX.Element {
  return (
    <div class="flex w-full h-screen items-center justify-center">
      <div class="p-4 rounded-lg bg-indigo-900 bg-opacity-25 flex flex-col space-y-4">
        <Title>Welcome to Page B!</Title>
        <Meta name="description" content="This is the page B for Rigidity Demo" />
        <span class="text-2xl text-white font-sans">
          {'Welcome to '}
          <span class="bg-white bg-opacity-25 font-mono p-2 rounded m-1">Page B</span>
          !
        </span>
        <div class="flex flex-col space-y-1">
          <RouterLink href="/" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to home</RouterLink>
          <RouterLink href="/a" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page A</RouterLink>
        </div>
      </div>
    </div>
  );
}
