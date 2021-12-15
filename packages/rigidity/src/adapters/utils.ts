import { Readable } from 'stream';
import { IncomingMessage, ServerResponse } from 'http';
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
  request: IncomingMessage,
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
