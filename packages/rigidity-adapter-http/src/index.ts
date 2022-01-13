import { RequestListener } from 'http';
import { Adapter } from 'rigidity';
import { handleHTTP } from './utils';

import './shims';

const ADAPTER: Adapter<RequestListener> = /* @__PURE__ */ {
  enableStaticFileServing: true,
  generateScript: (config) => `
import http from 'http';
import { createServer } from 'rigidity';
import adapter from 'rigidity-adapter-http';
const server = createServer(${config});
const listener = adapter.create(server);
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
