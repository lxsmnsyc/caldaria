import {
  createComponent,
  createContext,
  createSignal,
  JSX,
  useContext,
} from 'solid-js';

interface DataContext<L, A = undefined> {
  initial: boolean;
  load: L;
  action: A;
  setAction: (value: A) => void;
}

const DataContext = createContext<DataContext<any, any>>();

export function useDataContext<L, A = undefined>(): DataContext<L, A> {
  const ctx = useContext(DataContext);
  if (ctx) {
    return ctx;
  }
  throw new Error('Missing DataContext');
}

export interface DataProviderProps<L, A = undefined> {
  load: L;
  action: A;
  children: JSX.Element;
}

export function DataProvider<L, A = undefined>(props: DataProviderProps<L, A>) {
  const [action, setAction] = createSignal(props.action);
  return (
    createComponent(DataContext.Provider, {
      value: {
        initial: true,
        get load() {
          return props.load;
        },
        get action() {
          return action();
        },
        setAction,
      },
      get children() {
        return props.children;
      }
    })
  );
}
