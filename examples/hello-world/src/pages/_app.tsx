/* @jsxImportSource solid-js */
import { JSX, Suspense } from 'solid-js';
import { Link, AppProps } from 'rigidity';
import styles from '../styles/main.css?url';

export default function App(props: AppProps): JSX.Element {
  return (
    <>
      <Link rel="stylesheet" href={styles} />
      <div className="bg-gradient-to-r from-indigo-400 to-blue-600 w-screen h-screen flex overflow-hidden">
        <div className="flex flex-col items-center justify-center w-full">
          <Suspense fallback={<h1>Loading...</h1>}>
            {props.children}
          </Suspense>
        </div>
      </div>
    </>
  );
}
