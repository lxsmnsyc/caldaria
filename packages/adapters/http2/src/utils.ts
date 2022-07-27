import { Readable } from 'stream';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { ServerFunction } from 'rigidity/types';

export function nodeStreamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffer: Uint8Array[] = [];

    stream.on('data', (chunk) => buffer.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(buffer)));
    stream.on('error', (err) => reject(err));
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
  if (!path) {
    throw new Error('Unexpected url');
  }
  return new Request(path, {
    method,
    headers: {
      ...(headers as HeadersInit),
      ...(authority ? { host: authority } : {}),
      ...(scheme ? { scheme } : {}),
    },
    body: (request.method !== 'GET' && request.method !== 'HEAD')
      ? await nodeStreamToBuffer(request)
      : null,
  });
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
