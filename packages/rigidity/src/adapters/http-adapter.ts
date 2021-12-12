import { IncomingMessage, ServerResponse } from 'http';
import { RequestAdapter, ResponseAdapter } from '../adapter';

export function createHTTPRequestAdapter(
  request: IncomingMessage,
): RequestAdapter<IncomingMessage> {
  return {
    getHeader(key) {
      return request.headers[key];
    },
    url: request.url,
    raw: request,
  };
}

export function createHTTPResponseAdapter(
  response: ServerResponse,
): ResponseAdapter<ServerResponse> {
  return {
    setHeader(key, value) {
      response.setHeader(key, value);
    },
    setStatusCode(value) {
      response.statusCode = value;
    },
    getStatusCode() {
      return response.statusCode;
    },
    setContent(value) {
      response.end(value);
    },
    raw: response,
  };
}
