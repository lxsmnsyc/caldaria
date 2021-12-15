import { RequestListener } from 'http';
import { Adapter } from '../types';
import { handleHTTP } from './utils';

const ADAPTER: Adapter<RequestListener> = /* @__PURE__ */ {
  enableStaticFileServing: true,
  generateScript: (config) => `
import { createServer, adapters } from 'rigidity';
export default adapters.vanilla.create(createServer(${config}));
  `,
  create: (fn) => async (request, response) => {
    // eslint-disable-next-line no-void
    await handleHTTP(fn, request, response);
  },
};

export default ADAPTER;
