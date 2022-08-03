export default function onReadyState(
  readyState: DocumentReadyState,
  callback: () => void,
): undefined | (() => void) {
  const cb = () => {
    switch (readyState) {
      case 'loading':
        // Call regardless
        callback();
        return true;
      case 'interactive':
        if (document.readyState !== 'loading') {
          callback();
          return true;
        }
        return false;
      case 'complete':
        if (document.readyState === 'complete') {
          callback();
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
    return () => document.removeEventListener('readystatechange', listener);
  }
  return undefined;
}
