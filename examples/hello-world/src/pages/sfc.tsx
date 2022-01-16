'use solid-sfc';

import { Meta, RouterLink, Title } from 'rigidity';

export default (
  <div class="flex w-full h-screen items-center justify-center">
    <div class="p-4 rounded-lg bg-indigo-900 bg-opacity-25 flex flex-col space-y-4">
      <Title>Welcome to SFC Example!</Title>
      <Meta name="description" content="This is the SFC Example for Rigidity Demo" />
      <span class="text-2xl text-white font-sans">
        {'Welcome to '}
        <span class="bg-white bg-opacity-25 font-mono p-2 rounded m-1">SFC Example</span>
        !
      </span>
      <div>
        This page is written in SFC format.
      </div>
      <div class="flex flex-col space-y-1">
        <RouterLink href="/" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to home</RouterLink>
      </div>
    </div>
  </div>
);
