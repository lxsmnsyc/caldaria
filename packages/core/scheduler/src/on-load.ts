export default function onLoad(id: string, callback: () => Promise<void>): void {
  window.addEventListener('load', () => {
    callback().then(
      () => {
        if (import.meta.env.DEV) {
          console.log(`[client:load] hydrated island: "${id}"`);
        }
      },
      () => {
        // no-op
      },
    );
  }, {
    once: true,
  });
}
