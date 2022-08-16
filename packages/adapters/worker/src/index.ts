import { Adapter, ServerFunction } from 'caldaria/types';

const ADAPTER: Adapter<ServerFunction> = /* @__PURE__ */{
  enableStaticFileServing: false,
  generateScript: (config) => `
import createServer from 'caldaria/server';
import adapter from 'caldaria-adapter-worker';
const server = createServer(${config});
const listener = adapter.create(server);

addEventListener('fetch', (event) => {
  event.respondWith(listener(event.request))
});
  `,
  create: (fn) => fn,
};

export default ADAPTER;
