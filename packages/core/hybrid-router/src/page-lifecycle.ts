export type PageLifecycleType = 'beforeunload' | 'unload' | 'load';

export class PageLifecycleEvent extends Event {
}

export type PageLifecycleListener = (ev: PageLifecycleEvent) => void;

const LISTENERS = new Map<PageLifecycleType, Set<PageLifecycleListener>>();

export function on(event: PageLifecycleType, callback: PageLifecycleListener): () => void {
  let listeners = LISTENERS.get(event);

  if (!listeners) {
    listeners = new Set();
    LISTENERS.set(event, listeners);
  }

  listeners.add(callback);

  return () => {
    listeners?.delete(callback);
  };
}

export function notify(
  event: PageLifecycleType,
): boolean {
  const listeners = LISTENERS.get(event);

  const instance = new PageLifecycleEvent(event);

  if (listeners) {
    for (const listener of listeners.keys()) {
      listener(instance);
    }
  }

  return instance.defaultPrevented;
}
