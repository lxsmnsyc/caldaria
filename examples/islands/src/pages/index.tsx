/* @jsxImportSource solid-js */
import Counter from '../components/Counter.client';
import Main from '../components/Main.client';

export default function Index() {
  return (
    <Main>
      <Counter client:ready-state="interactive" initialValue={100} />
      <p>This is a server-side paragraph.</p>
    </Main>
  );
}
