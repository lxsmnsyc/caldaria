/* @jsxImportSource solid-js */
import { Meta, RouterLink, Title } from 'rigidity';
import { JSX } from 'solid-js';

export default function B(): JSX.Element {
  return (
    <div class="flex w-full h-screen items-center justify-center">
      <div class="p-4 rounded-lg bg-indigo-900 bg-opacity-25 flex flex-col space-y-4">
        <Title>Welcome to Page A!</Title>
        <Meta name="description" content="This is the page B for Rigidity Demo" />
        <span class="text-2xl text-white font-sans">
          {'Welcome to '}
          <span class="bg-white bg-opacity-25 font-mono p-2 rounded m-1">Page A</span>
          !
        </span>
        <div class="flex flex-col space-y-1">
          <RouterLink href="/" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to home</RouterLink>
          <RouterLink href="/b" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to page B</RouterLink>
        </div>
      </div>
    </div>
  );
}
