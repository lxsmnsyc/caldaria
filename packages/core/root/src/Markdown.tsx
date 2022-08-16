import {
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
    <MDXContext.Provider value={other}>
      {local.children}
    </MDXContext.Provider>
  );
}

export function useMDX(): MDXProps {
  const ctx = useContext(MDXContext);
  if (ctx) {
    return ctx;
  }
  throw new Error('Missing MDXProvider');
}
