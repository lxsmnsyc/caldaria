const INTERACTION_TIMEOUT = 80;

const DEFAULT_EVENTS = ['mouseenter', 'focusin', 'touchstart'];

export interface OnInteractionOptions {
  timeout?: number;
  events?: string[];
}

export default function onInteraction(
  id: string,
  options: OnInteractionOptions,
  marker: Element,
  callback: () => Promise<void>,
): void {
  const timeout = options.timeout ?? INTERACTION_TIMEOUT;
  const events = options.events ?? DEFAULT_EVENTS;

  let timer: number | undefined;

  function run() {
    if (timer) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      callback().then(
        () => {
          if (import.meta.env.DEV) {
            console.log(`[client:interaction=${JSON.stringify({ timeout, events })}] hydrated island: "${id}"`);
          }
        },
        () => {
          // no-op
        },
      );
      for (const event of events) {
        marker.removeEventListener(event, run, {
          capture: true,
        });
      }
    }, timeout);
  }

  for (const event of events) {
    marker.addEventListener(event, run, {
      capture: true,
    });
  }
}
