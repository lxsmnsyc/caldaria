export function forEach<T, R>(
  array: T[],
  callback: (value: T, index: number) => R,
): void {
  for (let i = 0, len = array.length; i < len; i += 1) {
    callback(array[i], i);
  }
}

export function map<T, R>(
  array: T[],
  transform: (value: T, index: number) => R,
): R[] {
  const result: R[] = [];

  for (let i = 0, len = array.length; i < len; i += 1) {
    result[i] = transform(array[i], i);
  }

  return result;
}

export function filter<T>(
  array: T[],
  predicate: (value: T, index: number) => boolean,
): T[] {
  const result: T[] = [];

  for (let i = 0, len = array.length; i < len; i += 1) {
    if (predicate(array[i], i)) {
      result.push(array[i]);
    }
  }

  return result;
}
