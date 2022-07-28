export default function onMedia(id: string, query: string, callback: () => Promise<void>): void {
  const media = window.matchMedia(query);

  function cb() {
    callback().then(
      () => {
        if (import.meta.env.DEV) {
          console.log(`[client:media="${query}"] hydrated island: "${id}"`);
        }
      },
      () => {
        // no-op
      },
    );
  }

  const onMediaCallback = () => {
    if (media.matches) {
      cb();
      media.removeEventListener('change', onMediaCallback);
    }
  };

  if (media.matches) {
    cb();
  } else {
    media.addEventListener('change', onMediaCallback);
  }
}
