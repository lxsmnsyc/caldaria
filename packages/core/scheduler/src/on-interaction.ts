const DEFAULT_EVENTS = ['mouseenter', 'focusin', 'touchstart'];

export default function onInteraction(
  events: string[] | boolean,
  marker: Element,
  callback: () => void,
): () => void {
  const allEvents = typeof events === 'boolean' ? DEFAULT_EVENTS : events;

  function run() {
    callback();
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

  return () => {
    for (const event of allEvents) {
      marker.removeEventListener(event, run, {
        capture: true,
      });
    }
  };
}
