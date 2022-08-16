import { createMemo } from 'solid-js';
import {
  App,
} from 'caldaria-shared';

const DefaultApp: App = (props) => createMemo(() => (
  props.children
));

export default DefaultApp;
