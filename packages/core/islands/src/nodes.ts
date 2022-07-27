export function getRoot(id: string): Element {
  const marker = document.querySelector(`rigidity-island[data-ri="${id}"]`);
  if (marker) {
    return marker;
  }
  throw new Error(`Missing <rigidity-island> with id ${id}`);
}
export function getFragment(id: string): Element | null {
  return document.querySelector(`template[data-ri="${id}"]`);
}
