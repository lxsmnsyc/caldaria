import {
  createComponent,
} from 'solid-js/web';
import {
  AppPage,
} from '../types';

const DefaultApp: AppPage = (props) => (
  createComponent(props.Component, {})
);

export default DefaultApp;
