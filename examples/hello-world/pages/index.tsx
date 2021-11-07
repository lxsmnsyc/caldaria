import { JSX } from 'solid-js';
import { Link } from 'rigidity';
import { styles, source } from '../styles/example.module.css?url';

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
      <Link rel="stylesheet" href={source} />
      <h1 class={styles.title}>{`Count: ${count}`}</h1>
      <button type="button" onClick={increment}>+</button>
      <button type="button" onClick={decrement}>-</button>
    </div>
  );
}
