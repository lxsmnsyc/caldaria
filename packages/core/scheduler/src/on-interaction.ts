const DEFAULT_EVENTS = ['mouseenter', 'focusin', 'touchstart'];

export default function onInteraction(
  id: string,
  events: string[] | boolean,
  marker: Element,
  callback: () => Promise<void>,
): void {
  const allEvents = typeof events === 'boolean' ? DEFAULT_EVENTS : events;

  function run() {
    callback().then(
      () => {
        if (import.meta.env.DEV) {
          console.log(`[client:interaction=${JSON.stringify(allEvents)}] hydrated island: "${id}"`);
        }
      },
      () => {
        // no-op
      },
    );
    for (const event of allEvents) {
      marker.removeEventListener(event, run, {
        capture: true,
      });
    }
  }

  for (const event of allEvents) {
    marker.addEventListener(event, run, {
      capture: true,
    });
  }
}
