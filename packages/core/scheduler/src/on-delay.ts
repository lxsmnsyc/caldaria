export default function onDelay(
  timeout: number,
  callback: () => void,
): () => void {
  const id = setTimeout(callback, timeout);
  return () => clearTimeout(id);
}
