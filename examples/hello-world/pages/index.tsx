import { JSX } from 'solid-js';
import { Style } from 'rigidity';
import style from '../styles/index.css?raw';

export default function Index(): JSX.Element {
  let count = $signal(0);

  function increment() {
    count += 1;
  }
  function decrement() {
    count -= 1;
  }

  return (
    <div>
      <Style>{style}</Style>
      <h1>{`Count: ${count}`}</h1>
      <button type="button" onClick={increment}>+</button>
      <button type="button" onClick={decrement}>-</button>
    </div>
  );
}
