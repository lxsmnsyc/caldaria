import { JSX } from 'solid-js';
import { isServer } from 'solid-js/web';

interface HelloProps {
  data: string;
}

function Hello(props: HelloProps): JSX.Element {
  return <h1 class="text-gray-50 text-2xl text-sans">{props.data}</h1>;
}

if (isServer) {
  Hello.getData = () => 'Hello World';
}

export default Hello;
