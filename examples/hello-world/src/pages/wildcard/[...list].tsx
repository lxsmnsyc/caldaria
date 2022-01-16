/* @jsxImportSource solid-js */
import { Meta, RouterLink, Title } from 'rigidity';
import { JSX } from 'solid-js';
import { isServer } from 'solid-js/web';

interface Params {
  list: string[];
}

interface HelloProps {
  data: string;
  params: Params;
}

function Wildcard(props: HelloProps): JSX.Element {
  return (
    <div class="flex w-full h-screen items-center justify-center">
      <div class="p-4 rounded-lg bg-indigo-900 bg-opacity-25 flex flex-col space-y-4">
        <Title>{`Welcome to Page ${props.params.list.join(', ')}!`}</Title>
        <Meta name="description" content={`This is the page ${props.params.list.join(', ')} for Rigidity Demo`} />
        <span class="text-2xl text-white font-sans">
          {'Welcome to '}
          <span class="bg-white bg-opacity-25 font-mono p-2 rounded m-1">{`Page ${props.params.list.join(', ')}`}</span>
          !
        </span>
        <span class="text-2xl text-white font-sans">
          {props.data.load}
        </span>
        <div class="flex flex-col space-y-1">
          <RouterLink href="/" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to home</RouterLink>
        </div>
      </div>
    </div>
  );
}

if (isServer) {
  Wildcard.load = (_: Request, params: Params) => `Hello, ${params.list.join(', ')}`;
}

export default Wildcard;
