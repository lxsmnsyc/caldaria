export default function onReadyState(
  id: string,
  readyState: DocumentReadyState,
  callback: () => Promise<void>,
): void {
  function run() {
    callback().then(
      () => {
        if (import.meta.env.DEV) {
          console.log(`[client:ready-state="${readyState}"] hydrated island: "${id}"`);
        }
      },
      () => {
        // no-op
      },
    );
  }
  const cb = () => {
    switch (readyState) {
      case 'loading':
        // Call regardless
        run();
        return true;
      case 'interactive':
        if (document.readyState !== 'loading') {
          run();
          return true;
        }
        return false;
      case 'complete':
        if (document.readyState === 'complete') {
          run();
          return true;
        }
        return false;
      default:
        return false;
    }
  };
  if (!cb()) {
    const listener = () => {
      if (cb()) {
        document.removeEventListener('readystatechange', listener);
      }
    };
    document.addEventListener('readystatechange', listener);
  }
}
