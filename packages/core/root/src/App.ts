import { createMemo } from 'solid-js';
import {
  App,
} from 'rigidity-shared';

const DefaultApp: App = (props) => createMemo(() => (
  props.children
));

export default DefaultApp;
