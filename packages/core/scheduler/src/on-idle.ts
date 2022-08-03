export default function onIdle(callback: () => void): () => void {
  const id = requestIdleCallback(callback);
  return () => cancelIdleCallback(id);
}
