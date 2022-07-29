export function getRoot(id: string): Element {
  const marker = document.querySelector(`ri-root[rid="${id}"]`);
  if (marker) {
    return marker;
  }
  throw new Error(`Missing <ri-root> with id ${id}`);
}
export function getFragment(id: string): Element | null {
  return document.querySelector(`template[data-ri="${id}"]`);
}
