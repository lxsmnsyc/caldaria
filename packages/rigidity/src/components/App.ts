import { createMemo } from 'solid-js';
import {
  App,
} from '../types';

const DefaultApp: App = (props) => createMemo(() => (
  props.children
));

export default DefaultApp;
