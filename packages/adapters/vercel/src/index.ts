import { VercelRequest, VercelResponse } from '@vercel/node';
import { Adapter } from 'caldaria/types';
import { handleHTTP } from './utils';
import './shims';

type VercelFunction = (request: VercelRequest, response: VercelResponse) => Promise<void>;
const ADAPTER: Adapter<VercelFunction> = /* @__PURE__ */ {
  enableStaticFileServing: false,
  generateScript: (config) => `
  import createServer from 'caldaria/server';
import adapter from 'caldaria-adapter-vercel';
export default adapter.create(createServer(${config}));
  `,
  create: (fn) => async (request, response) => {
    // eslint-disable-next-line no-void
    await handleHTTP(fn, request, response);
  },
};

export default ADAPTER;
