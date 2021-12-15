import { RequestListener } from 'http';
import { Adapter } from '../types';
import { handleHTTP } from './utils';

const ADAPTER: Adapter<RequestListener> = /* @__PURE__ */ {
  enableStaticFileServing: true,
  generateScript: (config) => `
import http from 'http';
import { createServer, adapters } from 'rigidity';
const server = createServer(${config});
const listener = adapters.http.create(server);
http.createServer(listener).listen(3000).on('listening', () => {
  console.log('Listening at http://localhost:3000')
});
  `,
  create: (fn) => (request, response) => {
    // eslint-disable-next-line no-void
    void handleHTTP(fn, request, response);
  },
};

export default ADAPTER;
