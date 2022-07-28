
const HOVER_TIMEOUT = 80;

export default function onHover(
  id: string,
  timeout: number | undefined,
  marker: Element,
  callback: () => Promise<void>,
): void {
  let timer: number | undefined;

  function run() {
    if (timer) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      callback().then(
        () => {
          if (import.meta.env.DEV) {
            console.log(`[client:hover=${timeout ?? HOVER_TIMEOUT}] hydrated island: "${id}"`);
          }
        },
        () => {
          // no-op
        },
      );
      marker.removeEventListener('mouseover', run, {
        capture: true,
      });
    }, timeout ?? HOVER_TIMEOUT);
  }

  marker.addEventListener('mouseover', run, {
    capture: true,
  });
}
