import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { Adapter } from 'caldaria/types';
import { handleHTTP2 } from './utils';
import './shims';

type HTTP2Listener = (request: Http2ServerRequest, response: Http2ServerResponse) => void;

const ADAPTER: Adapter<HTTP2Listener> = /* @__PURE__ */ {
  enableStaticFileServing: true,
  generateScript: (config) => `
  import http2 from 'http2';
  import fs from 'fs';
  import createServer from 'caldaria/server';
  import adapter from 'caldaria-adapter-http2';
  const server = createServer(${config});
  const listener = adapter.create(server);
  const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    allowHTTP1: true,
  };
  const port = process.env.PORT || 3000;
  http2.createSecureServer(options, listener).listen(port).on('listening', () => {
    console.log(\`Listening at http://localhost:\${port}\`)
  });
  `,
  create: (fn) => (request, response) => {
    // eslint-disable-next-line no-void
    void handleHTTP2(fn, request, response);
  },
};

export default ADAPTER;
