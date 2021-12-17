import { Readable } from 'stream';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { ServerFunction } from '../types';

export function nodeStreamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffer: Uint8Array[] = [];

    stream.on('data', (chunk) => buffer.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(buffer)));
    stream.on('error', (err) => reject(err));
  });
}

export async function convertHTTPRequestToWebRequest(
  request: IncomingMessage | Http2ServerRequest,
): Promise<Request> {
  if (!request.url) {
    throw new Error('Unexpected url');
  }
  return new Request(request.url, {
    method: request.method,
    headers: request.headers as HeadersInit,
    body: (request.method !== 'GET' && request.method !== 'HEAD')
      ? await nodeStreamToBuffer(request)
      : null,
  });
}

export async function convertHTTP2RequestToWebRequest(
  request: Http2ServerRequest,
): Promise<Request> {
  const {
    ':scheme': scheme,
    ':authority': authority,
    ':method': method,
    ':path': path,
    ...headers
  } = request.headers;
  console.log(scheme, authority);
  if (!path) {
    throw new Error('Unexpected url');
  }
  return new Request(path, {
    method,
    headers: {
      ...(headers as HeadersInit),
      ...(authority ? { host: authority } : {}),
    },
    body: (request.method !== 'GET' && request.method !== 'HEAD')
      ? await nodeStreamToBuffer(request)
      : null,
  });
}

export async function handleHTTP(
  func: ServerFunction,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
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

export async function handleHTTP2(
  func: ServerFunction,
  request: Http2ServerRequest,
  response: Http2ServerResponse,
): Promise<void> {
  const transformedRequest = await convertHTTP2RequestToWebRequest(request);
  const newResponse = await func(transformedRequest);

  // Set status code
  response.statusCode = newResponse.status;
  // Set headers
  newResponse.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });
  // Set content
  if (newResponse.body instanceof Buffer) {
    response.end(new Uint8Array(newResponse.body.buffer));
  } else if (typeof newResponse.body === 'string') {
    response.end(newResponse.body);
  } else if (newResponse.body == null) {
    response.end();
  } else {
    (newResponse.body as unknown as Readable).pipe(response);
  }
}
