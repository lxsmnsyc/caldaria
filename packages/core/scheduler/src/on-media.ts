export default function onMedia(
  query: string,
  callback: () => void,
): (() => void) | undefined {
  const media = window.matchMedia(query);

  const onMediaCallback = () => {
    if (media.matches) {
      callback();
      media.removeEventListener('change', onMediaCallback);
    }
  };

  if (media.matches) {
    callback();
    return undefined;
  }
  media.addEventListener('change', onMediaCallback);
  return () => media.removeEventListener('change', onMediaCallback);
}
