import { onInsert, resetObserver } from './dom-lifecycle';
import { notify, on } from './page-lifecycle';
import { registerAnchor, setupEvents } from './register-anchor';

function load() {
  resetObserver();
  if (import.meta.env.DEV) {
    console.log('[rigidity:hybrid-router] Registered observer');
  }

  document.body.querySelectorAll('a').forEach(registerAnchor);
  if (import.meta.env.DEV) {
    console.log('[rigidity:hybrid-router] Registered anchor tags synchronously');
  }

  onInsert((item) => {
    if (item instanceof HTMLAnchorElement) {
      registerAnchor(item);
    }
  });
  if (import.meta.env.DEV) {
    console.log('[rigidity:hybrid-router] Observing anchor tags');
  }
}

export function setup() {
  setupEvents();
  if (import.meta.env.DEV) {
    console.log('[rigidity:hybrid-router] Registered events');
  }

  on('load', load);

  // Defer on DOMContentLoad
  if (/complete|interactive|loaded/.test(document.readyState)) {
    notify('load');
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      notify('load');
    });
  }
}

export { onInsert, onRemove } from './dom-lifecycle';
export {
  PageLifecycleEvent,
  PageLifecycleListener,
  PageLifecycleType,
  on,
} from './page-lifecycle';
