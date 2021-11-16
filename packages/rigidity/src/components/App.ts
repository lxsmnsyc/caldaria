import { createMemo } from 'solid-js';
import {
  createComponent,
} from 'solid-js/web';
import {
  AppPage,
} from '../types';

const DefaultApp: AppPage = (props) => createMemo(() => (
  createComponent(props.Component, {})
));

export default DefaultApp;
