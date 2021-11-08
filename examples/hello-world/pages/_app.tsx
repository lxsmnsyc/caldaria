import { Link } from 'rigidity';
import styles from '../styles/main.css?url';

export default function App(props) {
  return (
    <>
      <Link rel="stylesheet" href={styles} />
      <div className="bg-gradient-to-r from-indigo-400 to-blue-600 w-screen h-screen flex overflow-hidden">
        <div className="flex flex-col items-center justify-center w-full">
          <props.Component />
        </div>
      </div>
    </>
  );
}
