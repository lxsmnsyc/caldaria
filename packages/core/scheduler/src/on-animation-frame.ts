export default function onAnimationFrame(id: string, callback: () => Promise<void>): void {
  requestAnimationFrame(() => {
    callback().then(
      () => {
        if (import.meta.env.DEV) {
          console.log(`[client:animation-frame] hydrated island: "${id}"`);
        }
      },
      () => {
        // no-op
      },
    );
  });
}
