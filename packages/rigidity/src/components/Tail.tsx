import { createContext, useContext } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';

export const TailContext = /* @__PURE__ */ createContext<JSX.Element[]>();

export interface TailProps {
  children: JSX.Element;
}

export default function Tail(props: TailProps): JSX.Element {
  const context = useContext(TailContext);

  if (context) {
    context.push(props.children);
  }

  return null;
}
