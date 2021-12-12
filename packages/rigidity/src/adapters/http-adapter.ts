import { IncomingMessage, ServerResponse } from 'http';
import { RequestAdapter, ResponseAdapter } from '../adapter';

export interface HTTPRequestAdapter extends RequestAdapter {
  raw: IncomingMessage;
}

export function createHTTPRequestAdapter(request: IncomingMessage): HTTPRequestAdapter {
  return {
    getHeader(key) {
      return request.headers[key];
    },
    url: request.url,
    raw: request,
  };
}

export interface HTTPResponseAdapter extends ResponseAdapter {
  raw: ServerResponse;
}

export function createHTTPResponseAdapter(response: ServerResponse): HTTPResponseAdapter {
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
    write(value) {
      response.end(value);
    },
    raw: response,
  };
}
