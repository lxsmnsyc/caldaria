export default function onVisible(
  marker: Element,
  callback: () => void,
): () => void {
  const observer = new IntersectionObserver((entries) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of entries) {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        callback();
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

  return () => observer.disconnect();
}
