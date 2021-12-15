import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import { Readable } from 'stream';
import { Adapter, ServerFunction } from '../types';

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffer: Uint8Array[] = [];

    stream.on('data', (chunk) => buffer.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(buffer)));
    stream.on('error', (err) => reject(err));
  });
}

async function convertHTTPRequestToWebRequest(
  request: IncomingMessage,
): Promise<Request> {
  if (!request.url) {
    throw new Error('Unexpected url');
  }
  return new Request(request.url, {
    method: request.method,
    headers: request.headers as HeadersInit,
    body: (request.method !== 'GET' && request.method !== 'HEAD')
      ? await streamToBuffer(request)
      : null,
  });
}

async function handle(
  func: ServerFunction,
  request: IncomingMessage,
  response: ServerResponse,
) {
  const transformedRequest = await convertHTTPRequestToWebRequest(request);
  const newResponse = await func(transformedRequest);

  // Set status code
  response.statusCode = newResponse.status;
  response.statusMessage = newResponse.statusText;
  // Set headers
  newResponse.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });
  // Set content
  if (
    newResponse.body instanceof Buffer
    || typeof newResponse.body === 'string'
    || newResponse.body == null
  ) {
    response.end(newResponse.body);
  } else {
    (newResponse.body as unknown as Readable).pipe(response);
  }
}

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
    void handle(fn, request, response);
  },
};

export default ADAPTER;
