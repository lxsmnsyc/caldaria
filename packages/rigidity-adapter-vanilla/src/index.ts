import { RequestListener } from 'http';
import { Adapter } from 'rigidity';
import { handleHTTP } from './utils';
import './shims';

const ADAPTER: Adapter<RequestListener> = /* @__PURE__ */ {
  enableStaticFileServing: true,
  generateScript: (config) => `
import { createServer } from 'rigidity';
import adapter from 'rigidity-adapter-vanilla';
export default adapter.create(createServer(${config}));
  `,
  create: (fn) => async (request, response) => {
    // eslint-disable-next-line no-void
    await handleHTTP(fn, request, response);
  },
};

export default ADAPTER;
