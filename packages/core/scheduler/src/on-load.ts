export default function onLoad(callback: () => void): () => void {
  const currentWindow = document.defaultView ?? window;
  currentWindow.addEventListener('load', callback, {
    once: true,
  });
  return () => currentWindow.removeEventListener('load', callback);
}
