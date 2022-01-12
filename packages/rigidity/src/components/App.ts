import { createMemo } from 'solid-js';
import {
  AppPage,
} from '../types';

const DefaultApp: AppPage = (props) => createMemo(() => (
  props.children
));

export default DefaultApp;
