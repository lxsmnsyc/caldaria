import { createContext, useContext } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';

export const HeadContext = /* @__PURE__ */ createContext<JSX.Element[]>();

export interface HeadProps {
  children?: JSX.Element
}

export default function Head(props: HeadProps): JSX.Element {
  const context = useContext(HeadContext);

  if (context) {
    context.push(props.children);
  }

  return null;
}
