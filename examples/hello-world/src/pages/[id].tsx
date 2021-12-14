import { RouterLink } from 'rigidity';
import { JSX } from 'solid-js';
import { isServer } from 'solid-js/web';

interface Params {
  id: string;
}

interface HelloProps {
  data: string;
  params: Params;
}

function Hello(props: HelloProps): JSX.Element {
  return (
    <>
      <h1 class="text-gray-50 text-2xl text-sans">{props.data}</h1>
      <RouterLink href="/alexis">Alexis</RouterLink>
      <RouterLink href="/solid">solid</RouterLink>
    </>
  );
}

if (isServer) {
  Hello.getData = (_: Request, params: Params) => `Hello, ${params.id}`;
}

export default Hello;
