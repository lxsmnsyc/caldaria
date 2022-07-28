export default function onVisible(
  id: string,
  marker: Element,
  callback: () => Promise<void>,
): void {
  const observer = new IntersectionObserver((entries) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of entries) {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        callback().then(
          () => {
            if (import.meta.env.DEV) {
              console.log(`[client:visible] hydrated island: "${id}"`);
            }
          },
          () => {
            // no-op
          },
        );
        observer.disconnect();
        break;
      }
    }
  });

  let node = marker.firstChild;

  while (node) {
    if (node instanceof Element) {
      observer.observe(node);
    }
    node = node.nextSibling;
  }
}
