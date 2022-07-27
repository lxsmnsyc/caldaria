/* @jsxImportSource solid-js */
import { JSX } from 'solid-js';
import { IslandComponent } from 'rigidity/islands-client';

type MainProps = IslandComponent<{
  children: JSX.Element;
}>

export default function Main(props: MainProps): JSX.Element {
  return (
    <div class="bg-gradient-to-r from-fuchsia-500 to-purple-600 w-screen h-screen flex overflow-hidden">
      <div class="flex flex-col items-center justify-center w-full">
        <h1>Counter App Example</h1>
        {props.children}
      </div>
    </div>
  );
}
