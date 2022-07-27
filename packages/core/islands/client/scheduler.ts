import { getRoot } from './nodes';

function logRoot(id: string) {
  if (import.meta.env.DEV) {
    console.log('Root hydrated', id);
  }
}

function runCallback(id: string, callback: () => Promise<void>): void {
  logRoot(id);
  callback().catch(() => {
    // no-op
  });
}

export function onMedia(id: string, query: string, callback: () => Promise<void>): void {
  const media = window.matchMedia(query);

  const onMediaCallback = () => {
    if (media.matches) {
      runCallback(id, callback);
      media.removeEventListener('change', onMediaCallback);
    }
  };

  if (media.matches) {
    runCallback(id, callback);
  } else {
    media.addEventListener('change', onMediaCallback);
  }
}

export function onVisible(id: string, callback: () => Promise<void>): void {
  const marker = getRoot(id);

  const observer = new IntersectionObserver((entries) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of entries) {
      if (entry.isIntersecting) {
        runCallback(id, callback);
        observer.disconnect();
        break;
      }
    }
  });

  let node = marker.firstChild;

  while (node) {
    if (node instanceof Element) {
      observer.observe(node);
    }
    node = node.nextSibling;
  }
}

export function onIdle(id: string, callback: () => Promise<void>): void {
  requestIdleCallback(() => {
    runCallback(id, callback);
  });
}

export function onAnimationFrame(id: string, callback: () => Promise<void>): void {
  requestAnimationFrame(() => {
    runCallback(id, callback);
  });
}

export function onDelay(id: string, timeout: number, callback: () => Promise<void>): void {
  setTimeout(() => {
    runCallback(id, callback);
  }, timeout);
}

const HOVER_TIMEOUT = 80;

export function onHover(
  id: string,
  timeout: number | undefined,
  callback: () => Promise<void>,
): void {
  const marker = getRoot(id);

  let timer: number | undefined;

  function run() {
    if (timer) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      runCallback(id, callback);
      marker.removeEventListener('mouseover', run, {
        capture: true,
      });
    }, timeout ?? HOVER_TIMEOUT);
  }

  marker.addEventListener('mouseover', run, {
    capture: true,
  });
}

export function onLoad(id: string, callback: () => Promise<void>): void {
  window.addEventListener('load', () => {
    runCallback(id, callback);
  }, {
    once: true,
  });
}
