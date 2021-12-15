import { VercelRequest, VercelResponse } from '@vercel/node';
import { Adapter } from '../types';
import { handleHTTP } from './utils';

type VercelFunction = (request: VercelRequest, response: VercelResponse) => Promise<void>;
const ADAPTER: Adapter<VercelFunction> = /* @__PURE__ */ {
  enableStaticFileServing: false,
  generateScript: (config) => `
import { createServer, adapters } from 'rigidity';
export default adapters.vercel.create(createServer(${config}));
  `,
  create: (fn) => async (request, response) => {
    // eslint-disable-next-line no-void
    await handleHTTP(fn, request, response);
  },
};

export default ADAPTER;
