export function getRoot(id: string): Element {
  const marker = document.querySelector(`ri-frame[rid="${id}"] > ri-root`);
  if (marker) {
    return marker;
  }
  throw new Error(`Missing ri-frame[rid="${id}"] > ri-root`);
}
export function getFragment(id: string): Element | null {
  const template = document.querySelector(`ri-frame[rid="${id}"] > template`);
  if (template) {
    return template;
  }
  throw new Error(`Missing ri-frame[rid="${id}"] > template`);
}
