import { RequestListener } from 'http';
import { Adapter } from 'caldaria/types';
import { handleHTTP } from './utils';
import './shims';

const ADAPTER: Adapter<RequestListener> = /* @__PURE__ */ {
  enableStaticFileServing: true,
  generateScript: (config) => `
  import createServer from 'caldaria/server';
import adapter from 'caldaria-adapter-vanilla';
export default adapter.create(createServer(${config}));
  `,
  create: (fn) => async (request, response) => {
    // eslint-disable-next-line no-void
    await handleHTTP(fn, request, response);
  },
};

export default ADAPTER;
