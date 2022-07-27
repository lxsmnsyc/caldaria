import { Adapter, ServerFunction } from 'rigidity/types';

const ADAPTER: Adapter<ServerFunction> = /* @__PURE__ */{
  enableStaticFileServing: false,
  generateScript: (config) => `
import { createServer } from 'rigidity/server';
import adapter from 'rigidity-adapter-worker';
const server = createServer(${config});
const listener = adapter.create(server);

addEventListener('fetch', (event) => {
  event.respondWith(listener(event.request))
});
  `,
  create: (fn) => fn,
};

export default ADAPTER;
