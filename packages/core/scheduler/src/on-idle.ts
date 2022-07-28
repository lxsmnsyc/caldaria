export default function onIdle(id: string, callback: () => Promise<void>): void {
  requestIdleCallback(() => {
    callback().then(
      () => {
        if (import.meta.env.DEV) {
          console.log(`[client:idle] hydrated island: "${id}"`);
        }
      },
      () => {
        // no-op
      },
    );
  });
}
