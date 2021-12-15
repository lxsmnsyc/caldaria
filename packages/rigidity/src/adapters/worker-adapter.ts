import { Adapter, ServerFunction } from '../types';

const ADAPTER: Adapter<ServerFunction> = /* @__PURE__ */{
  enableStaticFileServing: false,
  generateScript: (config) => `
import { createServer, adapters } from 'rigidity';
const server = createServer(${config});
const listener = adapters.worker.create(server);

addEventListener('fetch', (event) => {
  event.respondWith(listener(event.request))
});
  `,
  create: (fn) => fn,
};

export default ADAPTER;
