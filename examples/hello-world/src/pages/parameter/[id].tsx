/* @jsxImportSource solid-js */
import { Meta, Title } from 'caldaria/meta';
import { RouterLink } from 'caldaria/router';
import { createResource, JSX } from 'solid-js';
import { isServer } from 'solid-js/web';

interface Params {
  id: string;
}

interface HelloProps {
  data: string;
  params: Params;
}

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms, true);
  });
}

function Parametized(props: HelloProps): JSX.Element {
  const [data] = createResource(
    () => props.data.load,
    async (value) => {
      await sleep(1000);
      return value;
    },
    {
      initialValue: props.data.load,
    },
  );
  return (
    <div class="flex w-full h-screen items-center justify-center">
      <div class="p-4 rounded-lg bg-indigo-900 bg-opacity-25 flex flex-col space-y-4">
        <Title>{`Welcome to Page ${props.params.id}!`}</Title>
        <Meta name="description" content={`This is the page ${props.params.id} for Caldaria Demo`} />
        <span class="text-2xl text-white font-sans">
          {'Welcome to '}
          <span class="bg-white bg-opacity-25 font-mono p-2 rounded m-1">{`Page ${props.params.id}`}</span>
          !
        </span>
        <span class="text-2xl text-white font-sans">
          {data()}
        </span>
        <div class="flex flex-col space-y-1">
          <RouterLink href="/" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to home</RouterLink>
        </div>
      </div>
    </div>
  );
}

if (isServer) {
  Parametized.load = (_: Request, params: Params) => `Hello, ${params.id}`;
}

export default Parametized;
