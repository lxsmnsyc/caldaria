/* @jsxImportSource solid-js */
import { createSignal, JSX } from 'solid-js';
import { IslandComponent } from 'caldaria/islands-client';

type CountProps = IslandComponent<{
  initialValue: number;
}>

export default function Counter(props: CountProps): JSX.Element {
  const [count, setCount] = createSignal(props.initialValue);

  function increment() {
    setCount((c) => c + 1);
  }
  function decrement() {
    setCount((c) => c - 1);
  }

  return (
    <div class="flex items-center justify-center space-x-2 text-white p-2 rounded-lg bg-gray-900 bg-opacity-10">
      <button type="button" onClick={increment} class="p-2 rounded-lg bg-gray-900 bg-opacity-10">
        Increment
      </button>
      <span>{`Count: ${count()}`}</span>
      <button type="button" onClick={decrement} class="p-2 rounded-lg bg-gray-900 bg-opacity-10">
        Decrement
      </button>
    </div>
  );
}
