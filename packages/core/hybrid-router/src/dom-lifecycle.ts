const insertListeners = new Set<(el: Node) => void>();
const removeListeners: Map<Node, (() => void)> = new Map();

let OBSERVER: MutationObserver | undefined;

function onObserve(records: MutationRecord[]) {
  for (const record of records) {
    if (record.type === 'childList') {
      for (let i = 0, len = record.addedNodes.length; i < len; i += 1) {
        for (const listener of insertListeners.keys()) {
          listener(record.addedNodes[i]);
        }
      }
      for (let i = 0, len = record.removedNodes.length; i < len; i += 1) {
        const item = record.removedNodes[i];
        if (removeListeners.has(item)) {
          const listener = removeListeners.get(item);
          if (listener) {
            listener();
            removeListeners.delete(item);
          }
        }
      }
    }
  }
}

export function resetObserver() {
  if (OBSERVER) {
    OBSERVER.disconnect();
    insertListeners.clear();
    removeListeners.clear();
  }
  OBSERVER = new MutationObserver(onObserve);

  OBSERVER.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

export function onInsert(callback: (el: Node) => void) {
  insertListeners.add(callback);
}

export function onRemove(el: Node, callback: () => void) {
  removeListeners.set(el, callback);
}
