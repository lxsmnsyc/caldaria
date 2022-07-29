import {
  createComponent,
  createContext,
  JSX,
  splitProps,
  useContext,
} from 'solid-js';
import { MDXProps } from 'solid-marked';

const MDXContext = /* @__PURE__ */ createContext<MDXProps>();

export function MDXProvider(props: MDXProps & { children: JSX.Element }): JSX.Element {
  const [local, other] = splitProps(props, ['children']);
  return (
    createComponent(MDXContext.Provider, {
      value: other,
      get children() {
        return local.children;
      },
    })
  );
}

export function useMDX(): MDXProps {
  const ctx = useContext(MDXContext);
  if (ctx) {
    return ctx;
  }
  throw new Error('Missing MDXProvider');
}
