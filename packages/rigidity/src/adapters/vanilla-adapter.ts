import { RequestListener } from 'http';
import HTTPAdapter from './http-adapter';
import { Adapter } from '../types';

const ADAPTER: Adapter<RequestListener> = /* @__PURE__ */ {
  enableStaticFileServing: true,
  generateScript: (config) => `
import { createServer, adapters } from 'rigidity';
export default adapters.vanilla.create(createServer(${config}));
  `,
  create: HTTPAdapter.create,
};

export default ADAPTER;
