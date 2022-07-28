/* @jsxImportSource solid-js */
import {
  createRigidityRoot,
} from 'rigidity/root';

export default createRigidityRoot({
  App(appProps) {
    return (
      <>{appProps.children}</>
    );
  },
});
