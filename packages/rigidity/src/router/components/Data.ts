import {
  createContext,
} from 'solid-js';

interface DataContext<T> {
  initial: boolean;
  data: T;
}

const DataContext = createContext<DataContext<any>>();

export default DataContext;
