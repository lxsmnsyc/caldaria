import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { Adapter } from '../types';
import { handleHTTP2 } from './utils';

type HTTP2Listener = (request: Http2ServerRequest, response: Http2ServerResponse) => void;

const ADAPTER: Adapter<HTTP2Listener> = /* @__PURE__ */ {
  enableStaticFileServing: true,
  generateScript: (config) => `
  import http2 from 'http2';
  import { createServer, adapters } from 'rigidity';
  const server = createServer(${config});
  const listener = adapters.http2.create(server);
  http2.createServer(listener).listen(3000).on('listening', () => {
    console.log('Listening at http://localhost:3000')
  });
  `,
  create: (fn) => (request, response) => {
    // eslint-disable-next-line no-void
    void handleHTTP2(fn, request, response);
  },
};

export default ADAPTER;
