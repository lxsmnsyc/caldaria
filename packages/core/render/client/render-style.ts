import {
  isServer,
} from 'solid-js/web';
import { on } from 'rigidity-hybrid-router';

function insertStyle(id: string, content: string) {
  if (!document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = content;
    document.head.appendChild(el);
  }
}

export default function renderStyle(id: string, content: string): void {
  if (!isServer) {
    on('load', () => {
      insertStyle(id, content);
    });
    insertStyle(id, content);
  }
}
