import { onInsert, resetObserver } from './dom-lifecycle';
import { notify, on } from './page-lifecycle';
import { registerAnchor, setupEvents } from './register-anchor';

function load() {
  resetObserver();

  document.body.querySelectorAll('a').forEach(registerAnchor);

  onInsert((item) => {
    if (item instanceof HTMLAnchorElement) {
      registerAnchor(item);
    }
  });
}

export function setup() {
  setupEvents();

  on('load', load);

  // Defer on DOMContentLoad
  window.addEventListener('DOMContentLoaded', () => {
    notify('load');
  });
}

export { onInsert, onRemove } from './dom-lifecycle';
export {
  PageLifecycleEvent,
  PageLifecycleListener,
  PageLifecycleType,
  on,
} from './page-lifecycle';
