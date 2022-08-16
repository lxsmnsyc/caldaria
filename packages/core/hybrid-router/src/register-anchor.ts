import onVisible from 'caldaria-scheduler/visible';
import { onRemove } from './dom-lifecycle';
import { notify, on } from './page-lifecycle';
import prefetch from './prefetch';

interface NavigateOptions {
  pop?: boolean;
  replace?: string | null;
  scroll: ScrollBehavior | 'none';
}

async function navigate(href: string, options: NavigateOptions) {
  if (notify('beforeunload')) {
    return;
  }
  notify('unload');
  const response = await fetch(href);
  const result = await response.text();
  // Replace document
  document.open();
  document.write(result);
  document.close();
  // Update history
  if (!options.pop) {
    if (options.replace != null) {
      window.history.replaceState(null, '', href);
    } else {
      window.history.pushState(null, '', href);
    }
  }
  if (options.scroll !== 'none') {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: options.scroll,
    });
  }
  notify('load');
}

function getLocationOrigin(): string {
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}

function isLocalURL(url: string): boolean {
  // prevent a hydration mismatch on href for url with anchor refs
  if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
    return true;
  }
  try {
    // absolute urls can be local if they are on the same origin
    const locationOrigin = getLocationOrigin();
    const resolved = new URL(url, locationOrigin);
    return resolved.origin === locationOrigin;
  } catch (_) {
    return false;
  }
}

function isModifiedEvent(event: MouseEvent): boolean {
  const { target } = event.currentTarget as HTMLAnchorElement;
  return (
    (target && target !== '_self')
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey // triggers resource download
  );
}

function isLocalUrlAbsolute(url: string): boolean {
  return isLocalURL(url) && !url.startsWith('#');
}

export function registerAnchor(
  el: HTMLAnchorElement,
) {
  const cleanup = onVisible(el, () => {
    void prefetch(el.href);
  });

  if (cleanup) {
    const unsubscribe = on('unload', () => {
      cleanup();
      unsubscribe();
    });

    onRemove(el, () => {
      cleanup();
      unsubscribe();
    });
  }
}

function onClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) {
    return;
  }
  const el = event.target.closest('a');
  if (!(el instanceof HTMLAnchorElement)) {
    return;
  }
  const targetHref = el.href;
  // Make sure that the click is native and
  // that the url is local
  if (isModifiedEvent(event) || !isLocalUrlAbsolute(targetHref)) {
    return;
  }
  // Check if the element has a download attribute
  if (el.hasAttribute('download')) {
    return;
  }
  // Check if the element has rel="external"
  if (el.getAttribute('rel')?.includes('external')) {
    return;
  }

  event.preventDefault();

  let scroll = el.getAttribute('ri:scroll') ?? 'auto';
  if (scroll !== 'none' && targetHref.indexOf('#') > 0) {
    scroll = 'none';
  }
  void navigate(targetHref, {
    replace: el.getAttribute('ri:replace'),
    scroll: scroll as ScrollBehavior,
  });
}

function onPopState() {
  void navigate(window.location.pathname, {
    pop: true,
    scroll: 'none',
  });
}

export function setupEvents() {
  on('unload', () => {
    window.removeEventListener('click', onClick);
    window.removeEventListener('popstate', onPopState);
  });
  on('load', () => {
    window.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
  });
}
