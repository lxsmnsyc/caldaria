import {
  isServer,
} from 'solid-js/web';

export default function renderStyle(id: string, content: string): void {
  if (!isServer) {
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = content;
      document.head.appendChild(el);
    }
  }
}
