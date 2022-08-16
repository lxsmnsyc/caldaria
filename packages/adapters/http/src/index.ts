import { RequestListener } from 'http';
import { Adapter } from 'caldaria/types';
import { handleHTTP } from './utils';

import './shims';

const ADAPTER: Adapter<RequestListener> = /* @__PURE__ */ {
  enableStaticFileServing: true,
  generateScript: (config) => `
import http from 'http';
import createServer from 'caldaria/server';
import adapter from 'caldaria-adapter-http';
const server = createServer(${config});
const listener = adapter.create(server);
const port = process.env.PORT || 3000;
http.createServer(listener).listen(port).on('listening', () => {
  console.log(\`Listening at http://localhost:\${port}\`)
});
  `,
  create: (fn) => (request, response) => {
    // eslint-disable-next-line no-void
    void handleHTTP(fn, request, response);
  },
};

export default ADAPTER;
