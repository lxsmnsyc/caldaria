import {
  createComponent,
  createContext,
  createSignal,
  JSX,
  useContext,
} from 'solid-js';

interface DataContext<T> {
  initial: boolean;
  data: T;
  setData: (value: T) => void;
}

const DataContext = createContext<DataContext<any>>();

export function useDataContext<T>(): DataContext<T> {
  const ctx = useContext(DataContext);
  if (ctx) {
    return ctx;
  }
  throw new Error('Missing DataContext');
}

export interface DataProviderProps<T> {
  data: T;
  children: JSX.Element;
}

export function DataProvider<T>(props: DataProviderProps<T>) {
  const [currentData, setCurrentData] = createSignal(props.data);
  return (
    createComponent(DataContext.Provider, {
      value: {
        initial: true,
        get data() {
          return currentData();
        },
        setData(value) {
          setCurrentData(value);
        },
      },
      get children() {
        return props.children;
      }
    })
  );
}
