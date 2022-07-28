export default function onDelay(id: string, timeout: number, callback: () => Promise<void>): void {
  setTimeout(() => {
    callback().then(
      () => {
        if (import.meta.env.DEV) {
          console.log(`[client:delay=${timeout}] hydrated island: "${id}"`);
        }
      },
      () => {
        // no-op
      },
    );
  }, timeout);
}
